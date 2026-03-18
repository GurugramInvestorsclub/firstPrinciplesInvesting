'use client'

import { motion } from "framer-motion"
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Event } from "@/lib/types"

interface EventHeroProps {
    event: Event
}

export function EventHero({ event }: EventHeroProps) {
    const isRegistrationOpen = !!event.eventId && new Date(event.date) > new Date()
    const eventDate = new Date(event.date)

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

                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="w-full max-w-md relative"
                    >
                        <div className="bg-[#111113]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 flex flex-col gap-6 relative z-10 text-left hover:border-gold/30 hover:shadow-[0_12px_40px_rgba(255,199,44,0.15)] transition-all duration-500 group">
                            <div>
                                <h3 className="text-xl font-bold mb-1 text-white">Reserve Your Spot</h3>
                                <p className="text-sm text-gray-400">Join us for this exclusive session.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                        <Calendar className="w-4 h-4 text-gold" />
                                    </div>
                                    <span>{eventDate.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', timeZone: "Asia/Kolkata" })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                        <Clock className="w-4 h-4 text-gold" />
                                    </div>
                                    <span>{eventDate.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', timeZone: "Asia/Kolkata" })} IST</span>
                                </div>
                                {event.location && (
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4 text-gold" />
                                        </div>
                                        <span>{event.location}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4">
                                {isRegistrationOpen ? (
                                    <Button asChild size="lg" className="w-full text-base font-bold h-14 bg-gradient-to-r from-[#FFC72C] via-[#E6B422] to-[#C89B3C] text-[#0b0b0c] hover:shadow-[0_14px_35px_rgba(255,199,44,0.35)] hover:-translate-y-0.5 border-none transition-all duration-300">
                                        <Link href="#register">
                                            Proceed to Secure Checkout <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button disabled size="lg" className="w-full h-14 bg-white/5 text-gray-500 font-medium border border-white/10">
                                        Registration Closed
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gold/10 blur-3xl -z-10 transform scale-95 translate-y-4 group-hover:bg-gold/20 transition-colors duration-500" />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
