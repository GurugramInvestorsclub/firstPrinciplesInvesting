import { prisma } from "@/lib/prisma"
import { PaymentStatus } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
    try {
        if (!(await isAdminAuthenticated())) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const seminar = searchParams.get("seminar")
        const email = searchParams.get("email")

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {}

        if (seminar) {
            where.seminarSlug = seminar
        }

        if (email) {
            where.email = {
                contains: email,
                mode: "insensitive",
            }
        }

        const registrations = await prisma.registration.findMany({
            where,
            orderBy: { createdAt: "desc" },
        })

        // Fetch payment amounts for these registrations
        const orderIds = registrations
            .map((r) => r.razorpayOrderId)
            .filter(Boolean) as string[]

        const payments = await prisma.payment.findMany({
            where: {
                razorpayOrderId: { in: orderIds },
                status: PaymentStatus.SUCCESS,
            },
            select: {
                razorpayOrderId: true,
                amount: true,
            },
        })

        const amountMap = new Map(payments.map((p) => [p.razorpayOrderId, p.amount]))

        const data = registrations.map((reg) => ({
            ...reg,
            amountPaise: reg.razorpayOrderId ? amountMap.get(reg.razorpayOrderId) || null : null,
        }))

        return NextResponse.json({ success: true, data })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        )
    }
}
