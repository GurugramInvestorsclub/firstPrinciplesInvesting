import { auth } from "@/auth"
import {
  createInsightsSubscription,
  mapInsightsSubscriptionApiError,
  normalizeInsightsPlan,
} from "@/lib/insights-subscription-service"
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
    const plan = normalizeInsightsPlan(body?.plan)
    const couponCode =
      typeof body?.couponCode === "string" && body.couponCode.trim().length > 0
        ? body.couponCode.trim()
        : null

    const result = await createInsightsSubscription({
      userId: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      plan,
      couponCode,
    })

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: result.razorpaySubscriptionId,
        membership: result.membership,
        razorpayKeyId: result.razorpayKeyId,
        reused: result.reused,
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
