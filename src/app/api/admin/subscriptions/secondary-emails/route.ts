import { isAdminAuthenticated } from "@/lib/admin-auth"
import {
  addSecondaryEmailForUser,
  removeSecondaryEmail,
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

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorized()
    }

    const body = await request.json()
    const userId = parseRequiredString(body?.userId, "userId")
    const secondaryEmail = parseRequiredString(body?.secondaryEmail, "secondaryEmail")

    const record = await addSecondaryEmailForUser({
      userId,
      secondaryEmail,
    })

    return NextResponse.json({
      success: true,
      data: {
        record,
        message: `Successfully granted secondary access to ${secondaryEmail}`,
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

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorized()
    }

    const body = await request.json()
    const id = body?.id ? String(body.id) : undefined
    const email = body?.email ? String(body.email) : undefined

    if (!id && !email) {
      return NextResponse.json(
        { success: false, code: "INVALID_PAYLOAD", message: "id or email is required" },
        { status: 400 }
      )
    }

    await removeSecondaryEmail({ id, email })

    return NextResponse.json({
      success: true,
      data: {
        message: "Successfully revoked secondary email access",
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
