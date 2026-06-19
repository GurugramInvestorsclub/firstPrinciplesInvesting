import {
  createOrReuseOrder,
  getRazorpayKeyId,
  mapPaymentApiError,
  normalizeCouponCode,
  normalizeEventId,
  normalizeGuestEmail,
  normalizeGuestName,
  normalizeGuestPhone,
  paiseToRupees,
} from "@/lib/payment-service"
import { prisma } from "@/lib/prisma"
import { buildRateLimitIdentifier, consumeRateLimit } from "@/lib/rate-limit"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

async function findOrCreateGuestUser(params: { email: string; name: string }) {
  const existing = await prisma.user.findUnique({
    where: { email: params.email },
    select: { id: true, name: true },
  })

  if (existing) {
    if (!existing.name) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { name: params.name },
      })
    }

    return existing.id
  }

  const user = await prisma.user.create({
    data: {
      email: params.email,
      name: params.name,
    },
    select: { id: true },
  })

  return user.id
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = normalizeGuestName(body?.name)
    const email = normalizeGuestEmail(body?.email)
    const phone = normalizeGuestPhone(body?.phone)
    const eventId = normalizeEventId(body?.eventId)
    const couponCode = normalizeCouponCode(body?.couponCode)

    const identifier = buildRateLimitIdentifier(request, `guest-checkout:${email}`)
    let rateLimit: Awaited<ReturnType<typeof consumeRateLimit>> | null = null
    try {
      rateLimit = await consumeRateLimit({
        scope: "guest-checkout:create-order",
        identifier,
        maxRequests: 8,
        windowSeconds: 60 * 60,
        blockDurationSeconds: 2 * 60 * 60,
      })
    } catch (error) {
      console.error("Guest checkout rate limiter unavailable; continuing without throttle", error)
    }

    if (rateLimit && !rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: "RATE_LIMITED",
          message: "Too many checkout attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      )
    }

    const userId = await findOrCreateGuestUser({ email, name })
    const order = await createOrReuseOrder({
      userId,
      eventId,
      couponCode,
      isGuest: true,
    })

    await prisma.registration.upsert({
      where: {
        email_seminarSlug: {
          email,
          seminarSlug: eventId,
        },
      },
      update: {
        name,
        phone,
        paymentStatus: "pending",
        razorpayOrderId: order.orderId,
      },
      create: {
        name,
        email,
        phone,
        seminarSlug: eventId,
        paymentStatus: "pending",
        razorpayOrderId: order.orderId,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        paymentId: order.paymentId,
        orderId: order.orderId,
        amount: order.amount,
        amountRupees: paiseToRupees(order.amount),
        currency: order.currency,
        eventId: order.eventId,
        couponCode: order.couponCode,
        reused: order.reused,
        razorpayKeyId: getRazorpayKeyId(),
      },
    })
  } catch (error) {
    const mapped = mapPaymentApiError(error)
    const message =
      mapped.code === "ALREADY_PAID"
        ? "This email is already registered for this event"
        : mapped.message

    return NextResponse.json(
      { success: false, code: mapped.code, message },
      { status: mapped.status }
    )
  }
}
