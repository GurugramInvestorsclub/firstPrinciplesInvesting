import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendAdminGeneratedPasswordEmail } from "@/lib/password-reset"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdminAuthenticated())) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        if (!id) {
            return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, name: true }
        })

        if (!user || !user.email) {
            return NextResponse.json({ success: false, error: "User not found or missing email" }, { status: 404 })
        }

        let body: { customPassword?: string; sendEmail?: boolean } = {}
        try {
            body = await request.json()
        } catch {
            // body is optional
        }

        const customPassword = body.customPassword?.trim()
        const sendEmail = body.sendEmail !== false

        // Generate a random temporary password if custom password was not provided
        const temporaryPassword = customPassword && customPassword.length >= 6
            ? customPassword
            : `FPI-${crypto.randomBytes(4).toString("hex").toUpperCase()}!`

        const hashedPassword = await bcrypt.hash(temporaryPassword, 10)

        // Update the password and mark emailVerified in database
        await prisma.user.update({
            where: { id },
            data: { 
                password: hashedPassword,
                emailVerified: new Date()
            }
        })

        let emailSent = false
        if (sendEmail) {
            emailSent = await sendAdminGeneratedPasswordEmail({
                toEmail: user.email,
                name: user.name,
                temporaryPassword
            })
        }

        return NextResponse.json({
            success: true,
            message: `Password reset successfully for ${user.email}`,
            temporaryPassword,
            emailSent
        })
    } catch (error) {
        console.error("Error resetting user password:", error)
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        )
    }
}
