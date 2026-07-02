"use client"

import { Check, ShieldCheck, Zap } from "lucide-react"

export function PricingSection() {
    const pricingFeatures = [
        "2 Premium Research Reports every month (PDF)",
        "Monthly Live Member Meetups & Case Studies",
        "Complete Historical Research Archive Access",
        "50% discount on live sectoral webinars",
        "Direct Q&A thread with our analyst team",
        "Valuation models (Excel / Google Sheets)"
    ]

    return (
        <section id="pricing" className="py-24 md:py-32 bg-bg-deep relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container max-w-7xl px-6 mx-auto relative z-10">
                
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
                    <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                        Membership Pricing
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mt-4 leading-tight">
                        One Plan. Complete Access.
                    </h2>
                    <p className="text-neutral-400 mt-4 text-lg font-light max-w-2xl mx-auto">
                        No tiered pricing plans. No upsells. Get access to our entire institutional workspace and compound your conviction.
                    </p>
                </div>

                {/* Pricing Box - Premium Double Bezel */}
                <div className="max-w-2xl mx-auto p-2 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur shadow-2xl">
                    <div className="rounded-[2.2rem] bg-bg-deep border border-[#2E2E2E] p-8 md:p-12 space-y-8 relative overflow-hidden">
                        
                        {/* Gold Badge */}
                        <div className="absolute top-6 right-6 font-mono text-[9px] text-gold bg-gold/10 border border-gold/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-gold" />
                            <span>ALL ACCESSPASS</span>
                        </div>

                        {/* Price Details */}
                        <div className="space-y-3">
                            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                                3 MONTH MEMBERSHIP
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl md:text-5xl font-bold text-text-primary font-sans">
                                    ₹2,100
                                </span>
                                <span className="text-neutral-500 font-mono text-xs">/ 3 MONTHS</span>
                            </div>
                            <div className="text-xs font-mono text-gold font-semibold">
                                Equivalent to less than ₹24/day
                            </div>
                        </div>

                        {/* Value Statement */}
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-neutral-400 font-light leading-relaxed">
                            <span className="text-text-primary font-medium">Value Frame:</span> One single correct investment decision pays back a decade of subscription. One bad corporate governance trap avoided is worth lakhs.
                        </div>

                        {/* Feature List */}
                        <div className="space-y-4 pt-4 border-t border-[#2E2E2E]">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                                WHAT IS INCLUDED:
                            </span>
                            <ul className="grid md:grid-cols-2 gap-4">
                                {pricingFeatures.map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300 font-light leading-relaxed">
                                        <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Checkout CTA */}
                        <div className="pt-8 border-t border-[#2E2E2E] space-y-4">
                            <button
                                onClick={() => {
                                    // Normally triggers Razorpay checkout modal
                                    alert("In a production build, this triggers Razorpay/Stripe checkout interface.")
                                }}
                                className="w-full relative flex items-center justify-center bg-gold hover:bg-[#E0A800] text-bg-deep font-extrabold py-4 rounded-full transition-all duration-300 active:scale-[0.98] shadow-lg shadow-gold/10 cursor-pointer"
                            >
                                <span>Subscribe & Start Reading</span>
                            </button>

                            {/* Secure Indicator */}
                            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500">
                                <ShieldCheck className="w-4 h-4 text-neutral-600" />
                                <span>SECURE CHECKOUT · INSTANT ACCESS · 14-DAY REFUND POLICY</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    )
}
