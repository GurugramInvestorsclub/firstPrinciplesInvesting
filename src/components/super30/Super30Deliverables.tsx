'use client'

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

interface Super30DeliverablesProps {
    deliverables?: { title: string; description: string }[]
}

export function Super30Deliverables({ deliverables }: Super30DeliverablesProps) {
    if (!deliverables || deliverables.length === 0) return null

    return (
        <section id="deliverables" className="py-24 bg-[#0E0E11] relative overflow-hidden z-10 transition-colors duration-500 border-t border-white/5">
            <div className="w-[80%] mx-auto max-w-7xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-16 md:mb-20"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white drop-shadow-sm">
                        What you <span className="text-gold">get</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-[minmax(200px,auto)]">
                    {deliverables.map((item, index) => {
                        // Create an asymmetric bento grid pattern
                        // Example: 2 col wide, 1 col wide, 1 col wide, 2 col wide
                        const isWide = index % 4 === 0 || index % 4 === 3;
                        const bentoClass = isWide ? "md:col-span-2 lg:col-span-2" : "md:col-span-1 lg:col-span-1";

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                                className={`group p-8 md:p-10 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 hover:border-gold/30 transition-all duration-300 shadow-2xl hover:shadow-[0_0_30px_rgba(255,199,44,0.1)] overflow-hidden relative flex flex-col justify-between ${bentoClass}`}
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/15 transition-colors duration-500 rounded-full pointer-events-none" />
                                
                                <div className="relative z-10 mb-8">
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 text-gold shadow-[0_0_15px_rgba(255,199,44,0.15)] mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h3 className={`font-bold mb-4 text-white group-hover:text-gold transition-colors duration-300 ${isWide ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
                                        {item.title}
                                    </h3>
                                    <p className="text-lg text-gray-400 leading-relaxed font-light">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
