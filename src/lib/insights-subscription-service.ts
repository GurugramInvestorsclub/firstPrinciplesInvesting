import {
  InsightsPlanKey,
  InsightsSubscriptionChargeStatus,
  InsightsSubscriptionStatus,
  Prisma,
} from "@prisma/client"
import crypto from "crypto"
import Razorpay from "razorpay"
import type { Subscriptions } from "razorpay/dist/types/subscriptions"
import { prisma } from "@/lib/prisma"
import {
  type InsightsPlanCatalogEntry,
  type InsightsPlanSlug,
  getInsightsSubscriptionKeyId,
  getInsightsSubscriptionKeySecret,
  getInsightsSubscriptionPlanCatalog,
  getInsightsSubscriptionPlanDefinition,
  getInsightsSubscriptionPlanId,
  getInsightsSubscriptionRuntimeState,
  getInsightsSubscriptionTestOffer,
  getInsightsSubscriptionsWebhookSecret,
  hasInsightsSubscriptionCouponCode,
  isInsightsSubscriptionsFeatureEnabled,
} from "@/lib/insights-subscription-config"

const CURRENCY = "INR"
const SUBSCRIPTION_CREATION_STALE_MS = 1000 * 60 * 10
const PROVIDER_SUBSCRIPTION_RETRY_STALE_MS = 1000 * 60 * 45
const WEBHOOK_PROCESSING_TIMEOUT_MS = 1000 * 60 * 5

const OPEN_STATUSES = [
  InsightsSubscriptionStatus.CREATED,
  InsightsSubscriptionStatus.AUTHENTICATED,
  InsightsSubscriptionStatus.ACTIVE,
  InsightsSubscriptionStatus.PENDING,
  InsightsSubscriptionStatus.HALTED,
  InsightsSubscriptionStatus.PAUSED,
  InsightsSubscriptionStatus.CANCEL_REQUESTED,
] as const

type SubscriptionWithLatestCharge = Prisma.InsightsSubscriptionGetPayload<{
  include: {
    charges: true
  }
}>

type RazorpaySubscriptionRecord = Subscriptions.RazorpaySubscription

interface ProviderSubscriptionEntity {
  id: string | null
  planId: string | null
  customerId: string | null
  status: string | null
  currentStartAt: Date | null
  currentEndAt: Date | null
  chargeAt: Date | null
  startAt: Date | null
  endedAt: Date | null
  cancelledAt: Date | null
  quantity: number
  totalCount: number | null
  paidCount: number
  remainingCount: number | null
  source: string | null
  shortUrl: string | null
  notes: Prisma.InputJsonValue | null
}

interface ProviderPaymentEntity {
  id: string | null
  invoiceId: string | null
  subscriptionId: string | null
  amount: number | null
  currency: string
  status: string | null
  failureReason: string | null
  chargedAt: Date | null
}

export interface InsightsChargeSummary {
  id: string
  amount: number
  currency: string
  status: "created" | "captured" | "failed"
  chargedAt: Date | null
  razorpayPaymentId: string | null
  razorpayInvoiceId: string | null
  failureReason: string | null
}

export interface InsightsMembershipSummary {
  id: string
  userId: string
  planKey: InsightsPlanSlug
  planLabel: string
  status: InsightsSubscriptionStatus
  statusLabel: string
  hasAccess: boolean
  cancelAtCycleEnd: boolean
  currentStartAt: Date | null
  currentEndAt: Date | null
  cancelRequestedAt: Date | null
  cancelledAt: Date | null
  endedAt: Date | null
  razorpaySubscriptionId: string | null
  latestCharge: InsightsChargeSummary | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateInsightsSubscriptionResult {
  membership: InsightsMembershipSummary
  razorpaySubscriptionId: string
  razorpayKeyId: string
  reused: boolean
}

export class InsightsSubscriptionApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

function compareSignatures(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected, "utf8")
  const actualBuffer = Buffer.from(actual, "utf8")

  if (expectedBuffer.length !== actualBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer)
}

function getRazorpaySubscriptionKeyIdOrThrow(): string {
  const keyId = getInsightsSubscriptionKeyId()
  if (!keyId) {
    throw new InsightsSubscriptionApiError(503, "CONFIG_INCOMPLETE", "Razorpay key ID is not configured")
  }
  return keyId
}

function getRazorpaySubscriptionKeySecretOrThrow(): string {
  const secret = getInsightsSubscriptionKeySecret()
  if (!secret) {
    throw new InsightsSubscriptionApiError(503, "CONFIG_INCOMPLETE", "Razorpay key secret is not configured")
  }
  return secret
}

function getRazorpaySubscriptionsWebhookSecretOrThrow(): string {
  const secret = getInsightsSubscriptionsWebhookSecret()
  if (!secret) {
    throw new InsightsSubscriptionApiError(
      503,
      "CONFIG_INCOMPLETE",
      "Insights subscription webhook secret is not configured"
    )
  }
  return secret
}

function ensureFeatureEnabled() {
  if (!isInsightsSubscriptionsFeatureEnabled()) {
    throw new InsightsSubscriptionApiError(
      503,
      "FEATURE_DISABLED",
      "Insights subscriptions are not enabled yet"
    )
  }
}

function ensureCheckoutConfigured() {
  ensureFeatureEnabled()

  const runtime = getInsightsSubscriptionRuntimeState()
  if (!runtime.checkoutReady) {
    throw new InsightsSubscriptionApiError(
      503,
      "CONFIG_INCOMPLETE",
      `Insights subscriptions are enabled but not fully configured: ${runtime.missingCheckoutConfig.join(", ")}`
    )
  }
}

function ensureWebhookConfigured() {
  ensureFeatureEnabled()

  const runtime = getInsightsSubscriptionRuntimeState()
  if (!runtime.webhookReady) {
    throw new InsightsSubscriptionApiError(
      503,
      "CONFIG_INCOMPLETE",
      "Insights subscriptions webhook is not fully configured"
    )
  }
}

function getRazorpayClientOrThrow(): Razorpay {
  return new Razorpay({
    key_id: getRazorpaySubscriptionKeyIdOrThrow(),
    key_secret: getRazorpaySubscriptionKeySecretOrThrow(),
  })
}

function slugToPlanKey(plan: InsightsPlanSlug): InsightsPlanKey {
  if (plan === "monthly") {
    return InsightsPlanKey.MONTHLY
  }

  if (plan === "three_monthly") {
    return InsightsPlanKey.THREE_MONTHLY
  }

  return InsightsPlanKey.YEARLY
}

function planKeyToSlug(planKey: InsightsPlanKey): InsightsPlanSlug {
  if (planKey === InsightsPlanKey.MONTHLY) {
    return "monthly"
  }

  if (planKey === InsightsPlanKey.THREE_MONTHLY) {
    return "three_monthly"
  }

  return "yearly"
}

function addPlanInterval(start: Date, planKey: InsightsPlanKey): Date {
  const end = new Date(start)
  if (planKey === InsightsPlanKey.MONTHLY) {
    end.setMonth(end.getMonth() + 1)
    return end
  }

  if (planKey === InsightsPlanKey.THREE_MONTHLY) {
    end.setMonth(end.getMonth() + 3)
    return end
  }

  end.setFullYear(end.getFullYear() + 1)
  return end
}

function getPlanEntry(plan: InsightsPlanSlug): InsightsPlanCatalogEntry & { planId: string } {
  const definition = getInsightsSubscriptionPlanDefinition(plan)
  const planId = getInsightsSubscriptionPlanId(plan)

  if (!planId) {
    throw new InsightsSubscriptionApiError(
      503,
      "CONFIG_INCOMPLETE",
      `${definition.envVar} is not configured`
    )
  }

  return {
    ...definition,
    planId,
  }
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

function asInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value)
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null
  }

  return null
}

function toDateFromUnixSeconds(value: unknown): Date | null {
  const seconds = asInt(value)
  if (!seconds || seconds <= 0) {
    return null
  }

  return new Date(seconds * 1000)
}

function normalizeNotes(value: unknown): Prisma.InputJsonValue | null {
  if (Array.isArray(value)) {
    return value as Prisma.InputJsonValue
  }

  if (value && typeof value === "object") {
    return value as Prisma.InputJsonValue
  }

  return null
}

function getStringNote(notes: Prisma.InputJsonValue | null, key: string): string | null {
  if (!notes || Array.isArray(notes) || typeof notes !== "object") {
    return null
  }

  const candidate = (notes as Record<string, unknown>)[key]
  return typeof candidate === "string" && candidate.trim().length > 0 ? candidate.trim() : null
}

function normalizeProviderSubscriptionEntity(value: unknown): ProviderSubscriptionEntity {
  const raw = value as Record<string, unknown> | null | undefined

  return {
    id: asString(raw?.id),
    planId: asString(raw?.plan_id),
    customerId: asString(raw?.customer_id),
    status: asString(raw?.status)?.toLowerCase() ?? null,
    currentStartAt: toDateFromUnixSeconds(raw?.current_start),
    currentEndAt: toDateFromUnixSeconds(raw?.current_end),
    chargeAt: toDateFromUnixSeconds(raw?.charge_at),
    startAt: toDateFromUnixSeconds(raw?.start_at),
    endedAt: toDateFromUnixSeconds(raw?.ended_at),
    cancelledAt: toDateFromUnixSeconds(raw?.ended_at),
    quantity: asInt(raw?.quantity) ?? 1,
    totalCount: asInt(raw?.total_count),
    paidCount: asInt(raw?.paid_count) ?? 0,
    remainingCount: asInt(raw?.remaining_count),
    source: asString(raw?.source),
    shortUrl: asString(raw?.short_url),
    notes: normalizeNotes(raw?.notes),
  }
}

function normalizeProviderPaymentEntity(value: unknown): ProviderPaymentEntity | null {
  const raw = value as Record<string, unknown> | null | undefined
  const id = asString(raw?.id)
  const amount = asInt(raw?.amount)

  if (!id && !amount) {
    return null
  }

  const status = asString(raw?.status)?.toLowerCase() ?? null
  const explicitFailureReason =
    asString(raw?.error_description) ??
    asString(raw?.error_reason) ??
    asString(raw?.error_code)

  return {
    id,
    invoiceId: asString(raw?.invoice_id),
    subscriptionId: asString(raw?.subscription_id),
    amount,
    currency: asString(raw?.currency)?.toUpperCase() ?? CURRENCY,
    status,
    failureReason:
      explicitFailureReason ??
      (status && status !== "captured" ? "PAYMENT_NOT_CAPTURED" : null),
    chargedAt: toDateFromUnixSeconds(raw?.created_at),
  }
}

function mapProviderStatusToLocal(
  providerStatus: string | null,
  cancelAtCycleEnd: boolean
): InsightsSubscriptionStatus {
  switch (providerStatus) {
    case "created":
      return InsightsSubscriptionStatus.CREATED
    case "authenticated":
      return InsightsSubscriptionStatus.AUTHENTICATED
    case "active":
      return cancelAtCycleEnd
        ? InsightsSubscriptionStatus.CANCEL_REQUESTED
        : InsightsSubscriptionStatus.ACTIVE
    case "pending":
      return InsightsSubscriptionStatus.PENDING
    case "halted":
      return InsightsSubscriptionStatus.HALTED
    case "paused":
      return InsightsSubscriptionStatus.PAUSED
    case "cancelled":
      return InsightsSubscriptionStatus.CANCELLED
    case "completed":
      return InsightsSubscriptionStatus.COMPLETED
    case "expired":
      return InsightsSubscriptionStatus.EXPIRED
    default:
      return cancelAtCycleEnd
        ? InsightsSubscriptionStatus.CANCEL_REQUESTED
        : InsightsSubscriptionStatus.PENDING
  }
}

function statusLabel(status: InsightsSubscriptionStatus): string {
  switch (status) {
    case InsightsSubscriptionStatus.CREATED:
      return "Created"
    case InsightsSubscriptionStatus.AUTHENTICATED:
      return "Authenticated"
    case InsightsSubscriptionStatus.ACTIVE:
      return "Active"
    case InsightsSubscriptionStatus.PENDING:
      return "Pending"
    case InsightsSubscriptionStatus.HALTED:
      return "Renewal Halted"
    case InsightsSubscriptionStatus.PAUSED:
      return "Paused"
    case InsightsSubscriptionStatus.CANCEL_REQUESTED:
      return "Cancels At Period End"
    case InsightsSubscriptionStatus.CANCELLED:
      return "Cancelled"
    case InsightsSubscriptionStatus.COMPLETED:
      return "Completed"
    case InsightsSubscriptionStatus.EXPIRED:
      return "Expired"
  }
}

export function normalizeInsightsPlan(value: unknown): InsightsPlanSlug {
  if (typeof value !== "string") {
    throw new InsightsSubscriptionApiError(400, "INVALID_PLAN", "Plan is required")
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === "three_monthly") {
    return normalized
  }

  throw new InsightsSubscriptionApiError(
    400,
    "INVALID_PLAN",
    "Plan must be three_monthly"
  )
}

export function hashInsightsSubscriptionPayload(rawBody: string): string {
  return crypto.createHash("sha256").update(rawBody).digest("hex")
}

export function verifyInsightsSubscriptionCheckoutSignature(params: {
  razorpayPaymentId: string
  razorpaySubscriptionId: string
  razorpaySignature: string
}): boolean {
  const payload = `${params.razorpayPaymentId}|${params.razorpaySubscriptionId}`
  const generated = crypto
    .createHmac("sha256", getRazorpaySubscriptionKeySecretOrThrow())
    .update(payload)
    .digest("hex")

  return compareSignatures(generated, params.razorpaySignature)
}

export function verifyInsightsSubscriptionWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const generated = crypto
    .createHmac("sha256", getRazorpaySubscriptionsWebhookSecretOrThrow())
    .update(rawBody)
    .digest("hex")

  return compareSignatures(generated, signature)
}

async function acquireLock(tx: Prisma.TransactionClient, key: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`
}

async function logSubscriptionAudit(
  tx: Prisma.TransactionClient,
  subscriptionId: string,
  action: string,
  metadata?: Prisma.InputJsonValue
) {
  await tx.insightsSubscriptionAuditLog.create({
    data: {
      subscriptionId,
      action,
      metadata,
    },
  })
}

function membershipHasAccess(
  subscription: Pick<SubscriptionWithLatestCharge, "status" | "currentEndAt" | "charges">
): boolean {
  const now = Date.now()

  // Fallback for new subscribers: if status is still CREATED but we have a CAPTURED charge, grant access.
  if (subscription.status === InsightsSubscriptionStatus.CREATED) {
    return subscription.charges.some(c => c.status === InsightsSubscriptionChargeStatus.CAPTURED)
  }

  const entitled =
    subscription.status === InsightsSubscriptionStatus.ACTIVE ||
    subscription.status === InsightsSubscriptionStatus.CANCEL_REQUESTED ||
    subscription.status === InsightsSubscriptionStatus.AUTHENTICATED

  if (!entitled) {
    return false
  }

  if (subscription.status === InsightsSubscriptionStatus.AUTHENTICATED) {
    return true
  }

  if (!subscription.currentEndAt) {
    return true
  }

  return subscription.currentEndAt.getTime() > now
}

function serializeCharge(
  charge: SubscriptionWithLatestCharge["charges"][number] | undefined
): InsightsChargeSummary | null {
  if (!charge) {
    return null
  }

  return {
    id: charge.id,
    amount: charge.amount,
    currency: charge.currency,
    status:
      charge.status === InsightsSubscriptionChargeStatus.CAPTURED
        ? "captured"
        : charge.status === InsightsSubscriptionChargeStatus.FAILED
          ? "failed"
          : "created",
    chargedAt: charge.chargedAt,
    razorpayPaymentId: charge.razorpayPaymentId ?? null,
    razorpayInvoiceId: charge.razorpayInvoiceId ?? null,
    failureReason: charge.failureReason ?? null,
  }
}

function serializeMembership(subscription: SubscriptionWithLatestCharge): InsightsMembershipSummary {
  const planKey = planKeyToSlug(subscription.planKey)

  return {
    id: subscription.id,
    userId: subscription.userId,
    planKey,
    planLabel: getInsightsSubscriptionPlanDefinition(planKey).label,
    status: subscription.status,
    statusLabel: statusLabel(subscription.status),
    hasAccess: membershipHasAccess(subscription),
    cancelAtCycleEnd: subscription.cancelAtCycleEnd,
    currentStartAt: subscription.currentStartAt,
    currentEndAt: subscription.currentEndAt,
    cancelRequestedAt: subscription.cancelRequestedAt,
    cancelledAt: subscription.cancelledAt,
    endedAt: subscription.endedAt,
    razorpaySubscriptionId: subscription.razorpaySubscriptionId ?? null,
    latestCharge: serializeCharge(subscription.charges[0]),
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
  }
}

async function findCurrentMembershipRecord(userId: string): Promise<SubscriptionWithLatestCharge | null> {
  const open = await prisma.insightsSubscription.findFirst({
    where: {
      userId,
      status: {
        in: [...OPEN_STATUSES],
      },
    },
    include: {
      charges: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  if (open) {
    return open
  }

  return prisma.insightsSubscription.findFirst({
    where: { userId },
    include: {
      charges: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })
}

export async function getCurrentInsightsMembershipForUser(
  userId: string
): Promise<InsightsMembershipSummary | null> {
  const subscription = await findCurrentMembershipRecord(userId)
  return subscription ? serializeMembership(subscription) : null
}

export async function userHasInsightsAccess(userId: string): Promise<boolean> {
  const subscription = await prisma.insightsSubscription.findFirst({
    where: {
      userId,
      status: {
        in: [
          InsightsSubscriptionStatus.ACTIVE,
          InsightsSubscriptionStatus.CANCEL_REQUESTED,
          InsightsSubscriptionStatus.AUTHENTICATED,
          InsightsSubscriptionStatus.CREATED,
        ],
      },
    },
    select: {
      status: true,
      currentEndAt: true,
      charges: {
        where: {
          status: InsightsSubscriptionChargeStatus.CAPTURED
        },
        take: 1
      }
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  if (!subscription) {
    return false
  }

  // Fallback for new subscribers: if status is still CREATED but we have a CAPTURED charge, grant access.
  if (subscription.status === InsightsSubscriptionStatus.CREATED) {
    return subscription.charges.length > 0
  }

  if (
    subscription.status !== InsightsSubscriptionStatus.ACTIVE &&
    subscription.status !== InsightsSubscriptionStatus.CANCEL_REQUESTED &&
    subscription.status !== InsightsSubscriptionStatus.AUTHENTICATED
  ) {
    return false
  }

  if (subscription.status === InsightsSubscriptionStatus.AUTHENTICATED) {
    return true
  }

  if (!subscription.currentEndAt) {
    return true
  }

  return subscription.currentEndAt.getTime() > Date.now()
}

async function fetchProviderPayment(
  client: Razorpay,
  razorpayPaymentId: string
): Promise<ProviderPaymentEntity | null> {
  try {
    const payment = await client.payments.fetch(razorpayPaymentId)
    return normalizeProviderPaymentEntity(payment)
  } catch {
    return null
  }
}

async function fetchProviderSubscription(
  client: Razorpay,
  razorpaySubscriptionId: string
): Promise<ProviderSubscriptionEntity | null> {
  try {
    const subscription = await client.subscriptions.fetch(razorpaySubscriptionId)
    return normalizeProviderSubscriptionEntity(subscription)
  } catch {
    return null
  }
}

async function upsertChargeFromProvider(
  tx: Prisma.TransactionClient,
  subscriptionId: string,
  paymentEntity: ProviderPaymentEntity | null
) {
  if (!paymentEntity?.id || !paymentEntity.amount) {
    return null
  }

  const status =
    paymentEntity.status === "captured"
      ? InsightsSubscriptionChargeStatus.CAPTURED
      : paymentEntity.status === "failed"
        ? InsightsSubscriptionChargeStatus.FAILED
        : paymentEntity.status === "authorized"
          ? InsightsSubscriptionChargeStatus.CREATED
          : paymentEntity.failureReason
            ? InsightsSubscriptionChargeStatus.FAILED
            : InsightsSubscriptionChargeStatus.CREATED

  await tx.insightsSubscriptionCharge.upsert({
    where: {
      razorpayPaymentId: paymentEntity.id,
    },
    update: {
      amount: paymentEntity.amount,
      currency: paymentEntity.currency,
      status,
      failureReason: paymentEntity.failureReason,
      chargedAt: paymentEntity.chargedAt,
      razorpayInvoiceId: paymentEntity.invoiceId,
    },
    create: {
      subscriptionId,
      razorpayPaymentId: paymentEntity.id,
      razorpayInvoiceId: paymentEntity.invoiceId,
      amount: paymentEntity.amount,
      currency: paymentEntity.currency,
      status,
      failureReason: paymentEntity.failureReason,
      chargedAt: paymentEntity.chargedAt,
    },
  })
}

export async function manuallyActivateCapturedInsightsSubscription(params: {
  subscriptionId: string
  razorpayPaymentId: string
}): Promise<InsightsMembershipSummary> {
  ensureCheckoutConfigured()

  const razorpayPaymentId = params.razorpayPaymentId.trim()
  if (!razorpayPaymentId) {
    throw new InsightsSubscriptionApiError(400, "INVALID_PAYMENT_ID", "Razorpay payment ID is required")
  }

  const localSubscription = await prisma.insightsSubscription.findUnique({
    where: {
      id: params.subscriptionId,
    },
    include: {
      charges: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  })

  if (!localSubscription) {
    throw new InsightsSubscriptionApiError(
      404,
      "SUBSCRIPTION_NOT_FOUND",
      "Insights subscription not found"
    )
  }

  if (
    localSubscription.status === InsightsSubscriptionStatus.ACTIVE ||
    localSubscription.status === InsightsSubscriptionStatus.AUTHENTICATED ||
    localSubscription.status === InsightsSubscriptionStatus.CANCEL_REQUESTED
  ) {
    return serializeMembership(localSubscription)
  }

  const client = getRazorpayClientOrThrow()
  const providerPayment = await fetchProviderPayment(client, razorpayPaymentId)

  if (!providerPayment?.id || providerPayment.status !== "captured") {
    throw new InsightsSubscriptionApiError(
      409,
      "PAYMENT_NOT_CAPTURED",
      "Razorpay does not show this payment as captured"
    )
  }

  if (providerPayment.currency !== CURRENCY) {
    throw new InsightsSubscriptionApiError(
      409,
      "PAYMENT_CURRENCY_MISMATCH",
      "Captured payment currency does not match the subscription currency"
    )
  }

  const latestCharge = localSubscription.charges[0]
  if (latestCharge && latestCharge.amount !== providerPayment.amount) {
    throw new InsightsSubscriptionApiError(
      409,
      "PAYMENT_AMOUNT_MISMATCH",
      "Captured payment amount does not match the recorded subscription charge"
    )
  }

  if (
    providerPayment.subscriptionId &&
    localSubscription.razorpaySubscriptionId &&
    providerPayment.subscriptionId !== localSubscription.razorpaySubscriptionId
  ) {
    throw new InsightsSubscriptionApiError(
      409,
      "PAYMENT_SUBSCRIPTION_MISMATCH",
      "Captured payment belongs to a different Razorpay subscription"
    )
  }

  const providerSubscription = localSubscription.razorpaySubscriptionId
    ? await fetchProviderSubscription(client, localSubscription.razorpaySubscriptionId)
    : null

  const updated = await prisma.$transaction(
    async (tx) => {
      await acquireLock(tx, `insights-subscription:manual-activate:${localSubscription.id}`)

      const duplicateCharge = await tx.insightsSubscriptionCharge.findFirst({
        where: {
          razorpayPaymentId,
          subscriptionId: {
            not: localSubscription.id,
          },
        },
        select: {
          id: true,
        },
      })

      if (duplicateCharge) {
        throw new InsightsSubscriptionApiError(
          409,
          "PAYMENT_ALREADY_USED",
          "This Razorpay payment is already linked to another subscription"
        )
      }

      const subscription = await tx.insightsSubscription.findUnique({
        where: {
          id: localSubscription.id,
        },
      })

      if (!subscription) {
        throw new InsightsSubscriptionApiError(
          404,
          "SUBSCRIPTION_NOT_FOUND",
          "Insights subscription not found"
        )
      }

      if (
        subscription.status === InsightsSubscriptionStatus.ACTIVE ||
        subscription.status === InsightsSubscriptionStatus.AUTHENTICATED ||
        subscription.status === InsightsSubscriptionStatus.CANCEL_REQUESTED
      ) {
        return tx.insightsSubscription.findUniqueOrThrow({
          where: { id: subscription.id },
          include: {
            charges: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        })
      }

      if (providerSubscription?.id) {
        await applyProviderSubscriptionSnapshot(
          tx,
          {
            id: subscription.id,
            status: subscription.status,
            cancelAtCycleEnd: subscription.cancelAtCycleEnd,
          },
          providerSubscription,
          "SUBSCRIPTION_MANUALLY_ACTIVATED",
          providerPayment
        )

        const refreshed = await tx.insightsSubscription.findUniqueOrThrow({
          where: {
            id: subscription.id,
          },
        })

        if (
          refreshed.status === InsightsSubscriptionStatus.CREATED ||
          refreshed.status === InsightsSubscriptionStatus.PENDING
        ) {
          const currentStartAt = refreshed.currentStartAt ?? providerPayment.chargedAt ?? new Date()
          await tx.insightsSubscription.update({
            where: {
              id: subscription.id,
            },
            data: {
              status: InsightsSubscriptionStatus.ACTIVE,
              currentStartAt,
              currentEndAt: refreshed.currentEndAt ?? addPlanInterval(currentStartAt, refreshed.planKey),
            },
          })
        }
      } else {
        await upsertChargeFromProvider(tx, subscription.id, providerPayment)

        const currentStartAt = providerPayment.chargedAt ?? new Date()

        await tx.insightsSubscription.update({
          where: {
            id: subscription.id,
          },
          data: {
            status: InsightsSubscriptionStatus.ACTIVE,
            paidCount: {
              increment: 1,
            },
            currentStartAt,
            currentEndAt: subscription.currentEndAt ?? addPlanInterval(currentStartAt, subscription.planKey),
            lastWebhookAt: new Date(),
          },
        })

        await logSubscriptionAudit(tx, subscription.id, "SUBSCRIPTION_MANUALLY_ACTIVATED", {
          razorpayPaymentId,
          providerPaymentStatus: providerPayment.status,
          source: "admin",
        })
      }

      return tx.insightsSubscription.findUniqueOrThrow({
        where: { id: subscription.id },
        include: {
          charges: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      })
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  )

  return serializeMembership(updated)
}

async function applyProviderSubscriptionSnapshot(
  tx: Prisma.TransactionClient,
  subscription: {
    id: string
    status: InsightsSubscriptionStatus
    cancelAtCycleEnd: boolean
  },
  providerEntity: ProviderSubscriptionEntity,
  auditAction: string,
  paymentEntity?: ProviderPaymentEntity | null
) {
  const cancelAtCycleEnd =
    subscription.cancelAtCycleEnd ||
    subscription.status === InsightsSubscriptionStatus.CANCEL_REQUESTED

  const mappedStatus = mapProviderStatusToLocal(providerEntity.status, cancelAtCycleEnd)
  const terminalStatus =
    mappedStatus === InsightsSubscriptionStatus.CANCELLED ||
    mappedStatus === InsightsSubscriptionStatus.COMPLETED ||
    mappedStatus === InsightsSubscriptionStatus.EXPIRED

  await tx.insightsSubscription.update({
    where: { id: subscription.id },
    data: {
      razorpaySubscriptionId: providerEntity.id ?? undefined,
      razorpayPlanId: providerEntity.planId ?? undefined,
      customerId: providerEntity.customerId ?? undefined,
      status: mappedStatus,
      currentStartAt: providerEntity.currentStartAt,
      currentEndAt: providerEntity.currentEndAt,
      chargeAt: providerEntity.chargeAt,
      startAt: providerEntity.startAt,
      endedAt: providerEntity.endedAt,
      cancelledAt:
        mappedStatus === InsightsSubscriptionStatus.CANCELLED
          ? providerEntity.cancelledAt ?? new Date()
          : terminalStatus
            ? providerEntity.endedAt
            : null,
      cancelAtCycleEnd:
        mappedStatus === InsightsSubscriptionStatus.CANCEL_REQUESTED
          ? true
          : terminalStatus
            ? false
            : subscription.cancelAtCycleEnd,
      quantity: providerEntity.quantity,
      totalCount: providerEntity.totalCount,
      paidCount: providerEntity.paidCount,
      remainingCount: providerEntity.remainingCount,
      source: providerEntity.source ?? undefined,
      shortUrl: providerEntity.shortUrl ?? undefined,
      notes: providerEntity.notes ?? Prisma.JsonNull,
      lastWebhookAt: new Date(),
    },
  })

  await upsertChargeFromProvider(tx, subscription.id, paymentEntity ?? null)

  await logSubscriptionAudit(tx, subscription.id, auditAction, {
    providerStatus: providerEntity.status,
    razorpaySubscriptionId: providerEntity.id,
    razorpayPaymentId: paymentEntity?.id ?? null,
  })
}

export async function createInsightsSubscription(params: {
  userId: string
  email: string | null
  name: string | null
  plan: InsightsPlanSlug
  couponCode?: string | null
}): Promise<CreateInsightsSubscriptionResult> {
  ensureCheckoutConfigured()

  const plan = getPlanEntry(params.plan)
  const testOffer = getInsightsSubscriptionTestOffer({
    couponCode: params.couponCode,
    plan: params.plan,
  })

  if (hasInsightsSubscriptionCouponCode(params.couponCode) && !testOffer) {
    throw new InsightsSubscriptionApiError(
      400,
      "INVALID_SUBSCRIPTION_COUPON",
      "This subscription coupon or offer code is not configured"
    )
  }

  const prepared = await prisma.$transaction(
    async (tx) => {
      await acquireLock(tx, `insights-subscription:create:${params.userId}`)

      const existing = await tx.insightsSubscription.findFirst({
        where: {
          userId: params.userId,
          status: {
            in: [...OPEN_STATUSES],
          },
        },
        include: {
          charges: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      if (existing) {
        const ageMs = Date.now() - existing.createdAt.getTime()

        if (existing.status === InsightsSubscriptionStatus.CREATED) {
          if (!existing.razorpaySubscriptionId) {
            if (ageMs > SUBSCRIPTION_CREATION_STALE_MS) {
              await tx.insightsSubscription.update({
                where: { id: existing.id },
                data: {
                  status: InsightsSubscriptionStatus.EXPIRED,
                  endedAt: new Date(),
                  lastWebhookAt: new Date(),
                },
              })
              await logSubscriptionAudit(tx, existing.id, "SUBSCRIPTION_CREATION_STALE_EXPIRED", {
                ageMs,
              })
            } else {
              throw new InsightsSubscriptionApiError(
                409,
                "SUBSCRIPTION_CREATION_IN_PROGRESS",
                "An Insights membership is already being created. Retry in a few seconds."
              )
            }
          } else {
            if (ageMs > PROVIDER_SUBSCRIPTION_RETRY_STALE_MS) {
              await tx.insightsSubscription.update({
                where: { id: existing.id },
                data: {
                  status: InsightsSubscriptionStatus.EXPIRED,
                  endedAt: new Date(),
                  lastWebhookAt: new Date(),
                },
              })
              await logSubscriptionAudit(tx, existing.id, "SUBSCRIPTION_PROVIDER_CREATED_STALE_EXPIRED", {
                ageMs,
                razorpaySubscriptionId: existing.razorpaySubscriptionId,
              })
            } else if (existing.planKey === slugToPlanKey(params.plan)) {
              return { type: "reuse", subscription: existing }
            } else {
              await tx.insightsSubscription.update({
                where: { id: existing.id },
                data: {
                  status: InsightsSubscriptionStatus.EXPIRED,
                  endedAt: new Date(),
                  lastWebhookAt: new Date(),
                },
              })
              await logSubscriptionAudit(tx, existing.id, "SUBSCRIPTION_ABANDONED_FOR_NEW_PLAN", {
                ageMs,
                razorpaySubscriptionId: existing.razorpaySubscriptionId,
                newPlan: params.plan,
              })
            }
          }
        } else {
          throw new InsightsSubscriptionApiError(
            409,
            "ALREADY_SUBSCRIBED",
            "An Insights membership already exists for this account"
          )
        }
      }

      const localSubscription = await tx.insightsSubscription.create({
        data: {
          userId: params.userId,
          planKey: slugToPlanKey(params.plan),
          razorpayPlanId: plan.planId,
          status: InsightsSubscriptionStatus.CREATED,
          notes: {
            userEmail: params.email,
            userName: params.name,
            plan: params.plan,
            couponCode: testOffer?.couponCode ?? null,
            offerId: testOffer?.offerId ?? null,
          },
        },
        include: {
          charges: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      })

      await logSubscriptionAudit(tx, localSubscription.id, "SUBSCRIPTION_CREATED_LOCAL", {
        plan: params.plan,
      })

      return { type: "new", subscription: localSubscription }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  )

  if (prepared.type === "reuse") {
    return {
      membership: serializeMembership(prepared.subscription),
      razorpaySubscriptionId: prepared.subscription.razorpaySubscriptionId!,
      razorpayKeyId: getRazorpaySubscriptionKeyIdOrThrow(),
      reused: true,
    }
  }

  const client = getRazorpayClientOrThrow()

  let providerSubscription: RazorpaySubscriptionRecord
  try {
    const subscriptionCreatePayload: Subscriptions.RazorpaySubscriptionCreateRequestBody = {
      plan_id: plan.planId,
      total_count: plan.totalCount,
      quantity: 1,
      customer_notify: true,
      expire_by: Math.floor(Date.now() / 1000) + 60 * 30,
      ...(testOffer ? { offer_id: testOffer.offerId } : {}),
      notes: {
        localSubscriptionId: prepared.subscription.id,
        userId: params.userId,
        userEmail: params.email ?? "",
        plan: params.plan,
        couponCode: testOffer?.couponCode ?? "",
        offerId: testOffer?.offerId ?? "",
      },
    }

    providerSubscription = await client.subscriptions.create(subscriptionCreatePayload)
  } catch {
    await prisma.$transaction(async (tx) => {
      await acquireLock(tx, `insights-subscription:create-failed:${prepared.subscription.id}`)
      await tx.insightsSubscription.update({
        where: { id: prepared.subscription.id },
        data: {
          status: InsightsSubscriptionStatus.EXPIRED,
          endedAt: new Date(),
        },
      })
      await logSubscriptionAudit(tx, prepared.subscription.id, "SUBSCRIPTION_PROVIDER_CREATE_FAILED", {
        plan: params.plan,
      })
    })

    throw new InsightsSubscriptionApiError(
      502,
      "SUBSCRIPTION_CREATE_FAILED",
      "Unable to create Insights subscription with Razorpay"
    )
  }

  const providerEntity = normalizeProviderSubscriptionEntity(providerSubscription)
  if (!providerEntity.id) {
    throw new InsightsSubscriptionApiError(
      502,
      "SUBSCRIPTION_CREATE_FAILED",
      "Razorpay did not return a valid subscription ID"
    )
  }

  const updated = await prisma.$transaction(
    async (tx) => {
      await acquireLock(tx, `insights-subscription:finalize-create:${prepared.subscription.id}`)

      await applyProviderSubscriptionSnapshot(
        tx,
        {
          id: prepared.subscription.id,
          status: prepared.subscription.status,
          cancelAtCycleEnd: prepared.subscription.cancelAtCycleEnd,
        },
        providerEntity,
        "SUBSCRIPTION_CREATED_PROVIDER"
      )

      return tx.insightsSubscription.findUniqueOrThrow({
        where: { id: prepared.subscription.id },
        include: {
          charges: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      })
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  )

  return {
    membership: serializeMembership(updated),
    razorpaySubscriptionId: providerEntity.id,
    razorpayKeyId: getRazorpaySubscriptionKeyIdOrThrow(),
    reused: false,
  }
}

export async function verifyInsightsCheckoutAndSync(params: {
  userId: string
  razorpaySubscriptionId: string
  razorpayPaymentId: string
  razorpaySignature: string
}): Promise<InsightsMembershipSummary> {
  ensureCheckoutConfigured()

  const localSubscription = await prisma.insightsSubscription.findUnique({
    where: {
      razorpaySubscriptionId: params.razorpaySubscriptionId,
    },
  })

  if (!localSubscription) {
    throw new InsightsSubscriptionApiError(
      404,
      "SUBSCRIPTION_NOT_FOUND",
      "Insights subscription not found"
    )
  }

  if (localSubscription.userId !== params.userId) {
    throw new InsightsSubscriptionApiError(
      403,
      "SUBSCRIPTION_ACCESS_DENIED",
      "This Insights subscription does not belong to you"
    )
  }

  if (!localSubscription.razorpaySubscriptionId) {
    throw new InsightsSubscriptionApiError(
      409,
      "SUBSCRIPTION_NOT_READY",
      "Insights subscription is not ready to be verified yet"
    )
  }
  const verifiedSubscriptionId = localSubscription.razorpaySubscriptionId

  if (
    !verifyInsightsSubscriptionCheckoutSignature({
      razorpayPaymentId: params.razorpayPaymentId,
      razorpaySubscriptionId: verifiedSubscriptionId,
      razorpaySignature: params.razorpaySignature,
    })
  ) {
    throw new InsightsSubscriptionApiError(
      400,
      "INVALID_SIGNATURE",
      "Subscription signature verification failed"
    )
  }

  const client = getRazorpayClientOrThrow()

  let providerSubscription: RazorpaySubscriptionRecord
  try {
    providerSubscription = await client.subscriptions.fetch(params.razorpaySubscriptionId)
  } catch {
    throw new InsightsSubscriptionApiError(
      502,
      "SUBSCRIPTION_FETCH_FAILED",
      "Unable to verify subscription status with Razorpay"
    )
  }

  const providerEntity = normalizeProviderSubscriptionEntity(providerSubscription)
  const providerPayment = await fetchProviderPayment(client, params.razorpayPaymentId)

  const updated = await prisma.$transaction(
    async (tx) => {
      await acquireLock(tx, `insights-subscription:verify:${params.razorpaySubscriptionId}`)

      const subscription = await tx.insightsSubscription.findUnique({
        where: {
          razorpaySubscriptionId: verifiedSubscriptionId,
        },
      })

      if (!subscription) {
        throw new InsightsSubscriptionApiError(
          404,
          "SUBSCRIPTION_NOT_FOUND",
          "Insights subscription not found"
        )
      }

      if (subscription.userId !== params.userId) {
        throw new InsightsSubscriptionApiError(
          403,
          "SUBSCRIPTION_ACCESS_DENIED",
          "This Insights subscription does not belong to you"
        )
      }

      await applyProviderSubscriptionSnapshot(
        tx,
        {
          id: subscription.id,
          status: subscription.status,
          cancelAtCycleEnd: subscription.cancelAtCycleEnd,
        },
        providerEntity,
        "SUBSCRIPTION_VERIFIED_API",
        providerPayment
      )

      return tx.insightsSubscription.findUniqueOrThrow({
        where: { id: subscription.id },
        include: {
          charges: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      })
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  )

  return serializeMembership(updated)
}

export async function cancelInsightsMembership(params: {
  userId: string
}): Promise<{ membership: InsightsMembershipSummary; idempotent: boolean }> {
  ensureCheckoutConfigured()

  const current = await prisma.insightsSubscription.findFirst({
    where: {
      userId: params.userId,
      status: {
        in: [
          InsightsSubscriptionStatus.AUTHENTICATED,
          InsightsSubscriptionStatus.ACTIVE,
          InsightsSubscriptionStatus.PENDING,
          InsightsSubscriptionStatus.HALTED,
          InsightsSubscriptionStatus.PAUSED,
          InsightsSubscriptionStatus.CANCEL_REQUESTED,
        ],
      },
    },
    include: {
      charges: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  if (!current) {
    throw new InsightsSubscriptionApiError(
      404,
      "SUBSCRIPTION_NOT_FOUND",
      "No cancellable Insights subscription was found"
    )
  }

  if (!current.razorpaySubscriptionId) {
    throw new InsightsSubscriptionApiError(
      409,
      "SUBSCRIPTION_NOT_READY",
      "Insights subscription is not ready to be cancelled yet"
    )
  }

  if (current.status === InsightsSubscriptionStatus.CANCEL_REQUESTED) {
    return {
      membership: serializeMembership(current),
      idempotent: true,
    }
  }

  const client = getRazorpayClientOrThrow()
  let providerSubscription: RazorpaySubscriptionRecord
  try {
    providerSubscription = await client.subscriptions.cancel(current.razorpaySubscriptionId, true)
  } catch {
    throw new InsightsSubscriptionApiError(
      502,
      "SUBSCRIPTION_CANCEL_FAILED",
      "Unable to request cancellation with Razorpay"
    )
  }

  const providerEntity = normalizeProviderSubscriptionEntity(providerSubscription)

  const updated = await prisma.$transaction(
    async (tx) => {
      await acquireLock(tx, `insights-subscription:cancel:${current.id}`)

      await tx.insightsSubscription.update({
        where: { id: current.id },
        data: {
          status:
            providerEntity.status === "cancelled"
              ? InsightsSubscriptionStatus.CANCELLED
              : InsightsSubscriptionStatus.CANCEL_REQUESTED,
          cancelAtCycleEnd: providerEntity.status !== "cancelled",
          cancelRequestedAt: new Date(),
          cancelledAt:
            providerEntity.status === "cancelled"
              ? providerEntity.cancelledAt ?? new Date()
              : null,
          currentStartAt: providerEntity.currentStartAt,
          currentEndAt: providerEntity.currentEndAt,
          chargeAt: providerEntity.chargeAt,
          endedAt: providerEntity.endedAt,
          remainingCount: providerEntity.remainingCount,
          paidCount: providerEntity.paidCount,
          lastWebhookAt: new Date(),
        },
      })

      await logSubscriptionAudit(tx, current.id, "SUBSCRIPTION_CANCEL_REQUESTED", {
        razorpaySubscriptionId: current.razorpaySubscriptionId,
        providerStatus: providerEntity.status,
      })

      return tx.insightsSubscription.findUniqueOrThrow({
        where: { id: current.id },
        include: {
          charges: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      })
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  )

  return {
    membership: serializeMembership(updated),
    idempotent: false,
  }
}

export async function reserveInsightsWebhookEventProcessing(params: {
  webhookEventId: string
  eventType: string
  payloadHash: string
  razorpaySubscriptionId?: string | null
  razorpayPaymentId?: string | null
}): Promise<boolean> {
  ensureWebhookConfigured()

  const now = new Date()
  try {
    await prisma.insightsSubscriptionWebhookEvent.create({
      data: {
        webhookEventId: params.webhookEventId,
        eventType: params.eventType,
        payloadHash: params.payloadHash,
        razorpaySubscriptionId: params.razorpaySubscriptionId ?? null,
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

  const existing = await prisma.insightsSubscriptionWebhookEvent.findUnique({
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
    throw new InsightsSubscriptionApiError(
      409,
      "WEBHOOK_EVENT_CONFLICT",
      "Subscription webhook event ID was reused with a different payload"
    )
  }

  if (existing.processedAt) {
    return false
  }

  const processingStartedAtMs = existing.processingStartedAt?.getTime() ?? 0
  if (processingStartedAtMs > 0 && Date.now() - processingStartedAtMs <= WEBHOOK_PROCESSING_TIMEOUT_MS) {
    return false
  }

  const takeover = await prisma.insightsSubscriptionWebhookEvent.updateMany({
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

export async function markInsightsWebhookEventProcessed(webhookEventId: string) {
  await prisma.insightsSubscriptionWebhookEvent.updateMany({
    where: {
      webhookEventId,
      processedAt: null,
    },
    data: {
      processedAt: new Date(),
    },
  })
}

export async function processInsightsSubscriptionWebhook(params: {
  eventType: string
  subscriptionEntity: unknown
  paymentEntity?: unknown
}): Promise<{ handled: boolean; membership: InsightsMembershipSummary | null }> {
  ensureWebhookConfigured()

  const providerSubscription = normalizeProviderSubscriptionEntity(params.subscriptionEntity)
  const providerPayment = normalizeProviderPaymentEntity(params.paymentEntity)

  if (!providerSubscription.id) {
    return {
      handled: false,
      membership: null,
    }
  }

  const providerSubscriptionId = providerSubscription.id

  const updated = await prisma.$transaction(
    async (tx) => {
      await acquireLock(tx, `insights-subscription:webhook:${providerSubscriptionId}`)

      let subscription = await tx.insightsSubscription.findUnique({
        where: {
          razorpaySubscriptionId: providerSubscriptionId,
        },
      })

      if (!subscription) {
        const localSubscriptionId = getStringNote(providerSubscription.notes, "localSubscriptionId")
        if (localSubscriptionId) {
          subscription = await tx.insightsSubscription.findUnique({
            where: { id: localSubscriptionId },
          })
        }
      }

      if (!subscription) {
        const notedUserId = getStringNote(providerSubscription.notes, "userId")
        if (notedUserId) {
          subscription = await tx.insightsSubscription.findFirst({
            where: {
              userId: notedUserId,
              status: {
                in: [
                  InsightsSubscriptionStatus.CREATED,
                  InsightsSubscriptionStatus.AUTHENTICATED,
                  InsightsSubscriptionStatus.PENDING,
                ],
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          })
        }
      }

      if (!subscription) {
        return null
      }

      await applyProviderSubscriptionSnapshot(
        tx,
        {
          id: subscription.id,
          status: subscription.status,
          cancelAtCycleEnd: subscription.cancelAtCycleEnd,
        },
        providerSubscription,
        `WEBHOOK_${params.eventType.toUpperCase().replace(/\./g, "_")}`,
        providerPayment
      )

      return tx.insightsSubscription.findUniqueOrThrow({
        where: { id: subscription.id },
        include: {
          charges: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      })
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  )

  return {
    handled: Boolean(updated),
    membership: updated ? serializeMembership(updated) : null,
  }
}

export function mapInsightsSubscriptionApiError(error: unknown): {
  status: number
  code: string
  message: string
} {
  if (error instanceof InsightsSubscriptionApiError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
    }
  }

  console.error("Insights subscription error", error)

  return {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "Unexpected Insights subscription error",
  }
}

export function getInsightsSubscriptionUiState() {
  const runtime = getInsightsSubscriptionRuntimeState()

  return {
    enabled: runtime.featureEnabled,
    checkoutReady: runtime.checkoutReady,
    webhookReady: runtime.webhookReady,
    plans: getInsightsSubscriptionPlanCatalog().map((plan) => ({
      key: plan.key,
      label: plan.label,
      description: plan.description,
      cadence: plan.cadence,
      priceLabel: plan.priceLabel,
      badge: plan.badge ?? null,
    })),
  }
}
