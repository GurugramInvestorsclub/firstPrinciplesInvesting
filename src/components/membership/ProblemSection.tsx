"use client"

import { motion } from "framer-motion"
import { AlertCircle, TrendingUp, Twitter, MessageSquare, BookOpen } from "lucide-react"

export function ProblemSection() {
    // Array of noisy updates to display in the noise column
    const noiseAlerts = [
        { icon: Twitter, text: "BREAKING: Tech stock up 14% pre-market on buyout rumors!", color: "text-[#1DA1F2]" },
        { icon: AlertCircle, text: "JOIN NOW: Free Telegram calls for 500% gains this week!", color: "text-rose-500" },
        { icon: TrendingUp, text: "TV Host: 'Buy this sector now or miss the rally of the decade!'", color: "text-emerald-500" },
        { icon: MessageSquare, text: "WhatsApp: 'Insider says earnings will double next quarter...'", color: "text-green-500" },
        { icon: Twitter, text: "Finfluencer: 'Why I'm selling all my shares today [THREAD]'", color: "text-[#1DA1F2]" },
        { icon: AlertCircle, text: "Options trading tutorial: Turn ₹10k into ₹10L in 3 days!", color: "text-amber-500" },
    ]

    return (
        <section className="py-24 md:py-32 bg-[#1E1E1E] border-y border-[#2E2E2E] overflow-hidden relative">
            <div className="container max-w-7xl px-6 mx-auto relative z-10">
                
                {/* Header */}
                <div className="max-w-3xl mb-16 md:mb-24">
                    <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                        The Current State
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mt-4 leading-tight">
                        Modern Investing is Broken.
                    </h2>
                    <p className="text-neutral-400 mt-4 text-lg font-light">
                        We are drowning in information, yet starving for understanding. The retail investor is pushed towards trading volume, not business compounding.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-stretch">
                    
                    {/* Left Column: The Noise (Chaotic Ticker/Feed) */}
                    <div className="p-2 rounded-[2rem] bg-white/5 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[350px]">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#1E1E1E] via-transparent to-[#1E1E1E] z-10 pointer-events-none" />
                        
                        <div className="relative space-y-4 max-h-[300px] overflow-hidden mask-gradient-vertical px-4">
                            {/* Scroll container for infinite vertical scroll of noise */}
                            <motion.div 
                                className="space-y-4"
                                animate={{ y: [0, -320] }}
                                transition={{
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: 18,
                                    ease: "linear"
                                }}
                            >
                                {[...noiseAlerts, ...noiseAlerts].map((alert, idx) => {
                                    const Icon = alert.icon
                                    return (
                                        <div 
                                            key={idx}
                                            className="p-4 rounded-2xl bg-bg-deep/40 border border-white/5 backdrop-blur-sm flex items-start gap-4 opacity-40 blur-[1px] hover:blur-none hover:opacity-80 transition-all duration-300"
                                        >
                                            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${alert.color}`} />
                                            <span className="text-xs font-mono text-neutral-400">{alert.text}</span>
                                        </div>
                                    )
                                })}
                            </motion.div>
                        </div>
                        
                        {/* Title overlay for Noise Column */}
                        <div className="absolute inset-x-0 bottom-4 text-center z-20">
                            <span className="px-4 py-2 rounded-full bg-rose-950/80 border border-rose-500/30 text-rose-400 font-mono text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                                Information Overload
                            </span>
                        </div>
                    </div>

                    {/* Right Column: The Calm Ledger (Understanding) */}
                    <div className="p-2 rounded-[2rem] bg-white/5 border border-white/10 shadow-2xl relative flex flex-col justify-between">
                        <div className="rounded-[1.8rem] bg-bg-deep border border-[#2E2E2E] p-8 flex flex-col justify-between h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-xl" />
                            
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-gold" />
                                        <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider">THE LEDGER</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded">CONVICTION</span>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
                                        Understanding Compounds. Opinions Fluctuate.
                                    </h3>
                                    <p className="text-sm text-neutral-400 leading-relaxed font-light">
                                        Consuming hours of media feeds gives the illusion of learning. But true conviction is built in silence, examining structural realities.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-12 space-y-3 font-mono text-xs border-t border-[#2E2E2E] pt-6 text-neutral-500">
                                <div className="flex justify-between">
                                    <span>NOISE RATIO</span>
                                    <span className="text-emerald-500">0.00%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>RESEARCH HORIZON</span>
                                    <span className="text-text-primary">3 - 10 Years</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>INVESTMENT PHILOSOPHY</span>
                                    <span className="text-text-primary">First-Principles Thinking</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
