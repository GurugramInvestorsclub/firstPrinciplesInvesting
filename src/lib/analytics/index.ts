import {
    trackClientEvent,
    identifyClientUser,
    resetClientUser,
    initPostHogClient,
    getPostHogClient,
} from "./client"
import {
    AnalyticsEvent,
    EventMap,
    UserTraits,
    PageViewProperties,
} from "./events"

export * from "./events"
export { initPostHogClient, getPostHogClient }

/**
 * Universal Analytics Façade for Client Components
 */
export const analytics = {
    /**
     * Track a typed client-side analytics event
     */
    track<E extends AnalyticsEvent>(event: E, properties: EventMap[E]): void {
        trackClientEvent(event, properties)
    },

    /**
     * Track a page view event with clean metadata
     */
    pageView(properties: PageViewProperties): void {
        trackClientEvent("page_view", properties)
    },

    /**
     * Identify an authenticated user by internal ID with safe traits
     */
    identify(userId: string, traits?: UserTraits): void {
        identifyClientUser(userId, traits)
    },

    /**
     * Reset user session upon logout
     */
    reset(): void {
        resetClientUser()
    },
}
