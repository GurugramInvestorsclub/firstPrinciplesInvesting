"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, FileText, BarChart2, ShieldAlert, Table, Star, ArrowRight } from "lucide-react"

export function InsideReportSection() {
    const [activeTab, setActiveTab] = useState(0)

    const pages = [
        {
            name: "1. Cover Page",
            icon: FileText,
            content: (
                <div className="flex flex-col justify-between h-full p-8 border border-white/10 rounded-2xl bg-bg-deep relative overflow-hidden font-sans">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4">
                            <span className="text-[10px] font-mono tracking-widest text-gold uppercase font-bold">Institutional Research Memo</span>
                            <span className="text-[10px] font-mono tracking-wider text-neutral-500">MEMO #74 · CONFIDENTIAL</span>
                        </div>
                        <div className="space-y-3 pt-6">
                            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">SECTOR DEEP DIVE</span>
                            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">
                                Space Sector: India's Launch Systems & Satellites
                            </h3>
                            <p className="text-sm text-neutral-400 font-light max-w-xl">
                                Mapping structural opportunities, technology lifecycles, and competitive moats in the private aerospace supply chain.
                            </p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[#2E2E2E] grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs text-neutral-500">
                        <div>
                            <div className="text-neutral-600">DATE</div>
                            <div className="text-text-primary font-medium">Q3 2026</div>
                        </div>
                        <div>
                            <div className="text-neutral-600">ANALYSTS</div>
                            <div className="text-text-primary font-medium">FPI Research Team</div>
                        </div>
                        <div>
                            <div className="text-neutral-600">EST. READ TIME</div>
                            <div className="text-text-primary font-medium">42 Minutes</div>
                        </div>
                        <div>
                            <div className="text-neutral-600">PAGES</div>
                            <div className="text-text-primary font-medium">38 Slides</div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            name: "2. Valuation Chart",
            icon: BarChart2,
            content: (
                <div className="flex flex-col justify-between h-full p-8 border border-white/10 rounded-2xl bg-bg-deep font-sans">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-[#2E2E2E] pb-3">
                            <span className="text-xs font-mono text-gold font-bold uppercase tracking-wider">Discounted Cash Flow Model</span>
                            <span className="text-xs font-mono text-neutral-500">REVERSE DCF ANALYSIS</span>
                        </div>
                        <p className="text-xs text-neutral-400 font-light max-w-lg">
                            We model implied growth rates. What cash flow growth must the business achieve to justify the current market cap?
                        </p>
                    </div>

                    {/* Interactive Mock SVG Chart */}
                    <div className="my-6 h-48 w-full border border-[#2E2E2E] rounded-xl bg-black/20 relative flex items-end p-4 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-gold/5 via-transparent to-transparent pointer-events-none" />
                        <svg className="w-full h-full" viewBox="0 0 500 150">
                            {/* Grid Lines */}
                            <line x1="0" y1="30" x2="500" y2="30" stroke="#2E2E2E" strokeWidth="0.5" strokeDasharray="4" />
                            <line x1="0" y1="75" x2="500" y2="75" stroke="#2E2E2E" strokeWidth="0.5" strokeDasharray="4" />
                            <line x1="0" y1="120" x2="500" y2="120" stroke="#2E2E2E" strokeWidth="0.5" strokeDasharray="4" />
                            
                            {/* Curve */}
                            <path 
                                d="M 0 130 C 50 120, 100 110, 150 90 C 200 70, 250 65, 300 45 C 350 25, 450 15, 500 10" 
                                fill="none" 
                                stroke="#F5B800" 
                                strokeWidth="2.5" 
                            />
                            
                            {/* Fill Area Under Curve */}
                            <path 
                                d="M 0 130 C 50 120, 100 110, 150 90 C 200 70, 250 65, 300 45 C 350 25, 450 15, 500 10 L 500 150 L 0 150 Z" 
                                fill="url(#chartGradient)" 
                                opacity="0.08" 
                            />

                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#F5B800" />
                                    <stop offset="100%" stopColor="#F5B800" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Interactive Node Labels */}
                        <div className="absolute top-4 left-6 px-3 py-1 bg-black/60 border border-white/10 rounded-md backdrop-blur text-[10px] font-mono">
                            <span className="text-neutral-400">Implied CAGR:</span> <span className="text-gold font-bold">14.2%</span>
                        </div>
                        <div className="absolute bottom-4 right-6 px-3 py-1 bg-black/60 border border-white/10 rounded-md backdrop-blur text-[10px] font-mono">
                            <span className="text-neutral-400">Margin of Safety:</span> <span className="text-emerald-400 font-bold">28%</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono text-neutral-500">
                        <span>DATA TIMELINE: 2026 - 2036Implied</span>
                        <span className="text-text-primary">SCENARIO: BASE CASE</span>
                    </div>
                </div>
            )
        },
        {
            name: "3. Porter's Five Forces",
            icon: Star,
            content: (
                <div className="flex flex-col justify-between h-full p-8 border border-white/10 rounded-2xl bg-bg-deep font-sans">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-[#2E2E2E] pb-3">
                            <span className="text-xs font-mono text-gold font-bold uppercase tracking-wider">Moat Sustainability Grid</span>
                            <span className="text-xs font-mono text-neutral-500">PORTER'S 5 FORCES</span>
                        </div>
                        <p className="text-xs text-neutral-400 font-light">
                            Analyzing structural barriers. Does the company own their pricing, or are they dependent on major buyers?
                        </p>
                    </div>

                    {/* Porter's Grid Mock */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
                        <div className="p-3 border border-[#2E2E2E] rounded-lg bg-black/20 space-y-1">
                            <div className="text-[10px] font-mono text-neutral-500 uppercase">Supplier Power</div>
                            <div className="text-xs font-semibold text-text-primary">LOW</div>
                            <div className="text-[9px] text-neutral-400 font-light">High sourcing diversification</div>
                        </div>
                        <div className="p-3 border border-[#2E2E2E] rounded-lg bg-black/20 space-y-1">
                            <div className="text-[10px] font-mono text-neutral-500 uppercase">Buyer Power</div>
                            <div className="text-xs font-semibold text-gold">MEDIUM</div>
                            <div className="text-[9px] text-neutral-400 font-light">High reliance on govt agency contracts</div>
                        </div>
                        <div className="p-3 border border-[#2E2E2E] rounded-lg bg-black/20 space-y-1">
                            <div className="text-[10px] font-mono text-neutral-500 uppercase">Substitution Risk</div>
                            <div className="text-xs font-semibold text-text-primary">NEGLIGIBLE</div>
                            <div className="text-[9px] text-neutral-400 font-light">Proprietary launch payloads</div>
                        </div>
                        <div className="p-3 border border-[#2E2E2E] rounded-lg bg-black/20 space-y-1">
                            <div className="text-[10px] font-mono text-neutral-500 uppercase">New Entrants Threat</div>
                            <div className="text-xs font-semibold text-text-primary">VERY LOW</div>
                            <div className="text-[9px] text-neutral-400 font-light">Extreme R&D / regulatory barriers</div>
                        </div>
                        <div className="p-3 border border-[#2E2E2E] rounded-lg bg-black/20 space-y-1">
                            <div className="text-[10px] font-mono text-neutral-500 uppercase">Industry Rivalry</div>
                            <div className="text-xs font-semibold text-text-primary">MODERATE</div>
                            <div className="text-[9px] text-neutral-400 font-light">3 main private players globally</div>
                        </div>
                        <div className="p-3 border border-[#2E2E2E] rounded-lg bg-black/20 space-y-1 flex flex-col justify-center items-center">
                            <span className="text-[10px] font-mono text-gold font-bold">TOTAL MOAT INDEX</span>
                            <span className="text-sm font-extrabold text-gold">STRONG</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono text-neutral-500 pt-2">
                        <span>RATING SCALE: INTERNAL METRIC</span>
                        <span className="text-text-primary">OVERALL: HIGH BARRIER</span>
                    </div>
                </div>
            )
        },
        {
            name: "4. Financial Model",
            icon: Table,
            content: (
                <div className="flex flex-col justify-between h-full p-8 border border-white/10 rounded-2xl bg-bg-deep font-sans">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-[#2E2E2E] pb-3">
                            <span className="text-xs font-mono text-gold font-bold uppercase tracking-wider">Spreadsheet Projections</span>
                            <span className="text-xs font-mono text-neutral-500">REVENUE & CAPEX SUMMARY</span>
                        </div>
                        <p className="text-xs text-neutral-400 font-light">
                            We project financials step-by-step. In-depth model available for download in excel format.
                        </p>
                    </div>

                    {/* Table Grid */}
                    <div className="my-4 overflow-x-auto border border-[#2E2E2E] rounded-lg bg-black/20 text-[10px] font-mono no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#2E2E2E] bg-white/5">
                                    <th className="p-2 border-r border-[#2E2E2E] text-neutral-500">Metric (₹ Cr)</th>
                                    <th className="p-2 border-r border-[#2E2E2E]">FY24</th>
                                    <th className="p-2 border-r border-[#2E2E2E]">FY25</th>
                                    <th className="p-2 border-r border-[#2E2E2E] text-gold">FY26E</th>
                                    <th className="p-2">FY27E</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-[#2E2E2E]/60">
                                    <td className="p-2 border-r border-[#2E2E2E] font-semibold text-text-primary">Net Revenue</td>
                                    <td className="p-2 border-r border-[#2E2E2E] text-neutral-400">420.0</td>
                                    <td className="p-2 border-r border-[#2E2E2E] text-neutral-400">580.0</td>
                                    <td className="p-2 border-r border-[#2E2E2E] text-gold font-semibold">820.0</td>
                                    <td className="p-2 text-neutral-400">1,120.0</td>
                                </tr>
                                <tr className="border-b border-[#2E2E2E]/60">
                                    <td className="p-2 border-r border-[#2E2E2E] font-semibold text-text-primary">EBITDA Margin</td>
                                    <td className="p-2 border-r border-[#2E2E2E] text-neutral-400">18.5%</td>
                                    <td className="p-2 border-r border-[#2E2E2E] text-neutral-400">20.2%</td>
                                    <td className="p-2 border-r border-[#2E2E2E] text-gold font-semibold">22.5%</td>
                                    <td className="p-2 text-neutral-400">24.0%</td>
                                </tr>
                                <tr className="border-b border-[#2E2E2E]/60">
                                    <td className="p-2 border-r border-[#2E2E2E] font-semibold text-text-primary">Capex</td>
                                    <td className="p-2 border-r border-[#2E2E2E] text-neutral-400">80.0</td>
                                    <td className="p-2 border-r border-[#2E2E2E] text-neutral-400">120.0</td>
                                    <td className="p-2 border-r border-[#2E2E2E] text-gold font-semibold">150.0</td>
                                    <td className="p-2 text-neutral-400">80.0</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-r border-[#2E2E2E] font-semibold text-text-primary">ROCE</td>
                                    <td className="p-2 border-r border-[#2E2E2E] text-neutral-400">12.1%</td>
                                    <td className="p-2 border-r border-[#2E2E2E] text-neutral-400">14.8%</td>
                                    <td className="p-2 border-r border-[#2E2E2E] text-gold font-semibold">18.5%</td>
                                    <td className="p-2 text-neutral-400">21.0%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono text-neutral-500 pt-2">
                        <span>COMPOUNDING BASE CASE MODEL</span>
                        <span className="text-text-primary">ROCE EXPANDING</span>
                    </div>
                </div>
            )
        },
        {
            name: "5. Investment Thesis",
            icon: ShieldAlert,
            content: (
                <div className="flex flex-col justify-between h-full p-8 border border-white/10 rounded-2xl bg-bg-deep relative overflow-hidden font-sans">
                    {/* The Lock / Blur Overlay */}
                    <div className="absolute inset-0 bg-bg-deep/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
                            <Lock className="w-5 h-5 text-gold" />
                        </div>
                        <h4 className="text-lg font-bold text-text-primary tracking-tight mb-2">
                            Unlock Full Institutional Research
                        </h4>
                        <p className="text-xs text-neutral-400 max-w-sm font-light leading-relaxed mb-6">
                            This report contains 30 more pages covering valuation ranges, management interview transcripts, Scuttlebutt notes, and our final recommendation.
                        </p>
                        
                        <div className="p-0.5 rounded-full bg-[#2E2E2E]/80 border border-white/10 hover:border-gold/30 transition-all duration-300">
                            <button
                                onClick={() => {
                                    const pricingEl = document.getElementById("pricing")
                                    pricingEl?.scrollIntoView({ behavior: "smooth" })
                                }}
                                className="flex items-center gap-2 bg-gold hover:bg-[#E0A800] text-bg-deep font-bold px-6 py-2.5 rounded-full text-xs transition-all active:scale-[0.98] cursor-pointer"
                            >
                                <span>Unlock Membership</span>
                                <ArrowRight className="w-3.5 h-3.5 text-bg-deep" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 filter blur-[2px] select-none">
                        <div className="flex justify-between items-center border-b border-[#2E2E2E] pb-3">
                            <span className="text-xs font-mono text-gold font-bold uppercase tracking-wider">Investment Thesis</span>
                            <span className="text-xs font-mono text-neutral-500">FINAL RECOMMENDATION</span>
                        </div>
                        <div className="space-y-4 pt-4 text-xs text-neutral-400 leading-relaxed font-light">
                            <p className="font-semibold text-text-primary">
                                Executive Summary:
                            </p>
                            <p>
                                Based on our first-principles valuation, the company is implied to compound revenue at 18% over the next 5 years. However, our management call suggests that the public has underestimated the capacity expansion in Launch Vehicle Payloads which is set to triple...
                            </p>
                            <p>
                                Key Moat Driver: The custom aerospace payload patent operates as an absolute switching cost, as rewriting flight control software takes 4 years for any rival provider...
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono text-neutral-500 filter blur-[2px] select-none">
                        <span>ANALYSIS COMPLETED</span>
                        <span className="text-text-primary">RATING: UNLOCKED FOR MEMBERS</span>
                    </div>
                </div>
            )
        }
    ]

    return (
        <section className="py-24 md:py-32 bg-[#1E1E1E] border-b border-[#2E2E2E] relative overflow-hidden">
            <div className="container max-w-7xl px-6 mx-auto relative z-10">
                
                {/* Header */}
                <div className="max-w-3xl mb-16 md:mb-20">
                    <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                        Proof of Quality
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mt-4 leading-tight">
                        Inside a Research Report.
                    </h2>
                    <p className="text-neutral-400 mt-4 text-lg font-light">
                        We don't just write reports—we build institutional assets. Select a page below to view how we structure our research.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    
                    {/* Left Page tabs - 4 columns */}
                    <div className="lg:col-span-4 flex flex-col gap-2">
                        {pages.map((page, idx) => {
                            const Icon = page.icon
                            const isActive = activeTab === idx
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTab(idx)}
                                    className={`w-full text-left px-5 py-4 rounded-xl border flex items-center gap-4 transition-all duration-300 cursor-pointer ${
                                        isActive 
                                            ? "bg-[#2E2E2E]/80 border-gold/30 text-gold shadow-md" 
                                            : "bg-bg-deep/40 border-white/5 text-neutral-400 hover:text-text-primary hover:bg-bg-deep/70"
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-gold" : "text-neutral-500"}`} />
                                    <span className="text-sm font-medium tracking-tight">{page.name}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Right Screen Showcase - 8 columns */}
                    <div className="lg:col-span-8">
                        <div className="p-2 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur shadow-2xl min-h-[420px] flex flex-col justify-stretch">
                            <div className="relative flex-1 flex flex-col justify-stretch min-h-[400px]">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="h-full flex flex-col justify-stretch"
                                    >
                                        {pages[activeTab].content}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    )
}
