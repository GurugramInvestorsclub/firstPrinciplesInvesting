import { auth } from "@/auth"
import {
  finalizeCapturedPayment,
  initiateCompensatingRefund,
  mapPaymentApiError,
  requiresCompensatingRefund,
  validateCapturedPaymentAtProvider,
  verifyCheckoutSignature,
} from "@/lib/payment-service"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

function parseString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required`)
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

    const razorpayOrderId = parseString(
      body?.razorpayOrderId ?? body?.razorpay_order_id,
      "razorpayOrderId"
    )
    const razorpayPaymentId = parseString(
      body?.razorpayPaymentId ?? body?.razorpay_payment_id,
      "razorpayPaymentId"
    )
    const razorpaySignature = parseString(
      body?.razorpaySignature ?? body?.razorpay_signature,
      "razorpaySignature"
    )

    if (!verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })) {
      return NextResponse.json(
        { success: false, code: "INVALID_SIGNATURE", message: "Signature verification failed" },
        { status: 400 }
      )
    }

    const { contact } = await validateCapturedPaymentAtProvider({
      razorpayOrderId,
      razorpayPaymentId,
      expectedUserId: session.user.id,
    })

    const result = await finalizeCapturedPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      expectedUserId: session.user.id,
      phoneNumber: contact,
      source: "api",
    })

    if (!result.ok) {
      let refund = null
      if (
        result.razorpayPaymentId &&
        requiresCompensatingRefund(result.reason)
      ) {
        refund = await initiateCompensatingRefund({
          paymentId: result.paymentId,
          reason: result.reason ?? "UNKNOWN_CAPTURE_FAILURE",
          source: "api",
        })
      }

      return NextResponse.json(
        {
          success: false,
          code: result.reason ?? "PAYMENT_FAILED",
          message: "Payment could not be finalized safely",
          data: {
            paymentId: result.paymentId,
            eventId: result.eventId,
            idempotent: result.idempotent,
            refund,
          },
        },
        { status: 409 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: result.paymentId,
        eventId: result.eventId,
        idempotent: result.idempotent,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("is required")) {
      return NextResponse.json(
        { success: false, code: "INVALID_PAYLOAD", message: error.message },
        { status: 400 }
      )
    }

    const mapped = mapPaymentApiError(error)
    return NextResponse.json(
      { success: false, code: mapped.code, message: mapped.message },
      { status: mapped.status }
    )
  }
}
