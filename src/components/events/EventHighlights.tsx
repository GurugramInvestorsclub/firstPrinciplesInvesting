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
    
    return (
        <span>
            {parts.map((part, i) => {
                const num = parseFloat(part)
                if (!isNaN(num) && part.trim() !== '') {
                    return <AnimatedNumber key={i} value={num} />
                }
                return <span key={i}>{part}</span>
            })}
        </span>
    )
}

export function EventHighlights({ event }: { event: Event }) {
    if (!event.highlightStat) return null;

    return (
        <section id="highlights" className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gold/5 opacity-5 pointer-events-none" />
            <div className="w-[80%] mx-auto max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="p-8 md:p-14 rounded-[16px] text-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:shadow-[0_12px_40px_rgba(255,199,44,0.15)] transition-all duration-500 cursor-default"
                >
                    <h2 className="text-3xl md:text-5xl md:leading-tight font-bold text-white drop-shadow-lg">
                        <AnimatedTextWithNumbers text={event.highlightStat} />
                    </h2>
                </motion.div>
            </div>
        </section>
    )
}
