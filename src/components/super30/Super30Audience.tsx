'use client'

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

interface Super30AudienceProps {
    whoItsFor?: string[]
    whoItsNotFor?: string[]
}

export function Super30Audience({ whoItsFor, whoItsNotFor }: Super30AudienceProps) {
    if ((!whoItsFor || whoItsFor.length === 0) && (!whoItsNotFor || whoItsNotFor.length === 0)) return null

    return (
        <section id="audience" className="py-24 bg-[#0b0b0c] relative z-10 border-t border-white/5">
            <div className="w-[80%] mx-auto max-w-6xl">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight">
                        Who is this <span className="text-gold">for?</span>
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Who It's For */}
                    {whoItsFor && whoItsFor.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="p-8 md:p-10 rounded-3xl bg-emerald-950/10 border border-emerald-900/30 shadow-[0_0_40px_rgba(16,185,129,0.03)]"
                        >
                            <h3 className="text-2xl font-bold text-emerald-400 mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Check className="w-5 h-5" />
                                </span>
                                Right for you if...
                            </h3>
                            <ul className="space-y-6">
                                {whoItsFor.map((point, index) => (
                                    <li key={index} className="flex gap-4">
                                        <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                                        <p className="text-gray-300 font-light text-lg">{point}</p>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    {/* Who It's Not For */}
                    {whoItsNotFor && whoItsNotFor.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                            className="p-8 md:p-10 rounded-3xl bg-rose-950/10 border border-rose-900/30 shadow-[0_0_40px_rgba(225,29,72,0.03)]"
                        >
                            <h3 className="text-2xl font-bold text-rose-400 mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                                    <X className="w-5 h-5" />
                                </span>
                                Not for you if...
                            </h3>
                            <ul className="space-y-6">
                                {whoItsNotFor.map((point, index) => (
                                    <li key={index} className="flex gap-4">
                                        <X className="w-5 h-5 text-rose-500 shrink-0 mt-1" />
                                        <p className="text-gray-300 font-light text-lg">{point}</p>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    )
}
