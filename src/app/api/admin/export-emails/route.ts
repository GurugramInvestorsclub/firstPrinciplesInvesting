import { prisma } from "@/lib/prisma"
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
                amountPaise: true,
            },
            orderBy: { createdAt: "desc" },
        })

        const header = "name,email,phone,seminarSlug,paymentStatus,amount"
        const rows = registrations.map(
            (r: { name: string; email: string; phone: string | null; seminarSlug: string; paymentStatus: string; amountPaise: number | null }) => {
                const amount = r.amountPaise !== null ? (r.amountPaise / 100).toString() : ""
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
