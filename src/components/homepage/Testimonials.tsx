"use client"

import { Testimonial } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface TestimonialsProps {
    testimonials: Testimonial[]
}

export function Testimonials({ testimonials }: TestimonialsProps) {
    if (!testimonials || testimonials.length === 0) {
        return null
    }

    // Duplicate testimonials for infinite loop effect
    const displayTestimonials = [...testimonials, ...testimonials, ...testimonials]

    return (
        <section className="py-24 md:py-32 bg-bg-primary overflow-hidden">
            <div className="container max-w-7xl px-4 mx-auto">
                <div className="grid lg:grid-cols-5 gap-12 lg:gap-20 items-center">

                    {/* LEFT COLUMN: Content */}
                    <div className="lg:col-span-2 flex flex-col gap-8 text-left">
                        <div>
                            <span className="text-gold font-medium tracking-wide uppercase text-sm mb-3 block">
                                Community
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-tight">
                                Trusted by Serious Investors.
                            </h2>
                        </div>

                        <p className="text-lg text-text-secondary leading-relaxed">
                            Join a community of like-minded individuals who value structural analysis over market noise. Our members build conviction through first principles.
                        </p>

                        <div>
                            <Button asChild size="lg" className="bg-gold text-bg-deep hover:bg-gold-muted font-semibold px-8 h-12 rounded-md">
                                <Link href="/events">
                                    Join the Community <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Rotating Testimonials */}
                    <div className="lg:col-span-3 relative h-[600px] overflow-hidden mask-gradient-vertical">
                        {/* Desktop/Tablet Vertical Scroll */}
                        <div className="hidden md:block absolute inset-0 w-full animate-scroll-vertical hover:[animation-play-state:paused]">
                            <div className="flex flex-col gap-6">
                                {displayTestimonials.map((item, idx) => (
                                    <TestimonialCard key={`${item.name}-${idx}`} testimonial={item} />
                                ))}
                            </div>
                        </div>

                        {/* Mobile Horizontal Snap Scroll */}
                        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar">
                            {testimonials.map((item, idx) => (
                                <div key={idx} className="snap-center shrink-0 w-[85vw] max-w-[350px]">
                                    <TestimonialCard testimonial={item} />
                                </div>
                            ))}
                        </div>

                        {/* Fade masks for desktop */}
                        <div className="hidden md:block absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-bg-primary to-transparent z-10 pointer-events-none" />
                        <div className="hidden md:block absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-bg-primary to-transparent z-10 pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    return (
        <div className="bg-bg-deep p-8 rounded-2xl border border-text-secondary/10 shadow-sm transition-transform duration-300 hover:scale-[1.02]">
            <blockquote className="space-y-6">
                <p className="text-text-primary text-lg leading-relaxed relative">
                    <span className="text-gold/20 text-4xl absolute -top-4 -left-2">"</span>
                    <span className="relative z-10">{testimonial.quote}</span>
                </p>

                <footer className="flex items-center gap-4 pt-2">
                    {testimonial.photo && (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-bg-primary shrink-0 border border-text-secondary/20">
                            <Image
                                src={urlForImage(testimonial.photo).url()}
                                alt={testimonial.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    <div>
                        <cite className="not-italic font-medium text-text-primary block">
                            {testimonial.name}
                        </cite>
                        {testimonial.role && (
                            <span className="text-sm text-text-secondary block mt-0.5">
                                {testimonial.role}
                            </span>
                        )}
                    </div>
                </footer>
            </blockquote>
        </div>
    )
}
