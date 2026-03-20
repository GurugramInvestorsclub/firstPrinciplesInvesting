'use client'

import { motion } from "framer-motion"
import { User } from "lucide-react"
import { Event } from "@/lib/types"

export function EventAudience({ event }: { event: Event }) {
    if (!event.targetAudience || event.targetAudience.length === 0) return null;

    return (
        <section id="audience" className="py-24 md:py-32 bg-[#0E0E11] relative z-10 border-b border-white/5 overflow-hidden">
            {/* Ambient Background Element */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none opacity-50" />
            
            <div className="w-[80%] mx-auto max-w-screen-2xl relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-3xl mx-auto mb-20 text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white uppercase tracking-tight">
                        Who Is This <span className="text-gold">For?</span>
                    </h2>
                    <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
                        This experience is designed for a specific caliber of investor. Identify your path.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                    {event.targetAudience.map((audience, idx) => {
                        const lines = audience.description.split('\n').filter(l => l.trim() !== '');
                        const punchline = lines.length > 0 ? lines[0] : "";
                        const bullets = lines.slice(1).map(l => l.replace(/^[-\u2022]\s*/, '').trim());

                        return (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, delay: idx * 0.2, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={{ y: -8, scale: 1.01 }}
                                className="flex flex-col p-10 rounded-[24px] bg-[#111113]/40 border border-white/5 hover:border-gold/30 hover:shadow-[0_40px_100px_rgba(255,199,44,0.15)] transition-all duration-700 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                
                                <div className="flex gap-8 items-start relative z-10 mb-8">
                                    <div className="shrink-0">
                                        <div className="w-16 h-16 rounded-2xl bg-gold/5 flex items-center justify-center text-gold border border-gold/10 group-hover:bg-gold/20 group-hover:scale-110 transition-all duration-500 shadow-xl">
                                            <User className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-2xl mb-2 text-white group-hover:text-gold transition-colors duration-300 tracking-tight">
                                            {audience.title.startsWith("You are") ? audience.title : `You are ${audience.title}`}
                                        </h3>
                                        {punchline && (
                                            <p className="text-gray-300 font-medium leading-relaxed italic border-l-2 border-gold/30 pl-4 mb-2">
                                                {punchline}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10 mt-auto">
                                    {bullets.length > 0 && bullets.map((bullet, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm text-gray-400 font-light leading-relaxed">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                                            {bullet}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    )
}
