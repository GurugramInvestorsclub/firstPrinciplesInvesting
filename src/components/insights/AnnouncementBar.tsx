"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, Tag, ArrowRight } from "lucide-react"
import { Event } from "@/lib/types"

interface AnnouncementBarProps {
    event: Event
    isSubscriber: boolean
}

export function AnnouncementBar({ event, isSubscriber }: AnnouncementBarProps) {
    if (!event) return null

    // Format the date nicely, e.g. "Jul 26, 05:30 PM"
    const eventDateStr = event.date
        ? new Date(event.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : ""

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full bg-bg-deep/80 border-b border-gold/20 backdrop-blur-md sticky top-[64px] md:top-[74px] z-40 transition-all duration-300"
        >
            <div className="container max-w-7xl mx-auto px-4 py-2.5 md:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                {/* Left side: Live indicator and webinar title/info */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-sm md:text-base font-sans">
                    {/* Pulsing indicator */}
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] md:text-xs font-bold tracking-wider text-emerald-400 uppercase">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        Live Webinar
                    </span>

                    {isSubscriber ? (
                        <div className="text-text-primary font-medium">
                            🎟️ <span className="text-gold font-semibold">Subscriber Benefit:</span> Register for our live session, <span className="font-semibold text-white">{event.title}</span>, at <span className="text-gold font-bold">50% discount</span>!
                        </div>
                    ) : (
                        <div className="text-text-primary font-medium flex flex-wrap items-center justify-center sm:justify-start gap-x-1.5 gap-y-0.5">
                            🔥 <span>Upcoming Session:</span>
                            <span className="font-semibold text-white">{event.title}</span>
                            <span className="hidden md:inline text-white/50">|</span>
                            <span className="flex items-center gap-1 text-[13px] md:text-sm bg-gold/10 px-2 py-0.5 rounded border border-gold/25 text-gold font-bold">
                                <Tag className="w-3 h-3" />
                                Register at ₹999 instead of ₹1,499 with code <span className="underline decoration-wavy">EB500</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Right side: Action button */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    {eventDateStr && (
                        <span className="hidden lg:flex items-center gap-1 text-xs text-text-secondary font-medium font-sans">
                            <Calendar className="w-3.5 h-3.5" />
                            {eventDateStr}
                        </span>
                    )}
                    <Link
                        href={`/events/${event.slug.current}#register`}
                        className="inline-flex items-center gap-1 text-xs md:text-sm font-bold bg-gold hover:bg-gold-muted text-[#1A1A1A] px-4 py-1.5 rounded-full transition-all shadow-md shadow-gold/5 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Register Now
                        <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}
