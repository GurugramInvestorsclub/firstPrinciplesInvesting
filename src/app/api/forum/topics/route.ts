import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ForumType } from "@prisma/client"
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

        const topics = await prisma.forumTopic.findMany({
            where: { forumType },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                _count: {
                    select: { posts: true },
                },
            },
            orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        })

        return NextResponse.json({
            success: true,
            authorized: true,
            forumType,
            topics: topics.map((t) => ({
                id: t.id,
                title: t.title,
                slug: t.slug,
                content: t.content,
                isPinned: t.isPinned,
                isLocked: t.isLocked,
                viewsCount: t.viewsCount,
                repliesCount: t._count.posts,
                createdAt: t.createdAt,
                updatedAt: t.updatedAt,
                author: t.author,
            })),
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
        const { title, content, type } = body

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

        const newTopic = await prisma.forumTopic.create({
            data: {
                title: title.trim(),
                slug: topicSlug,
                content: content.trim(),
                forumType,
                authorId: session.user.id,
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
