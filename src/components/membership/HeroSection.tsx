"use client"

import { motion } from "framer-motion"
import { ArrowRight, ChevronRight } from "lucide-react"

export function HeroSection() {
    return (
        <section className="relative min-h-[90dvh] flex items-center pt-32 pb-20 overflow-hidden bg-bg-deep">
            {/* Ambient Background Light */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container max-w-7xl px-6 mx-auto relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* Left content - 8 columns */}
                    <div className="lg:col-span-8 space-y-8 text-left">
                        {/* Premium eyebrow */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-text-primary">
                                Institutional Membership
                            </span>
                        </div>

                        {/* Transformation Headline */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary leading-[1.05] font-sans">
                            Become a Better Investor <br className="hidden md:inline" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-muted to-white">
                                Before the Market Does.
                            </span>
                        </h1>

                        {/* Subheadline (Max 25 words) */}
                        <p className="text-lg md:text-xl text-neutral-400 max-w-[32rem] font-light leading-relaxed">
                            Acquire institutional-grade research that compounds. We strip away intraday noise to analyze business models from first principles.
                        </p>

                        {/* Price Tag & CTA Container */}
                        <div className="space-y-6 pt-4">
                            <div className="flex flex-wrap items-center gap-6">
                                {/* Primary CTA (Double Bezel effect) */}
                                <div className="p-1 rounded-full bg-[#2E2E2E]/85 ring-1 ring-white/10 shadow-lg hover:ring-gold/30 transition-all duration-500">
                                    <button
                                        onClick={() => {
                                            const pricingEl = document.getElementById("pricing")
                                            pricingEl?.scrollIntoView({ behavior: "smooth" })
                                        }}
                                        className="group relative flex items-center gap-2 bg-gold hover:bg-[#E0A800] text-bg-deep font-bold px-8 py-3.5 rounded-full transition-all duration-300 active:scale-[0.98] cursor-pointer"
                                    >
                                        <span>Become a Member</span>
                                        <div className="w-6 h-6 rounded-full bg-bg-deep/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
                                            <ArrowRight className="w-3.5 h-3.5 text-bg-deep" />
                                        </div>
                                    </button>
                                </div>

                                {/* Secondary CTA */}
                                <button
                                    onClick={() => {
                                        const researchEl = document.getElementById("featured-research")
                                        researchEl?.scrollIntoView({ behavior: "smooth" })
                                    }}
                                    className="flex items-center gap-2 text-text-primary hover:text-gold transition-colors font-semibold px-6 py-4 cursor-pointer"
                                >
                                    <span>Browse Free Research</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Pricing Visible Immediately */}
                            <div className="flex items-center gap-4 text-sm font-mono text-neutral-400">
                                <span className="text-gold font-bold text-lg">₹2,100</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                                <span>3 Month Subscription</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                                <span className="text-white/80">Less than ₹24/day</span>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="pt-8 border-t border-[#2E2E2E] flex flex-wrap gap-x-8 gap-y-3 text-xs text-neutral-500">
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold" />
                                <span>12,000+ Serious Investors</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold" />
                                <span>14-day cancellation policy</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold" />
                                <span>Direct Support with Analysts</span>
                            </div>
                        </div>
                    </div>

                    {/* Right asset / abstract graphic - 4 columns */}
                    <div className="lg:col-span-4 relative hidden lg:block">
                        <div className="p-2 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                            <div className="rounded-[2.2rem] bg-bg-deep border border-[#2E2E2E] overflow-hidden p-8 space-y-6 relative">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/10 rounded-full blur-2xl" />
                                
                                <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4">
                                    <span className="font-mono text-xs text-gold font-semibold uppercase tracking-wider">PLATFORM ACCESS</span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                </div>

                                <div className="space-y-4 font-mono text-xs text-neutral-400">
                                    <div className="space-y-1">
                                        <div className="text-neutral-500">RESEARCH PILLAR</div>
                                        <div className="text-text-primary text-sm font-medium">First-Principles Reasoning</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-neutral-500">MONTHLY REPORTS</div>
                                        <div className="text-text-primary text-sm font-medium">2 Premium Deep Dives</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-neutral-500">ACTIVE ROADMAP</div>
                                        <div className="text-text-primary text-sm font-medium">Space, Defense, API & EMS Sectors</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-neutral-500">ARCHIVE DEPTH</div>
                                        <div className="text-text-primary text-sm font-medium">Complete Access to 50+ Moat Analyses</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[#2E2E2E] flex justify-between items-center text-xs">
                                    <span className="text-neutral-500">SYSTEM STATUS</span>
                                    <span className="text-white font-mono">SECURE · ENCRYPTED</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
