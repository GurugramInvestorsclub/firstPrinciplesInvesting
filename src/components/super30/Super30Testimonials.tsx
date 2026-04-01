'use client'

import { motion } from "framer-motion"
import Image from "next/image"
import { urlForImage } from "@/lib/sanity.image"
import { Quote } from "lucide-react"

interface Testimonial {
    name: string
    text: string
    image?: any
}

export function Super30Testimonials({ testimonials }: { testimonials?: Testimonial[] }) {
    if (!testimonials || testimonials.length === 0) return null

    return (
        <section id="proof" className="py-24 bg-[#0E0E11] relative z-10 border-t border-white/5">
            <div className="w-[80%] mx-auto max-w-6xl">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                        Don't just take <span className="text-gold">our word for it</span>
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((test, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between"
                        >
                            <Quote className="absolute top-6 right-6 w-12 h-12 text-white/5 -rotate-12" />
                            <p className="text-gray-300 font-light text-lg italic leading-relaxed mb-8 relative z-10">
                                "{test.text}"
                            </p>
                            <div className="flex items-center gap-4 relative z-10">
                                {test.image ? (
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gold/30">
                                        <Image
                                            src={urlForImage(test.image).url()}
                                            alt={test.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold">
                                        {test.name.charAt(0)}
                                    </div>
                                )}
                                <span className="font-semibold text-white">{test.name}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
