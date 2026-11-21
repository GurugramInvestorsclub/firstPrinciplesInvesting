import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(
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

    return NextResponse.json({
      success: true,
      data: report,
    })
  } catch (error) {
    console.error("[Admin Report By ID GET Error]:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch report" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.weeklyReport.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
    })
  } catch (error) {
    console.error("[Admin Report DELETE Error]:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete report" },
      { status: 500 }
    )
  }
}
