import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"

function toSafeCsvCell(value: string | null | undefined): string {
    const normalized = (value ?? "").replace(/\r?\n/g, " ").trim()
    const formulaPrefixed = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized
    return `"${formulaPrefixed.replace(/"/g, '""')}"`
}

export async function GET() {
    try {
        if (!(await isAdminAuthenticated())) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const registrations = await prisma.registration.findMany({
            select: {
                name: true,
                email: true,
                phone: true,
                seminarSlug: true,
            },
            orderBy: { createdAt: "desc" },
        })

        const header = "name,email,phone,seminarSlug"
        const rows = registrations.map(
            (r: { name: string; email: string; phone: string | null; seminarSlug: string }) =>
                `${toSafeCsvCell(r.name)},${toSafeCsvCell(r.email)},${toSafeCsvCell(r.phone)},${toSafeCsvCell(r.seminarSlug)}`
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
