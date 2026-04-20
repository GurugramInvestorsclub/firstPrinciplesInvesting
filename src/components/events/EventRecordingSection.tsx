'use client'

import { motion } from "framer-motion"
import { Play, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Event } from "@/lib/types"

interface EventRecordingSectionProps {
    event: Event
}

export function EventRecordingSection({ event }: EventRecordingSectionProps) {
    const isRegistrationClosed = new Date(event.date) <= new Date()

    if (!isRegistrationClosed) return null

    return (
        <section className="py-12 md:py-20 relative overflow-hidden">
            <div className="w-[80%] mx-auto max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-[#111113]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 md:p-12 text-center hover:border-gold/30 hover:shadow-[0_12px_40px_rgba(255,199,44,0.15)] transition-all duration-500 group relative"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center backdrop-blur-md">
                        <Play className="w-6 h-6 text-gold fill-gold/20" />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                        Access Recording
                    </h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto font-light">
                        Missed the live session? You can still access the full recording here.
                    </p>

                    <Button 
                        asChild 
                        size="lg" 
                        className="group/btn relative z-10 px-10 h-14 text-base font-bold rounded-full bg-gradient-to-r from-[#FFC72C] via-[#E6B422] to-[#C89B3C] text-[#0b0b0c] hover:shadow-[0_20px_50px_rgba(255,199,44,0.3)] hover:-translate-y-1 transition-all duration-300 border-none"
                    >
                        <a 
                            href={event.superProfileLink || "https://superprofile.bio/firstprinciplesacademy"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                        >
                            Watch Recording
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                    </Button>

                    <div className="absolute inset-0 bg-gold/5 blur-3xl -z-10 transform scale-95 group-hover:bg-gold/10 transition-colors duration-500" />
                </motion.div>
            </div>
        </section>
    )
}
