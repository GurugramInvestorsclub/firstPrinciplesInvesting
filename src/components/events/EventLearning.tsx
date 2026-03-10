'use client'

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { Event } from "@/lib/types"

export function EventLearning({ event }: { event: Event }) {
    if (!event.learningPoints || event.learningPoints.length === 0) return null;

    return (
        <section className="py-24 bg-[#0E0E11] border-y border-white/5 relative z-10">
            <div className="w-[80%] mx-auto max-w-screen-2xl">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-3xl mx-auto mb-16 text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">What You Will Learn</h2>
                    <p className="text-lg text-gray-400">Key takeaways from this session.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {event.learningPoints.map((point, idx) => (
                        <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                            whileHover={{ y: -6, scale: 1.02 }}
                            className="bg-[#111113] border border-white/5 p-8 rounded-[16px] hover:border-gold/30 hover:shadow-[0_12px_40px_rgba(255,199,44,0.15)] transition-all duration-500 group"
                        >
                            <CheckCircle2 className="w-8 h-8 text-gold mb-6 group-hover:scale-110 transition-transform duration-300" />
                            <h3 className="font-bold text-xl mb-3 text-white">{point.title}</h3>
                            <p className="text-gray-400 leading-relaxed font-light">{point.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
