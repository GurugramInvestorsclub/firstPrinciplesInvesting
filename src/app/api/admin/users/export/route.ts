import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"

function toSafeCsvCell(value: string | null | undefined): string {
    const normalized = (value ?? "").replace(/\r?\n/g, " ").trim()
    const formulaPrefixed = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized
    return `"${formulaPrefixed.replace(/"/g, '""')}"`
}

export async function GET() {
    try {
        if (!(await isAdminAuthenticated())) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const users = await prisma.user.findMany({
            include: {
                accounts: true,
            },
            orderBy: { createdAt: "desc" },
        })

        const header = "id,name,email,loginMethod,createdAt"
        const rows = users.map((u) => {
            const loginMethod = u.accounts.length > 0 ? "Google" : (u.password ? "Email/Password" : "Unknown")
            const name = u.name || ""
            const email = u.email || ""
            const createdAt = u.createdAt.toISOString()

            return [
                toSafeCsvCell(u.id),
                toSafeCsvCell(name),
                toSafeCsvCell(email),
                toSafeCsvCell(loginMethod),
                toSafeCsvCell(createdAt),
            ].join(",")
        })
        
        const csv = [header, ...rows].join("\n")

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": 'attachment; filename="users.csv"',
            },
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        )
    }
}
