"use client"

import { Landmark, Users, Archive, Compass } from "lucide-react"

export function BenefitsSection() {
    const benefits = [
        {
            title: "Premium Research",
            outcome: "Understand industries deeply.",
            why: "Build high conviction before making multi-lakh portfolio allocations. Avoid panic-selling when the market drops, because you actually know what the business owns.",
            icon: Landmark,
        },
        {
            title: "Live Member Meetups",
            outcome: "Challenge your thinking.",
            why: "Participate in monthly live stress-tests. Present your thesis, challenge other members, and get direct feedback from the founding research analysts.",
            icon: Users,
        },
        {
            title: "Complete Research Archive",
            outcome: "Knowledge compounds.",
            why: "Unlock instant access to our comprehensive 50+ report library. Track how sectors like API chemicals, defense electronics, and EMS have evolved over years.",
            icon: Archive,
        },
        {
            title: "Sectoral Webinars",
            outcome: "Stay ahead of structural trends.",
            why: "Get a 50% discount on live webinars detailing high-barrier sectors (e.g. semiconductor assembly, nuclear energy). Learn technical details from sector veterans.",
            icon: Compass,
        }
    ]

    return (
        <section className="py-24 md:py-32 bg-bg-deep relative overflow-hidden">
            <div className="container max-w-7xl px-6 mx-auto relative z-10">
                
                {/* Header */}
                <div className="max-w-3xl mb-16 md:mb-24">
                    <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                        What Members Receive
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mt-4 leading-tight">
                        We Don't Sell Articles. We Sell Better Decisions.
                    </h2>
                    <p className="text-neutral-400 mt-4 text-lg font-light">
                        Every membership benefit is structured to save you time, increase conviction, and prevent expensive investment mistakes.
                    </p>
                </div>

                {/* Grid of Benefits - Asymmetrical bento style layout */}
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {benefits.map((benefit, idx) => {
                        const Icon = benefit.icon
                        return (
                            <div 
                                key={idx}
                                className="p-2 rounded-[2rem] bg-white/5 border border-white/5 shadow-lg hover:border-gold/20 transition-all duration-500 flex flex-col justify-stretch group"
                            >
                                <div className="rounded-[1.8rem] bg-[#1E1E1E] border border-white/5 p-8 flex flex-col justify-between h-full relative overflow-hidden group-hover:bg-[#2E2E2E]/60 transition-colors duration-500">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="p-3 rounded-2xl bg-bg-deep border border-[#2E2E2E] text-gold group-hover:scale-105 transition-transform duration-300">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                                                Benefit 0{idx + 1}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-xs font-mono text-gold uppercase tracking-wider">
                                                {benefit.title}
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
                                                {benefit.outcome}
                                            </h3>
                                        </div>

                                        <p className="text-sm text-neutral-400 leading-relaxed font-light">
                                            {benefit.why}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

            </div>
        </section>
    )
}
