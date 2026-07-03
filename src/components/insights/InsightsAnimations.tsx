"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function InsightsAnimations({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Respect prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (prefersReducedMotion) return

        const container = containerRef.current
        if (!container) return

        const ctx = gsap.context(() => {

            // Grid cards — scroll-triggered stagger
            const gridCards = gsap.utils.toArray<HTMLElement>(container.querySelectorAll("[data-gsap='grid-card']"))
            const gridContainer = container.querySelector("[data-gsap='grid']")
            if (gridCards.length > 0 && gridContainer) {
                gsap.fromTo(gridCards,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: gridContainer,
                            start: "top 85%",
                            once: true,
                        },
                    }
                )
            }
        }, container)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef}>
            {children}
        </div>
    )
}
