"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, Variants, AnimatePresence } from "framer-motion"
import { Calendar, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react"
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
            whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } }}
            className="md:w-[420px] w-full flex-shrink-0 md:snap-center group"
        >
            <div className="relative h-full flex flex-col rounded-3xl border border-text-secondary/10 bg-bg-primary/20 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-text-secondary/30 hover:shadow-[0_8px_40px_rgba(255,255,255,0.05)] hover:bg-bg-primary/40">
                {/* Subtle gradient light from top */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none z-10" />
                
                {/* Poster Container */}
                <div className="h-[200px] relative overflow-hidden bg-[#0A0A0A] border-b border-text-secondary/10 flex-shrink-0">
                    {event.image ? (
                        <>
                            <Image
                                src={urlForImage(event.image).width(800).height(450).url()}
                                alt={event.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Dark gradient overlay for readability */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/85" />
                        </>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-bg-primary/60 via-bg-deep/80 to-gold/10 opacity-80" />
                            <div className="absolute top-0 right-0 w-56 h-56 bg-gold/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 group-hover:bg-gold/25 transition-colors duration-700" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[50px] -translate-x-1/3 translate-y-1/3 group-hover:bg-blue-500/20 transition-colors duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/80" />
                        </>
                    )}
                    
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                    
                    {/* Badge positioned over the abstract visual or poster */}
                    <div className="absolute top-6 left-6 z-20">
                        <div className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-sm font-bold text-text-primary shadow-xl tracking-wide">
                            {month.toUpperCase()} {day}
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-8 flex flex-col z-20">
                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono tracking-wider text-text-secondary mb-5 uppercase">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gold/80" />
                            <span>{dateStr}</span>
                        </div>
                        <span className="text-text-secondary/30">•</span>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gold/80" />
                            <span className="truncate max-w-[120px]">{event.location || "Virtual"}</span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-text-primary mb-3 leading-tight group-hover:text-gold transition-colors duration-300">
                        {event.title}
                    </h3>
                    
                    <p className="text-text-secondary/80 leading-relaxed max-w-sm mb-6 flex-1 line-clamp-3">
                        {event.shortDescription}
                    </p>

                    {/* Speaker Authority */}
                    {event.speaker && (
                        <div className="flex items-center gap-3 mb-8">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                                {event.speaker.image ? (
                                    <Image
                                        src={urlForImage(event.speaker.image).width(100).height(100).fit("crop").url()}
                                        alt={event.speaker.name}
                                        fill
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                    />
                                ) : (
                                    <User className="absolute inset-0 m-auto w-5 h-5 text-text-secondary/50" />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-text-primary">
                                    {event.speaker.name}
                                </span>
                                {event.speaker.credentials && event.speaker.credentials.length > 0 ? (
                                    <span className="text-xs text-text-secondary/70 truncate max-w-[200px]">
                                        {event.speaker.credentials[0]}
                                    </span>
                                ) : event.speaker.bio ? (
                                    <span className="text-xs text-text-secondary/70 truncate max-w-[200px]">
                                        {event.speaker.bio}
                                    </span>
                                ) : (
                                    <span className="text-xs text-text-secondary/70">Expert Panelist</span>
                                )}
                            </div>
                        </div>
                    )}

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={!event.speaker ? "mt-auto" : ""}>
                        <Link 
                            href={`/events/${event.slug.current}`}
                            className="flex items-center justify-center w-full py-4 rounded-xl bg-white/5 border border-white/10 text-text-primary font-bold hover:bg-gold hover:text-bg-deep hover:border-gold transition-all duration-300 shadow-lg"
                        >
                            {isPastEvent ? "View Details" : "Reserve Your Seat"}
                        </Link>
                    </motion.div>
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
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onClick={() => scroll("left")}
                        className="hidden md:flex absolute left-4 top-[40%] -translate-y-1/2 z-30 w-12 h-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-gold hover:text-bg-deep transition-all duration-300 shadow-2xl"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showRightArrow && (
                    <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={() => scroll("right")}
                        className="hidden md:flex absolute right-4 top-[40%] -translate-y-1/2 z-30 w-12 h-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-gold hover:text-bg-deep transition-all duration-300 shadow-2xl"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-6 h-6" />
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
            
            {/* Fade out edges for desktop carousel */}
            <div className="hidden md:block absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-bg-deep to-transparent pointer-events-none z-10" />
            <div className="hidden md:block absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-bg-deep to-transparent pointer-events-none z-10" />
            
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
