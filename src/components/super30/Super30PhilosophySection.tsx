'use client'

import { motion } from "framer-motion"
import { PortableText } from "@portabletext/react"

export function Super30PhilosophySection({ heading, description }: { heading?: string, description?: any[] }) {
    if (!description || description.length === 0) return null

    return (
        <section id="philosophy" className="py-24 bg-[#0E0E11] relative z-10">
            <div className="w-[80%] mx-auto max-w-3xl">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {heading && (
                        <h2 className="text-3xl md:text-5xl font-bold mb-10 text-white tracking-tight">
                            {heading}
                        </h2>
                    )}
                    
                    <div className="prose prose-lg prose-invert max-w-none prose-p:text-gray-300 prose-p:font-light prose-p:leading-relaxed prose-headings:text-white prose-strong:text-gold prose-strong:font-semibold">
                        <PortableText value={description} />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
