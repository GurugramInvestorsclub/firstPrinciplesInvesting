import { NextResponse } from "next/server"
import { getDemergerData } from "@/lib/demergers"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const data = await getDemergerData()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error syncing demerger data:", error)
        return NextResponse.json(
            { error: "Failed to fetch demerger data" },
            { status: 500 }
        )
    }
}
