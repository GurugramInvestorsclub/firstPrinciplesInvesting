import { auth } from "@/auth"
import {
  computePricingPreview,
  mapPaymentApiError,
  normalizeCouponCode,
  normalizeEventId,
  paiseToRupees,
  paymentConstants,
} from "@/lib/payment-service"
import { prisma } from "@/lib/prisma"
import { buildRateLimitIdentifier, consumeRateLimit } from "@/lib/rate-limit"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, code: "UNAUTHORIZED", message: "Login is required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const eventId = normalizeEventId(body?.eventId)
    const couponCode = normalizeCouponCode(body?.couponCode)

    // Apply rate limiting only when a non-empty coupon code is provided (prevent brute-forcing).
    // Initial pricing previews with couponCode=null are not throttled to preserve checkout speed.
    if (couponCode) {
      const identifier = buildRateLimitIdentifier(request, `coupon:${session.user.id}`)
      let rateLimit: Awaited<ReturnType<typeof consumeRateLimit>> | null = null
      try {
        rateLimit = await consumeRateLimit({
          scope: "coupons:validate",
          identifier,
          maxRequests: 20,
          windowSeconds: 10 * 60,
          blockDurationSeconds: 15 * 60,
        })
      } catch (error) {
        console.error("Coupon rate limiter unavailable; continuing without throttle", error)
      }

      if (rateLimit && !rateLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            code: "RATE_LIMITED",
            message: "Too many coupon attempts. Please try again in a few minutes.",
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(rateLimit.retryAfterSeconds),
            },
          }
        )
      }
    }

    const pricing = await computePricingPreview({
      db: prisma,
      eventId,
      userId: session.user.id,
      couponCode,
    })

    return NextResponse.json({
      success: true,
      data: {
        eventId: pricing.eventId,
        currency: paymentConstants.currency,
        baseAmount: pricing.baseAmount,
        discountAmount: pricing.discountAmount,
        finalAmount: pricing.finalAmount,
        baseAmountRupees: paiseToRupees(pricing.baseAmount),
        discountAmountRupees: paiseToRupees(pricing.discountAmount),
        finalAmountRupees: paiseToRupees(pricing.finalAmount),
        isSubscriber: pricing.isSubscriber,
        coupon: pricing.coupon
          ? {
              code: pricing.coupon.code,
              type: pricing.coupon.type,
              value: pricing.coupon.value,
              eventId: pricing.coupon.eventId,
            }
          : null,
      },
    })
  } catch (error) {
    const mapped = mapPaymentApiError(error)
    return NextResponse.json(
      { success: false, code: mapped.code, message: mapped.message },
      { status: mapped.status }
    )
  }
}