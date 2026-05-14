import { auth } from "@/auth"
import {
  InsightsSubscriptionApiError,
  mapInsightsSubscriptionApiError,
  verifyInsightsCheckoutAndSync,
} from "@/lib/insights-subscription-service"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

function parseString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new InsightsSubscriptionApiError(400, "INVALID_PAYLOAD", `${field} is required`)
  }

  return value.trim()
}

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

    const razorpaySubscriptionId = parseString(
      body?.razorpaySubscriptionId ?? body?.razorpay_subscription_id,
      "razorpaySubscriptionId"
    )
    const razorpayPaymentId = parseString(
      body?.razorpayPaymentId ?? body?.razorpay_payment_id,
      "razorpayPaymentId"
    )
    const razorpaySignature = parseString(
      body?.razorpaySignature ?? body?.razorpay_signature,
      "razorpaySignature"
    )

    const membership = await verifyInsightsCheckoutAndSync({
      userId: session.user.id,
      razorpaySubscriptionId,
      razorpayPaymentId,
      razorpaySignature,
    })

    return NextResponse.json({
      success: true,
      data: {
        membership,
      },
    })
  } catch (error) {
    const mapped = mapInsightsSubscriptionApiError(error)
    return NextResponse.json(
      { success: false, code: mapped.code, message: mapped.message },
      { status: mapped.status }
    )
  }
}
