import { NextResponse } from "next/server"
import {
  syncAllActiveTenureSubscribersToBrevo,
  syncAllRegisteredUsersToBrevo,
} from "@/lib/brevo-crm-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization")
    const cronSecret = process.env.CRON_SECRET

    // Security check - verify Bearer token or Vercel cron header
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const [membersSync, registeredSync] = await Promise.all([
      syncAllActiveTenureSubscribersToBrevo(),
      syncAllRegisteredUsersToBrevo(),
    ])

    return NextResponse.json({
      success: membersSync.success && registeredSync.success,
      data: {
        members: membersSync,
        registeredUsers: registeredSync,
      },
    })
  } catch (error: any) {
    console.error("Brevo members and users sync cron error:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}
