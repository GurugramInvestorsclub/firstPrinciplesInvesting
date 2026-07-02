"use client"

import { Testimonial } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"
import Image from "next/image"
import { Quote } from "lucide-react"

interface TestimonialWrapProps {
    testimonials: Testimonial[]
}

export function TestimonialWrap({ testimonials }: TestimonialWrapProps) {
    if (!testimonials || testimonials.length === 0) {
        return null
    }

    return (
        <section className="py-24 md:py-32 bg-[#1E1E1E] border-y border-[#2E2E2E] overflow-hidden">
            <div className="container max-w-7xl px-6 mx-auto relative z-10">
                
                {/* Header */}
                <div className="max-w-3xl mb-16 md:mb-24">
                    <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                        Social Proof
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mt-4 leading-tight">
                        What Other Serious Investors Say.
                    </h2>
                    <p className="text-neutral-400 mt-4 text-lg font-light">
                        We don't collect superficial reviews. These are statements from business owners, analysts, and long-term capital allocators.
                    </p>
                </div>

                {/* Grid layout for testimonials */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                    {testimonials.slice(0, 6).map((item, idx) => (
                        <div 
                            key={idx}
                            className="p-2 rounded-[2rem] bg-white/5 border border-white/5 shadow-md flex flex-col justify-stretch group"
                        >
                            <div className="rounded-[1.8rem] bg-bg-deep border border-[#2E2E2E] p-8 flex flex-col justify-between h-full relative overflow-hidden group-hover:bg-[#2E2E2E]/40 transition-all duration-500">
                                <Quote className="absolute top-6 right-6 w-8 h-8 text-neutral-800/20 group-hover:text-gold/10 transition-colors duration-500" />
                                
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#2E2E2E] border border-[#2E2E2E] group-hover:border-gold/30 transition-colors shrink-0">
                                            {item.photo ? (
                                                <Image
                                                    src={urlForImage(item.photo).width(150).height(150).url()}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm">
                                                    {item.name.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-primary text-base tracking-tight leading-tight">
                                                {item.name}
                                            </h4>
                                            <p className="text-[10px] text-gold font-mono uppercase tracking-widest mt-1">
                                                {item.role || "Verified Member"}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-neutral-300 leading-relaxed font-light italic">
                                        "{item.quote}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
