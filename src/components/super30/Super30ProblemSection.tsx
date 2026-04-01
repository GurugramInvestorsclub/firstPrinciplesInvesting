'use client'

import { motion } from "framer-motion"
import { XCircle } from "lucide-react"

export function Super30ProblemSection({ painPoints }: { painPoints?: string[] }) {
    if (!painPoints || painPoints.length === 0) return null

    return (
        <section id="problem" className="py-24 bg-[#0E0E11] relative z-10 border-t border-white/5">
            <div className="w-[80%] mx-auto max-w-4xl">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                        The problem with <span className="text-gray-500">most investing approaches</span>
                    </h2>
                </motion.div>

                <div className="grid gap-6">
                    {painPoints.map((point, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-colors"
                        >
                            <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed">
                                {point}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
