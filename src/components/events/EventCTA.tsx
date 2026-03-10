'use client'

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Event } from "@/lib/types"

export function EventCTA({ event }: { event: Event }) {
    const isRegistrationOpen = !!event.registrationLink && new Date(event.date) > new Date()

    return (
        <section id="register" className="py-32 bg-[#0E0E11] relative z-10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,199,44,0.05),transparent_70%)] pointer-events-none" />
            <div className="w-[80%] mx-auto text-center relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto flex flex-col items-center"
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight leading-tight text-white drop-shadow-xl">
                        Ready to level up your investing?
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl font-light">
                        Join us for this session and get clear, actionable insights.
                    </p>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-gold/30 blur-2xl rounded-full scale-90 group-hover:scale-105 group-hover:bg-gold/40 transition-all duration-500 z-0" />
                        {isRegistrationOpen ? (
                            <Button asChild size="lg" className="relative z-10 h-16 px-10 text-xl rounded-full shadow-lg hover:shadow-[0_14px_35px_rgba(255,199,44,0.35)] hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-[#FFC72C] via-[#E6B422] to-[#C89B3C] text-[#0b0b0c] border-none font-bold overflow-hidden">
                                <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                                    Secure Your Spot 
                                    <motion.div
                                        className="inline-flex items-center"
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <ArrowRight className="ml-2 w-6 h-6" />
                                    </motion.div>
                                </Link>
                            </Button>
                        ) : (
                            <Button disabled size="lg" className="relative z-10 h-16 px-10 text-xl rounded-full bg-white/5 text-gray-500 border border-white/10 font-medium">
                                Registration Closed
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
