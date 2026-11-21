import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { generateReport } from "@/lib/weekly-report-service"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const saveToDatabase = searchParams.get("save") === "true"
    const title = searchParams.get("title") || undefined

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Both startDate and endDate query parameters are required (YYYY-MM-DD)" },
        { status: 400 }
      )
    }

    const report = await generateReport({
      startDate,
      endDate,
      reportType: "CUSTOM",
      title,
      saveToDatabase,
    })

    return NextResponse.json({
      success: true,
      data: report,
    })
  } catch (error) {
    console.error("[Admin Custom Report GET Error]:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to compute custom report" },
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
    const { startDate, endDate, title, saveToDatabase = true } = body

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Both startDate and endDate are required" },
        { status: 400 }
      )
    }

    const report = await generateReport({
      startDate,
      endDate,
      reportType: "CUSTOM",
      title,
      saveToDatabase,
    })

    return NextResponse.json({
      success: true,
      message: "Custom report generated successfully",
      data: report,
    })
  } catch (error) {
    console.error("[Admin Custom Report POST Error]:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to compute custom report" },
      { status: 500 }
    )
  }
}
