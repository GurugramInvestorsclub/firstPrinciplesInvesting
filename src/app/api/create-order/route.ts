import { auth } from "@/auth"
import {
  createOrReuseOrder,
  getRazorpayKeyId,
  mapPaymentApiError,
  normalizeCouponCode,
  normalizeEventId,
  paiseToRupees,
} from "@/lib/payment-service"
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

    const order = await createOrReuseOrder({
      userId: session.user.id,
      eventId,
      couponCode,
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
    return NextResponse.json(
      { success: false, code: mapped.code, message: mapped.message },
      { status: mapped.status }
    )
  }
}
