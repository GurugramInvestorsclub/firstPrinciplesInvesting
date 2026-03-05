import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, phone, seminarSlug } = body

        // Validate required fields
        if (!name || !email || !seminarSlug) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Name, email, and seminarSlug are required",
                },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: "Invalid email format" },
                { status: 400 }
            )
        }

        const registration = await prisma.registration.create({
            data: {
                name,
                email,
                phone: phone || null,
                seminarSlug,
                paymentStatus: "pending",
            },
        })

        return NextResponse.json({ success: true, data: registration })
    } catch (error) {
        // Handle Prisma unique constraint violation
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You have already registered for this seminar",
                },
                { status: 409 }
            )
        }

        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        )
    }
}
