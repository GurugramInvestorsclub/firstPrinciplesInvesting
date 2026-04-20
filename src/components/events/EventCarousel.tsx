"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, Variants, AnimatePresence } from "framer-motion"
import { Calendar, MapPin, User, ChevronLeft, ChevronRight, ArrowRight, Play } from "lucide-react"
import { Event } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
}

function EventCard({ event, isPastEvent }: { event: Event; isPastEvent?: boolean }) {
    const eventDate = new Date(event.date);
    const month = eventDate.toLocaleDateString("en-US", { month: "short" });
    const day = eventDate.toLocaleDateString("en-US", { day: "2-digit" });
    const year = eventDate.toLocaleDateString("en-US", { year: "numeric" });
    const dateStr = `${month} ${day}, ${year}`;

    return (
        <motion.div 
            variants={itemVariants}
            whileHover={{ 
                y: -10, 
                scale: 1.02, 
                transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } 
            }}
            className="md:w-[420px] w-full flex-shrink-0 md:snap-center group"
        >
            <div className="relative h-full flex flex-col rounded-[24px] border border-white/5 bg-[#111113]/40 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-gold/30 hover:shadow-[0_20px_60px_rgba(255,199,44,0.15)] hover:bg-[#111113]/60">
                {/* Subtle gradient light from top */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Poster Container */}
                <div className="h-[240px] relative overflow-hidden bg-[#0A0A0A] border-b border-white/5 flex-shrink-0">
                    {event.image ? (
                        <>
                            <Image
                                src={urlForImage(event.image).width(800).height(500).url()}
                                alt={event.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            {/* Dark gradient overlay for readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        </>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-deep to-gold/10 opacity-80" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2 group-hover:bg-gold/25 transition-colors duration-700" />
                            <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/10 rounded-full blur-[70px] -translate-x-1/3 translate-y-1/3 group-hover:bg-blue-500/20 transition-colors duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        </>
                    )}
                    
                    {/* Badge */}
                    <div className="absolute bottom-6 left-6 z-20">
                        <div className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gold/20 backdrop-blur-md border border-gold/30 text-xs font-bold text-gold shadow-xl tracking-wider uppercase">
                            {month} {day}
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-8 flex flex-col z-20 relative">
                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold tracking-[0.2em] text-gray-500 mb-6 uppercase">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gold" />
                            <span>{dateStr}</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-gold" />
                            <span className="truncate max-w-[140px]">{event.location || "Virtual"}</span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-gold transition-colors duration-300">
                        {event.title}
                    </h3>
                    
                    <p className="text-gray-400 leading-relaxed mb-8 flex-1 line-clamp-2">
                        {event.shortDescription}
                    </p>

                    <div className="mt-auto space-y-6">
                        {/* Speaker Information */}
                        {event.speaker && (
                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-gold/10 transition-colors">
                                <div className="relative w-11 h-11 rounded-full overflow-hidden border border-white/10">
                                    {event.speaker.image ? (
                                        <Image
                                            src={urlForImage(event.speaker.image).width(110).height(110).fit("crop").url()}
                                            alt={event.speaker.name}
                                            fill
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                        />
                                    ) : (
                                        <User className="absolute inset-0 m-auto w-5 h-5 text-gray-500" />
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold text-white truncate">
                                        {event.speaker.name}
                                    </span>
                                    <span className="text-[11px] text-gray-500 truncate">
                                        {event.speaker.credentials?.[0] || event.speaker.bio || "Expert Speaker"}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {isPastEvent && event.superProfileLink ? (
                                <>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <a 
                                            href={event.superProfileLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center w-full py-4 rounded-xl bg-gradient-to-r from-gold to-[#C89B3C] text-[#0b0b0c] font-bold transition-all duration-500 shadow-lg shadow-gold/20"
                                        >
                                            Get Recording
                                            <Play className="ml-2 w-4 h-4 fill-current" />
                                        </a>
                                    </motion.div>
                                    <Link 
                                        href={`/events/${event.slug.current}`}
                                        className="flex items-center justify-center w-full py-2 text-sm text-gray-500 hover:text-gold transition-colors font-medium"
                                    >
                                        View Details
                                    </Link>
                                </>
                            ) : (
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Link 
                                        href={`/events/${event.slug.current}`}
                                        className="flex items-center justify-center w-full py-4 rounded-xl bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 text-gold font-bold hover:from-gold hover:to-[#C89B3C] hover:text-[#0b0b0c] hover:border-transparent transition-all duration-500 shadow-lg group-hover:shadow-gold/10"
                                    >
                                        {isPastEvent ? "View Highlights" : "Reserve Your Seat"}
                                        <ArrowRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1" />
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export function EventCarousel({ events, isPastEvent }: { events: Event[]; isPastEvent?: boolean }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const updateArrowVisibility = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        updateArrowVisibility();
        window.addEventListener("resize", updateArrowVisibility);
        return () => window.removeEventListener("resize", updateArrowVisibility);
    }, [events]);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const scrollAmount = scrollRef.current.clientWidth * 0.8;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    };

    if (!events || events.length === 0) return null;

    return (
        <div className="relative group/carousel -mx-4 px-4 md:mx-0 md:px-0">
            {/* Navigation Arrows */}
            <AnimatePresence>
                {showLeftArrow && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={() => scroll("left")}
                        className="hidden md:flex absolute left-8 top-[45%] -translate-y-1/2 z-40 w-14 h-14 items-center justify-center rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-gold hover:text-bg-deep hover:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] group"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showRightArrow && (
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={() => scroll("right")}
                        className="hidden md:flex absolute right-8 top-[45%] -translate-y-1/2 z-40 w-14 h-14 items-center justify-center rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-gold hover:text-bg-deep hover:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] group"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    </motion.button>
                )}
            </AnimatePresence>

            <motion.div 
                ref={scrollRef}
                onScroll={updateArrowVisibility}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={containerVariants}
                className="flex flex-col md:flex-row gap-6 md:gap-8 md:overflow-x-auto md:snap-x md:snap-mandatory pb-12 pt-4 hide-scrollbar w-full max-w-7xl mx-auto"
            >
                {events.map((event) => (
                    <EventCard key={event.slug.current} event={event} isPastEvent={isPastEvent} />
                ))}
            </motion.div>
            
            
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    );
}
