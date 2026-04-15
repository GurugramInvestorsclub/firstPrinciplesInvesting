import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { hashResetToken, resetIdentifierForEmail } from "@/lib/password-reset"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const token = typeof body?.token === "string" ? body.token : ""
        const password = typeof body?.password === "string" ? body.password : ""

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required" },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            )
        }

        const tokenHash = hashResetToken(token)

        // Find the verification token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token: tokenHash },
        })

        if (!verificationToken || verificationToken.expires <= new Date()) {
            if (verificationToken) {
                await prisma.verificationToken.delete({
                    where: { token: tokenHash },
                })
            }
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 400 }
            )
        }

        // The identifier is "password-reset:email"
        const identifierParts = verificationToken.identifier.split(":")
        if (identifierParts[0] !== "password-reset" || identifierParts.length < 2) {
            return NextResponse.json(
                { error: "Invalid token type" },
                { status: 400 }
            )
        }

        const email = identifierParts.slice(1).join(":")

        // Update user password
        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.$transaction(async (tx) => {
            // Update the user
            await tx.user.update({
                where: { email },
                data: { password: hashedPassword },
            })

            // Delete the verification token and any other reset tokens for this email
            await tx.verificationToken.deleteMany({
                where: {
                    identifier: resetIdentifierForEmail(email),
                },
            })
        })

        return NextResponse.json(
            { success: true, message: "Password updated successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
