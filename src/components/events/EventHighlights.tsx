'use client'

import { motion, useSpring, useTransform, useInView } from "framer-motion"
import { useEffect, useRef } from "react"
import { Event } from "@/lib/types"

function AnimatedNumber({ value }: { value: number }) {
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once: true, margin: "-100px" })
    
    // Smooth counter animation
    const spring = useSpring(0, { bounce: 0, duration: 2500 })

    useEffect(() => {
        if (inView) {
            spring.set(value)
        }
    }, [inView, spring, value])

    useEffect(() => {
        return spring.on("change", (latest) => {
            if (ref.current) {
                if (value % 1 !== 0) {
                    ref.current.textContent = latest.toFixed(1)
                } else {
                    ref.current.textContent = Math.floor(latest).toString()
                }
            }
        })
    }, [spring, value])

    return <span ref={ref}>0</span>
}

function AnimatedTextWithNumbers({ text }: { text: string }) {
    // Find all numbers, including decimals
    const parts = text.split(/(\d+(?:\.\d+)?)/);
    const hasNumbers = parts.some(part => !isNaN(parseFloat(part)) && part.trim() !== '');
    
    if (!hasNumbers) {
        const words = text.split(' ');
        if (words.length > 2) {
            const firstPart = words.slice(0, -2).join(' ');
            const lastPart = words.slice(-2).join(' ');
            return (
                <span>
                    {firstPart} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC72C] to-[#C89B3C]">{lastPart}</span>
                </span>
            );
        }
    }

    return (
        <span>
            {parts.map((part, i) => {
                const num = parseFloat(part)
                if (!isNaN(num) && part.trim() !== '') {
                    return <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC72C] to-[#C89B3C]"><AnimatedNumber value={num} /></span>
                }
                return <span key={i}>{part}</span>
            })}
        </span>
    )
}

export function EventHighlights({ event }: { event: Event }) {
    if (!event.highlightStat) return null;

    return (
        <section id="highlights" className="py-20 md:py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gold/5 opacity-5 pointer-events-none" />
            <div className="w-[80%] mx-auto max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{
                        y: -8,
                        transition: { duration: 0.4 }
                    }}
                    className="p-10 md:p-16 rounded-[32px] text-center bg-[#111113]/40 backdrop-blur-2xl border border-white/5 hover:border-gold/30 hover:shadow-[0_40px_100px_rgba(255,199,44,0.15)] transition-all duration-500 cursor-default group relative overflow-hidden"
                >
                    {/* Gold hairline accent along the top edge */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <span className="relative z-10 block text-[10px] font-mono uppercase tracking-[0.4em] text-text-secondary/70 mb-8">
                        Why Now
                    </span>
                    <h2 className="relative z-10 text-2xl md:text-4xl leading-snug md:leading-snug font-semibold text-white drop-shadow-2xl max-w-3xl mx-auto">
                        <AnimatedTextWithNumbers text={event.highlightStat} />
                    </h2>
                </motion.div>
            </div>
        </section>
    )
}
