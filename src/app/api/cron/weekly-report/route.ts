import { NextResponse } from "next/server"
import { generateReport } from "@/lib/weekly-report-service"
import { sendWeeklyReportEmail } from "@/lib/weekly-report-email"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization")
    const cronSecret = process.env.CRON_SECRET

    // Security check: verify Bearer token from Vercel Cron
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("[WeeklyReportCron] Running weekly report generation...")

    // Generate weekly report for the previous Monday -> Sunday period and save to DB
    const report = await generateReport({
      reportType: "WEEKLY",
      saveToDatabase: true,
    })

    // Optionally dispatch summary email to admin
    let emailSent = false
    try {
      emailSent = await sendWeeklyReportEmail(report)
    } catch (emailErr) {
      console.warn("[WeeklyReportCron] Failed to send email summary:", emailErr)
    }

    return NextResponse.json({
      success: true,
      message: `Weekly report generated successfully for ${report.title}`,
      reportId: report.id,
      emailSent,
      data: {
        title: report.title,
        weekNumber: report.weekNumber,
        year: report.year,
        totalVisitors: report.totalVisitors,
        totalNewSubscriptions: report.totalNewSubscriptions,
        topPagePath: report.topPagePath,
        insightsVisitors: report.insightsVisitors,
        totalRevenue: report.totalRevenue,
      },
    })
  } catch (error) {
    console.error("[WeeklyReportCron] Execution failed:", error)
    const message = error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
