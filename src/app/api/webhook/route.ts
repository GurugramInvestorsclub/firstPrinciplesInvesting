import {
  finalizeCapturedPayment,
  hashPayload,
  initiateCompensatingRefund,
  mapPaymentApiError,
  markOrderFailed,
  markWebhookEventProcessed,
  requiresCompensatingRefund,
  reserveWebhookEventProcessing,
  verifyWebhookSignature,
} from "@/lib/payment-service"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-razorpay-signature")

    if (!signature) {
      return NextResponse.json(
        { success: false, code: "MISSING_SIGNATURE", message: "Missing webhook signature" },
        { status: 400 }
      )
    }

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { success: false, code: "INVALID_SIGNATURE", message: "Webhook signature verification failed" },
        { status: 400 }
      )
    }

    const payload = JSON.parse(rawBody)
    const eventType = asString(payload?.event) ?? "unknown"

    const paymentEntity = payload?.payload?.payment?.entity
    const razorpayOrderId = asString(paymentEntity?.order_id)
    const razorpayPaymentId = asString(paymentEntity?.id)
    const webhookEventIdHeader = request.headers.get("x-razorpay-event-id")
    const webhookEventId = asString(webhookEventIdHeader) ?? `${eventType}:${hashPayload(rawBody)}`

    const shouldProcess = await reserveWebhookEventProcessing({
      webhookEventId,
      eventType,
      payloadHash: hashPayload(rawBody),
      razorpayOrderId,
      razorpayPaymentId,
    })

    if (!shouldProcess) {
      return NextResponse.json({
        success: true,
        idempotent: true,
        message: "Duplicate webhook ignored",
      })
    }

    if (eventType === "payment.captured" && razorpayOrderId && razorpayPaymentId) {
      let captureResult: Awaited<ReturnType<typeof finalizeCapturedPayment>>
      let refund = null

      try {
        captureResult = await finalizeCapturedPayment({
          razorpayOrderId,
          razorpayPaymentId,
          phoneNumber: asString(paymentEntity?.contact),
          source: "webhook",
        })
      } catch (error) {
        const mapped = mapPaymentApiError(error)
        if (mapped.code === "PAYMENT_NOT_FOUND") {
          await markWebhookEventProcessed(webhookEventId)
          return NextResponse.json({
            success: true,
            data: {
              eventType,
              ignored: true,
              reason: "ORDER_NOT_FOUND_IN_SYSTEM",
            },
          })
        }

        throw error
      }

      if (!captureResult.ok && requiresCompensatingRefund(captureResult.reason)) {
        refund = await initiateCompensatingRefund({
          paymentId: captureResult.paymentId,
          reason: captureResult.reason ?? "UNKNOWN_CAPTURE_FAILURE",
          source: "webhook",
        })
      }

      await markWebhookEventProcessed(webhookEventId)

      return NextResponse.json({
        success: true,
        data: {
          eventType,
          paymentId: captureResult.paymentId,
          ok: captureResult.ok,
          idempotent: captureResult.idempotent,
          reason: captureResult.reason,
          refund,
        },
      })
    }

    if (eventType === "payment.failed" && razorpayOrderId) {
      const failedResult = await markOrderFailed({
        razorpayOrderId,
        razorpayPaymentId,
        reason: "RAZORPAY_PAYMENT_FAILED",
      })

      await markWebhookEventProcessed(webhookEventId)

      return NextResponse.json({
        success: true,
        data: {
          eventType,
          paymentId: failedResult.paymentId,
          updated: failedResult.updated,
          idempotent: failedResult.idempotent,
        },
      })
    }

    await markWebhookEventProcessed(webhookEventId)

    return NextResponse.json({
      success: true,
      data: {
        eventType,
        ignored: true,
      },
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, code: "INVALID_JSON", message: "Invalid webhook payload" },
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
