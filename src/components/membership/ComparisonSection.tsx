"use client"

import { Check, X } from "lucide-react"

export function ComparisonSection() {
    const comparisonRows = [
        {
            feature: "Premium Research Deep Dives",
            free: "Only basic summaries (1-2 pages)",
            member: "2 detailed reports / month (35+ pages)",
            isMemberOnly: false
        },
        {
            feature: "Valuation Models (DCF/Excel)",
            free: "None",
            member: "Full unlocked excel downloads",
            isMemberOnly: true
        },
        {
            feature: "Live Member Meetups",
            free: "No access",
            member: "Monthly live video discussions",
            isMemberOnly: true
        },
        {
            feature: "Complete Research Archive",
            free: "3 basic sample reports",
            member: "50+ past reports fully unlocked",
            isMemberOnly: true
        },
        {
            feature: "Sectoral Webinars",
            free: "Full price (₹2,000+ each)",
            member: "50% flat discount",
            isMemberOnly: true
        },
        {
            feature: "Direct Analyst Q&A",
            free: "No",
            member: "Yes, via member dashboard",
            isMemberOnly: true
        }
    ]

    return (
        <section className="py-24 md:py-32 bg-bg-deep border-b border-[#2E2E2E] overflow-hidden">
            <div className="container max-w-7xl px-6 mx-auto relative z-10">
                
                {/* Header */}
                <div className="max-w-3xl mb-16 md:mb-24">
                    <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                        Comparison
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mt-4 leading-tight">
                        Choose Your Conviction Level.
                    </h2>
                    <p className="text-neutral-400 mt-4 text-lg font-light">
                        We build research for serious compounders. Compare the level of access below.
                    </p>
                </div>

                {/* Comparison Grid (Table-like look but using CSS Grid for better responsiveness) */}
                <div className="border border-[#2E2E2E] rounded-3xl overflow-hidden bg-black/10">
                    {/* Header Row */}
                    <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#2E2E2E] bg-white/5 font-mono text-xs uppercase text-neutral-400 p-6 gap-4">
                        <div className="md:col-span-6 font-bold tracking-wider">Features</div>
                        <div className="md:col-span-3 font-semibold">Free Reader</div>
                        <div className="md:col-span-3 font-bold text-gold">Paid Member</div>
                    </div>

                    {/* Body Rows */}
                    <div className="divide-y divide-[#2E2E2E]">
                        {comparisonRows.map((row, idx) => (
                            <div 
                                key={idx}
                                className="grid grid-cols-1 md:grid-cols-12 p-6 items-center gap-4 text-sm hover:bg-white/5 transition-colors duration-300"
                            >
                                {/* Feature Name */}
                                <div className="md:col-span-6 font-semibold text-text-primary">
                                    {row.feature}
                                </div>

                                {/* Free Tier Column */}
                                <div className="md:col-span-3 text-neutral-500 font-light flex items-center gap-2">
                                    {row.isMemberOnly ? (
                                        <>
                                            <X className="w-4 h-4 text-rose-500/50 shrink-0" />
                                            <span>{row.free}</span>
                                        </>
                                    ) : (
                                        <span>{row.free}</span>
                                    )}
                                </div>

                                {/* Member Tier Column */}
                                <div className="md:col-span-3 text-gold font-medium flex items-center gap-2">
                                    <Check className="w-4 h-4 text-gold shrink-0" />
                                    <span>{row.member}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    )
}
