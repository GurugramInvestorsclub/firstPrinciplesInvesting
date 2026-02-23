"use client"

import { useEffect, useRef } from "react"

const steps = [
    {
        number: "01",
        title: "Study",
        description: "Understand businesses structurally.",
    },
    {
        number: "02",
        title: "Analyze",
        description: "Break down incentives, moats, and capital allocation.",
    },
    {
        number: "03",
        title: "Decide",
        description: "Act with discipline, not emotion.",
    },
]

export function Method() {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
        if (prefersReducedMotion) return

        let ctx: any = null

        async function init() {
            const gsap = (await import("gsap")).default
            const { ScrollTrigger } = await import("gsap/ScrollTrigger")
            gsap.registerPlugin(ScrollTrigger)

            ctx = gsap.context(() => {
                const cards = sectionRef.current?.querySelectorAll(".method-step")
                if (!cards) return

                gsap.set(cards, { opacity: 0, y: 30 })
                gsap.to(cards, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                        once: true,
                    },
                })
            }, sectionRef)
        }

        init()
        return () => ctx?.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            className="py-28 md:py-36 bg-bg-deep border-t border-white/5"
        >
            <div className="container max-w-6xl px-6 md:px-12 mx-auto">
                {/* Section label */}
                <p
                    className="text-xs uppercase tracking-[0.2em] text-text-secondary mb-4 font-medium"
                    style={{ fontFamily: "var(--font-mono-code)" }}
                >
                    Methodology
                </p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary mb-16 md:mb-20">
                    How It Works
                </h2>

                {/* Steps */}
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    {/* Connecting line (desktop only) */}
                    <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-white/10" aria-hidden="true" />

                    {steps.map((step, i) => (
                        <div key={i} className="method-step relative flex flex-col gap-4">
                            {/* Step number */}
                            <span
                                className="text-5xl md:text-6xl font-bold text-gold/20 leading-none"
                                style={{ fontFamily: "var(--font-mono-code)" }}
                            >
                                {step.number}
                            </span>

                            {/* Title */}
                            <h3 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
                                {step.title}
                            </h3>

                            {/* Description */}
                            <p className="text-text-secondary text-base leading-relaxed max-w-xs">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
