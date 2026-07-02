"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart2, ShieldAlert, Cpu, Award, DollarSign, Layers } from "lucide-react"

export function SolutionSection() {
    const [activeStep, setActiveStep] = useState(0)

    const workflowSteps = [
        {
            title: "Industry Structure & Value Chains",
            icon: Layers,
            summary: "We dissect the sector's structure. Who makes the money? Who has pricing power? Where is value captured?",
            details: "Instead of summarizing public reports, we map out raw suppliers, distributors, and customers. We measure switching costs, input dependencies, and technological obsolescence thresholds."
        },
        {
            title: "Business Model & Unit Economics",
            icon: DollarSign,
            summary: "We verify unit profitability. Is the growth self-sustaining? Or does it consume capital?",
            details: "We analyze margins, cash conversion cycles, working capital requirements, and return on capital employed (ROCE). We model how profit margins expand or contract with scale."
        },
        {
            title: "Management & Capital Allocation",
            icon: Award,
            summary: "We judge managers on what they do with capital, not what they say on news channels.",
            details: "We track historical capital deployment: buybacks, acquisitions, dividends, and capital expenditures. We check promoter pledging, audit histories, and executive compensation structures."
        },
        {
            title: "Valuation & Terminal Risks",
            icon: ShieldAlert,
            summary: "We estimate margins of safety and model terminal threats to the business.",
            details: "We build multi-scenario DCF and reverse-DCF models. We analyze structural headwinds, technological disruption, regulatory risks, and corporate governance flags."
        }
    ]

    return (
        <section className="py-24 md:py-32 bg-bg-deep relative overflow-hidden">
            <div className="container max-w-7xl px-6 mx-auto relative z-10">
                
                {/* Header */}
                <div className="max-w-3xl mb-16 md:mb-24">
                    <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                        The Solution
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mt-4 leading-tight">
                        We Rebuild the Thesis from Absolute Scratch.
                    </h2>
                    <p className="text-neutral-400 mt-4 text-lg font-light">
                        Every premium report is a full structural synthesis. We do not recycle consensus metrics. We inspect the foundations.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-stretch">
                    
                    {/* Left Column: Interactive Workflow Steps (7 columns) */}
                    <div className="lg:col-span-6 space-y-4 flex flex-col justify-center">
                        {workflowSteps.map((step, idx) => {
                            const Icon = step.icon
                            const isActive = activeStep === idx

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveStep(idx)}
                                    className={`w-full text-left p-6 rounded-2xl border transition-all duration-500 flex items-start gap-4 cursor-pointer relative overflow-hidden ${
                                        isActive 
                                            ? "bg-[#2E2E2E]/80 border-gold/30 shadow-lg" 
                                            : "bg-[#1E1E1E]/40 border-white/5 hover:border-white/10 hover:bg-[#1E1E1E]/60"
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeIndicator"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-gold"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    <div className={`p-3 rounded-xl shrink-0 transition-colors duration-300 ${
                                        isActive ? "bg-gold text-bg-deep" : "bg-[#2E2E2E] text-neutral-400"
                                    }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className={`text-base font-bold transition-colors duration-300 ${
                                            isActive ? "text-gold" : "text-text-primary"
                                        }`}>
                                            {step.title}
                                        </h3>
                                        <p className="text-xs text-neutral-400 font-light leading-relaxed">
                                            {step.summary}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Right Column: Visual Showcase Card (6 columns) */}
                    <div className="lg:col-span-6 flex flex-col justify-center">
                        <div className="p-2 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl h-full flex flex-col">
                            <div className="rounded-[2.2rem] bg-bg-deep border border-[#2E2E2E] p-8 flex flex-col justify-between h-full relative overflow-hidden">
                                
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center gap-2 border-b border-[#2E2E2E] pb-4">
                                        <span className="font-mono text-xs text-gold uppercase tracking-wider">
                                            Stage {activeStep + 1} Analytical Depth
                                        </span>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeStep}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6"
                                        >
                                            <h3 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
                                                {workflowSteps[activeStep].title}
                                            </h3>
                                            <p className="text-sm text-neutral-300 leading-relaxed font-light">
                                                {workflowSteps[activeStep].details}
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                <div className="mt-12 border-t border-[#2E2E2E] pt-6 flex items-center justify-between text-xs font-mono text-neutral-500">
                                    <span>ANALYSIS COMPLETED</span>
                                    <span className="text-text-primary">100% IN-HOUSE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
