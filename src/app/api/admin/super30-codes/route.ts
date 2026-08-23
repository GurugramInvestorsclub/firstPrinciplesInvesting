import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import crypto from "crypto"

export const dynamic = "force-dynamic"

function generateRandomCode(): string {
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase()
    return `SUPER30-${randomHex}`
}

export async function GET() {
    try {
        if (!(await isAdminAuthenticated())) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const codes = await prisma.super30Code.findMany({
            include: {
                accesses: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: { unlockedAt: "desc" },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ success: true, data: codes })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!(await isAdminAuthenticated())) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json().catch(() => ({}))
        const rawCode = typeof body.code === "string" ? body.code.trim().toUpperCase() : ""
        const codeToUse = rawCode || generateRandomCode()
        const maxUses = typeof body.maxUses === "number" && body.maxUses > 0 ? body.maxUses : null
        const expiryDate = body.expiryDate ? new Date(body.expiryDate) : null

        // Check uniqueness
        const existing = await prisma.super30Code.findUnique({
            where: { code: codeToUse },
        })

        if (existing) {
            return NextResponse.json(
                { success: false, error: `Code '${codeToUse}' already exists. Please choose a different code.` },
                { status: 400 }
            )
        }

        const newCode = await prisma.super30Code.create({
            data: {
                code: codeToUse,
                maxUses,
                expiryDate,
                isActive: true,
            },
        })

        return NextResponse.json({ success: true, data: newCode })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
