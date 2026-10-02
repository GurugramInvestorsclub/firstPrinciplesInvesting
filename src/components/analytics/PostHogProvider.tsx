"use client"

import React, { useEffect, Suspense, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { initPostHogClient, analytics } from "@/lib/analytics"

function PostHogPageViewTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const lastTrackedPath = useRef<string | null>(null)

    useEffect(() => {
        if (!pathname) return

        const fullPath = searchParams?.toString()
            ? `${pathname}?${searchParams.toString()}`
            : pathname

        // Avoid duplicate triggers on same path
        if (lastTrackedPath.current === fullPath) return
        lastTrackedPath.current = fullPath

        const utm_source = searchParams?.get("utm_source") || null
        const utm_medium = searchParams?.get("utm_medium") || null
        const utm_campaign = searchParams?.get("utm_campaign") || null
        const utm_content = searchParams?.get("utm_content") || null
        const utm_term = searchParams?.get("utm_term") || null

        analytics.pageView({
            path: fullPath,
            referrer: typeof document !== "undefined" ? document.referrer : undefined,
            landing_page: typeof window !== "undefined" ? window.location.href : undefined,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_content,
            utm_term,
        })
    }, [pathname, searchParams])

    return null
}

function PostHogUserSync() {
    const { data: session, status } = useSession()
    const previousUserId = useRef<string | null>(null)

    useEffect(() => {
        if (status === "loading") return

        if (status === "authenticated" && session?.user?.id) {
            const currentUserId = session.user.id
            if (previousUserId.current !== currentUserId) {
                previousUserId.current = currentUserId
                analytics.identify(currentUserId, {
                    account_type: "free", // Can be updated if subscription is known
                    created_at: undefined,
                })
            }
        } else if (status === "unauthenticated" && previousUserId.current) {
            previousUserId.current = null
            analytics.reset()
        }
    }, [session, status])

    return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        initPostHogClient()
    }, [])

    return (
        <>
            <Suspense fallback={null}>
                <PostHogPageViewTracker />
            </Suspense>
            <PostHogUserSync />
            {children}
        </>
    )
}
