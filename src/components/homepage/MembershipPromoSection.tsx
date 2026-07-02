"use client"

import Link from "next/link"
import { ArrowRight, Star, ShieldCheck } from "lucide-react"

export function MembershipPromoSection() {
    return (
        <section className="py-24 bg-bg-deep border-t border-[#2E2E2E] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container max-w-5xl px-6 mx-auto relative z-10">
                {/* Double Bezel Container */}
                <div className="p-2 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl">
                    <div className="rounded-[2.2rem] bg-[#1E1E1E] border border-[#2E2E2E] p-8 md:p-12 relative overflow-hidden grid md:grid-cols-12 gap-8 items-center">
                        
                        {/* Decorative star background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                        {/* Left Content Column (7 columns) */}
                        <div className="md:col-span-8 space-y-6 text-left">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/20 bg-gold/5">
                                <Star className="w-3.5 h-3.5 text-gold fill-gold/20" />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-gold">
                                    Premium Access
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">
                                Go Beyond the Consensus. <br />
                                Build True Investing Conviction.
                            </h2>

                            <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-lg">
                                Stop outsourcing your thesis to news panels or stock tips. Get institutional-grade research models, deep-dive mappings, and active manager scuttlebutt.
                            </p>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-500 font-mono">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                                    <span>2 reports / month</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                                    <span>Excel models</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                                    <span>Live member meetups</span>
                                </div>
                            </div>
                        </div>

                        {/* Right CTA Column (4 columns) */}
                        <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center">
                            <div className="p-1 rounded-full bg-[#2E2E2E]/80 border border-white/10 hover:border-gold/30 transition-all duration-300">
                                <Link
                                    href="/membership"
                                    className="group relative flex items-center gap-2 bg-gold hover:bg-[#E0A800] text-bg-deep font-extrabold px-6 py-3 rounded-full text-xs transition-all active:scale-[0.98]"
                                >
                                    <span>Explore Membership</span>
                                    <div className="w-6 h-6 rounded-full bg-bg-deep/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
                                        <ArrowRight className="w-3.5 h-3.5 text-bg-deep" />
                                    </div>
                                </Link>
                            </div>
                            
                            <div className="mt-4 flex items-center gap-1 text-[10px] font-mono text-neutral-500 text-left md:text-right">
                                <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
                                <span>₹2,100 / 3 Months</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}
