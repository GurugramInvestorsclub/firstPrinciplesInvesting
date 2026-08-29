"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { X, Sparkles, Calendar, Users, ArrowRight, ChevronLeft, ChevronRight, Tag } from "lucide-react"
import { Event, Super30Program } from "@/lib/types"

interface EventPromoCarouselProps {
    events?: Event[]
    super30Programs?: Super30Program[]
}

interface PromoSlide {
    id: string
    category: "SUPER30" | "EVENT"
    badge: string
    title: string
    tagline: string
    dateOrSeats?: string
    href: string
    buttonText: string
    isLive?: boolean
}

export function EventPromoCarousel({ events = [], super30Programs = [] }: EventPromoCarouselProps) {
    const [isDismissed, setIsDismissed] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [theme, setTheme] = useState<"dark" | "light">("dark")
    const [mounted, setMounted] = useState(false)

    // Build the list of slides dynamically from active Super 30 programs and upcoming events
    const slides: PromoSlide[] = []

    // Add active Super 30 programs first
    if (super30Programs && super30Programs.length > 0) {
        super30Programs.slice(0, 2).forEach((prog) => {
            slides.push({
                id: `super30-${prog._id}`,
                category: "SUPER30",
                badge: prog.batchName || "SUPER 30 COHORT",
                title: prog.title,
                tagline: prog.tagline || prog.shortDescription || "Master fundamental equity research & valuation in an exclusive batch.",
                dateOrSeats: prog.seatsAvailable ? `${prog.seatsAvailable} Seats Left` : "Registrations Open",
                href: `/super30/${prog.slug?.current || ""}`,
                buttonText: "Apply Now",
                isLive: !prog.isSoldOut
            })
        })
    }

    // Add upcoming events / webinars
    if (events && events.length > 0) {
        events.slice(0, 2).forEach((ev) => {
            slides.push({
                id: `event-${ev._id || ev.eventId}`,
                category: "EVENT",
                badge: "LIVE WEBINAR",
                title: ev.title,
                tagline: ev.shortDescription || "Join our upcoming fundamental equity masterclass and live Q&A session.",
                dateOrSeats: ev.date
                    ? new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "Upcoming Event",
                href: ev.slug?.current ? `/events/${ev.slug.current}` : "/events",
                buttonText: "Register Now",
                isLive: true
            })
        })
    }

    // Fallback slides if no active data available from Sanity
    if (slides.length === 0) {
        slides.push(
            {
                id: "fallback-super30",
                category: "SUPER30",
                badge: "SUPER 30 COHORT",
                title: "Super-30 Equity Batch",
                tagline: "Intensive 30-investor program on stock picking & SOTP valuation.",
                dateOrSeats: "Registrations Open",
                href: "/super30",
                buttonText: "Explore Cohort",
                isLive: true
            },
            {
                id: "fallback-event",
                category: "EVENT",
                badge: "MONTHLY MASTERCLASS",
                title: "Equity Research Webinars",
                tagline: "Join live monthly fundamental analysis deep-dives & interactive Q&A.",
                dateOrSeats: "Upcoming Webinar",
                href: "/events",
                buttonText: "View Events",
                isLive: true
            }
        )
    }

    // Load theme & dismissed state on mount
    useEffect(() => {
        setMounted(true)

        // Check if user dismissed the promo in current session
        const dismissed = sessionStorage.getItem("fpi_event_promo_dismissed")
        if (dismissed === "true") {
            setIsDismissed(true)
        }

        // Listen for article theme change
        const savedTheme = localStorage.getItem("fpi-article-theme") as "dark" | "light" | null
        if (savedTheme === "light" || savedTheme === "dark") {
            setTheme(savedTheme)
        }

        const handleThemeChange = () => {
            const currentTheme = localStorage.getItem("fpi-article-theme") as "dark" | "light" | null
            if (currentTheme) {
                setTheme(currentTheme)
            }
        }

        window.addEventListener("fpi-article-theme-change", handleThemeChange)
        return () => window.removeEventListener("fpi-article-theme-change", handleThemeChange)
    }, [])

    // Auto-advance slide every 5 seconds unless paused or dismissed
    useEffect(() => {
        if (isDismissed || isPaused || slides.length <= 1) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length)
        }, 5000)

        return () => clearInterval(timer)
    }, [isDismissed, isPaused, slides.length])

    const handleDismiss = () => {
        setIsDismissed(true)
        sessionStorage.setItem("fpi_event_promo_dismissed", "true")
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
    }

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % slides.length)
    }

    if (!mounted || isDismissed || slides.length === 0) {
        return null
    }

    const currentSlide = slides[currentIndex] || slides[0]
    const isLight = theme === "light"

    return (
        <aside
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-label="Promoted Event Sidebar"
            className={`hidden min-[1320px]:block fixed top-40 right-[max(1rem,calc((100vw-768px)/2-250px))] w-[245px] z-30 pointer-events-auto transition-all duration-300 ${
                isDismissed ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
            }`}
        >
            <div
                className={`p-4 rounded-2xl border backdrop-blur-xl relative overflow-hidden transition-all duration-300 shadow-2xl group ${
                    isLight
                        ? "bg-white/95 border-slate-200/90 shadow-slate-300/50 text-slate-900"
                        : "bg-[#131316]/95 border-gold/25 shadow-black/90 text-white"
                }`}
            >
                {/* Subtle Gold Background Accent Glow */}
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-gold/10 rounded-full blur-2xl pointer-events-none" />

                {/* Top Header Bar with Cancel (X) Button */}
                <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
                        </span>
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-gold/90"}`}>
                            ACTIVE EVENT
                        </span>
                    </div>

                    <button
                        onClick={handleDismiss}
                        aria-label="Close promo card"
                        title="Dismiss event widget"
                        className={`p-1 rounded-full transition-colors cursor-pointer ${
                            isLight
                                ? "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                                : "text-neutral-400 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Slide Category Badge */}
                <div className="mb-2">
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase border ${
                            currentSlide.category === "SUPER30"
                                ? isLight
                                    ? "bg-amber-100 text-amber-900 border-amber-300"
                                    : "bg-gold/15 text-gold border-gold/30"
                                : isLight
                                ? "bg-blue-100 text-blue-900 border-blue-300"
                                : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                        }`}
                    >
                        {currentSlide.category === "SUPER30" ? (
                            <Users className="w-3 h-3 text-gold" />
                        ) : (
                            <Calendar className="w-3 h-3 text-cyan-400" />
                        )}
                        <span>{currentSlide.badge}</span>
                    </span>
                </div>

                {/* Main Content Area */}
                <div className="space-y-2 min-h-[92px] flex flex-col justify-between">
                    <div>
                        <h3 className={`text-xs font-bold leading-snug tracking-tight line-clamp-2 transition-colors ${
                            isLight ? "text-slate-900 hover:text-amber-700" : "text-white group-hover:text-gold"
                        }`}>
                            {currentSlide.title}
                        </h3>
                        <p className={`text-[11px] leading-relaxed line-clamp-2 mt-1 font-light ${
                            isLight ? "text-slate-600" : "text-neutral-400"
                        }`}>
                            {currentSlide.tagline}
                        </p>
                    </div>

                    {currentSlide.dateOrSeats && (
                        <div className="pt-1">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${
                                isLight
                                    ? "bg-slate-100 border-slate-200 text-slate-700"
                                    : "bg-white/5 border-white/10 text-gold/90"
                            }`}>
                                <Sparkles className="w-2.5 h-2.5 text-gold" />
                                <span>{currentSlide.dateOrSeats}</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Primary CTA Button */}
                <div className="mt-3 pt-2.5 border-t border-white/10">
                    <Link
                        href={currentSlide.href}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                            isLight
                                ? "bg-slate-900 text-gold hover:bg-slate-800"
                                : "bg-gold text-black hover:bg-gold-muted"
                        }`}
                    >
                        <span>{currentSlide.buttonText}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Navigation Dots & Prev/Next Micro Controls (If > 1 slide) */}
                {slides.length > 1 && (
                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/5">
                        <div className="flex items-center gap-1">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    aria-label={`Go to slide ${idx + 1}`}
                                    className={`h-1 rounded-full transition-all cursor-pointer ${
                                        idx === currentIndex
                                            ? "w-4 bg-gold"
                                            : isLight
                                            ? "w-1 bg-slate-300 hover:bg-slate-400"
                                            : "w-1 bg-white/20 hover:bg-white/40"
                                    }`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={prevSlide}
                                aria-label="Previous event slide"
                                className={`p-1 rounded-md transition-colors cursor-pointer ${
                                    isLight
                                        ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                        : "text-neutral-400 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                                onClick={nextSlide}
                                aria-label="Next event slide"
                                className={`p-1 rounded-md transition-colors cursor-pointer ${
                                    isLight
                                        ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                        : "text-neutral-400 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    )
}
