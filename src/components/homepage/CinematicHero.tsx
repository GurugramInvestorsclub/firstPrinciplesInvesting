"use client"

import { useEffect, useState, Suspense, lazy } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const HeroCanvas = lazy(() => import("./HeroCanvas"))

export function CinematicHero() {
    const [canvasVisible, setCanvasVisible] = useState(false)

    useEffect(() => {
        // Only load and show Three.js canvas on desktop screens (width >= 768px)
        const isMobile = window.innerWidth < 768
        if (isMobile) return

        const timer = setTimeout(() => setCanvasVisible(true), 100)
        return () => clearTimeout(timer)
    }, [])

    return (
        <section
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
                className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-24 pt-32 flex flex-col items-center md:items-start text-center md:text-left gap-6"
            >
                {/* Line 1 — Sans */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-text-primary animate-fade-in-up"
                    style={{ fontFamily: "var(--font-heading)" }}
                >
                    Invest with Clarity.
                </h1>

                {/* Line 2 — Serif dramatic */}
                <p
                    className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl italic text-text-primary leading-[1.05] tracking-tight animate-fade-in-up delay-100"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    Think in{" "}
                    <span className="text-gold">First Principles.</span>
                </p>

                {/* Subtext */}
                <p className="text-base md:text-lg text-text-secondary max-w-lg leading-relaxed animate-fade-in-up delay-200">
                    A structured approach to understanding businesses, building conviction, and compounding wealth over decades.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 pt-4 animate-fade-in-up delay-300">
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
