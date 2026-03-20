'use client'

import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Event } from "@/lib/types"

interface EventRegistrationProps {
    event: Event
    isRegistrationOpen: boolean
}

export function EventRegistration({ event, isRegistrationOpen }: EventRegistrationProps) {
    const eventDate = new Date(event.startTime || event.date)

    return (
        <div className="bg-[#111113]/90 backdrop-blur-2xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] rounded-[24px] p-10 flex flex-col gap-8 relative z-10 text-left hover:border-gold/40 hover:shadow-[0_20px_60px_rgba(255,199,44,0.15)] transition-all duration-500 group">
            <div className="relative">
                <h3 className="text-2xl font-bold mb-2 text-white">Reserve Your <span className="text-gold">Seat</span></h3>
                <p className="text-gray-400">Join us for this exclusive session.</p>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gold/5 rounded-full blur-xl group-hover:bg-gold/10 transition-all duration-700" />
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4 text-gray-300">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20">
                        <Calendar className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</span>
                        <span className="font-medium">{eventDate.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', timeZone: "Asia/Kolkata" })}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20">
                        <Clock className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Time</span>
                        <span className="font-medium">{eventDate.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', timeZone: "Asia/Kolkata" })} IST</span>
                    </div>
                </div>
                {event.location && (
                    <div className="flex items-center gap-4 text-gray-300">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20">
                            <MapPin className="w-5 h-5 text-gold" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Location</span>
                            <span className="font-medium">{event.location}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-4">
                {isRegistrationOpen ? (
                    <Button asChild size="lg" className="w-full text-base font-bold h-16 bg-gradient-to-r from-[#FFC72C] via-[#E6B422] to-[#C89B3C] text-[#0b0b0c] hover:shadow-[0_20px_50px_rgba(255,199,44,0.4)] hover:-translate-y-1 rounded-xl border-none transition-all duration-500 group/btn shadow-[0_10px_30px_rgba(255,199,44,0.2)]">
                        <Link href="#register" className="flex items-center justify-center">
                            Reserve your seat 
                            <ArrowRight className="ml-2 h-5 w-5 transform group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                ) : (
                    <Button disabled size="lg" className="w-full h-16 rounded-xl bg-white/5 text-gray-500 font-bold border border-white/10 uppercase tracking-widest text-xs">
                        Registration Closed
                    </Button>
                )}
            </div>
        </div>
    )
}
