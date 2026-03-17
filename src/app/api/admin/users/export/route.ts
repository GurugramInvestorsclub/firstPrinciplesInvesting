import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"

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
            
            return `"${u.id}","${name.replace(/"/g, '""')}","${email.replace(/"/g, '""')}","${loginMethod}","${createdAt}"`
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
