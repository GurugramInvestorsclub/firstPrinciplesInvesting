"use client"

import { useEffect, useRef } from "react"

const paragraphs = [
    "Tactics expire. Frameworks endure. We teach investors to see businesses as systems : to understand competitive moats, capital allocation logic, and the incentive structures that drive long-term outcomes.",
    "This is not about hot stock tips or quarterly earnings reactions. It is about building the analytical infrastructure to make decisions you can hold for years.",
    "Clarity in investing begins with clarity in thinking."
]

export function Manifesto() {
    const sectionRef = useRef<HTMLElement>(null)
    const headlineRef = useRef<HTMLDivElement>(null)

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
                // Animate the headline words
                const headlineEl = headlineRef.current
                if (!headlineEl) return

                const words = headlineEl.querySelectorAll(".word")
                gsap.set(words, { opacity: 0, y: 12 })

                gsap.to(words, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.04,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                        once: true,
                    },
                })

                // Animate paragraphs
                const paras = sectionRef.current?.querySelectorAll(".manifesto-para")
                if (paras) {
                    gsap.set(paras, { opacity: 0, y: 20 })
                    gsap.to(paras, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.15,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top 60%",
                            once: true,
                        },
                    })
                }
            }, sectionRef)
        }

        init()
        return () => ctx?.revert()
    }, [])

    // Split the headline into individually wrapped words
    const headlineText = "We focus on foundations."
    const headlineWords = headlineText.split(" ")

    return (
        <section
            ref={sectionRef}
            className="relative py-28 md:py-40 bg-bg-deep overflow-hidden border-t border-white/5"
        >
            {/* Subtle grain */}
            <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: "repeat" }}
                aria-hidden="true"
            />

            <div className="container max-w-4xl px-6 md:px-12 mx-auto relative z-10">
                {/* Muted lead-in */}
                <p className="text-sm md:text-base text-text-secondary tracking-wide mb-6 uppercase font-medium"
                    style={{ letterSpacing: "0.08em" }}
                >
                    Most investing education focuses on tactics.
                </p>

                {/* Large serif headline with word-by-word reveal */}
                <div ref={headlineRef} className="mb-12 md:mb-16">
                    <h2
                        className="text-3xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        {headlineWords.map((word, i) => (
                            <span
                                key={i}
                                className={`word inline-block mr-[0.3em] ${word === "foundations." ? "text-gold font-bold" : "text-text-primary"
                                    }`}
                            >
                                {word}
                            </span>
                        ))}
                    </h2>
                </div>

                {/* Sharp paragraphs */}
                <div className="space-y-6 max-w-2xl">
                    {paragraphs.map((p, i) => (
                        <p
                            key={i}
                            className="manifesto-para text-base md:text-lg text-text-secondary leading-relaxed"
                        >
                            {p}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    )
}
