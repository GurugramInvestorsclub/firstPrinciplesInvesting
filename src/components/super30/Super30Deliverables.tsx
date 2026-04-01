'use client'

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

interface Super30DeliverablesProps {
    deliverables?: { title: string; description: string }[]
}

export function Super30Deliverables({ deliverables }: Super30DeliverablesProps) {
    if (!deliverables || deliverables.length === 0) return null

    return (
        <section id="deliverables" className="py-24 bg-[#0b0b0c] relative overflow-hidden text-text-primary z-10 transition-colors duration-500 border-t border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,199,44,0.03),transparent_50%)] pointer-events-none" />
            
            <div className="w-[80%] mx-auto max-w-5xl relative z-10">
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

                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {deliverables.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                            className="group p-6 md:p-8 rounded-2xl bg-[#131315] hover:bg-[#18181b] border border-[#2E2E2E] hover:border-gold/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-gold/5 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/10 transition-colors duration-500 rounded-full" />
                            
                            <div className="flex gap-4 relative z-10">
                                <div className="mt-1 shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 text-gold shadow-[0_0_10px_rgba(255,199,44,0.1)]">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-gold transition-colors duration-300">
                                        {item.title}
                                    </h3>
                                    <p className="text-lg text-text-secondary leading-relaxed font-light">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
