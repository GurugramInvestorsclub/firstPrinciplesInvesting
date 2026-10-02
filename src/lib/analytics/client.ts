import posthog from "posthog-js"
import { AnalyticsEvent, EventMap, UserTraits } from "./events"

let isInitialized = false

const SENSITIVE_KEY_REGEX = /(password|secret|token|card|cvv|upi|pin|authorization)/i

function sanitizeProperties<T extends Record<string, unknown>>(props?: T): Record<string, unknown> {
    if (!props || typeof props !== "object") return {}
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(props)) {
        if (SENSITIVE_KEY_REGEX.test(key)) {
            continue // Drop sensitive keys
        }
        sanitized[key] = value
    }
    return sanitized
}

export function initPostHogClient(): boolean {
    if (typeof window === "undefined") return false
    if (isInitialized) return true

    const apiKey =
        process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() ||
        process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com"

    if (!apiKey) {
        if (process.env.NODE_ENV !== "production") {
            console.info("[Analytics] PostHog project token is not defined. PostHog client tracking is inactive.")
        }
        return false
    }

    try {
        posthog.init(apiKey, {
            api_host: apiHost,
            person_profiles: "identified_only",
            capture_pageview: false, // Handled deliberately via Next.js router
            capture_pageleave: true,
            autocapture: true,
            session_recording: {
                maskAllInputs: true,
                maskTextSelector: ".sensitive-text, [data-private]",
            },
            respect_dnt: true,
            disable_session_recording: process.env.NODE_ENV !== "production",
            loaded: () => {
                if (process.env.NODE_ENV !== "production") {
                    console.info("[Analytics] PostHog client initialized successfully.")
                }
            },
        })
        isInitialized = true
        return true
    } catch (err) {
        console.warn("[Analytics] PostHog client initialization error:", err)
        return false
    }
}

export function trackClientEvent<E extends AnalyticsEvent>(
    event: E,
    properties: EventMap[E]
): void {
    if (typeof window === "undefined") return
    if (!isInitialized && !initPostHogClient()) return

    try {
        const cleanProps = sanitizeProperties(properties as Record<string, unknown>)
        posthog.capture(event, cleanProps)
    } catch (err) {
        // Analytics must never break user experience
        console.warn(`[Analytics] Failed to capture event "${event}":`, err)
    }
}

export function identifyClientUser(userId: string, traits?: UserTraits): void {
    if (typeof window === "undefined" || !userId) return
    if (!isInitialized && !initPostHogClient()) return

    try {
        const cleanTraits = sanitizeProperties(traits)
        posthog.identify(userId, cleanTraits)
    } catch (err) {
        console.warn("[Analytics] Failed to identify user:", err)
    }
}

export function resetClientUser(): void {
    if (typeof window === "undefined") return
    if (!isInitialized) return

    try {
        posthog.reset()
    } catch (err) {
        console.warn("[Analytics] Failed to reset user:", err)
    }
}

export function getPostHogClient() {
    return posthog
}
