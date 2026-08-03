import { isAdminAuthenticated } from "@/lib/admin-auth"
import {
  InsightsSubscriptionApiError,
  mapInsightsSubscriptionApiError,
  revokeManualInsightsSubscription,
} from "@/lib/insights-subscription-service"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

function unauthorized() {
  return NextResponse.json({ success: false, code: "UNAUTHORIZED", message: "Unauthorized" }, { status: 401 })
}

function parseRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new InsightsSubscriptionApiError(400, "INVALID_PAYLOAD", `${field} is required`)
  }

  return value.trim()
}

function parseOptionalString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim()
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorized()
    }

    const body = await request.json()
    const subscriptionId = parseRequiredString(body?.subscriptionId, "subscriptionId")
    const adminNotes = parseOptionalString(body?.adminNotes)

    const membership = await revokeManualInsightsSubscription({
      subscriptionId,
      adminNotes,
    })

    return NextResponse.json({
      success: true,
      data: {
        membership,
      },
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, code: "INVALID_JSON", message: "Invalid JSON payload" },
        { status: 400 }
      )
    }

    const mapped = mapInsightsSubscriptionApiError(error)
    return NextResponse.json(
      { success: false, code: mapped.code, message: mapped.message },
      { status: mapped.status }
    )
  }
}
