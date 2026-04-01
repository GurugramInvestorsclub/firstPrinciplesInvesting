'use client'

import { motion } from "framer-motion"
import { Calendar, Users } from "lucide-react"
import { Super30Program } from "@/lib/types"

interface Super30HeroProps {
    program: Super30Program
}

export function Super30Hero({ program }: Super30HeroProps) {
    const deadlineDate = program.applicationDeadline ? new Date(program.applicationDeadline) : null

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
                <div className="flex flex-col items-center text-center gap-16 lg:gap-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-6xl flex flex-col items-center gap-8"
                    >
                        <div className="flex flex-wrap justify-center items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20 backdrop-blur-sm">
                                <Users className="w-3.5 h-3.5" />
                                {program.batchName || 'Premium Cohort'}
                            </span>
                            {program.seatsAvailable !== undefined && program.seatsAvailable > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10 backdrop-blur-sm">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    Only {program.seatsAvailable} seats remaining
                                </span>
                            )}
                            {deadlineDate && (
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10 backdrop-blur-sm">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Apply by {deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                            )}
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tighter leading-[1.05] text-white drop-shadow-2xl">
                            {program.headline || program.title}
                        </h1>

                        {program.subheadline && (
                            <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl mx-auto">
                                {program.subheadline}
                            </p>
                        )}
                        
                        <div className="pt-8">
                           <a 
                                href="#apply"
                                className="inline-flex items-center justify-center px-10 py-5 rounded-full text-lg font-bold bg-gold text-[#0b0b0c] hover:bg-gold-muted transition-all duration-300 shadow-[0_0_30px_rgba(245,184,0,0.3)] hover:shadow-[0_0_40px_rgba(245,184,0,0.5)] hover:-translate-y-1"
                           >
                               {program.ctaText || "Apply Now"}
                           </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
