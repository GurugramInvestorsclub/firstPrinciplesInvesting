'use client'

import { Calendar, Clock, MapPin } from "lucide-react"
import { Event } from "@/lib/types"
import { EventCheckoutCard } from "./EventCheckoutCard"

interface EventRegistrationProps {
    event: Event
    isRegistrationOpen: boolean
}

export function EventRegistration({ event, isRegistrationOpen }: EventRegistrationProps) {
    const eventDate = new Date(event.startTime || event.date)

    return (
        <div className="bg-[#111113]/90 backdrop-blur-2xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] rounded-[24px] p-10 flex flex-col gap-8 relative z-10 text-left hover:border-gold/40 hover:shadow-[0_20px_60px_rgba(255,199,44,0.15)] transition-all duration-500 group">
            <div className="relative">
                <h3 className="text-2xl font-bold mb-2 text-white">Ready to <span className="text-gold">level up</span> your investing?</h3>
                <p className="text-gray-400 text-sm">Secure your seat with backend-verified pricing and signed payment capture.</p>
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

            <div className="pt-4 border-t border-white/10">
                <EventCheckoutCard event={event} minimal={true} />
            </div>
        </div>
    )
}
