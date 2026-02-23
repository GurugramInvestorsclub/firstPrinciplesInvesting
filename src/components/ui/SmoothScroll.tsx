"use client"

import { useEffect } from "react"

export function SmoothScroll() {
    useEffect(() => {
        // Respect reduced motion preference
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
        if (prefersReducedMotion) return

        let lenis: any = null

        async function initLenis() {
            const Lenis = (await import("@studio-freight/lenis")).default
            lenis = new Lenis({
                duration: 1.1,
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: "vertical" as const,
                smoothWheel: true,
            })

            function raf(time: number) {
                lenis?.raf(time)
                requestAnimationFrame(raf)
            }
            requestAnimationFrame(raf)
        }

        initLenis()

        return () => {
            lenis?.destroy()
        }
    }, [])

    return null
}
