import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
    try {
        if (!(await isAdminAuthenticated())) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const email = searchParams.get("email")

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {}

        if (email) {
            where.email = {
                contains: email,
                mode: "insensitive",
            }
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                accounts: true, // To identify login providers
            },
            orderBy: { createdAt: "desc" },
        })

        // Simplify data for the table
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            createdAt: user.createdAt,
            // If they have accounts, it's likely Google. If they have a password, it's Credentials.
            loginMethod: user.accounts.length > 0 ? "Google" : (user.password ? "Email/Password" : "Unknown")
        }))

        return NextResponse.json({ success: true, data: formattedUsers })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        )
    }
}
