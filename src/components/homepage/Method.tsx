"use client"

import { useEffect, useRef } from "react"
import { ArrowRight } from "lucide-react"

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
                const elements = sectionRef.current?.querySelectorAll(".method-element")
                if (!elements) return

                gsap.set(elements, { opacity: 0, y: 30 })
                gsap.to(elements, {
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
            className="py-24 md:py-32 bg-bg-deep border-t border-white/5 overflow-hidden"
        >
            <div className="container max-w-5xl px-6 mx-auto flex flex-col items-center">
                {/* Section Header */}
                <div className="text-center mb-16 md:mb-20 method-element w-full">
                    <p
                        className="text-xs uppercase tracking-[0.2em] text-text-secondary mb-4 font-medium"
                        style={{ fontFamily: "var(--font-mono-code)" }}
                    >
                        Methodology
                    </p>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary">
                        How It Works
                    </h2>
                </div>

                {/* Flow Container */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 w-full">
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col md:flex-row items-center gap-6 md:gap-4 w-full md:w-auto method-element">
                            {/* Card */}
                            <div className="peer group relative w-full md:w-[280px] p-8 md:p-10 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.1] hover:-translate-y-1 overflow-hidden flex flex-col justify-center min-h-[200px]">
                                {/* Background Number */}
                                <span
                                    className="absolute -bottom-2 -right-4 text-[120px] font-bold text-white/[0.02] transition-colors duration-300 group-hover:text-gold/[0.06] leading-none pointer-events-none select-none tracking-tighter"
                                    style={{ fontFamily: "var(--font-mono-code)" }}
                                >
                                    {step.number}
                                </span>

                                <div className="relative z-10 flex flex-col gap-3">
                                    <h3 className="text-2xl font-bold text-text-primary tracking-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>

                            {/* Arrow Connection (except last item) */}
                            {i < steps.length - 1 && (
                                <>
                                    <div className="hidden relative md:flex items-center justify-center text-white/20 transition-all duration-300 peer-hover:text-gold/50 peer-hover:drop-shadow-[0_0_8px_rgba(245,184,0,0.5)]">
                                        <ArrowRight className="w-6 h-6" strokeWidth={1.5} />
                                    </div>
                                    <div className="md:hidden flex items-center justify-center py-2 text-white/20 transition-all duration-300 peer-hover:text-gold/50 peer-hover:drop-shadow-[0_0_8px_rgba(245,184,0,0.5)]">
                                        <ArrowRight className="w-6 h-6 rotate-90" strokeWidth={1.5} />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
