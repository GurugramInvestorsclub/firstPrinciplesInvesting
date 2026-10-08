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

import { client } from "@/lib/sanity.client"

function formatSlugToTitle(slug: string): string {
  if (!slug) return "Special Report"
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")?.trim() || ""
    const query = searchParams.get("q")?.trim() || searchParams.get("email")?.trim() || ""
    const days = searchParams.get("days")?.trim() || ""

    const whereClause: any = {}

    if (slug) {
      whereClause.slug = slug
    }

    if (days) {
      const numDays = parseInt(days, 10)
      if (!isNaN(numDays) && numDays > 0) {
        const cutoff = new Date(Date.now() - numDays * 24 * 60 * 60 * 1000)
        whereClause.createdAt = { gte: cutoff }
      } else if (days === "today") {
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)
        whereClause.createdAt = { gte: startOfToday }
      }
    }

    if (query) {
      whereClause.OR = [
        { email: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ]
    }

    const [submissions, sanityMagnets] = await Promise.all([
      prisma.leadMagnetSubmission.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      }),
      client
        .fetch<Array<{ title?: string; slug?: { current?: string } | string }>>(
          `*[_type == "leadMagnet"]{ title, "slug": slug.current }`
        )
        .catch(() => []),
    ])

    const leadMagnetTitles: Record<string, string> = {}
    sanityMagnets.forEach((m: any) => {
      const s = typeof m?.slug === "string" ? m.slug : m?.slug?.current
      if (s && m?.title) {
        leadMagnetTitles[s] = m.title
      }
    })

    const header = "Name,Email,Lead Magnet Title,Resource (Slug),Source,Requested On (IST),Submission ID"
    const rows = submissions.map((s) => {
      const title = leadMagnetTitles[s.slug] || formatSlugToTitle(s.slug)
      return [
        toSafeCsvCell(s.name),
        toSafeCsvCell(s.email),
        toSafeCsvCell(title),
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
