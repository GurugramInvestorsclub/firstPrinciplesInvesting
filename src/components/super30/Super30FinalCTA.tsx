'use client'

import { motion } from "framer-motion"

export function Super30FinalCTA({ heading, ctaText }: { heading?: string, ctaText?: string }) {
    return (
        <section className="py-24 md:py-32 bg-[#0E0E11] relative z-10 overflow-hidden border-t border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,199,44,0.08),transparent_70%)] pointer-events-none" />
            <div className="w-[80%] mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto flex flex-col items-center gap-10"
                >
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white drop-shadow-xl">
                        {heading || "Ready to transform your approach?"}
                    </h2>
                    
                    <a 
                        href="#apply"
                        className="inline-flex items-center justify-center px-12 py-5 rounded-full text-xl font-bold bg-white text-[#0b0b0c] hover:bg-gold transition-colors duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(245,184,0,0.5)]"
                    >
                        {ctaText || "Apply Now"}
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
