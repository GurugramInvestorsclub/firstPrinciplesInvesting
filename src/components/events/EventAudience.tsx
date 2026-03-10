'use client'

import { motion } from "framer-motion"
import { User } from "lucide-react"
import { Event } from "@/lib/types"

export function EventAudience({ event }: { event: Event }) {
    if (!event.targetAudience || event.targetAudience.length === 0) return null;

    return (
        <section id="audience" className="py-24 bg-[#0E0E11] relative z-10">
            <div className="w-[80%] mx-auto max-w-screen-2xl">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-3xl mx-auto mb-16 text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Who Should Attend</h2>
                    <p className="text-lg text-gray-400">Designed for serious investors.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {event.targetAudience.map((audience, idx) => (
                        <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                            whileHover={{ y: -4, scale: 1.01 }}
                            className="flex gap-6 items-start p-6 rounded-[16px] bg-[#111113] border border-white/5 hover:border-gold/20 hover:shadow-[0_8px_30px_rgba(255,199,44,0.1)] transition-all duration-500 group"
                        >
                            <div className="shrink-0">
                                <div className="w-12 h-12 rounded-full bg-gold/5 flex items-center justify-center text-gold border border-gold/10 group-hover:bg-gold/10 transition-colors duration-300">
                                    <User className="w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-2 text-white">{audience.title}</h3>
                                <p className="text-gray-400 leading-relaxed font-light">{audience.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
