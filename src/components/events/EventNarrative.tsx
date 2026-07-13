'use client'

import { motion } from "framer-motion"
import { RichText } from "@/components/sanity/RichText"
import { Event } from "@/lib/types"

export function EventNarrative({ event }: { event: Event }) {
    if (!event.whyThisMatters) return null;

    return (
        <section className="py-24 md:py-32 bg-[#0E0E11] relative z-10">
            <div className="w-[80%] mx-auto max-w-6xl">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">

                    {/* Left rail — sticky heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="lg:col-span-4"
                    >
                        <div className="lg:sticky lg:top-32">
                            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-text-secondary/70">
                                The Context
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 leading-tight tracking-tight">
                                Why This <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC72C] to-[#C89B3C]">Matters</span>
                            </h2>
                            <div className="mt-8 h-px w-20 bg-gradient-to-r from-gold to-transparent" />
                        </div>
                    </motion.div>

                    {/* Right column — narrative prose with lead paragraph */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                        className="lg:col-span-8 text-gray-400 [&>p]:text-base [&>p]:md:text-lg [&>p]:leading-relaxed [&>p:first-of-type]:text-lg [&>p:first-of-type]:md:text-xl [&>p:first-of-type]:text-gray-200 [&>p:first-of-type]:font-light [&>p:last-of-type]:mb-0"
                    >
                        <RichText value={event.whyThisMatters} />
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
