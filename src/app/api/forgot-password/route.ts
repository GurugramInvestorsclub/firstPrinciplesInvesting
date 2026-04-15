import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { buildRateLimitIdentifier, consumeRateLimit } from "@/lib/rate-limit"
import {
    createResetTokenRecord,
    sendPasswordResetEmail,
    resetIdentifierForEmail,
} from "@/lib/password-reset"

const GENERIC_RESET_MESSAGE =
    "If an account exists with this email, you will receive a password reset link shortly."

function acceptedResetResponse() {
    return NextResponse.json({ message: GENERIC_RESET_MESSAGE }, { status: 202 })
}

export async function POST(req: Request) {
    try {
        const identifier = buildRateLimitIdentifier(req, "forgot-password")
        let rateLimit: Awaited<ReturnType<typeof consumeRateLimit>> | null = null
        try {
            rateLimit = await consumeRateLimit({
                scope: "auth:forgot-password",
                identifier,
                maxRequests: 5,
                windowSeconds: 60 * 60,
                blockDurationSeconds: 2 * 60 * 60,
            })
        } catch (error) {
            console.error("Forgot password rate limiter unavailable; continuing without throttle", error)
        }

        if (rateLimit && !rateLimit.allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(rateLimit.retryAfterSeconds),
                    },
                }
            )
        }

        const body = await req.json()
        const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            )
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            )
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            // Return generic response even if user doesn't exist
            return acceptedResetResponse()
        }

        // Only allow password reset for credentials-based users
        // If they only have OAuth accounts, we shouldn't send a password reset
        // but for security we still return the generic message.
        // If user has a password, they are credentials-based.
        if (!user.password) {
             return acceptedResetResponse()
        }

        const resetRecord = createResetTokenRecord(email)

        await prisma.verificationToken.deleteMany({
            where: {
                identifier: resetIdentifierForEmail(email),
            },
        })

        await prisma.verificationToken.create({
            data: {
                identifier: resetRecord.identifier,
                token: resetRecord.tokenHash,
                expires: resetRecord.expires,
            },
        })

        const origin = new URL(req.url).origin
        const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(
            resetRecord.rawToken
        )}`

        const delivered = await sendPasswordResetEmail({
            toEmail: email,
            resetUrl,
        })

        if (!delivered) {
            console.warn("Password reset email delivery failed for:", email)
            if (process.env.NODE_ENV !== "production") {
                console.warn("Use this URL to reset in development:", resetUrl)
            }
        }

        return acceptedResetResponse()
    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
