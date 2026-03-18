import { CouponType, PaymentStatus, Prisma, PrismaClient } from "@prisma/client"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { razorpay } from "@/lib/razorpay"

const MIN_PAYABLE_PAISE = 100
const CURRENCY = "INR"
const WEBHOOK_PROCESSING_TIMEOUT_MS = 1000 * 60 * 5
const ORDER_CREATION_WAIT_MS = 1000 * 5
const ORDER_CREATION_POLL_INTERVAL_MS = 200
const ORDER_CREATION_STALE_MS = 1000 * 60 * 5

type DbClient = PrismaClient | Prisma.TransactionClient

interface BasePricing {
  eventId: string
  baseAmount: number
  discountAmount: number
  finalAmount: number
}

export interface PricingPreview extends BasePricing {
  coupon: {
    id: string
    code: string
    type: "percentage" | "flat"
    value: number
    maxUses: number | null
    usedCount: number
    perUserLimit: number | null
    expiryDate: Date
    eventId: string | null
  } | null
}

export interface CreateOrderResult {
  paymentId: string
  orderId: string
  amount: number
  currency: string
  eventId: string
  couponCode: string | null
  reused: boolean
}

export interface FinalizePaymentResult {
  ok: boolean
  idempotent: boolean
  paymentId: string
  eventId: string
  amount: number
  reason: string | null
  razorpayPaymentId: string | null
}

export interface MarkFailedResult {
  updated: boolean
  idempotent: boolean
  paymentId: string | null
}

export interface RefundResult {
  attempted: boolean
  alreadyInProgressOrDone: boolean
  refundId: string | null
}

const REFUNDABLE_FAILURE_REASONS = new Set([
  "COUPON_NOT_FOUND_AT_CAPTURE",
  "COUPON_USER_LIMIT_REACHED_AT_CAPTURE",
  "COUPON_LIMIT_REACHED_AT_CAPTURE",
  "DUPLICATE_SUCCESS_FOR_EVENT",
  "ORDER_CREATION_STALE",
])

export class PaymentApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function normalizeEventId(value: unknown): string {
  if (typeof value !== "string") {
    throw new PaymentApiError(400, "INVALID_EVENT_ID", "eventId is required")
  }

  const eventId = value.trim()
  if (!/^[a-zA-Z0-9_-]{3,64}$/.test(eventId)) {
    throw new PaymentApiError(400, "INVALID_EVENT_ID", "eventId format is invalid")
  }

  return eventId
}

export function normalizeCouponCode(value: unknown): string | null {
  if (value == null || value === "") {
    return null
  }

  if (typeof value !== "string") {
    throw new PaymentApiError(400, "INVALID_COUPON", "couponCode must be a string")
  }

  const normalized = value.trim().toUpperCase()
  if (!/^[A-Z0-9_-]{3,32}$/.test(normalized)) {
    throw new PaymentApiError(400, "INVALID_COUPON", "couponCode format is invalid")
  }

  return normalized
}

export function normalizeCouponValue(value: unknown): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new PaymentApiError(400, "INVALID_AMOUNT", "Price must be a finite number")
    }
    return Math.round(value * 100)
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) {
      throw new PaymentApiError(400, "INVALID_AMOUNT", "Price must be a valid number")
    }
    return Math.round(parsed * 100)
  }

  throw new PaymentApiError(400, "INVALID_AMOUNT", "Price must be provided")
}

function ensureAmount(amount: number, label: string): number {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new PaymentApiError(400, "INVALID_AMOUNT", `${label} must be a positive amount`)
  }

  return amount
}

function compareSignatures(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected, "utf8")
  const actualBuffer = Buffer.from(actual, "utf8")

  if (expectedBuffer.length !== actualBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer)
}

function getRazorpaySecret(): string {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new PaymentApiError(500, "CONFIG_ERROR", "RAZORPAY_KEY_SECRET is not configured")
  }

  return process.env.RAZORPAY_KEY_SECRET
}

export function getRazorpayKeyId(): string {
  if (!process.env.RAZORPAY_KEY_ID) {
    throw new PaymentApiError(500, "CONFIG_ERROR", "RAZORPAY_KEY_ID is not configured")
  }

  return process.env.RAZORPAY_KEY_ID
}

export function getRazorpayWebhookSecret(): string {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    throw new PaymentApiError(500, "CONFIG_ERROR", "RAZORPAY_WEBHOOK_SECRET is not configured")
  }

  return process.env.RAZORPAY_WEBHOOK_SECRET
}

export function verifyCheckoutSignature(params: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}): boolean {
  const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`
  const generated = crypto.createHmac("sha256", getRazorpaySecret()).update(payload).digest("hex")

  return compareSignatures(generated, params.razorpaySignature)
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const generated = crypto
    .createHmac("sha256", getRazorpayWebhookSecret())
    .update(rawBody)
    .digest("hex")

  return compareSignatures(generated, signature)
}

export async function validateCapturedPaymentAtProvider(params: {
  razorpayOrderId: string
  razorpayPaymentId: string
  expectedUserId?: string
}): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: {
      razorpayOrderId: params.razorpayOrderId,
    },
    select: {
      id: true,
      userId: true,
      amount: true,
    },
  })

  if (!payment) {
    throw new PaymentApiError(404, "PAYMENT_NOT_FOUND", "Payment order not found")
  }

  if (params.expectedUserId && payment.userId !== params.expectedUserId) {
    throw new PaymentApiError(403, "PAYMENT_ACCESS_DENIED", "This payment does not belong to you")
  }

  let providerPayment: unknown
  try {
    providerPayment = await razorpay.payments.fetch(params.razorpayPaymentId)
  } catch (error) {
    console.error("Failed to fetch payment from Razorpay", error)
    throw new PaymentApiError(
      502,
      "RAZORPAY_PAYMENT_FETCH_FAILED",
      "Unable to verify payment status with provider"
    )
  }

  const providerOrderId =
    typeof (providerPayment as { order_id?: unknown }).order_id === "string"
      ? (providerPayment as { order_id: string }).order_id
      : null
  const providerStatus =
    typeof (providerPayment as { status?: unknown }).status === "string"
      ? (providerPayment as { status: string }).status.toLowerCase()
      : null
  const providerCurrency =
    typeof (providerPayment as { currency?: unknown }).currency === "string"
      ? (providerPayment as { currency: string }).currency.toUpperCase()
      : null

  const providerAmountRaw = (providerPayment as { amount?: unknown }).amount
  const providerAmount =
    typeof providerAmountRaw === "number" ? providerAmountRaw : Number(providerAmountRaw)

  if (providerOrderId !== params.razorpayOrderId) {
    throw new PaymentApiError(
      409,
      "RAZORPAY_ORDER_PAYMENT_MISMATCH",
      "Provider payment does not belong to this order"
    )
  }

  if (providerStatus !== "captured") {
    throw new PaymentApiError(
      409,
      "PAYMENT_NOT_CAPTURED",
      "Provider reports payment is not captured yet"
    )
  }

  if (providerCurrency !== CURRENCY) {
    throw new PaymentApiError(
      409,
      "PAYMENT_CURRENCY_MISMATCH",
      "Provider payment currency does not match order currency"
    )
  }

  if (!Number.isInteger(providerAmount) || providerAmount !== payment.amount) {
    throw new PaymentApiError(
      409,
      "PAYMENT_AMOUNT_MISMATCH",
      "Provider payment amount does not match expected order amount"
    )
  }
}

export function hashPayload(rawBody: string): string {
  return crypto.createHash("sha256").update(rawBody).digest("hex")
}

export function requiresCompensatingRefund(reason: string | null): boolean {
  if (!reason) {
    return false
  }

  return REFUNDABLE_FAILURE_REASONS.has(reason)
}

async function acquireLock(tx: Prisma.TransactionClient, key: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`
}

async function logAudit(
  tx: Prisma.TransactionClient,
  paymentId: string,
  action: string,
  metadata?: Prisma.InputJsonValue
) {
  await tx.paymentAuditLog.create({
    data: {
      paymentId,
      action,
      metadata,
    },
  })
}

export async function ensureEventPricing(db: DbClient, eventId: string) {
  const event = await db.eventPricing.findUnique({
    where: { eventId },
  })

  if (!event) {
    throw new PaymentApiError(404, "EVENT_NOT_FOUND", "Event pricing is not configured")
  }

  ensureAmount(event.price, "Event price")
  return event
}

function calculateDiscount(baseAmount: number, couponType: CouponType, value: number): number {
  if (couponType === CouponType.PERCENTAGE) {
    if (value < 1 || value > 100) {
      throw new PaymentApiError(500, "COUPON_CONFIG_ERROR", "Coupon percentage must be between 1 and 100")
    }
    return Math.floor((baseAmount * value) / 100)
  }

  return value
}

async function resolveCouponPreview(params: {
  db: DbClient
  couponCode: string
  eventId: string
  userId: string
  baseAmount: number
  now: Date
}): Promise<PricingPreview["coupon"] & { discountAmount: number; finalAmount: number }> {
  const coupon = await params.db.coupon.findUnique({
    where: { code: params.couponCode },
  })

  if (!coupon) {
    throw new PaymentApiError(404, "COUPON_NOT_FOUND", "Coupon code is invalid")
  }

  if (!coupon.isActive) {
    throw new PaymentApiError(400, "COUPON_INACTIVE", "Coupon is inactive")
  }

  if (coupon.expiryDate <= params.now) {
    throw new PaymentApiError(400, "COUPON_EXPIRED", "Coupon has expired")
  }

  if (coupon.eventId && coupon.eventId !== params.eventId) {
    throw new PaymentApiError(400, "COUPON_EVENT_MISMATCH", "Coupon is not valid for this event")
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new PaymentApiError(400, "COUPON_LIMIT_REACHED", "Coupon usage limit has been reached")
  }

  if (coupon.perUserLimit !== null) {
    const userUsage = await params.db.couponRedemption.count({
      where: {
        couponId: coupon.id,
        userId: params.userId,
      },
    })

    if (userUsage >= coupon.perUserLimit) {
      throw new PaymentApiError(400, "COUPON_USER_LIMIT_REACHED", "Coupon user limit reached")
    }
  }

  const discountAmount = Math.min(
    calculateDiscount(params.baseAmount, coupon.type, coupon.value),
    params.baseAmount
  )

  const finalAmount = params.baseAmount - discountAmount

  if (finalAmount < MIN_PAYABLE_PAISE) {
    throw new PaymentApiError(
      400,
      "COUPON_INVALID_AMOUNT",
      "Final payable amount is below the allowed minimum"
    )
  }

  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type === CouponType.PERCENTAGE ? "percentage" : "flat",
    value: coupon.value,
    maxUses: coupon.maxUses,
    usedCount: coupon.usedCount,
    perUserLimit: coupon.perUserLimit,
    expiryDate: coupon.expiryDate,
    eventId: coupon.eventId,
    discountAmount,
    finalAmount,
  }
}

export async function computePricingPreview(params: {
  db: DbClient
  eventId: string
  userId: string
  couponCode?: string | null
  now?: Date
}): Promise<PricingPreview> {
  const now = params.now ?? new Date()
  const event = await ensureEventPricing(params.db, params.eventId)
  const baseAmount = ensureAmount(event.price, "Event price")

  if (!params.couponCode) {
    return {
      eventId: params.eventId,
      baseAmount,
      discountAmount: 0,
      finalAmount: baseAmount,
      coupon: null,
    }
  }

  const couponPreview = await resolveCouponPreview({
    db: params.db,
    couponCode: params.couponCode,
    eventId: params.eventId,
    userId: params.userId,
    baseAmount,
    now,
  })

  return {
    eventId: params.eventId,
    baseAmount,
    discountAmount: couponPreview.discountAmount,
    finalAmount: couponPreview.finalAmount,
    coupon: {
      id: couponPreview.id,
      code: couponPreview.code,
      type: couponPreview.type,
      value: couponPreview.value,
      maxUses: couponPreview.maxUses,
      usedCount: couponPreview.usedCount,
      perUserLimit: couponPreview.perUserLimit,
      expiryDate: couponPreview.expiryDate,
      eventId: couponPreview.eventId,
    },
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function waitForOrderAssignment(
  paymentId: string
): Promise<{
  paymentId: string
  orderId: string
  amount: number
  eventId: string
  couponCode: string | null
} | null> {
  const deadline = Date.now() + ORDER_CREATION_WAIT_MS

  while (Date.now() < deadline) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        razorpayOrderId: true,
        amount: true,
        eventId: true,
        couponCode: true,
        status: true,
      },
    })

    if (!payment) {
      return null
    }

    if (payment.razorpayOrderId) {
      return {
        paymentId: payment.id,
        orderId: payment.razorpayOrderId,
        amount: payment.amount,
        eventId: payment.eventId,
        couponCode: payment.couponCode,
      }
    }

    if (payment.status === PaymentStatus.FAILED) {
      return null
    }

    await sleep(ORDER_CREATION_POLL_INTERVAL_MS)
  }

  return null
}

export async function createOrReuseOrder(params: {
  userId: string
  eventId: string
  couponCode: string | null
}): Promise<CreateOrderResult> {
  const pricing = await computePricingPreview({
    db: prisma,
    eventId: params.eventId,
    userId: params.userId,
    couponCode: params.couponCode,
  })

  const prepared = await prisma.$transaction(
    async (tx) => {
      const now = new Date()
      await acquireLock(tx, `create-order:${params.userId}:${params.eventId}`)

      const existingSuccess = await tx.payment.findFirst({
        where: {
          userId: params.userId,
          eventId: params.eventId,
          status: PaymentStatus.SUCCESS,
        },
        select: {
          id: true,
        },
      })

      if (existingSuccess) {
        throw new PaymentApiError(409, "ALREADY_PAID", "Payment already completed for this event")
      }

      const activeCreatedPayment = await tx.payment.findFirst({
        where: {
          userId: params.userId,
          eventId: params.eventId,
          status: PaymentStatus.CREATED,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      if (activeCreatedPayment) {
        const requestedCouponId = pricing.coupon?.id ?? null
        const requestedCouponCode = pricing.coupon?.code ?? null
        const matchesRequestedPricing =
          activeCreatedPayment.amount === pricing.finalAmount &&
          activeCreatedPayment.couponId === requestedCouponId &&
          activeCreatedPayment.couponCode === requestedCouponCode

        const ageMs = now.getTime() - activeCreatedPayment.createdAt.getTime()

        if (!matchesRequestedPricing) {
          if (ageMs <= ORDER_CREATION_STALE_MS) {
            throw new PaymentApiError(
              409,
              "ORDER_ALREADY_OPEN",
              "An active order already exists for this event. Retry after it settles."
            )
          }

          await tx.payment.update({
            where: { id: activeCreatedPayment.id },
            data: {
              status: PaymentStatus.FAILED,
              failureReason: "ORDER_CREATION_STALE",
            },
          })

          await logAudit(tx, activeCreatedPayment.id, "ORDER_CREATION_STALE_MARKED_FAILED", {
            ageMs,
          })
        } else if (activeCreatedPayment.razorpayOrderId) {
          await logAudit(tx, activeCreatedPayment.id, "ORDER_REUSED", {
            orderId: activeCreatedPayment.razorpayOrderId,
          })

          return {
            kind: "reused" as const,
            paymentId: activeCreatedPayment.id,
            orderId: activeCreatedPayment.razorpayOrderId,
            amount: activeCreatedPayment.amount,
            eventId: activeCreatedPayment.eventId,
            couponCode: activeCreatedPayment.couponCode,
          }
        } else {
          if (ageMs <= ORDER_CREATION_STALE_MS) {
            return {
              kind: "pending" as const,
              paymentId: activeCreatedPayment.id,
              amount: activeCreatedPayment.amount,
              eventId: activeCreatedPayment.eventId,
              couponCode: activeCreatedPayment.couponCode,
            }
          }

          await tx.payment.update({
            where: { id: activeCreatedPayment.id },
            data: {
              status: PaymentStatus.FAILED,
              failureReason: "ORDER_CREATION_STALE",
            },
          })

          await logAudit(tx, activeCreatedPayment.id, "ORDER_CREATION_STALE_MARKED_FAILED", {
            ageMs,
          })
        }
      }

      const payment = await tx.payment.create({
        data: {
          userId: params.userId,
          eventId: params.eventId,
          amount: pricing.finalAmount,
          couponId: pricing.coupon?.id,
          couponCode: pricing.coupon?.code ?? null,
          status: PaymentStatus.CREATED,
        },
      })

      await logAudit(tx, payment.id, "PAYMENT_CREATED", {
        amount: payment.amount,
        eventId: payment.eventId,
        couponCode: payment.couponCode,
      })

      return {
        kind: "created" as const,
        paymentId: payment.id,
        amount: payment.amount,
        eventId: payment.eventId,
        couponCode: payment.couponCode,
      }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  )

  if (prepared.kind === "reused") {
    return {
      paymentId: prepared.paymentId,
      orderId: prepared.orderId,
      amount: prepared.amount,
      currency: CURRENCY,
      eventId: prepared.eventId,
      couponCode: prepared.couponCode,
      reused: true,
    }
  }

  if (prepared.kind === "pending") {
    const assignedOrder = await waitForOrderAssignment(prepared.paymentId)
    if (assignedOrder) {
      return {
        paymentId: assignedOrder.paymentId,
        orderId: assignedOrder.orderId,
        amount: assignedOrder.amount,
        currency: CURRENCY,
        eventId: assignedOrder.eventId,
        couponCode: assignedOrder.couponCode,
        reused: true,
      }
    }

    throw new PaymentApiError(
      409,
      "ORDER_CREATION_IN_PROGRESS",
      "An order is already being created. Retry in a few seconds."
    )
  }

  let order
  try {
    order = await razorpay.orders.create({
      amount: prepared.amount,
      currency: CURRENCY,
      receipt: prepared.paymentId,
      notes: {
        eventId: params.eventId,
        userId: params.userId,
        couponCode: pricing.coupon?.code ?? "",
        paymentId: prepared.paymentId,
      },
    })
  } catch (error) {
    await prisma.$transaction(async (tx) => {
      await acquireLock(tx, `payment-order:${prepared.paymentId}`)
      await tx.payment.update({
        where: { id: prepared.paymentId },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: "RAZORPAY_ORDER_CREATION_FAILED",
        },
      })
      await logAudit(tx, prepared.paymentId, "ORDER_CREATION_FAILED", {
        eventId: params.eventId,
        couponCode: pricing.coupon?.code ?? null,
      })
    })

    throw new PaymentApiError(
      502,
      "ORDER_CREATION_FAILED",
      "Unable to create payment order with payment provider"
    )
  }

  return prisma.$transaction(
    async (tx) => {
      await acquireLock(tx, `payment-order:${prepared.paymentId}`)
      const payment = await tx.payment.findUnique({
        where: { id: prepared.paymentId },
      })

      if (!payment) {
        throw new PaymentApiError(500, "PAYMENT_NOT_FOUND", "Payment record disappeared")
      }

      if (payment.razorpayOrderId) {
        return {
          paymentId: payment.id,
          orderId: payment.razorpayOrderId,
          amount: payment.amount,
          currency: CURRENCY,
          eventId: payment.eventId,
          couponCode: payment.couponCode,
          reused: true,
        }
      }

      if (payment.status !== PaymentStatus.CREATED) {
        throw new PaymentApiError(
          409,
          "ORDER_NOT_CREATABLE",
          "Payment is no longer in a creatable state"
        )
      }

      await tx.payment.update({
        where: { id: prepared.paymentId },
        data: {
          razorpayOrderId: order.id,
        },
      })

      await logAudit(tx, prepared.paymentId, "ORDER_CREATED", {
        orderId: order.id,
        amount: order.amount,
        eventId: params.eventId,
        couponCode: pricing.coupon?.code ?? null,
      })

      return {
        paymentId: prepared.paymentId,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        eventId: params.eventId,
        couponCode: pricing.coupon?.code ?? null,
        reused: false,
      }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  )
}

async function markPaymentAsFailed(
  tx: Prisma.TransactionClient,
  paymentId: string,
  razorpayPaymentId: string,
  razorpaySignature: string | null,
  reason: string
) {
  await tx.payment.update({
    where: { id: paymentId },
    data: {
      status: PaymentStatus.FAILED,
      razorpayPaymentId,
      razorpaySignature,
      failureReason: reason,
    },
  })

  await logAudit(tx, paymentId, "PAYMENT_MARKED_FAILED", {
    razorpayPaymentId,
    reason,
  })
}

export async function finalizeCapturedPayment(params: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature?: string | null
  expectedUserId?: string
  source: "api" | "webhook"
}): Promise<FinalizePaymentResult> {
  return prisma.$transaction(
    async (tx) => {
      await acquireLock(tx, `payment-capture:${params.razorpayOrderId}`)

      const payment = await tx.payment.findUnique({
        where: { razorpayOrderId: params.razorpayOrderId },
      })

      if (!payment) {
        throw new PaymentApiError(404, "PAYMENT_NOT_FOUND", "Payment order not found")
      }

      if (params.expectedUserId && payment.userId !== params.expectedUserId) {
        throw new PaymentApiError(403, "PAYMENT_ACCESS_DENIED", "This payment does not belong to you")
      }

      const duplicatePaymentId = await tx.payment.findFirst({
        where: {
          id: { not: payment.id },
          razorpayPaymentId: params.razorpayPaymentId,
        },
        select: { id: true },
      })

      if (duplicatePaymentId) {
        throw new PaymentApiError(
          409,
          "PAYMENT_ID_ALREADY_USED",
          "Payment ID is already associated with a different order"
        )
      }

      if (payment.status === PaymentStatus.SUCCESS) {
        if (
          payment.razorpayPaymentId &&
          payment.razorpayPaymentId !== params.razorpayPaymentId
        ) {
          throw new PaymentApiError(409, "PAYMENT_ID_MISMATCH", "Payment already completed with another payment ID")
        }

        return {
          ok: true,
          idempotent: true,
          paymentId: payment.id,
          eventId: payment.eventId,
          amount: payment.amount,
          reason: null,
          razorpayPaymentId: payment.razorpayPaymentId ?? params.razorpayPaymentId,
        }
      }

      if (payment.status === PaymentStatus.FAILED) {
        if (payment.failureReason !== "RAZORPAY_PAYMENT_FAILED") {
          return {
            ok: false,
            idempotent: true,
            paymentId: payment.id,
            eventId: payment.eventId,
            amount: payment.amount,
            reason: payment.failureReason,
            razorpayPaymentId: payment.razorpayPaymentId ?? params.razorpayPaymentId,
          }
        }

        await logAudit(tx, payment.id, "FAILED_PAYMENT_RECOVERY_ATTEMPT", {
          previousFailureReason: payment.failureReason,
          previousRazorpayPaymentId: payment.razorpayPaymentId,
          incomingRazorpayPaymentId: params.razorpayPaymentId,
          source: params.source,
        })
      }

      await acquireLock(tx, `event-success:${payment.userId}:${payment.eventId}`)

      const duplicateSuccess = await tx.payment.findFirst({
        where: {
          id: { not: payment.id },
          userId: payment.userId,
          eventId: payment.eventId,
          status: PaymentStatus.SUCCESS,
        },
        select: { id: true },
      })

      if (duplicateSuccess) {
        await markPaymentAsFailed(
          tx,
          payment.id,
          params.razorpayPaymentId,
          params.razorpaySignature ?? null,
          "DUPLICATE_SUCCESS_FOR_EVENT"
        )

        return {
          ok: false,
          idempotent: false,
          paymentId: payment.id,
          eventId: payment.eventId,
          amount: payment.amount,
          reason: "DUPLICATE_SUCCESS_FOR_EVENT",
          razorpayPaymentId: params.razorpayPaymentId,
        }
      }

      if (payment.couponId) {
        await acquireLock(tx, `coupon-use:${payment.couponId}:${payment.userId}`)

        const coupon = await tx.coupon.findUnique({
          where: { id: payment.couponId },
        })

        if (!coupon) {
          await markPaymentAsFailed(
            tx,
            payment.id,
            params.razorpayPaymentId,
            params.razorpaySignature ?? null,
            "COUPON_NOT_FOUND_AT_CAPTURE"
          )

          return {
            ok: false,
            idempotent: false,
            paymentId: payment.id,
            eventId: payment.eventId,
            amount: payment.amount,
            reason: "COUPON_NOT_FOUND_AT_CAPTURE",
            razorpayPaymentId: params.razorpayPaymentId,
          }
        }

        if (coupon.perUserLimit !== null) {
          const alreadyRedeemed = await tx.couponRedemption.count({
            where: {
              couponId: coupon.id,
              userId: payment.userId,
            },
          })

          if (alreadyRedeemed >= coupon.perUserLimit) {
            await markPaymentAsFailed(
              tx,
              payment.id,
              params.razorpayPaymentId,
              params.razorpaySignature ?? null,
              "COUPON_USER_LIMIT_REACHED_AT_CAPTURE"
            )

            return {
              ok: false,
              idempotent: false,
              paymentId: payment.id,
              eventId: payment.eventId,
              amount: payment.amount,
              reason: "COUPON_USER_LIMIT_REACHED_AT_CAPTURE",
              razorpayPaymentId: params.razorpayPaymentId,
            }
          }
        }

        const updatedCoupons = await tx.$queryRaw<{ id: string }[]>`
          UPDATE "coupons"
          SET "used_count" = "used_count" + 1,
              "updated_at" = CURRENT_TIMESTAMP
          WHERE "id" = ${coupon.id}
            AND "is_active" = true
            AND "expiry_date" > NOW()
            AND ("event_id" IS NULL OR "event_id" = ${payment.eventId})
            AND ("max_uses" IS NULL OR "used_count" < "max_uses")
          RETURNING "id"
        `

        if (updatedCoupons.length !== 1) {
          await markPaymentAsFailed(
            tx,
            payment.id,
            params.razorpayPaymentId,
            params.razorpaySignature ?? null,
            "COUPON_LIMIT_REACHED_AT_CAPTURE"
          )

          return {
            ok: false,
            idempotent: false,
            paymentId: payment.id,
            eventId: payment.eventId,
            amount: payment.amount,
            reason: "COUPON_LIMIT_REACHED_AT_CAPTURE",
            razorpayPaymentId: params.razorpayPaymentId,
          }
        }

        await tx.couponRedemption.create({
          data: {
            couponId: coupon.id,
            paymentId: payment.id,
            userId: payment.userId,
            eventId: payment.eventId,
          },
        })
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          razorpayPaymentId: params.razorpayPaymentId,
          razorpaySignature: params.razorpaySignature ?? null,
          failureReason: null,
          paidAt: new Date(),
        },
      })

      await logAudit(tx, payment.id, "PAYMENT_CAPTURED", {
        source: params.source,
        razorpayPaymentId: params.razorpayPaymentId,
      })

      return {
        ok: true,
        idempotent: false,
        paymentId: payment.id,
        eventId: payment.eventId,
        amount: payment.amount,
        reason: null,
        razorpayPaymentId: params.razorpayPaymentId,
      }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  )
}

export async function markOrderFailed(params: {
  razorpayOrderId: string
  razorpayPaymentId: string | null
  reason: string
}): Promise<MarkFailedResult> {
  return prisma.$transaction(
    async (tx) => {
      await acquireLock(tx, `payment-failed:${params.razorpayOrderId}`)

      const payment = await tx.payment.findUnique({
        where: { razorpayOrderId: params.razorpayOrderId },
      })

      if (!payment) {
        return {
          updated: false,
          idempotent: true,
          paymentId: null,
        }
      }

      if (payment.status === PaymentStatus.SUCCESS) {
        return {
          updated: false,
          idempotent: true,
          paymentId: payment.id,
        }
      }

      if (payment.status === PaymentStatus.FAILED) {
        return {
          updated: false,
          idempotent: true,
          paymentId: payment.id,
        }
      }

      if (params.razorpayPaymentId) {
        const duplicatePaymentId = await tx.payment.findFirst({
          where: {
            id: { not: payment.id },
            razorpayPaymentId: params.razorpayPaymentId,
          },
          select: { id: true },
        })

        if (duplicatePaymentId) {
          return {
            updated: false,
            idempotent: true,
            paymentId: payment.id,
          }
        }
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          razorpayPaymentId: params.razorpayPaymentId,
          failureReason: params.reason,
        },
      })

      await logAudit(tx, payment.id, "PAYMENT_FAILED", {
        reason: params.reason,
        razorpayPaymentId: params.razorpayPaymentId,
      })

      return {
        updated: true,
        idempotent: false,
        paymentId: payment.id,
      }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  )
}

export async function initiateCompensatingRefund(params: {
  paymentId: string
  reason: string
  source: "api" | "webhook"
}): Promise<RefundResult> {
  if (!requiresCompensatingRefund(params.reason)) {
    return {
      attempted: false,
      alreadyInProgressOrDone: false,
      refundId: null,
    }
  }

  const pending = await prisma.$transaction(
    async (tx) => {
      await acquireLock(tx, `refund-init:${params.paymentId}`)
      const payment = await tx.payment.findUnique({
        where: { id: params.paymentId },
      })

      if (!payment || !payment.razorpayPaymentId) {
        return null
      }

      if (payment.status !== PaymentStatus.FAILED) {
        return null
      }

      if (payment.refundStatus === "pending" || payment.refundStatus === "initiated" || payment.refundStatus === "processed") {
        return {
          alreadyInProgressOrDone: true,
          razorpayPaymentId: payment.razorpayPaymentId,
          amount: payment.amount,
        }
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          refundStatus: "pending",
          refundReason: params.reason,
        },
      })

      await logAudit(tx, payment.id, "REFUND_PENDING", {
        reason: params.reason,
        source: params.source,
      })

      return {
        alreadyInProgressOrDone: false,
        razorpayPaymentId: payment.razorpayPaymentId,
        amount: payment.amount,
      }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  )

  if (!pending) {
    return {
      attempted: false,
      alreadyInProgressOrDone: false,
      refundId: null,
    }
  }

  if (pending.alreadyInProgressOrDone) {
    return {
      attempted: false,
      alreadyInProgressOrDone: true,
      refundId: null,
    }
  }

  let refund
  try {
    refund = await razorpay.payments.refund(pending.razorpayPaymentId, {
      amount: pending.amount,
      notes: {
        paymentId: params.paymentId,
        reason: params.reason,
        source: params.source,
      },
    })
  } catch (error) {
    await prisma.$transaction(async (tx) => {
      await acquireLock(tx, `refund-failed:${params.paymentId}`)
      await tx.payment.update({
        where: { id: params.paymentId },
        data: {
          refundStatus: "failed",
          refundReason: params.reason,
        },
      })

      await logAudit(tx, params.paymentId, "REFUND_FAILED", {
        reason: params.reason,
        source: params.source,
      })
    })

    throw new PaymentApiError(
      502,
      "REFUND_INITIATION_FAILED",
      "Payment captured but refund initiation failed; manual intervention required"
    )
  }

  try {
    await prisma.$transaction(async (tx) => {
      await acquireLock(tx, `refund-finalize:${params.paymentId}`)
      await tx.payment.update({
        where: { id: params.paymentId },
        data: {
          refundStatus: "initiated",
          razorpayRefundId: refund.id,
          refundInitiatedAt: new Date(),
          refundReason: params.reason,
        },
      })

      await logAudit(tx, params.paymentId, "REFUND_INITIATED", {
        refundId: refund.id,
        reason: params.reason,
        source: params.source,
      })
    })
  } catch (recordingError) {
    console.error(
      "Refund may have been initiated at provider but local recording failed",
      recordingError
    )
    throw new PaymentApiError(
      500,
      "REFUND_RECORDING_FAILED",
      "Refund may have been initiated; manual reconciliation required before retrying"
    )
  }

  return {
    attempted: true,
    alreadyInProgressOrDone: false,
    refundId: refund.id,
  }
}

export async function reserveWebhookEventProcessing(params: {
  webhookEventId: string
  eventType: string
  payloadHash: string
  razorpayOrderId?: string | null
  razorpayPaymentId?: string | null
}): Promise<boolean> {
  const now = new Date()
  try {
    await prisma.razorpayWebhookEvent.create({
      data: {
        webhookEventId: params.webhookEventId,
        eventType: params.eventType,
        payloadHash: params.payloadHash,
        razorpayOrderId: params.razorpayOrderId ?? null,
        razorpayPaymentId: params.razorpayPaymentId ?? null,
        processingStartedAt: now,
      },
    })

    return true
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
      throw error
    }
  }

  const existing = await prisma.razorpayWebhookEvent.findUnique({
    where: { webhookEventId: params.webhookEventId },
    select: {
      id: true,
      payloadHash: true,
      processedAt: true,
      processingStartedAt: true,
    },
  })

  if (!existing) {
    return false
  }

  if (existing.payloadHash !== params.payloadHash) {
    throw new PaymentApiError(
      409,
      "WEBHOOK_EVENT_CONFLICT",
      "Webhook event ID reused with different payload hash"
    )
  }

  if (existing.processedAt) {
    return false
  }

  const processingStartedAtMs = existing.processingStartedAt?.getTime() ?? 0
  if (processingStartedAtMs > 0 && Date.now() - processingStartedAtMs <= WEBHOOK_PROCESSING_TIMEOUT_MS) {
    return false
  }

  const takeover = await prisma.razorpayWebhookEvent.updateMany({
    where: {
      id: existing.id,
      processedAt: null,
      processingStartedAt: existing.processingStartedAt,
    },
    data: {
      processingStartedAt: now,
    },
  })

  return takeover.count === 1
}

export async function markWebhookEventProcessed(webhookEventId: string) {
  await prisma.razorpayWebhookEvent.updateMany({
    where: {
      webhookEventId,
      processedAt: null,
    },
    data: {
      processedAt: new Date(),
      processingStartedAt: null,
    },
  })
}

export function mapPaymentApiError(error: unknown): PaymentApiError {
  if (error instanceof PaymentApiError) {
    return error
  }

  console.error("Payment subsystem error", error)
  return new PaymentApiError(500, "INTERNAL_ERROR", "Internal server error")
}

export function paiseToRupees(amount: number): number {
  return Number((amount / 100).toFixed(2))
}

export const paymentConstants = {
  currency: CURRENCY,
  minPayablePaise: MIN_PAYABLE_PAISE,
}
