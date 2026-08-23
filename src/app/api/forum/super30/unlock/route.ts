import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
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

        const body = await request.json().catch(() => ({}))
        const rawCode = typeof body.code === "string" ? body.code.trim().toUpperCase() : ""

        if (!rawCode) {
            return NextResponse.json({ success: false, error: "Please enter a passcode" }, { status: 400 })
        }

        // Check existing access
        const existingAccess = await prisma.super30UserAccess.findUnique({
            where: { userId: session.user.id },
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

        // Unlock access & increment count
        await prisma.$transaction([
            prisma.super30UserAccess.create({
                data: {
                    userId: session.user.id,
                    codeId: codeRecord.id,
                },
            }),
            prisma.super30Code.update({
                where: { id: codeRecord.id },
                data: { usedCount: { increment: 1 } },
            }),
        ])

        return NextResponse.json({
            success: true,
            message: "Congratulations! Super 30 Forum access unlocked successfully.",
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
