import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        if (!(await isAdminAuthenticated())) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        if (!id) {
            return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
        }

        await prisma.user.delete({
            where: { id },
        })

        return NextResponse.json({ success: true, message: "User deleted successfully" })
    } catch (error) {
        console.error("Error deleting user:", error)
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        )
    }
}
