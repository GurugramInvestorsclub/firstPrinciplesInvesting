"use client"

import { useState } from "react"
import { Calendar, Video, Download, Check, Star, ArrowRight } from "lucide-react"
import { mockEvents } from "./mockData"

export function EventsView() {
    const [registeredIds, setRegisteredIds] = useState<string[]>([])

    const toggleRegister = (id: string) => {
        if (registeredIds.includes(id)) {
            setRegisteredIds(registeredIds.filter(item => item !== id))
        } else {
            setRegisteredIds([...registeredIds, id])
        }
    }

    return (
        <div className="space-y-8 text-left">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary tracking-tight font-sans">
                    Member Webinars & Meetups
                </h1>
                <p className="text-sm text-neutral-400 font-light mt-1">
                    Register for upcoming live briefings and access the complete video replay library with session slides.
                </p>
            </div>

            {/* Upcoming Events */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-text-primary border-b border-[#2E2E2E] pb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold" />
                    <span>Upcoming Live Briefings</span>
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {mockEvents.filter(e => !e.recordingUrl).map((event) => {
                        const isReg = registeredIds.includes(event.id)
                        return (
                            <div 
                                key={event.id}
                                className="p-1 rounded-[2rem] bg-white/5 border border-white/5 shadow-md flex flex-col justify-stretch"
                            >
                                <div className="rounded-[1.8rem] bg-bg-deep border border-[#2E2E2E] p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl" />
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 uppercase">
                                            <span>{event.type}</span>
                                            <span>{event.date}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-text-primary leading-snug">{event.title}</h3>
                                        <p className="text-xs text-neutral-400 font-light leading-relaxed">
                                            {event.description}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-[#2E2E2E] flex justify-between items-center">
                                        <span className="text-[10px] font-mono text-neutral-500">PLATFORM: LIVE ZOOM</span>
                                        <button
                                            onClick={() => toggleRegister(event.id)}
                                            className={`px-5 py-2.5 rounded-full font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                                isReg 
                                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                                                    : "bg-gold text-bg-deep hover:bg-[#E0A800] active:scale-[0.98]"
                                            }`}
                                        >
                                            {isReg ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>Seat Reserved</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Reserve Seat</span>
                                                    <ArrowRight className="w-3 h-3 text-bg-deep" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Past Replays Library */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-text-primary border-b border-[#2E2E2E] pb-3 flex items-center gap-2">
                    <Video className="w-4 h-4 text-gold" />
                    <span>Past Recording Replays</span>
                </h2>

                <div className="border border-[#2E2E2E] rounded-2xl bg-black/10 overflow-hidden divide-y divide-[#2E2E2E]">
                    {mockEvents.filter(e => e.recordingUrl).map((event) => (
                        <div 
                            key={event.id}
                            className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-all duration-300"
                        >
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-500 uppercase">
                                    <span>{event.type}</span>
                                    <span className="w-1 h-1 rounded-full bg-neutral-600" />
                                    <span>RECORDED ON {event.date}</span>
                                </div>
                                <h3 className="text-base font-bold text-text-primary">{event.title}</h3>
                                <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-2xl">
                                    {event.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 shrink-0 font-mono text-[10px] font-bold">
                                <button
                                    onClick={() => alert("Slides PDF download started.")}
                                    className="px-4 py-2 border border-white/5 hover:border-gold/30 hover:bg-gold/10 hover:text-gold text-neutral-400 bg-[#1E1E1E] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Slides</span>
                                </button>
                                <button
                                    onClick={() => alert("Playing replay video player...")}
                                    className="px-4 py-2 bg-gold hover:bg-[#E0A800] text-bg-deep rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
                                >
                                    <Video className="w-3.5 h-3.5 text-bg-deep" />
                                    <span>Watch Video Replay</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
