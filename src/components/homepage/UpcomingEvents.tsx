"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Event } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { EventCarousel } from "@/components/events/EventCarousel"

interface UpcomingEventsProps {
    events: Event[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    if (!events || events.length === 0) {
        return null;
    }

    return (
        <section className="relative py-24 md:py-32 overflow-hidden bg-bg-deep border-t border-white/5" ref={containerRef}>
            {/* Premium background effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gold/5 rounded-[100%] blur-[120px] opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-900/10 rounded-full blur-[150px] opacity-30 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay pointer-events-none" />

            <div className="container max-w-[1400px] px-4 md:px-8 mx-auto relative z-10 w-full overflow-hidden">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: { opacity: 0, y: 40 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                    }}
                    className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-8 max-w-7xl mx-auto"
                >
                    <div className="space-y-5 max-w-2xl">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gold uppercase tracking-widest backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                            </span>
                            Live Briefings
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-text-primary">
                            Strategic Intel. <span className="text-text-secondary">Delivered Live.</span>
                        </h2>
                    </div>
                    <div className="hidden md:block">
                        <Button asChild variant="outline" className="rounded-full px-8 py-6 border-white/10 hover:border-gold/40 hover:bg-gold/10 text-text-primary bg-white/5 backdrop-blur-md transition-all duration-300">
                            <Link href="/events" className="flex items-center gap-2 text-sm font-bold tracking-wide uppercase">
                                View Full Calendar <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    </div>
                </motion.div>

                {/* Carousel Container */}
                <EventCarousel events={events} />

                <div className="md:hidden mt-4 flex justify-center max-w-7xl mx-auto">
                    <Button asChild variant="outline" className="w-full rounded-xl py-6 border-white/10 hover:border-gold/40 hover:bg-gold/10 text-text-primary bg-white/5 backdrop-blur-md transition-all duration-300">
                        <Link href="/events" className="flex items-center justify-center gap-2 text-sm font-bold tracking-wide uppercase">
                            View Full Calendar <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
