"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getComments(postSlug: string) {
    try {
        const comments = await prisma.comment.findMany({
            where: { postSlug, parentId: null },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                },
                replies: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            }
                        }
                    }
                }
            }
        })
        return { success: true, comments }
    } catch (error) {
        console.error("Failed to fetch comments:", error)
        return { success: false, error: "Failed to fetch comments" }
    }
}

export async function addComment(postSlug: string, content: string, parentId?: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        if (!content || content.trim() === "") {
            return { success: false, error: "Comment cannot be empty" }
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                postSlug,
                userId: session.user.id,
                parentId: parentId || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                }
            }
        })

        revalidatePath(`/insights/${postSlug}`)
        return { success: true, comment }
    } catch (error) {
        console.error("Failed to add comment:", error)
        return { success: false, error: "Failed to add comment" }
    }
}

export async function deleteComment(commentId: string, postSlug: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        })

        if (!comment) {
            return { success: false, error: "Comment not found" }
        }

        if (comment.userId !== session.user.id) {
            return { success: false, error: "Unauthorized to delete this comment" }
        }

        await prisma.comment.delete({
            where: { id: commentId }
        })

        revalidatePath(`/insights/${postSlug}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to delete comment:", error)
        return { success: false, error: "Failed to delete comment" }
    }
}
