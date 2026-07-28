"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
    BookOpen, 
    Percent, 
    Database, 
    Users, 
    FileSpreadsheet, 
    MessageSquare, 
    ChevronLeft, 
    ChevronRight, 
    ArrowRight, 
    Zap, 
    ShieldCheck, 
    Sparkles 
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface PerkItem {
    id: string
    title: string
    subtitle: string
    description: string
    badge: string
    icon: any
    ctaText: string
    href: string
}

const MEMBERSHIP_PERKS: PerkItem[] = [
    {
        id: "reports",
        title: "2 Premium Research Reports",
        subtitle: "In-Depth Institutional Breakdowns",
        description: "Receive 2 comprehensive, non-consensus equity research reports every month with full investment thesis, valuation models, and risk analysis.",
        badge: "MOST POPULAR",
        icon: BookOpen,
        ctaText: "Explore Membership",
        href: "/membership"
    },
    {
        id: "archive",
        title: "Complete Research Archive",
        subtitle: "Historical Moat Repository",
        description: "Unlock instant back-catalog access to 50+ past industry breakdowns, promoter quality assessments, and sector evolution maps.",
        badge: "INSTANT ACCESS",
        icon: Database,
        ctaText: "Unlock Archive",
        href: "/membership"
    },
    {
        id: "meetups",
        title: "Monthly Live Member Meetups",
        subtitle: "Scuttlebutt & Stress-Tests",
        description: "Participate in monthly live stress-tests. Present your thesis, challenge other members, and get direct feedback from senior analysts.",
        badge: "LIVE SESSIONS",
        icon: Users,
        ctaText: "Join Live Sessions",
        href: "/membership"
    },
    {
        id: "webinar-discount",
        title: "50% Discount on Webinars",
        subtitle: "Exclusive Member Pass",
        description: "Save 50% on all live sectoral masterclasses detailing high-barrier growth sectors like API chemicals, defense electronics, and EMS.",
        badge: "MEMBER PERK",
        icon: Percent,
        ctaText: "Claim Member Pass",
        href: "/membership"
    },
    {
        id: "models",
        title: "Valuation Models & Sheets",
        subtitle: "Institutional Spreadsheets",
        description: "Download ready-to-use DCF models, earnings sensitivity calculators, and financial templates in Excel and Google Sheets.",
        badge: "EXCEL & SHEETS",
        icon: FileSpreadsheet,
        ctaText: "Get Valuation Sheets",
        href: "/membership"
    },
    {
        id: "analyst-qa",
        title: "Direct Analyst Q&A Thread",
        subtitle: "1-on-1 Thesis Clarifications",
        description: "Get direct answers from our research analysts on company fundamentals, governance queries, and sector trends.",
        badge: "ANALYST ACCESS",
        icon: MessageSquare,
        ctaText: "Ask Our Team",
        href: "/membership"
    }
]

export function SubscriptionCarousel() {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(false)

    const updateArrowVisibility = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setShowLeftArrow(scrollLeft > 10)
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }

    useEffect(() => {
        updateArrowVisibility()
        window.addEventListener("resize", updateArrowVisibility)
        return () => window.removeEventListener("resize", updateArrowVisibility)
    }, [])

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return
        const scrollAmount = scrollRef.current.clientWidth * 0.8
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        })
    }

    return (
        <section className="w-full py-12 md:py-16 relative overflow-hidden bg-gradient-to-b from-transparent via-gold/5 to-transparent border-y border-white/10 rounded-3xl my-8">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 space-y-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono font-semibold uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Continue Learning Beyond This Event</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                        Upgrade to <span className="text-gold">All-Access Membership</span>
                    </h2>
                    <p className="text-text-secondary text-base md:text-lg font-light leading-relaxed">
                        Get access to in-depth company research, sector reports, member-only webinars, valuation models, and exclusive investing insights.
                    </p>
                </div>

                {/* Carousel Container */}
                <div className="relative group/carousel">
                    {/* Navigation Arrows */}
                    <AnimatePresence>
                        {showLeftArrow && (
                            <motion.button
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                onClick={() => scroll("left")}
                                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center rounded-full bg-black/80 backdrop-blur-xl border border-gold/30 text-gold hover:bg-gold hover:text-bg-deep transition-all duration-300 shadow-2xl"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showRightArrow && (
                            <motion.button
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 15 }}
                                onClick={() => scroll("right")}
                                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center rounded-full bg-black/80 backdrop-blur-xl border border-gold/30 text-gold hover:bg-gold hover:text-bg-deep transition-all duration-300 shadow-2xl"
                                aria-label="Scroll right"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Scrollable Cards Track */}
                    <div
                        ref={scrollRef}
                        onScroll={updateArrowVisibility}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 hide-scrollbar w-full"
                    >
                        {MEMBERSHIP_PERKS.map((perk) => {
                            const Icon = perk.icon
                            return (
                                <motion.div
                                    key={perk.id}
                                    whileHover={{ y: -6, scale: 1.015 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="w-[300px] sm:w-[360px] flex-shrink-0 snap-center group"
                                >
                                    <div className="h-full flex flex-col justify-between p-7 rounded-3xl bg-[#121215]/90 border border-white/10 backdrop-blur-xl group-hover:border-gold/40 group-hover:shadow-[0_15px_40px_rgba(255,199,44,0.12)] transition-all duration-500 relative overflow-hidden">
                                        {/* Top accent glow */}
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                        <div className="space-y-5">
                                            {/* Top Row: Icon + Badge */}
                                            <div className="flex items-center justify-between">
                                                <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-bg-deep transition-all duration-300">
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <span className="text-[10px] font-mono font-bold text-gold bg-gold/10 border border-gold/30 px-3 py-1 rounded-full uppercase tracking-wider">
                                                    {perk.badge}
                                                </span>
                                            </div>

                                            {/* Text Content */}
                                            <div className="space-y-2 text-left">
                                                <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors duration-300">
                                                    {perk.title}
                                                </h3>
                                                <p className="text-xs text-gold/80 font-medium">
                                                    {perk.subtitle}
                                                </p>
                                                <p className="text-sm text-text-secondary leading-relaxed font-light">
                                                    {perk.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bottom Action Area */}
                                        <div className="pt-6 mt-6 border-t border-white/10">
                                            <Button
                                                asChild
                                                className="w-full rounded-2xl bg-gold/10 hover:bg-gold text-gold hover:text-bg-deep border border-gold/30 font-bold py-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-gold/20 flex items-center justify-center gap-2"
                                            >
                                                <Link href={perk.href}>
                                                    {perk.ctaText}
                                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* Membership Offer Banner */}
                <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-r from-[#18181C] via-[#1A1813] to-[#18181C] border border-gold/30 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="space-y-3 text-center md:text-left max-w-xl">
                            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                                <Zap className="w-3.5 h-3.5 text-gold" />
                                <span>ALL-ACCESS MEMBERSHIP</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                                Ready to build high-conviction thesis?
                            </h3>
                            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                                Join now for <span className="text-white font-bold">₹2,100 / 3 months</span> (less than ₹24/day). Get immediate access to all research reports, valuation sheets, and member masterclasses.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-3 shrink-0 w-full sm:w-auto">
                            <Button
                                asChild
                                size="lg"
                                className="w-full sm:w-auto rounded-full px-8 h-14 text-base md:text-lg font-extrabold bg-gold text-bg-deep hover:bg-gold-muted transition-all duration-300 shadow-xl shadow-gold/20 hover:scale-[1.02]"
                            >
                                <Link href="/membership" className="flex items-center gap-2 justify-center">
                                    Explore Membership
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </Button>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-text-secondary">
                                <ShieldCheck className="w-4 h-4 text-gold" />
                                <span>Instant Access · 14-Day Guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </section>
    )
}
