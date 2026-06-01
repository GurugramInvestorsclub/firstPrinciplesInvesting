import { prisma } from "@/lib/prisma"
import { PaymentStatus } from "@prisma/client"
import { NextResponse, NextRequest } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"

function toSafeCsvCell(value: string | null | undefined): string {
    const normalized = (value ?? "").replace(/\r?\n/g, " ").trim()
    const formulaPrefixed = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized
    return `"${formulaPrefixed.replace(/"/g, '""')}"`
}

export async function GET(request: NextRequest) {
    try {
        if (!(await isAdminAuthenticated())) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const seminar = searchParams.get("seminar")

        const registrations = await prisma.registration.findMany({
            where: seminar ? { seminarSlug: seminar } : undefined,
            select: {
                name: true,
                email: true,
                phone: true,
                seminarSlug: true,
                paymentStatus: true,
                razorpayOrderId: true,
            },
            orderBy: { createdAt: "desc" },
        })

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

        const header = "name,email,phone,seminarSlug,paymentStatus,amount"
        const rows = registrations.map(
            (r) => {
                const amountPaise = r.razorpayOrderId ? amountMap.get(r.razorpayOrderId) || null : null
                const amount = amountPaise !== null ? (amountPaise / 100).toString() : ""
                return `${toSafeCsvCell(r.name)},${toSafeCsvCell(r.email)},${toSafeCsvCell(r.phone)},${toSafeCsvCell(r.seminarSlug)},${toSafeCsvCell(r.paymentStatus)},${toSafeCsvCell(amount)}`
            }
        )
        const csv = [header, ...rows].join("\n")

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition":
                    'attachment; filename="registrations.csv"',
            },
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        )
    }
}
