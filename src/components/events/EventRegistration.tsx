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
    )
}
