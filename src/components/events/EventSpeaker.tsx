'use client'

import { motion } from "framer-motion"
import Image from "next/image"
import { urlForImage } from "@/lib/sanity.image"
import { Event } from "@/lib/types"

export function EventSpeaker({ event }: { event: Event }) {
    if (!event.speaker) return null;

    return (
        <section className="py-24 bg-[#111113] border-y border-white/5 relative z-10">
            <div className="w-[80%] mx-auto max-w-screen-2xl">
                <div className="grid md:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        whileHover={{ rotate: -2, scale: 1.02 }}
                        className="md:col-span-5 lg:col-span-4 order-2 md:order-1 transition-all duration-500"
                    >
                        {event.speaker.image && (
                            <div className="aspect-[3/4] relative rounded-[20px] overflow-hidden bg-[#0E0E11] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
                                <Image
                                    src={urlForImage(event.speaker.image).width(400).height(533).url()}
                                    alt={event.speaker.name}
                                    fill
                                    className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        )}
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="md:col-span-7 lg:col-span-8 order-1 md:order-2 text-center md:text-left"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">About the Speaker</h2>
                        <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#FFC72C] to-[#C89B3C]">{event.speaker.name}</h3>
                        <p className="text-lg text-gray-300 leading-relaxed mb-8 font-light">
                            {event.speaker.bio}
                        </p>
                        {event.speaker.credentials && (
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                {event.speaker.credentials.map((cred, idx) => (
                                    <span key={idx} className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 font-medium shadow-sm text-gray-300">
                                        {cred}
                                    </span>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
