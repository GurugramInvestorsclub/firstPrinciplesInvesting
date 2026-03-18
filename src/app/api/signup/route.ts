import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { buildRateLimitIdentifier, consumeRateLimit } from "@/lib/rate-limit"
import {
    createSignupVerificationRecord,
    sendSignupVerificationEmail,
    signupIdentifierPrefixForEmail,
} from "@/lib/signup-verification"

const GENERIC_SIGNUP_MESSAGE =
    "If your email can receive messages, a verification link has been sent."

function acceptedSignupResponse() {
    return NextResponse.json({ message: GENERIC_SIGNUP_MESSAGE }, { status: 202 })
}

function isVerificationEmailConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
}

export async function POST(req: Request) {
    try {
        const identifier = buildRateLimitIdentifier(req, "signup")
        let rateLimit: Awaited<ReturnType<typeof consumeRateLimit>> | null = null
        try {
            rateLimit = await consumeRateLimit({
                scope: "auth:signup",
                identifier,
                maxRequests: 5,
                windowSeconds: 60 * 60,
                blockDurationSeconds: 2 * 60 * 60,
            })
        } catch (error) {
            console.error("Signup rate limiter unavailable; continuing without throttle", error)
        }

        if (rateLimit && !rateLimit.allowed) {
            return NextResponse.json(
                { error: "Too many signup attempts. Please try again later." },
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
        const password = typeof body?.password === "string" ? body.password : ""
        const name =
            typeof body?.name === "string" && body.name.trim().length > 0
                ? body.name.trim().slice(0, 100)
                : null

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
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

        if (process.env.NODE_ENV === "production" && !isVerificationEmailConfigured()) {
            return NextResponse.json(
                { error: "Signup is temporarily unavailable. Please try again later." },
                { status: 503 }
            )
        }

        const normalizedName = name?.trim() ? name.trim() : null

        // Existing verified users should receive a generic response to prevent enumeration.
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser?.emailVerified) {
            return acceptedSignupResponse()
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const verificationRecord = createSignupVerificationRecord({
            email,
            name: normalizedName,
            passwordHash: hashedPassword,
        })

        await prisma.$transaction(async (tx) => {
            await tx.verificationToken.deleteMany({
                where: {
                    identifier: {
                        startsWith: signupIdentifierPrefixForEmail(email),
                    },
                },
            })

            await tx.verificationToken.create({
                data: {
                    identifier: verificationRecord.identifier,
                    token: verificationRecord.tokenHash,
                    expires: verificationRecord.expires,
                },
            })

            // In development, we can create the user immediately to allow testing sign-in
            if (process.env.NODE_ENV !== "production") {
                await tx.user.upsert({
                    where: { email },
                    update: {
                        name: normalizedName,
                        password: hashedPassword,
                        emailVerified: new Date(),
                    },
                    create: {
                        email,
                        name: normalizedName,
                        password: hashedPassword,
                        emailVerified: new Date(),
                    },
                })
            }
        })

        const origin = new URL(req.url).origin
        const verificationUrl = `${origin}/api/signup/verify?token=${encodeURIComponent(
            verificationRecord.rawToken
        )}`

        const delivered = await sendSignupVerificationEmail({
            toEmail: email,
            verificationUrl,
        })

        if (!delivered) {
            await prisma.verificationToken.deleteMany({
                where: {
                    token: verificationRecord.tokenHash,
                },
            })

            console.warn("Verification email delivery failed.")
            if (process.env.NODE_ENV !== "production") {
                console.warn("Use this URL to verify in development:", verificationUrl)
            }
        }

        return acceptedSignupResponse()
    } catch (error) {
        console.error("Signup error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
