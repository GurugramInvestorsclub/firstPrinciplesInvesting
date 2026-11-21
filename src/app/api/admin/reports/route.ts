import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { generateReport, ensureWeeklyReportTableExists } from "@/lib/weekly-report-service"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await ensureWeeklyReportTableExists()

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type") // "WEEKLY" | "CUSTOM" | "ALL"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)))
    const skip = (page - 1) * limit

    const where: any = {}
    if (reportType && reportType !== "ALL") {
      where.reportType = reportType
    }

    const [reports, totalCount] = await Promise.all([
      prisma.weeklyReport.findMany({
        where,
        orderBy: { startDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.weeklyReport.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("[Admin Reports GET Error]:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { startDate, endDate, title, reportType } = body

    // Generate report (defaults to previous week if no dates provided)
    const report = await generateReport({
      startDate,
      endDate,
      reportType: reportType || "WEEKLY",
      title,
      saveToDatabase: true,
    })

    return NextResponse.json({
      success: true,
      message: "Report generated successfully",
      data: report,
    })
  } catch (error) {
    console.error("[Admin Reports POST Error]:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to generate report" },
      { status: 500 }
    )
  }
}
