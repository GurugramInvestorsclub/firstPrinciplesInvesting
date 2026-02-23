"use client"

import { useEffect, useRef, useState } from "react"

const stats = [
    { value: 10, suffix: "+", label: "Workshops Conducted" },
    { value: 500, suffix: "+", label: "Investors Educated" },
    { value: 4.9, suffix: "", label: "Average Feedback Score", decimals: 1 },
]

function StatCounter({
    target,
    suffix,
    decimals = 0,
    triggered,
}: {
    target: number
    suffix: string
    decimals?: number
    triggered: boolean
}) {
    const [current, setCurrent] = useState(0)
    const animRef = useRef<any>(null)

    useEffect(() => {
        if (!triggered) return

        let cancelled = false

        async function animate() {
            const gsap = (await import("gsap")).default
            const obj = { val: 0 }

            animRef.current = gsap.to(obj, {
                val: target,
                duration: 1.2,
                ease: "power2.out",
                onUpdate: () => {
                    if (!cancelled) {
                        setCurrent(
                            decimals > 0
                                ? parseFloat(obj.val.toFixed(decimals))
                                : Math.round(obj.val)
                        )
                    }
                },
            })
        }

        animate()
        return () => {
            cancelled = true
            animRef.current?.kill()
        }
    }, [triggered, target, decimals])

    return (
        <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight tabular-nums">
            {decimals > 0 ? current.toFixed(decimals) : current}
            {suffix}
        </span>
    )
}

export function ProofStats() {
    const sectionRef = useRef<HTMLElement>(null)
    const [triggered, setTriggered] = useState(false)

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches

        if (prefersReducedMotion) {
            setTriggered(true)
            return
        }

        let ctx: any = null

        async function init() {
            const gsap = (await import("gsap")).default
            const { ScrollTrigger } = await import("gsap/ScrollTrigger")
            gsap.registerPlugin(ScrollTrigger)

            ctx = gsap.context(() => {
                ScrollTrigger.create({
                    trigger: sectionRef.current,
                    start: "top 75%",
                    once: true,
                    onEnter: () => setTriggered(true),
                })
            }, sectionRef)
        }

        init()
        return () => ctx?.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            className="py-24 md:py-32 bg-bg-deep border-t border-white/5"
        >
            <div className="container max-w-5xl px-6 md:px-12 mx-auto">
                <div className="bg-bg-primary/30 rounded-2xl border border-white/5 p-10 md:p-16">
                    <p
                        className="text-xs uppercase tracking-[0.2em] text-text-secondary mb-12 font-medium"
                        style={{ fontFamily: "var(--font-mono-code)" }}
                    >
                        Measured Impact
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <StatCounter
                                    target={stat.value}
                                    suffix={stat.suffix}
                                    decimals={stat.decimals}
                                    triggered={triggered}
                                />
                                <span className="text-sm text-text-secondary uppercase tracking-wider font-medium">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
