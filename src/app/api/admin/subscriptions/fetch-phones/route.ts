import { isAdminAuthenticated } from "@/lib/admin-auth"
import {
  backfillSubscriberPhoneNumbers,
  mapInsightsSubscriptionApiError,
} from "@/lib/insights-subscription-service"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

// Max timeout for serverless execution
export const maxDuration = 120

function unauthorized() {
  return NextResponse.json({ success: false, code: "UNAUTHORIZED", message: "Unauthorized" }, { status: 401 })
}

export async function POST() {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorized()
    }

    const result = await backfillSubscriberPhoneNumbers()

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
