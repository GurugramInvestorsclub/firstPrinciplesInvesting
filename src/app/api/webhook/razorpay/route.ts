import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text()

        // Verify webhook signature
        const signature = request.headers.get("x-razorpay-signature")
        if (!signature) {
            return NextResponse.json(
                { success: false, message: "Missing signature" },
                { status: 400 }
            )
        }

        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
        if (!webhookSecret) {
            console.error("RAZORPAY_WEBHOOK_SECRET is not set")
            return NextResponse.json(
                { success: false, message: "Server configuration error" },
                { status: 500 }
            )
        }

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("hex")

        if (signature !== expectedSignature) {
            console.error("Webhook signature mismatch")
            return NextResponse.json(
                { success: false, message: "Invalid signature" },
                { status: 400 }
            )
        }

        // Parse and process the event
        const event = JSON.parse(rawBody)

        if (event.event === "payment.captured") {
            const payment = event.payload?.payment?.entity

            if (!payment) {
                return NextResponse.json(
                    { success: false, message: "Invalid payload" },
                    { status: 400 }
                )
            }

            const razorpayOrderId = payment.order_id
            const razorpayPaymentId = payment.id

            // Find and update registration
            const registration = await prisma.registration.findUnique({
                where: { razorpayOrderId },
            })

            if (!registration) {
                console.error(`Registration not found for order: ${razorpayOrderId}`)
                return NextResponse.json(
                    { success: false, message: "Registration not found" },
                    { status: 404 }
                )
            }

            await prisma.registration.update({
                where: { razorpayOrderId },
                data: {
                    paymentStatus: "paid",
                    razorpayPaymentId,
                },
            })

            console.log(`Payment captured for registration ${registration.id}`)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Webhook error:", error)
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        )
    }
}
