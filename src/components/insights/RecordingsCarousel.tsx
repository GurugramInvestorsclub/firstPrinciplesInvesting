"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Video, Play, ExternalLink, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Recording } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"

function formatDate(dateStr?: string) {
    if (!dateStr) return ""
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        })
    } catch (e) {
        return dateStr
    }
}

interface RecordingsCarouselProps {
    recordings: Recording[]
}

export function RecordingsCarousel({ recordings }: RecordingsCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

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
    }, [recordings])

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return
        const scrollAmount = scrollRef.current.clientWidth * 0.85
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        })
    }

    if (!recordings || recordings.length === 0) {
        return (
            <div className="pt-16 border-t border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold">
                        <Video className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-sans font-bold text-white tracking-tight">Recordings Archive</h2>
                        <p className="text-xs md:text-sm text-neutral-400 font-light">Watch recorded sessions, webinars, and masterclass replays</p>
                    </div>
                </div>
                <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                    <p className="text-sm text-neutral-400 font-sans">No session recordings found in the archive.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="pt-16 border-t border-white/5 space-y-8">
            {/* Header & Navigation Controls */}
            <div className="flex items-end justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold">
                        <Video className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold/80 block mb-0.5">MEMBERS EXCLUSIVE</span>
                        <h2 className="text-xl md:text-2xl font-sans font-bold text-white tracking-tight">Recordings Archive</h2>
                    </div>
                </div>

                {/* Navigation arrows */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        aria-label="Previous recordings"
                        className="w-10 h-10 rounded-full border border-white/10 bg-[#1E1E1E] flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 active:scale-95"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        aria-label="Next recordings"
                        className="w-10 h-10 rounded-full border border-white/10 bg-[#1E1E1E] flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 active:scale-95"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Carousel Container */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {recordings.map((recording) => (
                    <div
                        key={recording._id}
                        className="w-[300px] sm:w-[340px] md:w-[380px] flex-shrink-0 snap-start group flex flex-col justify-between border border-white/10 hover:border-gold/30 bg-[#1E1E1E] rounded-2xl overflow-hidden hover:shadow-[0_12px_40px_rgba(255,199,44,0.12)] transition-all duration-300"
                    >
                        {/* Thumbnail or Poster */}
                        <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-neutral-900 to-black overflow-hidden flex items-center justify-center flex-shrink-0">
                            {recording.thumbnail ? (
                                <Image
                                    src={urlForImage(recording.thumbnail).width(500).height(281).fit("crop").url()}
                                    alt={recording.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gold/10 via-neutral-900 to-black p-6 text-center">
                                    <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold mb-2 group-hover:scale-110 transition-transform">
                                        <Play className="w-5 h-5 fill-gold/40 ml-0.5" />
                                    </div>
                                    <span className="text-[10px] font-mono text-gold/80 uppercase tracking-widest">SESSION RECORDING</span>
                                </div>
                            )}
                            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-mono text-gold font-bold flex items-center gap-1.5 shadow-md">
                                <Calendar className="w-3 h-3 text-gold/80" />
                                <span>{formatDate(recording.date)}</span>
                            </div>
                        </div>

                        {/* Details & CTA */}
                        <div className="p-6 flex flex-col justify-between flex-grow space-y-5">
                            <div className="space-y-2">
                                {recording.duration && (
                                    <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
                                        <Clock className="w-3 h-3 text-gold/70" />
                                        <span>{recording.duration}</span>
                                    </div>
                                )}
                                <h3 className="text-base font-bold text-white group-hover:text-gold transition-colors leading-snug line-clamp-2">
                                    {recording.title}
                                </h3>
                                {recording.description && (
                                    <p className="text-xs text-neutral-400 font-light line-clamp-3 leading-relaxed">
                                        {recording.description}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <a
                                    href={recording.recordingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-xl bg-gold/10 hover:bg-gold text-gold hover:text-black font-semibold text-xs transition-all duration-300 border border-gold/25 hover:border-gold shadow-sm active:scale-[0.99]"
                                >
                                    <span>Watch Recording</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
