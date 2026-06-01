"use client"

import { motion } from "framer-motion"

const noisePhrases = [
    { text: "Multibagger", left: "15%", top: "20%", blur: 4, duration: 18, delay: -5 },
    { text: "Buy Now", left: "75%", top: "15%", blur: 2, duration: 14, delay: -2 },
    { text: "Breakout", left: "10%", top: "60%", blur: 5, duration: 22, delay: -8 },
    { text: "Target Price", left: "80%", top: "65%", blur: 3, duration: 16, delay: -1 },
    { text: "Stock Tips", left: "40%", top: "35%", blur: 6, duration: 25, delay: -12 },
    { text: "Momentum", left: "65%", top: "45%", blur: 3, duration: 19, delay: -4 },
    { text: "Narratives", left: "30%", top: "80%", blur: 4, duration: 21, delay: -9 },
]

const structuredConcepts = [
    "Industry Structure",
    "Capital Allocation",
    "Management Incentives",
    "Competitive Advantages",
    "Long-Term Thinking",
    "Business Analysis"
]

export function PhilosophySection() {
    return (
        <section className="relative py-32 md:py-48 border-y border-white/5 overflow-hidden bg-[#080810]">
            {/* Background images for subtle research visuals */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-luminosity">
                <img src="/images/annual_report.png" alt="" className="absolute top-[-10%] left-[-10%] w-[60%] h-[120%] object-cover transform -rotate-6" />
                <img src="/images/valuation_model.png" alt="" className="absolute top-[-10%] right-[-10%] w-[60%] h-[120%] object-cover transform rotate-3" />
            </div>

            <div className="container max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
                
                {/* Headline Section */}
                <div className="text-center mb-32 max-w-5xl">
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-[1.1] text-white">
                        Most investing content optimizes for engagement.
                    </h2>
                    <h3 className="text-3xl md:text-5xl lg:text-6xl font-heading italic tracking-tight leading-[1.2] mt-6" style={{ color: "var(--insights-accent)" }}>
                        We optimize for understanding.
                    </h3>
                </div>

                {/* Left & Right Contrast Area */}
                <div className="w-full grid lg:grid-cols-2 gap-16 lg:gap-0 items-stretch min-h-[500px]">
                    
                    {/* LEFT SIDE: Market Noise */}
                    <div className="relative h-[400px] md:h-[500px] flex items-center justify-center lg:border-r border-white/5 overflow-visible">
                        <div className="absolute inset-0 w-full h-full">
                            {noisePhrases.map((phrase, i) => (
                                <motion.span
                                    key={i}
                                    className="absolute text-2xl md:text-4xl font-heading font-black text-white/20 uppercase tracking-tighter whitespace-nowrap"
                                    style={{
                                        filter: `blur(${phrase.blur}px)`,
                                        left: phrase.left,
                                        top: phrase.top,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    animate={{
                                        x: ["-15%", "15%", "-10%", "20%", "-15%"],
                                        y: ["-10%", "15%", "-20%", "10%", "-10%"],
                                        rotate: [-3, 5, -2, 4, -3],
                                    }}
                                    transition={{
                                        duration: phrase.duration,
                                        repeat: Infinity,
                                        ease: "linear",
                                        delay: phrase.delay,
                                    }}
                                >
                                    {phrase.text}
                                </motion.span>
                            ))}
                        </div>
                        {/* Title to anchor the side slightly */}
                        <div className="relative z-10 text-xs font-mono uppercase tracking-[0.3em] backdrop-blur-md px-6 py-2 border border-white/5 rounded-full" style={{ color: "var(--insights-accent)" }}>
                            Market Noise
                        </div>
                    </div>

                    {/* RIGHT SIDE: First Principles Research */}
                    <div className="relative h-[400px] md:h-[500px] flex flex-col items-center justify-center lg:pl-20">
                        <div className="w-full max-w-md">
                            <div className="text-2xl md:text-3xl font-heading font-bold uppercase tracking-widest mb-12 text-center lg:text-left" style={{ color: "var(--insights-accent)" }}>
                                First Principles Research
                            </div>
                            
                            <div className="flex flex-col gap-8">
                                {structuredConcepts.map((concept, i) => (
                                    <div key={i} className="flex items-center gap-6 group">
                                        <div className="w-2 h-2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "var(--insights-accent)" }}></div>
                                        <span className="text-xl md:text-3xl font-heading text-white/70 group-hover:text-white group-hover:translate-x-2 transition-all duration-500">
                                            {concept}
                                        </span>
                                        <div className="flex-1 border-b border-white/5 group-hover:border-white/20 transition-colors ml-4"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
