"use client"

import { useEffect, useRef, useState, Suspense, lazy } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const HeroCanvas = lazy(() => import("./HeroCanvas"))

export function CinematicHero() {
    const sectionRef = useRef<HTMLElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [canvasVisible, setCanvasVisible] = useState(false)

    useEffect(() => {
        // Lazy-show canvas after mount
        const timer = setTimeout(() => setCanvasVisible(true), 100)

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches

        if (prefersReducedMotion) return () => clearTimeout(timer)

        let ctx: any = null

        async function initGSAP() {
            const gsap = (await import("gsap")).default

            const children = contentRef.current?.children
            if (!children) return

            ctx = gsap.context(() => {
                gsap.set(Array.from(children), { opacity: 0, y: 30 })

                gsap.to(Array.from(children), {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    stagger: 0.12,
                    ease: "power2.out",
                    delay: 0.3,
                })
            }, sectionRef)
        }

        initGSAP()

        return () => {
            clearTimeout(timer)
            ctx?.revert()
        }
    }, [])

    return (
        <section
            ref={sectionRef}
            className="relative w-full min-h-[100dvh] flex items-end md:items-end justify-center md:justify-start overflow-hidden bg-bg-deep"
        >
            {/* Three.js Canvas */}
            {canvasVisible && (
                <div className="absolute inset-0 z-0 animate-fade-in" style={{ animationDuration: "1.5s" }}>
                    <Suspense fallback={null}>
                        <HeroCanvas />
                    </Suspense>
                </div>
            )}

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-bg-deep via-bg-deep/70 to-transparent pointer-events-none" />
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-bg-deep/80 via-transparent to-transparent pointer-events-none hidden md:block" />

            {/* Content */}
            <div
                ref={contentRef}
                className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-24 pt-32 flex flex-col items-center md:items-start text-center md:text-left gap-6"
            >
                {/* Line 1 — Sans */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-text-primary"
                    style={{ fontFamily: "var(--font-heading)" }}
                >
                    Invest with Clarity.
                </h1>

                {/* Line 2 — Serif dramatic */}
                <p
                    className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl italic text-text-primary leading-[1.05] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    Think in{" "}
                    <span className="text-gold">First Principles.</span>
                </p>

                {/* Subtext */}
                <p className="text-base md:text-lg text-text-secondary max-w-lg leading-relaxed">
                    A structured approach to understanding businesses, building conviction, and compounding wealth over decades.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 pt-4">
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full px-8 h-12 text-base font-semibold bg-transparent border-2 border-gold text-gold hover:bg-gold/10 transition-all duration-300 group"
                    >
                        <Link href="/events">
                            Explore Events
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="lg"
                        className="rounded-full px-8 h-12 text-base font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-300"
                    >
                        <Link href="/insights">Read Insights</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
