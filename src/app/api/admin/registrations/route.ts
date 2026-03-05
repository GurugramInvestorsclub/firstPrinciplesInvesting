import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
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

        return NextResponse.json({ success: true, data: registrations })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        )
    }
}
