"use client"

import { Check, AlertTriangle } from "lucide-react"

export function AudienceSection() {
    const isFor = [
        "Retail investors wanting to build long-term conviction.",
        "Analysts and professionals who need deep sector mappings.",
        "Finance students wanting to learn real-world business models.",
        "Business owners seeking to understand market structures.",
        "Serious learners who enjoy reading 40-page research reports.",
        "Investors willing to spend hours building understanding."
    ]

    const isNotFor = [
        "People looking for intraday trading tips or calls.",
        "People expecting buy/sell/hold stock recommendations.",
        "Telegram channel signals or momentum swing alerts.",
        "Options, futures, or cryptocurrency day traders.",
        "Anyone looking for a get-rich-quick formula.",
        "People unwilling to do reading and homework."
    ]

    return (
        <section className="py-24 md:py-32 bg-[#1E1E1E] border-b border-[#2E2E2E] overflow-hidden">
            <div className="container max-w-7xl px-6 mx-auto relative z-10">
                
                {/* Header */}
                <div className="max-w-3xl mb-16 md:mb-24">
                    <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                        Alignment
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mt-4 leading-tight">
                        Is This Membership For You?
                    </h2>
                    <p className="text-neutral-400 mt-4 text-lg font-light">
                        We are selective about our readers. We want to align with people who treat investing as a business-ownership exercise.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-stretch">
                    
                    {/* Left Column: Who This Is For */}
                    <div className="p-2 rounded-[2rem] bg-white/5 border border-white/10 shadow-2xl flex flex-col justify-stretch">
                        <div className="rounded-[1.8rem] bg-bg-deep border border-[#2E2E2E] p-8 flex flex-col justify-between h-full">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-[#2E2E2E] pb-4">
                                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span className="font-mono text-xs text-text-primary font-bold uppercase tracking-wider">
                                        Who This Is Built For
                                    </span>
                                </div>

                                <ul className="space-y-4">
                                    {isFor.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-neutral-300 font-light">
                                            <span className="text-gold font-mono font-bold mt-0.5">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Who This Is NOT For */}
                    <div className="p-2 rounded-[2rem] bg-white/5 border border-white/10 shadow-2xl flex flex-col justify-stretch">
                        <div className="rounded-[1.8rem] bg-bg-deep border border-[#2E2E2E] p-8 flex flex-col justify-between h-full">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-[#2E2E2E] pb-4">
                                    <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <span className="font-mono text-xs text-text-primary font-bold uppercase tracking-wider">
                                        Who Should NOT Subscribe
                                    </span>
                                </div>

                                <ul className="space-y-4">
                                    {isNotFor.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-neutral-400 font-light">
                                            <span className="text-rose-500/80 font-mono font-bold mt-0.5">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    )
}
