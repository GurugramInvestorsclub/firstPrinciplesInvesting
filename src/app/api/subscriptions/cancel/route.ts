import { auth } from "@/auth"
import {
  cancelInsightsMembership,
  mapInsightsSubscriptionApiError,
} from "@/lib/insights-subscription-service"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, code: "UNAUTHORIZED", message: "Login is required" },
        { status: 401 }
      )
    }

    const result = await cancelInsightsMembership({
      userId: session.user.id,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    const mapped = mapInsightsSubscriptionApiError(error)
    return NextResponse.json(
      { success: false, code: mapped.code, message: mapped.message },
      { status: mapped.status }
    )
  }
}
