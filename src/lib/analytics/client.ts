import { AnalyticsEvent, EventMap, UserTraits } from "./events"

export function initPostHogClient(): boolean {
    return false
}

export function trackClientEvent<E extends AnalyticsEvent>(
    _event: E,
    _properties: EventMap[E]
): void {
    // PostHog client tracking removed
}

export function identifyClientUser(_userId: string, _traits?: UserTraits): void {
    // PostHog client tracking removed
}

export function resetClientUser(): void {
    // PostHog client tracking removed
}

export function getPostHogClient(): null {
    return null
}
