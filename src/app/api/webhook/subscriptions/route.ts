import {
  hashInsightsSubscriptionPayload,
  mapInsightsSubscriptionApiError,
  markInsightsWebhookEventProcessed,
  processInsightsSubscriptionWebhook,
  reserveInsightsWebhookEventProcessing,
  verifyInsightsSubscriptionWebhookSignature,
} from "@/lib/insights-subscription-service"
import { NextRequest, NextResponse } from "next/server"
import { trackServerEvent } from "@/lib/analytics/server"

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

    if (result.handled) {
      const planSlug = result.membership?.planKey ?? "three_monthly"
      const distinctId = result.membership?.userId || razorpaySubscriptionId || "unknown_subscriber"
      const amount = paymentEntity?.amount ? paymentEntity.amount / 100 : 2100

      if (eventType === "subscription.charged" || eventType === "subscription.activated") {
        trackServerEvent({
          distinctId,
          event: "payment_success",
          properties: {
            product_id: `insights_${planSlug}`,
            product_name: "Insights Membership",
            plan: planSlug,
            amount,
            currency: "INR",
            subscription_id: razorpaySubscriptionId,
            payment_id: razorpayPaymentId,
            payment_provider: "razorpay",
          },
        }).catch((err) => console.error("Subscription webhook payment tracking failed:", err))

        if (eventType === "subscription.charged") {
          trackServerEvent({
            distinctId,
            event: "subscription_renewed",
            properties: {
              plan: planSlug,
              amount,
              currency: "INR",
              payment_provider: "razorpay",
            },
          }).catch((err) => console.error("Subscription webhook renewal tracking failed:", err))
        }
      } else if (eventType === "subscription.cancelled") {
        trackServerEvent({
          distinctId,
          event: "subscription_cancelled",
          properties: {
            plan: planSlug,
            reason: "webhook_cancelled",
          },
        }).catch((err) => console.error("Subscription webhook cancellation tracking failed:", err))
      }
    }

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
