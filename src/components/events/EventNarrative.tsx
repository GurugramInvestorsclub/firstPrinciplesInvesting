'use client'

import { motion } from "framer-motion"
import { RichText } from "@/components/sanity/RichText"
import { Event } from "@/lib/types"

export function EventNarrative({ event }: { event: Event }) {
    if (!event.whyThisMatters) return null;

    return (
        <section className="py-24 md:py-32 bg-[#0E0E11] relative z-10">
            <div className="w-[80%] mx-auto max-w-3xl text-center">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mx-auto"
                >
                    <h3 className="text-sm font-bold text-gold uppercase tracking-widest mb-10 border-b border-white/10 pb-4 inline-block">
                        Why This Matters
                    </h3>
                    <div className="text-left mx-auto max-w-2xl text-gray-300 prose-invert prose-lg leading-loose">
                        <RichText value={event.whyThisMatters} />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
