'use client'

import { motion } from "framer-motion"
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Event } from "@/lib/types"
import { urlForImage, getImageDimensions } from "@/lib/sanity.image"

import { EventActionSection } from "./EventActionSection"

interface EventHeroProps {
    event: Event
}

export function EventHero({ event }: EventHeroProps) {
    const eventDate = new Date(event.startTime || event.date)
    const dimensions = event.image ? getImageDimensions(event.image) : null
    const imageAspect = dimensions ? dimensions.width / dimensions.height : 1

    return (
        <section id="overview" className="relative pt-32 pb-20 md:pt-40 md:pb-32 lg:pt-48 lg:pb-40 overflow-hidden min-h-[90vh] flex items-center bg-[#0E0E11]">
            {/* Ambient Image Background */}
            {event.image && (
                <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
                    <Image
                        src={urlForImage(event.image).width(1200).height(750).url()}
                        alt=""
                        fill
                        priority
                        className="object-cover opacity-[0.15] blur-2xl scale-110 select-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E11]/30 via-[#0E0E11]/80 to-[#0E0E11]" />
                </div>
            )}

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
            
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-[#0E0E11]/40 to-[#0E0E11] -z-10" />
            
            <div className="w-[80%] mx-auto max-w-screen-2xl relative z-10">
                <div className="flex flex-col items-center text-center gap-16 md:gap-20">
                    
                    {/* H1 Title / Text Section */}
                    <div className="w-full max-w-6xl flex flex-col items-center gap-8 animate-fade-in-up">
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
                            {event.title.split(' ').slice(0, -1).join(' ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC72C] to-[#C89B3C]">{event.title.split(' ').slice(-1)}</span>
                        </h1>

                        {event.subHeading && (
                            <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl mx-auto">
                                {event.subHeading}
                            </p>
                        )}
                    </div>

                    {/* Centered Event Poster Image (80% width of container on desktop, full on mobile) */}
                    {event.image && (
                        <div className="w-full md:w-[80%] max-w-4xl flex justify-center animate-fade-in-up delay-200">
                            <motion.div 
                                whileHover={{ scale: 1.005, y: -2 }}
                                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                                className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.7)] group/poster"
                                style={{ aspectRatio: imageAspect }}
                            >
                                <Image
                                    src={urlForImage(event.image).width(1600).url()}
                                    alt={event.title}
                                    fill
                                    priority
                                    className="object-cover transition-transform duration-700 group-hover/poster:scale-[1.01]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
                                <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none" />
                            </motion.div>
                        </div>
                    )}

                    {/* Centered Registration / Payment Card */}
                    <div className="w-full max-w-md animate-fade-in-up delay-300">
                        <EventActionSection event={event} />
                    </div>

                </div>
            </div>
        </section>
    )
}
