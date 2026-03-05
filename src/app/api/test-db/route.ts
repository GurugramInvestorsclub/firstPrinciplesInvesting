import { prisma } from "../../../lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const registrations = await prisma.registration.findMany()
        return NextResponse.json({
            success: true,
            data: registrations
        })
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}
