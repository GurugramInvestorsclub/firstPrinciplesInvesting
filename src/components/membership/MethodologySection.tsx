"use client"

import { motion } from "framer-motion"
import { BookOpen, Search, UserCheck, ShieldAlert, Cpu, Clipboard, Zap } from "lucide-react"

export function MethodologySection() {
    const steps = [
        {
            title: "Annual Reports",
            desc: "10-year financial screening, related party transactions, and auditor changes.",
            icon: BookOpen
        },
        {
            title: "Industry Reports",
            desc: "Mapping global commodity indices, raw material trends, and export-import data.",
            icon: Search
        },
        {
            title: "Competitor Analysis",
            desc: "Comparing return on equity, inventory turnovers, and market shares across players.",
            icon: Cpu
        },
        {
            title: "Management Calls",
            desc: "Direct discussions and tracking of historical guidance vs actual execution.",
            icon: UserCheck
        },
        {
            title: "Financial Models",
            desc: "Detailed discounted cash flow and reverse cash flow projections.",
            icon: Zap
        },
        {
            title: "Scuttlebutt Channel",
            desc: "On-the-ground dealer, distributor, and vendor channel audits.",
            icon: Clipboard
        },
        {
            title: "Investment Memo",
            desc: "Final core thesis synthesis highlighting terminal risk thresholds.",
            icon: ShieldAlert
        }
    ]

    return (
        <section className="py-24 md:py-32 bg-[#1E1E1E] border-b border-[#2E2E2E] overflow-hidden">
            <div className="container max-w-7xl px-6 mx-auto relative z-10">
                
                {/* Header */}
                <div className="max-w-3xl mb-16 md:mb-24">
                    <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                        Research Engine
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mt-4 leading-tight">
                        Our Research Methodology.
                    </h2>
                    <p className="text-neutral-400 mt-4 text-lg font-light">
                        We build high conviction by putting in the hours. Here is the exact funnel every research report undergoes before it is published.
                    </p>
                </div>

                {/* Workflow nodes */}
                <div className="relative border-l border-[#2E2E2E] ml-4 md:ml-8 space-y-12">
                    {steps.map((step, idx) => {
                        const Icon = step.icon
                        return (
                            <div key={idx} className="relative pl-8 md:pl-12 group">
                                {/* Node dot */}
                                <div className="absolute left-0 top-1.5 -translate-x-[9.5px] w-[18px] h-[18px] rounded-full bg-bg-deep border-2 border-neutral-700 group-hover:border-gold transition-colors duration-300 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 group-hover:bg-gold transition-colors duration-300" />
                                </div>

                                <div className="p-1 rounded-[1.5rem] bg-white/5 border border-white/5 shadow-md max-w-2xl group-hover:border-white/10 group-hover:bg-white/10 transition-all duration-500">
                                    <div className="rounded-[1.3rem] bg-bg-deep border border-[#2E2E2E] p-6 flex flex-col md:flex-row items-start gap-4">
                                        <div className="p-2.5 rounded-xl bg-[#1E1E1E] text-gold border border-white/5 shrink-0">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-[9px] text-neutral-500 font-bold uppercase">
                                                    PHASE 0{idx + 1}
                                                </span>
                                                <h3 className="text-sm font-bold text-text-primary tracking-tight">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-neutral-400 font-light leading-relaxed">
                                                {step.desc}
                                            </p>
                                        </div>
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
