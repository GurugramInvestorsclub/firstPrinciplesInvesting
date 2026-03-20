'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Event } from "@/lib/types"
import { ChevronDown } from "lucide-react"

export function EventAgenda({ event }: { event: Event }) {
    if (!event.agenda || event.agenda.length === 0) return null;

    return (
        <section id="agenda" className="py-24 md:py-32 bg-[#0E0E11] relative overflow-hidden">
            {/* Background Narrative Path */}
            <div className="absolute left-1/2 top-40 bottom-40 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent hidden md:block -translate-x-1/2" />
            
            <div className="w-[85%] mx-auto max-w-7xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-24"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tight mb-6">
                        The Masterclass <span className="text-gold">Journey</span>
                    </h2>
                    <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
                        A structured progression from market noise to high-conviction mastery.
                    </p>
                </motion.div>

                <div className="space-y-12 md:space-y-0 relative">
                    {event.agenda.map((item, idx) => (
                        <div key={idx} className={`relative md:flex md:items-center md:justify-between mb-12 md:mb-24 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                            {/* Step Indicator (Desktop Center) */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center z-20">
                                <motion.div 
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="w-12 h-12 rounded-full bg-[#0E0E11] border-2 border-gold flex items-center justify-center text-gold font-bold shadow-[0_0_20px_rgba(255,199,44,0.3)]"
                                >
                                    {idx + 1}
                                </motion.div>
                            </div>

                            {/* Card Content */}
                            <motion.div 
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                                className={`w-full md:w-[45%] group`}
                            >
                                <div className="bg-[#111113]/40 border border-white/5 p-8 md:p-10 rounded-[24px] hover:border-gold/30 hover:shadow-[0_30px_70px_rgba(255,199,44,0.1)] transition-all duration-700 relative overflow-hidden h-full">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <span className="text-6xl font-bold text-white leading-none tracking-tighter">0{idx + 1}</span>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[10px] font-bold text-gold uppercase tracking-widest">
                                                {item.time}
                                            </div>
                                            <div className="h-px w-8 bg-gold/30" />
                                        </div>

                                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gold transition-colors duration-300 leading-tight">
                                            {item.title}
                                        </h3>

                                        {(() => {
                                            const lines = item.description.split('\n').filter(l => l.trim() !== '');
                                            const punchline = lines.length > 0 ? lines[0] : "";
                                            const bullets = lines.slice(1).map(l => l.replace(/^[-\u2022]\s*/, '').trim());

                                            return (
                                                <>
                                                    {punchline && (
                                                        <p className="text-gray-300 font-medium mb-6 leading-relaxed italic border-l-2 border-gold/30 pl-4">
                                                            {punchline}
                                                        </p>
                                                    )}
                                                    
                                                    {bullets.length > 0 ? (
                                                        <ul className="space-y-3">
                                                            {bullets.map((bullet, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-400 font-light">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                                                                    {bullet}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : !punchline ? (
                                                        <p className="text-gray-400 font-light leading-relaxed">
                                                            {item.description}
                                                        </p>
                                                    ) : null}
                                                </>
                                            )
                                        })()}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Spacer for empty side */}
                            <div className="hidden md:block w-[45%]" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
