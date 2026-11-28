import { AnalyticsEvent, EventMap } from "./events"

export function getServerPostHogClient(): null {
    return null
}

/**
 * Server-side event tracking stub (PostHog removed).
 */
export async function trackServerEvent<E extends AnalyticsEvent>(_params: {
    distinctId: string
    event: E
    properties: EventMap[E]
}): Promise<void> {
    // PostHog server tracking removed
}

/**
 * Interface for Analytics API Query Responses
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
 * Server-side query helper stub (PostHog removed).
 */
export async function queryPostHogApi(_params: {
    endpoint: string
    method?: "GET" | "POST"
    body?: unknown
}): Promise<PostHogQueryResponse | null> {
    return null
}
