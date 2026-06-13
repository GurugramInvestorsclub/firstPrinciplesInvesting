import { client } from "@/lib/sanity.client"
import { groq } from "next-sanity"
import {
  finalizeCapturedPayment,
  initiateCompensatingRefund,
  mapPaymentApiError,
  requiresCompensatingRefund,
  validateCapturedPaymentAtProvider,
  verifyCheckoutSignature,
} from "@/lib/payment-service"
import { prisma } from "@/lib/prisma"
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
    })

    const result = await finalizeCapturedPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      phoneNumber: contact,
      source: "api",
    })

    if (!result.ok) {
      let refund = null
      if (result.razorpayPaymentId && requiresCompensatingRefund(result.reason)) {
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

    const registration = await prisma.registration.findFirst({
      where: {
        razorpayOrderId,
        seminarSlug: result.eventId,
      },
      select: {
        email: true,
        phone: true,
      },
    })

    let whatsappLink = null
    try {
      const query = groq`*[_type in ["event", "super30Program"] && eventId == $eventId][0].whatsappLink`
      whatsappLink = await client.fetch(query, { eventId: result.eventId })
    } catch (sanityError) {
      console.error("Failed to fetch WhatsApp link from Sanity:", sanityError)
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: result.paymentId,
        eventId: result.eventId,
        idempotent: result.idempotent,
        email: registration?.email ?? "",
        phone: registration?.phone ?? contact ?? "",
        whatsappLink,
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
