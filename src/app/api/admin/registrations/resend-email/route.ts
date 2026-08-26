import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { triggerRegistrationEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
    try {
        if (!(await isAdminAuthenticated())) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { registrationId, registrationIds } = body

        const idsToProcess: string[] = []
        if (registrationId && typeof registrationId === "string") {
            idsToProcess.push(registrationId)
        } else if (Array.isArray(registrationIds)) {
            idsToProcess.push(...registrationIds.filter((id) => typeof id === "string"))
        }

        if (idsToProcess.length === 0) {
            return NextResponse.json(
                { success: false, error: "No valid registrationId or registrationIds provided" },
                { status: 400 }
            )
        }

        const registrations = await prisma.registration.findMany({
            where: {
                id: { in: idsToProcess },
            },
        })

        if (registrations.length === 0) {
            return NextResponse.json(
                { success: false, error: "No matching registrations found" },
                { status: 404 }
            )
        }

        // Fetch payment amounts for these registrations
        const orderIds = registrations
            .map((r) => r.razorpayOrderId)
            .filter(Boolean) as string[]

        const payments = await prisma.payment.findMany({
            where: {
                razorpayOrderId: { in: orderIds },
            },
            select: {
                razorpayOrderId: true,
                amount: true,
                razorpayPaymentId: true,
            },
        })

        const paymentMap = new Map(payments.map((p) => [p.razorpayOrderId, p]))

        const results: { id: string; email: string; success: boolean }[] = []

        for (const reg of registrations) {
            const payment = reg.razorpayOrderId ? paymentMap.get(reg.razorpayOrderId) : null
            const amountPaid = payment?.amount ? payment.amount / 100 : undefined
            const paymentId = reg.razorpayPaymentId || payment?.razorpayPaymentId || undefined

            try {
                const sent = await triggerRegistrationEmail({
                    toEmail: reg.email,
                    toName: reg.name,
                    eventId: reg.seminarSlug,
                    orderId: reg.razorpayOrderId ?? undefined,
                    paymentId,
                    amountPaid,
                })

                results.push({
                    id: reg.id,
                    email: reg.email,
                    success: sent,
                })
            } catch (err) {
                console.error(`Failed to resend registration email to ${reg.email}:`, err)
                results.push({
                    id: reg.id,
                    email: reg.email,
                    success: false,
                })
            }
        }

        const successCount = results.filter((r) => r.success).length

        return NextResponse.json({
            success: true,
            sentCount: successCount,
            totalProcessed: results.length,
            results,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
