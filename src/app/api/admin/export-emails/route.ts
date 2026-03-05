import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const registrations = await prisma.registration.findMany({
            select: {
                name: true,
                email: true,
                seminarSlug: true,
            },
            orderBy: { createdAt: "desc" },
        })

        const header = "name,email,seminarSlug"
        const rows = registrations.map(
            (r) =>
                `"${r.name.replace(/"/g, '""')}","${r.email.replace(/"/g, '""')}","${r.seminarSlug.replace(/"/g, '""')}"`
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
