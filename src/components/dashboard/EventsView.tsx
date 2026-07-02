"use client"

import { useState } from "react"
import { Calendar, Video, Download } from "lucide-react"

interface EventsViewProps {
    upcomingEvents: any[]
    pastEvents: any[]
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

export function EventsView({ upcomingEvents, pastEvents }: EventsViewProps) {
    const [registeredIds, setRegisteredIds] = useState<string[]>([])

    const toggleRegister = (id: string) => {
        if (registeredIds.includes(id)) {
            setRegisteredIds(registeredIds.filter(item => item !== id))
        } else {
            setRegisteredIds([...registeredIds, id])
        }
    }

    return (
        <div className="space-y-12 text-left max-w-4xl mx-auto py-4">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary tracking-tight font-sans">
                    Events & Meetups
                </h1>
                <p className="text-sm text-neutral-400 font-light mt-1">
                    Register for upcoming webinars and access the complete video replay library with slides.
                </p>
            </div>

            {/* Upcoming Live Sessions */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-text-primary border-b border-white/5 pb-3 font-mono uppercase tracking-wider">
                    Upcoming Live Sessions
                </h2>

                {upcomingEvents.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {upcomingEvents.map((event) => {
                            const isReg = registeredIds.includes(event.eventId || event.id)
                            return (
                                <div 
                                    key={event.eventId || event.id}
                                    className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] flex flex-col justify-between min-h-[200px]"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 uppercase">
                                            <span>{event.location || "ZOOM WEBINAR"}</span>
                                            <span>{formatDate(event.date)}</span>
                                        </div>
                                        <h3 className="text-base font-bold text-text-primary leading-snug">{event.title}</h3>
                                        <p className="text-xs text-neutral-400 font-light leading-relaxed">
                                            {event.shortDescription}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                                        <span>ZOOM WEBINAR</span>
                                        {event.superProfileLink || event.registrationLink ? (
                                            <a
                                                href={event.superProfileLink || event.registrationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-gold hover:bg-[#E0A800] text-bg-deep font-bold rounded-full text-xs active:scale-[0.98] transition-transform"
                                            >
                                                Register Seat
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => toggleRegister(event.eventId || event.id)}
                                                className={`px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
                                                    isReg 
                                                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                                                        : "bg-gold text-bg-deep hover:bg-[#E0A800] active:scale-[0.98]"
                                                }`}
                                            >
                                                {isReg ? "Seat Reserved" : "Reserve Seat"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-xs text-neutral-500">
                        No upcoming events.
                    </div>
                )}
            </div>

            {/* Past Recording Replays */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-text-primary border-b border-white/5 pb-3 font-mono uppercase tracking-wider">
                    Past Session Replays
                </h2>

                {pastEvents.length > 0 ? (
                    <div className="border border-white/5 rounded-2xl bg-black/10 overflow-hidden divide-y divide-white/5">
                        {pastEvents.map((event) => (
                            <div 
                                key={event.eventId || event.id}
                                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-colors duration-300"
                            >
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-500 uppercase">
                                        <span>{event.location || "ZOOM REPLAY"}</span>
                                        <span className="w-1 h-1 rounded-full bg-neutral-600" />
                                        <span>RECORDED ON {formatDate(event.date)}</span>
                                    </div>
                                    <h3 className="text-base font-bold text-text-primary">{event.title}</h3>
                                    <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-xl">
                                        {event.shortDescription}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 font-mono text-[10px] font-bold">
                                    <button
                                        onClick={() => alert("Slides PDF download initiated.")}
                                        className="px-4 py-2 border border-white/5 hover:border-gold/30 hover:bg-gold/10 hover:text-gold text-neutral-400 bg-[#1E1E1E] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Slides PDF</span>
                                    </button>
                                    <button
                                        onClick={() => alert("Playing replay video...")}
                                        className="px-4 py-2 bg-gold hover:bg-[#E0A800] text-bg-deep rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
                                    >
                                        <Video className="w-3.5 h-3.5 text-bg-deep" />
                                        <span>Replay Video</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-xs text-neutral-500">
                        No past replays available.
                    </div>
                )}
            </div>

        </div>
    )
}
