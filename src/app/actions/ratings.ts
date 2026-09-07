"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { userHasInsightsAccess } from "@/lib/insights-subscription-service"

export interface RatingStats {
    averageRating: number
    totalRatings: number
    userRating: number | null
}

export async function getArticleRating(postSlug: string, userId?: string): Promise<{ success: boolean; stats: RatingStats; error?: string }> {
    try {
        if (!postSlug) {
            return { success: false, stats: { averageRating: 0, totalRatings: 0, userRating: null }, error: "Invalid post slug" }
        }

        const aggregate = await prisma.articleRating.aggregate({
            where: { postSlug },
            _avg: { rating: true },
            _count: { rating: true },
        })

        let userRating: number | null = null
        if (userId) {
            const userRatingRecord = await prisma.articleRating.findUnique({
                where: {
                    postSlug_userId: {
                        postSlug,
                        userId,
                    },
                },
                select: { rating: true },
            })
            if (userRatingRecord) {
                userRating = userRatingRecord.rating
            }
        }

        const rawAvg = aggregate._avg.rating || 0
        const averageRating = Math.round(rawAvg * 10) / 10
        const totalRatings = aggregate._count.rating || 0

        return {
            success: true,
            stats: {
                averageRating,
                totalRatings,
                userRating,
            },
        }
    } catch (err) {
        console.error("Error fetching article rating stats:", err)
        return {
            success: false,
            stats: { averageRating: 0, totalRatings: 0, userRating: null },
            error: err instanceof Error ? err.message : String(err),
        }
    }
}

export async function submitArticleRating(
    postSlug: string,
    rating: number
): Promise<{ success: boolean; stats?: RatingStats; error?: string }> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Please log in to rate this article" }
        }

        const userId = session.user.id
        const hasAccess = await userHasInsightsAccess(userId)
        if (!hasAccess) {
            return { success: false, error: "Insights membership is required to rate articles" }
        }

        if (!postSlug || typeof rating !== "number" || rating < 1 || rating > 5) {
            return { success: false, error: "Invalid rating. Rating must be between 1 and 5 stars." }
        }

        const roundedRating = Math.round(rating)

        await prisma.articleRating.upsert({
            where: {
                postSlug_userId: {
                    postSlug,
                    userId,
                },
            },
            update: {
                rating: roundedRating,
            },
            create: {
                postSlug,
                userId,
                rating: roundedRating,
            },
        })

        const updatedResult = await getArticleRating(postSlug, userId)
        return {
            success: true,
            stats: updatedResult.stats,
        }
    } catch (err) {
        console.error("Error submitting article rating:", err)
        return {
            success: false,
            error: err instanceof Error ? err.message : String(err),
        }
    }
}
