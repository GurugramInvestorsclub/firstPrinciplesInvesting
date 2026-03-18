import { NextRequest, NextResponse } from "next/server"
import {
    verifyPassword,
    COOKIE_NAME,
    createAdminSessionToken,
    getAdminSessionMaxAgeSeconds,
} from "@/lib/admin-auth"
import { buildRateLimitIdentifier, consumeRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
    try {
        const identifier = buildRateLimitIdentifier(request, "admin-login")
        let rateLimit: Awaited<ReturnType<typeof consumeRateLimit>> | null = null
        try {
            rateLimit = await consumeRateLimit({
                scope: "admin:login",
                identifier,
                maxRequests: 8,
                windowSeconds: 15 * 60,
                blockDurationSeconds: 30 * 60,
            })
        } catch (error) {
            console.error("Admin login rate limiter unavailable; continuing without throttle", error)
        }

        if (rateLimit && !rateLimit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Too many login attempts. Try again later.",
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(rateLimit.retryAfterSeconds),
                    },
                }
            )
        }

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

        let sessionToken: string
        try {
            sessionToken = createAdminSessionToken()
        } catch (error) {
            console.error("Admin session configuration error", error)
            return NextResponse.json(
                { success: false, message: "Admin auth is not configured correctly" },
                { status: 500 }
            )
        }

        const response = NextResponse.json({ success: true })

        response.cookies.set(COOKIE_NAME, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: getAdminSessionMaxAgeSeconds(),
        })

        return response
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid request" },
            { status: 400 }
        )
    }
}
