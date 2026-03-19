'use client'

import { motion } from "framer-motion"
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Event } from "@/lib/types"

import { EventActionSection } from "./EventActionSection"

interface EventHeroProps {
    event: Event
}

export function EventHero({ event }: EventHeroProps) {
    const eventDate = new Date(event.startTime || event.date)

    return (
        <section id="overview" className="relative pt-32 pb-20 md:pt-40 md:pb-32 lg:pt-48 lg:pb-40 overflow-hidden min-h-[90vh] flex items-center">
            {/* Slow Animated Background Elements */}
            <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5 border-dashed opacity-30 -z-10 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-gold/5 opacity-20 -z-10 pointer-events-none"
                animate={{ rotate: -360 }}
                transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-[#0b0b0c]/0 to-[#0b0b0c]/0 -z-10" />
            
            <div className="w-[80%] mx-auto max-w-screen-2xl relative z-10">
                <div className="flex flex-col items-center text-center gap-12 lg:gap-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full max-w-5xl flex flex-col items-center gap-6"
                    >
                        <div className="flex flex-wrap justify-center items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20 backdrop-blur-sm">
                                <Calendar className="w-3.5 h-3.5" />
                                {eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" })}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10 backdrop-blur-sm">
                                <MapPin className="w-3.5 h-3.5" />
                                {event.location}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tighter leading-[1.05] text-white drop-shadow-2xl">
                            {event.title}
                        </h1>

                        {event.subHeading && (
                            <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl mx-auto">
                                {event.subHeading}
                            </p>
                        )}
                    </motion.div>

                    <EventActionSection event={event} />
                </div>
            </div>
        </section>
    )
}
