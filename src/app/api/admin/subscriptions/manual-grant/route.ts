import { isAdminAuthenticated } from "@/lib/admin-auth"
import {
  grantManualInsightsSubscription,
  InsightsSubscriptionApiError,
  mapInsightsSubscriptionApiError,
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

function parseOptionalNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const num = Number(value.trim())
    if (Number.isFinite(num) && num > 0) {
      return num
    }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorized()
    }

    const body = await request.json()
    const email = parseRequiredString(body?.email, "email")
    const name = parseOptionalString(body?.name)
    const durationPreset = body?.durationPreset === "1_year" ? "1_year" : "3_months"
    const paymentMethod = parseOptionalString(body?.paymentMethod) || "NEFT"
    const utrNumber = parseOptionalString(body?.utrNumber)
    const amountPaid = parseOptionalNumber(body?.amountPaid)
    const adminNotes = parseOptionalString(body?.adminNotes)
    const sendEmailNotification = body?.sendEmailNotification !== false

    const membership = await grantManualInsightsSubscription({
      email,
      name,
      planKey: durationPreset === "1_year" ? "yearly" : "three_monthly",
      durationPreset,
      paymentMethod,
      utrNumber,
      amountPaid,
      adminNotes,
      sendEmailNotification,
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
