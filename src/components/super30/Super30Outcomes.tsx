'use client'

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function Super30Outcomes({ outcomes }: { outcomes?: string[] }) {
    if (!outcomes || outcomes.length === 0) return null

    return (
        <section id="outcomes" className="py-24 bg-[#0E0E11] relative z-10 border-t border-white/5">
            <div className="w-[80%] mx-auto max-w-7xl">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-16 md:mb-20 text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                        The <span className="text-gold">transformation</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                        This isn't just about learning new frameworks. It's about fundamentally rewiring how you view the world.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-[minmax(180px,auto)]">
                    {outcomes.map((outcome, index) => {
                        // Alternate grid sizing for bento effect (span 1 or span 2)
                        const isFeature = index === 0 || index === 4 || index === 7;
                        
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                                className={`group p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md border border-white/10 hover:border-gold/40 hover:bg-white/[0.08] transition-all duration-500 flex flex-col justify-end relative overflow-hidden ${isFeature ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-1 lg:col-span-1'}`}
                            >
                                <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-gold/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                
                                <div className="w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center bg-gold/5 shrink-0 group-hover:bg-gold/15 transition-colors mb-8 relative z-10 shadow-[0_0_20px_rgba(245,184,0,0.1)]">
                                    <ArrowRight className="w-5 h-5 text-gold group-hover:rotate-[-45deg] transition-transform duration-500" />
                                </div>
                                <p className={`text-gray-200 font-medium leading-relaxed relative z-10 ${isFeature ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                                    {outcome}
                                </p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
