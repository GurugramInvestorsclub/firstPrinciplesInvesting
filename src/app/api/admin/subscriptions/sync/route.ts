import { isAdminAuthenticated } from "@/lib/admin-auth"
import {
  mapInsightsSubscriptionApiError,
  syncAllSubscriptionsFromRazorpay,
  syncSubscriptionFromRazorpay,
} from "@/lib/insights-subscription-service"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

function unauthorized() {
  return NextResponse.json({ success: false, code: "UNAUTHORIZED", message: "Unauthorized" }, { status: 401 })
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorized()
    }

    const body = await request.json().catch(() => ({}))
    const subscriptionId = typeof body?.subscriptionId === "string" ? body.subscriptionId.trim() : null
    const syncAll = Boolean(body?.syncAll)

    if (syncAll) {
      const summary = await syncAllSubscriptionsFromRazorpay()
      return NextResponse.json({
        success: true,
        data: {
          type: "bulk",
          summary,
        },
      })
    }

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, code: "INVALID_PAYLOAD", message: "subscriptionId or syncAll is required" },
        { status: 400 }
      )
    }

    const result = await syncSubscriptionFromRazorpay(subscriptionId)
    return NextResponse.json({
      success: true,
      data: {
        type: "single",
        subscriptionId,
        invoicesCount: result.invoicesCount,
        newlySyncedCharges: result.newlySyncedCharges,
        subscription: result.subscription,
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
