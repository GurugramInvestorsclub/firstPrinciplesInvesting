"use client"

import { Testimonial } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"
import Image from "next/image"

interface TestimonialsProps {
    testimonials: Testimonial[]
}

export function Testimonials({ testimonials }: TestimonialsProps) {
    if (!testimonials || testimonials.length === 0) {
        return null
    }

    // Split testimonials into two columns
    const half = Math.ceil(testimonials.length / 2)
    const col1 = testimonials.slice(0, half)
    const col2 = testimonials.slice(half)

    // Duplicate for infinite loop (2 sets total for -50% transition)
    const displayCol1 = [...col1, ...col1]
    const displayCol2 = [...col2, ...col2]

    return (
        <section className="py-24 md:py-32 bg-bg-deep overflow-hidden border-t border-[#2E2E2E]">
            <div className="container max-w-7xl px-4 mx-auto">
                <div className="grid lg:grid-cols-5 gap-12 lg:gap-20 items-stretch">

                    {/* LEFT COLUMN: Static Content (40%) */}
                    <div className="lg:col-span-2 flex flex-col justify-center h-fit gap-8 py-8 lg:sticky lg:top-32">
                        <div>
                            <span className="text-gold font-medium tracking-wide uppercase text-sm mb-3 block">
                                Community
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-[1.1]">
                                We believe in the power of <span className="text-gold">community.</span>
                            </h2>
                        </div>

                        <p className="text-lg text-text-secondary leading-relaxed">
                            Most investors outsource their thinking. We help you build your own view. Join a network of serious investors building conviction through first principles.
                        </p>
                    </div>

                    {/* RIGHT COLUMN: Dynamic Marquee (60%) */}
                    <div className="lg:col-span-3 relative h-[600px] lg:h-[700px] overflow-hidden mask-gradient-vertical hover:[&_*]:[animation-play-state:paused]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full relative">

                            {/* Column 1 - Slow speed (40s) */}
                            <div className="relative h-full overflow-hidden">
                                <div className="animate-scroll-vertical-slow flex flex-col gap-6 w-full absolute top-0">
                                    {displayCol1.map((item, idx) => (
                                        <TestimonialCard key={`col1-${item.name}-${idx}`} testimonial={item} />
                                    ))}
                                </div>
                            </div>

                            {/* Column 2 - Fast speed (25s) */}
                            <div className="relative h-full overflow-hidden hidden md:block">
                                <div className="animate-scroll-vertical-fast flex flex-col gap-6 w-full absolute top-0">
                                    {displayCol2.map((item, idx) => (
                                        <TestimonialCard key={`col2-${item.name}-${idx}`} testimonial={item} />
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Fade masks */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-bg-deep to-transparent z-10 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-bg-deep to-transparent z-10 pointer-events-none" />
                    </div>

                </div>
            </div>
        </section>
    )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    return (
        <div className="bg-[#2E2E2E] p-6 rounded-2xl border border-[#3E3E3E] shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:border-gold/30">
            <div className="flex items-start gap-4 mb-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-bg-deep shrink-0 border border-text-secondary/20">
                    {testimonial.photo ? (
                        <Image
                            src={urlForImage(testimonial.photo).width(200).height(200).url()}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm">
                            {testimonial.name.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-text-primary text-base leading-none mb-1">
                        {testimonial.name}
                    </h4>
                    {testimonial.role && (
                        <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">
                            {testimonial.role}
                        </p>
                    )}
                </div>
            </div>

            <p className="text-[#A1A1A1] text-sm leading-relaxed">
                "{testimonial.quote}"
            </p>
        </div>
    )
}
