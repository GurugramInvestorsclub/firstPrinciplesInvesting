"use client"

import { useState } from "react"
import { Calendar, MapPin, User, ArrowRight, Play, Lock } from "lucide-react"
import Image from "next/image"
import { urlForImage } from "@/lib/sanity.image"

interface EventsViewProps {
    upcomingEvents: any[]
    pastEvents: any[]
    hasSubscriptionAccess?: boolean
    onNavigate?: (tab: string, arg?: string) => void
}

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        })
    } catch (e) {
        return dateStr
    }
}

export function EventsView({ upcomingEvents, pastEvents, hasSubscriptionAccess = false, onNavigate }: EventsViewProps) {
    const [registeredIds, setRegisteredIds] = useState<string[]>([])
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [selectedEventName, setSelectedEventName] = useState("")

    const toggleRegister = (id: string) => {
        if (registeredIds.includes(id)) {
            setRegisteredIds(registeredIds.filter(item => item !== id))
        } else {
            setRegisteredIds([...registeredIds, id])
        }
    }

    const handleReplayClick = (event: any) => {
        if (hasSubscriptionAccess) {
            window.open(event.superProfileLink || "https://superprofile.bio/firstprinciplesacademy", "_blank")
        } else {
            setSelectedEventName(event.title)
            setShowUpgradeModal(true)
        }
    }

    return (
        <div className="space-y-12 text-left max-w-4xl mx-auto py-4">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary tracking-tight font-sans">
                    Events & Meetups
                </h1>
                <p className="text-sm text-neutral-400 font-light mt-1 font-mono">
                    Register for upcoming webinars and access the complete video replay library with slides.
                </p>
            </div>

            {/* Upcoming Live Sessions */}
            <div className="space-y-6">
                <h2 className="text-sm font-bold text-neutral-500 border-b border-white/5 pb-3 font-mono uppercase tracking-wider">
                    Upcoming Live Sessions
                </h2>

                {upcomingEvents.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        {upcomingEvents.map((event) => {
                            const isReg = registeredIds.includes(event.eventId || event.id)
                            const eventDate = new Date(event.date)
                            const month = eventDate.toLocaleDateString("en-US", { month: "short" })
                            const day = eventDate.toLocaleDateString("en-US", { day: "2-digit" })
                            const dateStr = formatDate(event.date)

                            return (
                                <div 
                                    key={event.eventId || event.id}
                                    className="flex flex-col rounded-[24px] border border-white/5 bg-[#111113]/40 backdrop-blur-xl overflow-hidden hover:border-gold/35 hover:shadow-[0_20px_60px_rgba(255,199,44,0.15)] transition-all duration-500 group"
                                >
                                    {/* Poster Container */}
                                    <div className="h-[200px] relative overflow-hidden bg-[#0A0A0A] border-b border-white/5 flex-shrink-0">
                                        {event.image ? (
                                            <>
                                                <Image
                                                    src={urlForImage(event.image).width(800).height(400).url()}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                            </>
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-deep to-gold/10 opacity-80" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                            </>
                                        )}
                                        {/* Date Badge */}
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-gold/20 backdrop-blur-md border border-gold/30 text-[10px] font-bold text-gold tracking-wider uppercase font-mono">
                                                {month} {day}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-grow p-6 flex flex-col justify-between min-h-[300px]">
                                        <div>
                                            {/* Metadata */}
                                            <div className="flex items-center gap-3 text-[9px] font-bold tracking-[0.2em] text-neutral-500 mb-4 uppercase font-mono">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gold" />
                                                    <span>{dateStr}</span>
                                                </div>
                                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-gold" />
                                                    <span className="truncate max-w-[120px]">{event.location || "Virtual"}</span>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-gold transition-colors duration-300">
                                                {event.title}
                                            </h3>
                                            
                                            <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-light line-clamp-3">
                                                {event.shortDescription}
                                            </p>
                                        </div>

                                        <div className="space-y-4 mt-auto">
                                            {/* Speaker Info */}
                                            {event.speaker && (
                                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:border-gold/15 transition-colors">
                                                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                                                        {event.speaker.image ? (
                                                            <Image
                                                                src={urlForImage(event.speaker.image).width(80).height(80).fit("crop").url()}
                                                                alt={event.speaker.name}
                                                                fill
                                                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                                            />
                                                        ) : (
                                                            <User className="absolute inset-0 m-auto w-4 h-4 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-white truncate leading-tight">
                                                            {event.speaker.name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 truncate leading-none mt-0.5">
                                                            {event.speaker.credentials?.[0] || "Expert Speaker"}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Button */}
                                            <div className="pt-2">
                                                {event.superProfileLink || event.registrationLink ? (
                                                    <a 
                                                        href={event.superProfileLink || event.registrationLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center w-full py-3 rounded-xl bg-gradient-to-r from-gold/15 to-gold/5 border border-gold/20 text-gold font-bold text-xs hover:from-gold hover:to-[#C89B3C] hover:text-[#0b0b0c] hover:border-transparent transition-all duration-500 font-mono tracking-wider uppercase cursor-pointer"
                                                    >
                                                        Reserve Seat
                                                        <ArrowRight className="ml-2 w-3.5 h-3.5" />
                                                    </a>
                                                ) : (
                                                    <button
                                                        onClick={() => toggleRegister(event.eventId || event.id)}
                                                        className={`flex items-center justify-center w-full py-3 rounded-xl font-bold text-xs transition-all duration-300 font-mono tracking-wider uppercase cursor-pointer ${
                                                            isReg 
                                                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                                                                : "bg-gradient-to-r from-gold/15 to-gold/5 border border-gold/20 text-gold hover:from-gold hover:to-[#C89B3C] hover:text-[#0b0b0c] hover:border-transparent"
                                                        }`}
                                                    >
                                                        {isReg ? "Seat Reserved" : "Reserve Seat"}
                                                        {!isReg && <ArrowRight className="ml-2 w-3.5 h-3.5" />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-xs text-neutral-500 font-mono">
                        No upcoming events scheduled.
                    </div>
                )}
            </div>

            {/* Past Recording Replays */}
            <div className="space-y-6">
                <h2 className="text-sm font-bold text-neutral-500 border-b border-white/5 pb-3 font-mono uppercase tracking-wider">
                    Past Session Replays
                </h2>

                {pastEvents.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        {pastEvents.map((event) => {
                            const eventDate = new Date(event.date)
                            const month = eventDate.toLocaleDateString("en-US", { month: "short" })
                            const day = eventDate.toLocaleDateString("en-US", { day: "2-digit" })
                            const dateStr = formatDate(event.date)

                            return (
                                <div 
                                    key={event.eventId || event.id}
                                    className="flex flex-col rounded-[24px] border border-white/5 bg-[#111113]/40 backdrop-blur-xl overflow-hidden hover:border-gold/35 hover:shadow-[0_20px_60px_rgba(255,199,44,0.15)] transition-all duration-500 group"
                                >
                                    {/* Poster Container */}
                                    <div className="h-[200px] relative overflow-hidden bg-[#0A0A0A] border-b border-white/5 flex-shrink-0">
                                        {event.image ? (
                                            <>
                                                <Image
                                                    src={urlForImage(event.image).width(800).height(400).url()}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                            </>
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-deep to-gold/10 opacity-80" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                            </>
                                        )}
                                        {/* Date Badge */}
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-gold/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-neutral-300 tracking-wider uppercase font-mono">
                                                {month} {day}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-grow p-6 flex flex-col justify-between min-h-[300px]">
                                        <div>
                                            {/* Metadata */}
                                            <div className="flex items-center gap-3 text-[9px] font-bold tracking-[0.2em] text-neutral-500 mb-4 uppercase font-mono">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gold" />
                                                    <span>RECORDED ON {dateStr}</span>
                                                </div>
                                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-gold" />
                                                    <span className="truncate max-w-[120px]">{event.location || "Virtual"}</span>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-gold transition-colors duration-300">
                                                {event.title}
                                            </h3>
                                            
                                            <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-light line-clamp-3">
                                                {event.shortDescription}
                                            </p>
                                        </div>

                                        <div className="space-y-4 mt-auto">
                                            {/* Speaker Info */}
                                            {event.speaker && (
                                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:border-gold/15 transition-colors">
                                                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                                                        {event.speaker.image ? (
                                                            <Image
                                                                src={urlForImage(event.speaker.image).width(80).height(80).fit("crop").url()}
                                                                alt={event.speaker.name}
                                                                fill
                                                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                                            />
                                                        ) : (
                                                            <User className="absolute inset-0 m-auto w-4 h-4 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-white truncate leading-tight">
                                                            {event.speaker.name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 truncate leading-none mt-0.5">
                                                            {event.speaker.credentials?.[0] || "Expert Speaker"}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Replay Link */}
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => handleReplayClick(event)}
                                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gold hover:bg-[#E0A800] text-bg-deep font-bold text-xs shadow-lg shadow-gold/15 active:scale-[0.98] transition-all duration-300 font-mono tracking-wider uppercase cursor-pointer"
                                                >
                                                    <span>Watch Replay</span>
                                                    <Play className="w-3.5 h-3.5 fill-bg-deep text-bg-deep" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-xs text-neutral-500 font-mono">
                        No past event recordings available.
                    </div>
                )}
            </div>

            {/* Custom Premium Access Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-md bg-[#1E1E1E] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-2xl relative">
                        <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto">
                            <Lock className="w-5 h-5 text-gold" />
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                Subscriber Access Required
                            </h3>
                            <p className="text-xs text-neutral-400 leading-relaxed font-light">
                                The video replay for <strong className="text-text-primary font-bold">"{selectedEventName}"</strong> is reserved for active members. Upgrade your membership to get instant access to all past session recordings, slides, and premium research.
                            </p>
                        </div>

                        <div className="pt-2 flex flex-col gap-2 font-mono text-[10px]">
                            <button
                                onClick={() => {
                                    setShowUpgradeModal(false)
                                    onNavigate?.("profile")
                                }}
                                className="w-full py-3 bg-gold hover:bg-[#E0A800] text-bg-deep font-bold rounded-xl text-xs transition-transform active:scale-[0.98] cursor-pointer"
                            >
                                Upgrade Membership
                            </button>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-text-primary rounded-xl text-xs transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
