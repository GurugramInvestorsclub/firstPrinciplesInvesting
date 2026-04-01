'use client'

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function Super30Outcomes({ outcomes }: { outcomes?: string[] }) {
    if (!outcomes || outcomes.length === 0) return null

    return (
        <section id="outcomes" className="py-24 bg-[#0E0E11] relative z-10 border-t border-white/5">
            <div className="w-[80%] mx-auto max-w-4xl">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                        The <span className="text-gold">transformation</span>
                    </h2>
                </motion.div>

                <div className="grid gap-6">
                    {outcomes.map((outcome, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex items-center gap-6 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-white/5 to-transparent border border-white/10 hover:border-gold/30 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center bg-gold/5 shrink-0 group-hover:bg-gold/10 transition-colors">
                                <ArrowRight className="w-5 h-5 text-gold group-hover:translate-x-1 transition-transform" />
                            </div>
                            <p className="text-xl md:text-2xl text-gray-200 font-medium leading-relaxed">
                                {outcome}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
