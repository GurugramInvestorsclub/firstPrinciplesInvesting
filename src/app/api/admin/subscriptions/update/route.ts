import { isAdminAuthenticated } from "@/lib/admin-auth"
import {
  InsightsSubscriptionApiError,
  mapInsightsSubscriptionApiError,
  updateSubscriptionDetails,
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

function parseOptionalString(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim()
  }
  return null
}

function parseOptionalNumber(value: unknown): number | null | undefined {
  if (value === undefined) {
    return undefined
  }
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const num = Number(value.trim())
    if (Number.isFinite(num) && num >= 0) {
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
    const subscriptionId = parseRequiredString(body?.subscriptionId, "subscriptionId")
    const paymentMethod = parseOptionalString(body?.paymentMethod)
    const utrNumber = parseOptionalString(body?.utrNumber)
    const amountPaid = parseOptionalNumber(body?.amountPaid)
    const currentEndAt = parseOptionalString(body?.currentEndAt)
    const adminNotes = parseOptionalString(body?.adminNotes)
    const resendEmail = body?.resendEmail === true

    const membership = await updateSubscriptionDetails({
      subscriptionId,
      paymentMethod,
      utrNumber,
      amountPaid,
      currentEndAt: currentEndAt ? new Date(currentEndAt) : undefined,
      adminNotes,
      resendEmail,
    })

    return NextResponse.json({
      success: true,
      data: {
        membership,
        message: "Subscription details updated successfully",
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
