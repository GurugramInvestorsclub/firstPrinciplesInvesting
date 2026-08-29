"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import {
    Layers,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    Tag,
    Sparkles,
    ExternalLink
} from "lucide-react"
import { DemergerRecord } from "@/lib/demergers"

interface DemergerTrackerCarouselProps {
    records: DemergerRecord[]
    isLocked?: boolean
}

export function DemergerTrackerCarousel({ records, isLocked = false }: DemergerTrackerCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const validRecords = (records || []).slice(0, 10) // Show up to 10 key demergers in carousel

    const checkScroll = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setCanScrollLeft(scrollLeft > 10)
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
    }

    useEffect(() => {
        checkScroll()
        window.addEventListener("resize", checkScroll)
        return () => window.removeEventListener("resize", checkScroll)
    }, [validRecords])

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return
        const scrollAmount = scrollRef.current.clientWidth * 0.85
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        })
    }

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "Listed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Listed
                    </span>
                )
            case "Record Date Set":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gold/10 text-gold border border-gold/30">
                        <Clock className="w-3 h-3 text-gold" />
                        Record Date Set
                    </span>
                )
            case "NCLT Approval Pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        <AlertCircle className="w-3 h-3 text-cyan-400" />
                        NCLT Pending
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        <Sparkles className="w-3 h-3 text-purple-300" />
                        {status || "Announced"}
                    </span>
                )
        }
    }

    return (
        <div className="pt-16 border-t border-white/5 space-y-8">
            {/* Header & Navigation Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/5">
                <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold mt-1">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold/80 block mb-0.5">
                            SPECIAL SITUATIONS & ARBITRAGE
                        </span>
                        <h2 className="text-xl md:text-2xl font-sans font-bold text-white tracking-tight">
                            Demerger Tracker
                        </h2>
                        <p className="text-xs md:text-sm text-neutral-400 font-light max-w-xl mt-1">
                            Track Indian equity spin-offs, NCLT approval stages, swap ratios, and record dates.
                        </p>
                    </div>
                </div>

                {/* Right controls: View Full Tracker CTA + Scroll Arrows */}
                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                    <Link
                        href="/demerger-tracker"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 hover:bg-gold text-gold hover:text-black border border-gold/30 hover:border-gold font-semibold text-xs transition-all duration-300 shadow-sm active:scale-95"
                    >
                        <span>View Full Tracker</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                            aria-label="Previous demerger"
                            className="w-9 h-9 rounded-full border border-white/10 bg-[#1E1E1E] flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 active:scale-95"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                            aria-label="Next demerger"
                            className="w-9 h-9 rounded-full border border-white/10 bg-[#1E1E1E] flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 active:scale-95"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Carousel Container */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {validRecords.map((item) => {
                    const targetHref = `/demerger-tracker?search=${encodeURIComponent(item.companyName)}`

                    return (
                        <div
                            key={item.id}
                            className={`w-[300px] sm:w-[340px] md:w-[360px] flex-shrink-0 snap-start group flex flex-col justify-between border border-white/10 hover:border-gold/30 bg-[#1E1E1E] rounded-2xl overflow-hidden hover:shadow-[0_12px_40px_rgba(255,199,44,0.12)] transition-all duration-300 ${
                                isLocked ? "opacity-75" : ""
                            }`}
                        >
                            <div className="p-6 flex flex-col justify-between flex-grow space-y-5">
                                {/* Top Badge Row */}
                                <div className="flex items-center justify-between gap-2">
                                    {renderStatusBadge(item.status)}
                                    {item.sector && (
                                        <span className="text-[10px] font-mono text-neutral-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                            {item.sector}
                                        </span>
                                    )}
                                </div>

                                {/* Company & Symbol */}
                                <div className="space-y-1">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <h3 className="text-base font-bold text-white group-hover:text-gold transition-colors line-clamp-1">
                                            {item.companyName}
                                        </h3>
                                        {item.symbol && (
                                            <span className="text-[10px] font-mono text-gold/80 bg-gold/10 px-1.5 py-0.5 rounded flex-shrink-0">
                                                {item.symbol}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                                        <span className="text-neutral-500 font-normal">Spin-off:</span> {item.demergedEntity}
                                    </p>
                                </div>

                                {/* Details Pills / Grid */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                                    {item.ratio ? (
                                        <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2 flex flex-col">
                                            <span className="text-[9px] font-mono uppercase text-neutral-500 tracking-wider">Ratio</span>
                                            <span className="text-xs font-semibold text-gold font-mono truncate">{item.ratio}</span>
                                        </div>
                                    ) : (
                                        <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2 flex flex-col">
                                            <span className="text-[9px] font-mono uppercase text-neutral-500 tracking-wider">Stage</span>
                                            <span className="text-xs font-medium text-neutral-300 truncate">{item.stageRaw || "Announced"}</span>
                                        </div>
                                    )}

                                    {item.recordDate ? (
                                        <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2 flex flex-col">
                                            <span className="text-[9px] font-mono uppercase text-neutral-500 tracking-wider">Record Date</span>
                                            <span className="text-xs font-semibold text-white font-mono truncate">{item.recordDate}</span>
                                        </div>
                                    ) : (
                                        <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2 flex flex-col">
                                            <span className="text-[9px] font-mono uppercase text-neutral-500 tracking-wider">Valuation</span>
                                            <span className="text-xs font-medium text-gold/90 truncate">{item.valuation || "SOTP Model"}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Action */}
                                <div className="pt-3 border-t border-white/5">
                                    <Link
                                        href={targetHref}
                                        className="inline-flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-white/5 hover:bg-gold/10 text-neutral-300 hover:text-gold border border-white/10 hover:border-gold/30 text-xs font-medium transition-all duration-300"
                                    >
                                        <span>Open Tracker Details</span>
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
