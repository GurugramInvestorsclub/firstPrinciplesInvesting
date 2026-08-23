import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ForumType, Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export const dynamic = "force-dynamic"

function slugify(text: string): string {
    const base = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    const randomSuffix = crypto.randomBytes(2).toString("hex")
    return `${base || "topic"}-${randomSuffix}`
}

export async function checkUserForumAccess(userId: string, forumType: ForumType) {
    if (forumType === ForumType.SUBSCRIBERS) {
        const sub = await prisma.insightsSubscription.findFirst({
            where: {
                userId,
                status: { in: ["ACTIVE", "AUTHENTICATED"] },
            },
        })
        return Boolean(sub)
    }

    if (forumType === ForumType.SUPER_30) {
        const super30Access = await prisma.super30UserAccess.findUnique({
            where: { userId },
        })
        return Boolean(super30Access)
    }

    return false
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const typeParam = searchParams.get("type")?.toUpperCase()
        const forumType = typeParam === "SUPER_30" ? ForumType.SUPER_30 : ForumType.SUBSCRIBERS
        const categoryParam = searchParams.get("category") || "All"
        const search = searchParams.get("search")?.trim() || ""
        const sort = searchParams.get("sort") || "recently_active" // "recently_active", "newest", "most_discussed"

        const session = await auth()
        const userId = session?.user?.id

        let isAuthorized = false
        if (userId) {
            isAuthorized = await checkUserForumAccess(userId, forumType)
        }

        if (!isAuthorized) {
            return NextResponse.json({
                success: true,
                authorized: false,
                forumType,
                requiresAuth: !userId,
                requiresMembership: forumType === ForumType.SUBSCRIBERS,
                requiresPasscode: forumType === ForumType.SUPER_30,
                topics: [],
            })
        }

        // Build Prisma Filter
        const whereClause: Prisma.ForumTopicWhereInput = {
            forumType,
        }

        // Category Filter
        if (categoryParam && categoryParam !== "All") {
            if (categoryParam === "Companies") {
                whereClause.companyName = { not: null }
            } else if (categoryParam === "Sectors") {
                whereClause.OR = [
                    { category: { equals: "Industry", mode: "insensitive" } },
                    { tags: { hasSome: ["Sectors", "Industry", "Pharma", "Chemicals", "Banking", "IT"] } },
                ]
            } else {
                whereClause.category = { equals: categoryParam, mode: "insensitive" }
            }
        }

        // Search Filter across title, companyName, content, tags
        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { companyName: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
                { tags: { hasSome: [search] } },
            ]
        }

        // Order By
        let orderByClause: Prisma.ForumTopicOrderByWithRelationInput[] = []
        if (sort === "newest") {
            orderByClause = [{ isPinned: "desc" }, { createdAt: "desc" }]
        } else if (sort === "most_discussed") {
            orderByClause = [{ isPinned: "desc" }, { posts: { _count: "desc" } }]
        } else {
            // Default: Recently Active
            orderByClause = [{ isPinned: "desc" }, { lastActiveAt: "desc" }]
        }

        const topics = await prisma.forumTopic.findMany({
            where: whereClause,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                posts: {
                    select: {
                        authorId: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: { posts: true },
                },
            },
            orderBy: orderByClause,
        })

        const formattedTopics = topics.map((t) => {
            // Count unique contributors (author + post authors)
            const authorSet = new Set<string>()
            if (t.authorId) authorSet.add(t.authorId)
            t.posts.forEach((p) => authorSet.add(p.authorId))

            return {
                id: t.id,
                title: t.title,
                slug: t.slug,
                content: t.content,
                companyName: t.companyName,
                category: t.category,
                tags: t.tags,
                isPinned: t.isPinned,
                isLocked: t.isLocked,
                viewsCount: t.viewsCount,
                repliesCount: t._count.posts,
                contributorsCount: authorSet.size,
                lastActiveAt: t.lastActiveAt || t.updatedAt || t.createdAt,
                createdAt: t.createdAt,
                updatedAt: t.updatedAt,
                author: t.author,
            }
        })

        return NextResponse.json({
            success: true,
            authorized: true,
            forumType,
            topics: formattedTopics,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
        }

        const body = await request.json()
        const { title, content, type, companyName, category, tags } = body

        if (!title || typeof title !== "string" || !title.trim()) {
            return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
        }

        if (!content || typeof content !== "string" || !content.trim()) {
            return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 })
        }

        const forumType = String(type).toUpperCase() === "SUPER_30" ? ForumType.SUPER_30 : ForumType.SUBSCRIBERS

        const isAuthorized = await checkUserForumAccess(session.user.id, forumType)
        if (!isAuthorized) {
            return NextResponse.json({ success: false, error: "Access denied for this forum" }, { status: 403 })
        }

        const topicSlug = slugify(title)
        const parsedCompanyName = typeof companyName === "string" && companyName.trim() ? companyName.trim().toUpperCase() : null
        const parsedCategory = typeof category === "string" && category.trim() ? category.trim() : "Investment Thesis"
        const parsedTags = Array.isArray(tags)
            ? tags.map((t) => String(t).trim()).filter(Boolean)
            : typeof tags === "string"
            ? tags.split(",").map((t) => t.trim()).filter(Boolean)
            : []

        const newTopic = await prisma.forumTopic.create({
            data: {
                title: title.trim(),
                slug: topicSlug,
                content: content.trim(),
                forumType,
                companyName: parsedCompanyName,
                category: parsedCategory,
                tags: parsedTags,
                authorId: session.user.id,
                lastActiveAt: new Date(),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        })

        return NextResponse.json({ success: true, topic: newTopic })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
