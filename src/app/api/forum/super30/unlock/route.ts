import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { buildRateLimitIdentifier, consumeRateLimit } from "@/lib/rate-limit"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Please log in to redeem a Super 30 Passcode" },
                { status: 401 }
            )
        }

        const userId = session.user.id
        const identifier = buildRateLimitIdentifier(request, `super30-unlock:${userId}`)
        let rateLimit: Awaited<ReturnType<typeof consumeRateLimit>> | null = null
        try {
            rateLimit = await consumeRateLimit({
                scope: "forum:super30-unlock",
                identifier,
                maxRequests: 5,
                windowSeconds: 15 * 60,
                blockDurationSeconds: 30 * 60,
            })
        } catch (error) {
            console.error("Super30 unlock rate limiter unavailable; continuing without throttle", error)
        }

        if (rateLimit && !rateLimit.allowed) {
            return NextResponse.json(
                { success: false, error: "Too many passcode attempts. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(rateLimit.retryAfterSeconds),
                    },
                }
            )
        }

        const body = await request.json().catch(() => ({}))
        const rawCode = typeof body.code === "string" ? body.code.trim().toUpperCase() : ""

        if (!rawCode) {
            return NextResponse.json({ success: false, error: "Please enter a passcode" }, { status: 400 })
        }

        // Check existing access
        const existingAccess = await prisma.super30UserAccess.findUnique({
            where: { userId },
        })

        if (existingAccess) {
            return NextResponse.json({
                success: true,
                alreadyUnlocked: true,
                message: "You already have access to the Super 30 Forum!",
            })
        }

        // Find matching code
        const codeRecord = await prisma.super30Code.findUnique({
            where: { code: rawCode },
        })

        if (!codeRecord || !codeRecord.isActive) {
            return NextResponse.json(
                { success: false, error: "Invalid or inactive passcode. Please check and try again." },
                { status: 400 }
            )
        }

        if (codeRecord.expiryDate && new Date(codeRecord.expiryDate) < new Date()) {
            return NextResponse.json(
                { success: false, error: "This passcode has expired." },
                { status: 400 }
            )
        }

        if (codeRecord.maxUses !== null && codeRecord.usedCount >= codeRecord.maxUses) {
            return NextResponse.json(
                { success: false, error: "This passcode has reached its maximum redemptions limit." },
                { status: 400 }
            )
        }

        // Atomic lock & update to prevent concurrent race conditions
        const result = await prisma.$transaction(async (tx) => {
            const updateCount = await tx.$executeRaw`
                UPDATE "super30_codes"
                SET "used_count" = "used_count" + 1
                WHERE "id" = ${codeRecord.id}
                  AND "is_active" = true
                  AND ("expiry_date" IS NULL OR "expiry_date" > NOW())
                  AND ("max_uses" IS NULL OR "used_count" < "max_uses")
            `

            if (updateCount === 0) {
                return false
            }

            await tx.super30UserAccess.create({
                data: {
                    userId,
                    codeId: codeRecord.id,
                },
            })

            return true
        })

        if (!result) {
            return NextResponse.json(
                { success: false, error: "This passcode has reached its maximum redemptions limit." },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Congratulations! Super 30 Forum access unlocked successfully.",
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}