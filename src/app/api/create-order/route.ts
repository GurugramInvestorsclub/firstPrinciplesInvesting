import { prisma } from "@/lib/prisma"
import { razorpay } from "@/lib/razorpay"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { registrationId, amount } = body

        if (!registrationId || !amount) {
            return NextResponse.json(
                { success: false, message: "registrationId and amount are required" },
                { status: 400 }
            )
        }

        if (typeof amount !== "number" || amount <= 0) {
            return NextResponse.json(
                { success: false, message: "amount must be a positive number" },
                { status: 400 }
            )
        }

        // Verify registration exists
        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
        })

        if (!registration) {
            return NextResponse.json(
                { success: false, message: "Registration not found" },
                { status: 404 }
            )
        }

        if (registration.paymentStatus === "paid") {
            return NextResponse.json(
                { success: false, message: "Payment already completed" },
                { status: 400 }
            )
        }

        // Create Razorpay order (amount in paise)
        const order = await razorpay.orders.create({
            amount: amount,
            currency: "INR",
            receipt: registrationId,
        })

        // Store the order ID
        await prisma.registration.update({
            where: { id: registrationId },
            data: { razorpayOrderId: order.id },
        })

        return NextResponse.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                registrationId,
            },
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        )
    }
}
