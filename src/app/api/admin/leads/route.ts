import { prisma } from "@/lib/prisma"
import { NextResponse, NextRequest } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"

import { client } from "@/lib/sanity.client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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
    const query = searchParams.get("q")?.trim() || searchParams.get("email")?.trim() || ""
    const slug = searchParams.get("slug")?.trim() || ""
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

    const [submissions, allSubmissions, sanityMagnets] = await Promise.all([
      prisma.leadMagnetSubmission.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      }),
      // Lightweight fetch to compute overall summary stats
      prisma.leadMagnetSubmission.findMany({
        select: { email: true, slug: true, createdAt: true },
      }),
      // Query Sanity for lead magnet friendly titles
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

    const uniqueEmailsSet = new Set(allSubmissions.map((s) => s.email.toLowerCase()))
    const slugCounts: Record<string, number> = {}
    allSubmissions.forEach((s) => {
      if (s.slug) {
        slugCounts[s.slug] = (slugCounts[s.slug] || 0) + 1
      }
    })

    const availableSlugs = Object.keys(slugCounts).sort((a, b) => slugCounts[b] - slugCounts[a])

    const enrichedSubmissions = submissions.map((sub) => ({
      ...sub,
      leadMagnetTitle: leadMagnetTitles[sub.slug] || formatSlugToTitle(sub.slug),
    }))

    return NextResponse.json({
      success: true,
      data: enrichedSubmissions,
      stats: {
        totalSubmissions: allSubmissions.length,
        uniqueEmails: uniqueEmailsSet.size,
        availableSlugs,
        slugCounts,
        leadMagnetTitles,
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
