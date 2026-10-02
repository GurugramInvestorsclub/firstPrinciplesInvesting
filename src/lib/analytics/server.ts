import { PostHog } from "posthog-node"
import { AnalyticsEvent, EventMap } from "./events"

let serverClient: PostHog | null = null

export function getServerPostHogClient(): PostHog | null {
    if (serverClient) return serverClient

    const apiKey =
        process.env.POSTHOG_API_KEY?.trim() ||
        process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() ||
        process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
    const apiHost =
        process.env.POSTHOG_HOST?.trim() ||
        process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ||
        "https://us.i.posthog.com"

    if (!apiKey) {
        return null
    }

    try {
        serverClient = new PostHog(apiKey, {
            host: apiHost,
            flushAt: 1,
            flushInterval: 0,
        })
        return serverClient
    } catch (err) {
        console.warn("[Analytics Server] Failed to initialize PostHog Node client:", err)
        return null
    }
}

/**
 * Server-side authoritative event tracking.
 * Used for verified Razorpay webhooks and payment confirmations.
 */
export async function trackServerEvent<E extends AnalyticsEvent>(params: {
    distinctId: string
    event: E
    properties: EventMap[E]
}): Promise<void> {
    const client = getServerPostHogClient()
    if (!client) return

    try {
        client.capture({
            distinctId: params.distinctId,
            event: params.event,
            properties: {
                ...params.properties,
                $lib: "posthog-node",
                $lib_version: "server-verified",
            },
        })
        // Flush in background
        await client.flush()
    } catch (err) {
        // Analytics must never crash payment or webhook processing
        console.warn(`[Analytics Server] Failed to capture event "${params.event}":`, err)
    }
}

/**
 * Interface for PostHog API Query Responses
 */
export interface PostHogAnalyticsDashboardData {
    configured: boolean
    hasPersonalApiKey: boolean
    hasProjectId: boolean
    overview: {
        totalVisitors: number
        uniqueUsers: number
        signups: number
        conversionRate: number
        successfulPayments: number
        revenue: number
        returningUsers: number
    }
    traffic: {
        visitorsOverTime: Array<{ date: string; visitors: number; pageViews: number }>
        topPages: Array<{ path: string; views: number }>
        topReferrers: Array<{ source: string; visitors: number }>
        utmCampaigns: Array<{ campaign: string; count: number }>
    }
    funnel: {
        steps: Array<{
            name: string
            count: number
            conversionRate: number
            dropOffRate: number
        }>
        overallConversionPct: number
    }
    content: {
        topArticles: Array<{ id: string; title: string; views: number; premium: boolean }>
        premiumViews: number
        freeViews: number
        completedReads: number
    }
    webinars: {
        views: number
        registrations: number
        checkoutStarts: number
        payments: number
        conversionRate: number
    }
    subscriptions: {
        totalSubscribers: number
        successfulPayments: number
        failedPayments: number
        cancellations: number
    }
    retention: {
        cohorts: Array<{
            cohort: string
            size: number
            week1: number | null
            week2: number | null
            week4: number | null
            week8: number | null
            week12: number | null
        }>
        hasEnoughData: boolean
    }
    recentActivity: Array<{
        event: string
        timestamp: string
        distinctId: string
        summary: string
    }>
}

export interface PostHogQueryResponse {
    results?: unknown[]
    columns?: string[]
    types?: string[]
}

/**
 * Server-side helper to query PostHog REST API / HogQL
 */
export async function queryPostHogApi(params: {
    endpoint: string
    method?: "GET" | "POST"
    body?: unknown
}): Promise<PostHogQueryResponse | null> {
    const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim()
    const projectId = process.env.POSTHOG_PROJECT_ID?.trim()
    const host =
        process.env.POSTHOG_HOST?.trim() ||
        process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ||
        "https://us.i.posthog.com"

    if (!personalApiKey || !projectId) {
        return null
    }

    const url = `${host.replace(/\/$/, "")}/api/projects/${projectId}/${params.endpoint.replace(/^\//, "")}`

    try {
        const res = await fetch(url, {
            method: params.method || "GET",
            headers: {
                Authorization: `Bearer ${personalApiKey}`,
                "Content-Type": "application/json",
            },
            ...(params.body ? { body: JSON.stringify(params.body) } : {}),
            next: { revalidate: 120 }, // Cache queries for 2 minutes to optimize performance
        })

        if (!res.ok) {
            console.warn(`[Analytics Server] PostHog API query failed (${res.status}):`, await res.text())
            return null
        }

        return await res.json()
    } catch (err) {
        console.warn("[Analytics Server] PostHog API connection error:", err)
        return null
    }
}
