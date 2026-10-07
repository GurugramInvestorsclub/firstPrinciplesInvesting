import { prisma } from "@/lib/prisma"
import { NextResponse, NextRequest } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function toSafeCsvCell(value: string | null | undefined): string {
  const normalized = (value ?? "").replace(/\r?\n/g, " ").trim()
  const formulaPrefixed = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized
  return `"${formulaPrefixed.replace(/"/g, '""')}"`
}

function formatDateIST(date: Date): string {
  try {
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  } catch {
    return date.toISOString()
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")?.trim() || ""
    const query = searchParams.get("q")?.trim() || searchParams.get("email")?.trim() || ""

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

    const submissions = await prisma.leadMagnetSubmission.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    })

    const header = "Name,Email,Resource (Slug),Source,Created At (IST),Submission ID"
    const rows = submissions.map((s) => {
      return [
        toSafeCsvCell(s.name),
        toSafeCsvCell(s.email),
        toSafeCsvCell(s.slug),
        toSafeCsvCell(s.source || "website"),
        toSafeCsvCell(formatDateIST(s.createdAt)),
        toSafeCsvCell(s.id),
      ].join(",")
    })

    const csv = [header, ...rows].join("\n")
    const dateStamp = new Date().toISOString().slice(0, 10)
    const fileName = slug ? `leads_${slug}_${dateStamp}.csv` : `lead_magnet_submissions_${dateStamp}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Failed to export leads CSV:", error)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
