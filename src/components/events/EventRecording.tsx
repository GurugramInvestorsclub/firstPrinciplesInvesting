'use client'

import { Play, ArrowRight, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Event } from "@/lib/types"

interface EventRecordingProps {
    event: Event
}

export function EventRecording({ event }: EventRecordingProps) {
    return (
        <div className="bg-[#111113]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 flex flex-col gap-6 relative z-10 text-left hover:border-gold/30 hover:shadow-[0_12px_40px_rgba(255,199,44,0.15)] transition-all duration-500 group">
            <div>
                <h3 className="text-xl font-bold mb-1 text-white">Access Recording</h3>
                <p className="text-sm text-gray-400">Missed the live session? Watch it now.</p>
            </div>

            <div className="space-y-4 py-2">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4 text-gold" />
                    </div>
                    <span>Full High-Quality Recording</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <Play className="w-4 h-4 text-gold" />
                    </div>
                    <span>Watch from any device, anytime.</span>
                </div>
            </div>

            <div className="pt-4">
                <Button 
                    asChild 
                    size="lg" 
                    className="w-full text-base font-bold h-14 bg-gradient-to-r from-[#FFC72C] via-[#E6B422] to-[#C89B3C] text-[#0b0b0c] hover:shadow-[0_14px_35px_rgba(255,199,44,0.35)] hover:-translate-y-0.5 border-none transition-all duration-300"
                >
                    <a 
                        href="https://superprofile.bio/firstprinciplesacademy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                    >
                        Watch Recording <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            </div>
        </div>
    )
}
