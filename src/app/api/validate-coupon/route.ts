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
        coupon: pricing.coupon
          ? {
              code: pricing.coupon.code,
              type: pricing.coupon.type,
              value: pricing.coupon.value,
              maxUses: pricing.coupon.maxUses,
              usedCount: pricing.coupon.usedCount,
              perUserLimit: pricing.coupon.perUserLimit,
              expiryDate: pricing.coupon.expiryDate,
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
