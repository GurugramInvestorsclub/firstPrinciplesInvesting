"use client"

import { useEffect, useRef } from "react"
import { analytics } from "@/lib/analytics"

interface ArticleTrackerProps {
    articleId: string
    title: string
    category?: string
    isPremium: boolean
}

export function ArticleTracker({
    articleId,
    title,
    category,
    isPremium,
}: ArticleTrackerProps) {
    const hasFiredCompleted = useRef(false)
    const startTime = useRef(Date.now())

    useEffect(() => {
        // Track view on initial mount
        analytics.track("article_viewed", {
            article_id: articleId,
            article_title: title,
            article_category: category,
            content_type: "insight",
            is_premium: isPremium,
        })

        // Track completion on 80% scroll depth
        const handleScroll = () => {
            if (hasFiredCompleted.current) return

            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
            if (scrollHeight <= 0) return

            const currentScroll = window.scrollY
            const scrollPercent = (currentScroll / scrollHeight) * 100

            if (scrollPercent >= 80) {
                hasFiredCompleted.current = true
                const elapsedSeconds = Math.round((Date.now() - startTime.current) / 1000)

                analytics.track("article_completed", {
                    article_id: articleId,
                    article_title: title,
                    scroll_depth: 80,
                    read_time_seconds: elapsedSeconds,
                })
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [articleId, title, category, isPremium])

    return null
}
