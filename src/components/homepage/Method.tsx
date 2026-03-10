"use client"

import { motion } from "framer-motion"

const steps = [
    {
        number: "01",
        title: "Study",
        description: "Understand businesses structurally.",
    },
    {
        number: "02",
        title: "Analyze",
        description: "Break down incentives, moats, and capital allocation.",
    },
    {
        number: "03",
        title: "Decide",
        description: "Act with discipline, not emotion.",
    },
]

export function Method() {
    return (
        <section
            className="py-24 md:py-32 bg-[#0E0E11] relative overflow-hidden z-10"
        >
            {/* Ambient Lighting */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,199,44,0.08),transparent_60%)] pointer-events-none -z-10" />
            
            <div className="container max-w-6xl px-6 mx-auto flex flex-col items-center relative z-10">
                {/* Section Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16 md:mb-24 w-full"
                >
                    <p
                        className="text-sm font-bold text-gold uppercase tracking-widest mb-4 inline-block"
                        style={{ fontFamily: "var(--font-mono-code)" }}
                    >
                        Methodology
                    </p>
                    <h2 className="text-4xl md:text-5xl lg:text-[44px] font-semibold tracking-tight text-white drop-shadow-lg">
                        How It Works
                    </h2>
                </motion.div>

                {/* Flow Container */}
                <div className="w-full flex-col md:flex-row flex items-center justify-center relative">
                    {/* Desktop Horizontal Connecting Line */}
                    <div className="hidden md:block absolute top-[90px] left-[15%] right-[15%] h-[2px] z-0">
                        {/* Static Track Background */}
                        <div className="absolute inset-0 bg-white/5 rounded-full" />
                        {/* Animated Sweep Line */}
                        <motion.div 
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC72C]/60 to-[#FFC72C] rounded-full origin-left"
                        />
                    </div>

                    {/* Mobile Vertical Connecting Line */}
                    <div className="md:hidden absolute top-[10%] bottom-[10%] left-1/2 -translate-x-1/2 w-[2px] z-0">
                        {/* Static Track Background */}
                        <div className="absolute inset-0 bg-white/5 rounded-full" />
                        {/* Animated Sweep Line */}
                        <motion.div 
                            initial={{ scaleY: 0 }}
                            whileInView={{ scaleY: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFC72C]/60 to-[#FFC72C] rounded-full origin-top"
                        />
                    </div>

                    {/* Steps Container */}
                    <div className="flex flex-col md:flex-row items-center justify-between w-full h-full gap-16 md:gap-4 relative z-10">
                        {steps.map((step, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: i * 0.2, ease: "easeOut" }}
                                whileHover={{ y: -6, scale: 1.02 }}
                                className="group relative w-[280px] p-8 rounded-[18px] bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.08)] hover:border-gold/30 hover:shadow-[0_20px_60px_rgba(255,199,44,0.15)] flex flex-col min-h-[220px] transition-all duration-500 overflow-hidden backdrop-blur-md"
                            >
                                {/* Background Number */}
                                <span
                                    className="absolute -bottom-2 right-5 text-[120px] font-bold text-white opacity-5 transition-colors duration-500 leading-none select-none tracking-tighter"
                                >
                                    {step.number}
                                </span>

                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-[#111113] border border-white/10 flex items-center justify-center text-gold font-bold text-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:border-gold/30 group-hover:bg-gold/10 transition-colors duration-300">
                                            {step.number}
                                        </div>
                                    </div>
                                    <h3 className="text-[22px] font-semibold text-white tracking-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-[16px] text-[#b8b3aa] leading-[1.6] font-light">
                                        {step.description}
                                    </p>
                                </div>
                                <div className="absolute inset-0 bg-gold/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
