import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkUserForumAccess } from "../route"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const topic = await prisma.forumTopic.findUnique({
            where: { slug },
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
                    orderBy: { createdAt: "asc" },
                },
            },
        })

        if (!topic) {
            return NextResponse.json({ success: false, error: "Topic not found" }, { status: 404 })
        }

        const session = await auth()
        const userId = session?.user?.id

        let isAuthorized = false
        if (userId) {
            isAuthorized = await checkUserForumAccess(userId, topic.forumType)
        }

        if (!isAuthorized) {
            return NextResponse.json({
                success: true,
                authorized: false,
                topic: {
                    title: topic.title,
                    forumType: topic.forumType,
                },
            })
        }

        // Increment views count asynchronously
        await prisma.forumTopic.update({
            where: { id: topic.id },
            data: { viewsCount: { increment: 1 } },
        }).catch(() => {})

        return NextResponse.json({
            success: true,
            authorized: true,
            topic,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
        }

        const topic = await prisma.forumTopic.findUnique({
            where: { slug },
        })

        if (!topic) {
            return NextResponse.json({ success: false, error: "Topic not found" }, { status: 404 })
        }

        if (topic.isLocked) {
            return NextResponse.json({ success: false, error: "This topic is locked for replies" }, { status: 403 })
        }

        const isAuthorized = await checkUserForumAccess(session.user.id, topic.forumType)
        if (!isAuthorized) {
            return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
        }

        const body = await request.json()
        const { content, parentId } = body

        if (!content || typeof content !== "string" || !content.trim()) {
            return NextResponse.json({ success: false, error: "Reply content is required" }, { status: 400 })
        }

        const newPost = await prisma.forumPost.create({
            data: {
                topicId: topic.id,
                authorId: session.user.id,
                content: content.trim(),
                parentId: parentId || null,
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

        return NextResponse.json({ success: true, post: newPost })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
