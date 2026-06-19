import {
  hashInsightsSubscriptionPayload,
  mapInsightsSubscriptionApiError,
  markInsightsWebhookEventProcessed,
  processInsightsSubscriptionWebhook,
  reserveInsightsWebhookEventProcessing,
  verifyInsightsSubscriptionWebhookSignature,
} from "@/lib/insights-subscription-service"
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
      console.warn("[Webhook Warning] Missing x-razorpay-signature header on incoming subscription webhook request.")
      return NextResponse.json(
        { success: false, code: "MISSING_SIGNATURE", message: "Missing webhook signature" },
        { status: 400 }
      )
    }

    if (!verifyInsightsSubscriptionWebhookSignature(rawBody, signature)) {
      console.warn("[Webhook Warning] Signature verification failed for incoming subscription webhook request. Check if RAZORPAY_SUBSCRIPTIONS_WEBHOOK_SECRET is correct.")
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_SIGNATURE",
          message: "Webhook signature verification failed",
        },
        { status: 400 }
      )
    }

    const payload = JSON.parse(rawBody)
    const eventType = asString(payload?.event) ?? "unknown"
    const subscriptionEntity = payload?.payload?.subscription?.entity
    const paymentEntity = payload?.payload?.payment?.entity
    const razorpaySubscriptionId = asString(subscriptionEntity?.id)
    const razorpayPaymentId = asString(paymentEntity?.id)
    const webhookEventIdHeader = request.headers.get("x-razorpay-event-id")
    const webhookEventId =
      asString(webhookEventIdHeader) ?? `${eventType}:${hashInsightsSubscriptionPayload(rawBody)}`

    const shouldProcess = await reserveInsightsWebhookEventProcessing({
      webhookEventId,
      eventType,
      payloadHash: hashInsightsSubscriptionPayload(rawBody),
      razorpaySubscriptionId,
      razorpayPaymentId,
    })

    if (!shouldProcess) {
      return NextResponse.json({
        success: true,
        idempotent: true,
        message: "Duplicate subscription webhook ignored",
      })
    }

    const result = await processInsightsSubscriptionWebhook({
      eventType,
      subscriptionEntity,
      paymentEntity,
    })

    await markInsightsWebhookEventProcessed(webhookEventId)

    return NextResponse.json({
      success: true,
      data: {
        eventType,
        handled: result.handled,
        membership: result.membership,
      },
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, code: "INVALID_JSON", message: "Invalid webhook payload" },
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
