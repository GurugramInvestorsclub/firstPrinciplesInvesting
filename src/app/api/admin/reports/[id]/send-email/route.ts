import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { sendWeeklyReportEmail } from "@/lib/weekly-report-email"

export const dynamic = "force-dynamic"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const report = await prisma.weeklyReport.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 })
    }

    const emailSent = await sendWeeklyReportEmail(report as any)

    return NextResponse.json({
      success: emailSent,
      message: emailSent
        ? "Report emailed successfully to rahul@firstprinciplesresearch.in"
        : "Failed to dispatch email (check Brevo/Resend API keys)",
    })
  } catch (error) {
    console.error("[Send Report Email Error]:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    )
  }
}
