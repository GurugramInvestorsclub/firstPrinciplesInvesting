import { NextRequest, NextResponse } from "next/server"
import { verifyPassword, COOKIE_NAME } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { password } = body

        if (!password || typeof password !== "string") {
            return NextResponse.json(
                { success: false, message: "Password is required" },
                { status: 400 }
            )
        }

        if (!verifyPassword(password)) {
            return NextResponse.json(
                { success: false, message: "Invalid password" },
                { status: 401 }
            )
        }

        const response = NextResponse.json({ success: true })

        response.cookies.set(COOKIE_NAME, "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 24 hours
        })

        return response
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid request" },
            { status: 400 }
        )
    }
}
