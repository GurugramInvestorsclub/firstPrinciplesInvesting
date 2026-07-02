"use client"

import { ArrowRight, ShieldCheck } from "lucide-react"

export function FinalCTASection() {
    return (
        <section className="py-24 md:py-36 bg-bg-deep relative overflow-hidden text-center border-t border-[#2E2E2E]">
            {/* Soft background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container max-w-4xl px-6 mx-auto relative z-10 space-y-8">
                <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                    Final Call
                </span>
                
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-tight max-w-2xl mx-auto">
                    Start Building Higher Conviction Today.
                </h2>
                
                <p className="text-neutral-400 text-base md:text-lg font-light max-w-xl mx-auto leading-relaxed">
                    Don't miss our next research report on the Railway Ecosystem. Join 12,000+ serious investors and start making decisions based on structural business moats.
                </p>

                <div className="pt-4 flex flex-col items-center gap-4">
                    {/* Primary Button */}
                    <div className="p-1 rounded-full bg-[#2E2E2E]/80 border border-white/10 hover:border-gold/30 transition-all duration-300">
                        <button
                            onClick={() => {
                                const pricingEl = document.getElementById("pricing")
                                pricingEl?.scrollIntoView({ behavior: "smooth" })
                            }}
                            className="group relative flex items-center gap-2 bg-gold hover:bg-[#E0A800] text-bg-deep font-extrabold px-10 py-4 rounded-full text-sm transition-all duration-300 active:scale-[0.98] cursor-pointer"
                        >
                            <span>Become a Member</span>
                            <div className="w-6 h-6 rounded-full bg-bg-deep/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
                                <ArrowRight className="w-3.5 h-3.5 text-bg-deep" />
                            </div>
                        </button>
                    </div>

                    {/* Subtext info */}
                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 pt-2">
                        <ShieldCheck className="w-4 h-4 text-neutral-600" />
                        <span>₹2,100 / 3 Months · Cancel anytime · Full 14-day refund</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
