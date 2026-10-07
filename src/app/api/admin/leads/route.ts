import { prisma } from "@/lib/prisma"
import { NextResponse, NextRequest } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim() || searchParams.get("email")?.trim() || ""
    const slug = searchParams.get("slug")?.trim() || ""

    const whereClause: any = {}

    if (slug) {
      whereClause.slug = slug
    }

    if (query) {
      whereClause.OR = [
        { email: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ]
    }

    const [submissions, allSubmissions] = await Promise.all([
      prisma.leadMagnetSubmission.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      }),
      // Lightweight fetch to compute overall summary stats
      prisma.leadMagnetSubmission.findMany({
        select: { email: true, slug: true },
      }),
    ])

    const uniqueEmailsSet = new Set(allSubmissions.map((s) => s.email.toLowerCase()))
    const uniqueSlugsSet = new Set(allSubmissions.map((s) => s.slug).filter(Boolean))

    return NextResponse.json({
      success: true,
      data: submissions,
      stats: {
        totalSubmissions: allSubmissions.length,
        uniqueEmails: uniqueEmailsSet.size,
        availableSlugs: Array.from(uniqueSlugsSet).sort(),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Failed to load lead magnet submissions:", error)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Submission ID is required" },
        { status: 400 }
      )
    }

    await prisma.leadMagnetSubmission.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Failed to delete lead submission:", error)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
