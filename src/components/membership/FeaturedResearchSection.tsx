"use client"

import { motion } from "framer-motion"
import { Lock, Clock, BookOpen, FileText } from "lucide-react"

export function FeaturedResearchSection() {
    const reports = [
        {
            title: "EMS: Electronics Manufacturing Services",
            readTime: "45 min read",
            desc: "Dissecting assembly moats, margin levers, and working capital dynamics of major contract manufacturers.",
            sector: "EMS & Hardware",
            color: "from-blue-500/20 to-indigo-500/20"
        },
        {
            title: "Space Sector: Payload & Launch Systems",
            readTime: "42 min read",
            desc: "Mapping the private aerospace supply chain in India, technology lifecycles, and defense export linkages.",
            sector: "Aerospace",
            color: "from-amber-500/20 to-orange-500/20"
        },
        {
            title: "Defense Electronics: Radar & Avionics",
            readTime: "38 min read",
            desc: "Analyzing indigenization curves, multi-year order book execution, and supply dependencies in sonar.",
            sector: "Defense",
            color: "from-emerald-500/20 to-teal-500/20"
        },
        {
            title: "Battery Chemicals & Cathode Moats",
            readTime: "50 min read",
            desc: "Investigating chemistry pathways, mineral sourcing contracts, and capital allocation of battery chemical pioneers.",
            sector: "Chemicals",
            color: "from-purple-500/20 to-pink-500/20"
        },
        {
            title: "Nuclear Energy: The Supply Ecosystem",
            readTime: "35 min read",
            desc: "Tracking private suppliers of reactor components, heavy forgings, and regulatory entry barriers.",
            sector: "Energy",
            color: "from-rose-500/20 to-red-500/20"
        },
        {
            title: "Carbon Black & Industrial Additives",
            readTime: "32 min read",
            desc: "A first-principles look at specialty carbon segments, raw material ties, and domestic tire demand.",
            sector: "Materials",
            color: "from-cyan-500/20 to-sky-500/20"
        }
    ]

    return (
        <section id="featured-research" className="py-24 md:py-32 bg-[#1E1E1E] border-y border-[#2E2E2E] overflow-hidden">
            <div className="container max-w-7xl px-6 mx-auto relative z-10">
                
                {/* Header */}
                <div className="max-w-3xl mb-16 md:mb-24">
                    <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                        Premium Library
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mt-4 leading-tight">
                        Our Featured Research Deep Dives.
                    </h2>
                    <p className="text-neutral-400 mt-4 text-lg font-light">
                        Unlock our active archive. Below are the key sectors we have mapped. Hover over any report to inspect details, and join to unlock.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {reports.map((report, idx) => (
                        <div 
                            key={idx}
                            onClick={() => {
                                const pricingEl = document.getElementById("pricing")
                                pricingEl?.scrollIntoView({ behavior: "smooth" })
                            }}
                            className="p-2 rounded-[2rem] bg-white/5 border border-white/5 shadow-lg hover:border-gold/30 hover:bg-white/10 transition-all duration-500 cursor-pointer flex flex-col justify-stretch group relative"
                        >
                            {/* Inner Card content */}
                            <div className="rounded-[1.8rem] bg-bg-deep border border-white/5 p-6 flex flex-col justify-between h-full relative overflow-hidden">
                                {/* Blurred preview text in background */}
                                <div className="absolute inset-0 p-6 opacity-5 select-none filter blur-[4px] group-hover:blur-[2px] group-hover:opacity-10 transition-all duration-700 font-mono text-[9px] leading-relaxed text-white">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </div>

                                <div className="space-y-6 relative z-10">
                                    {/* Locked Badge & Category */}
                                    <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
                                        <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                                            {report.sector}
                                        </span>
                                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:bg-gold/10 group-hover:border-gold/30 group-hover:text-gold transition-colors duration-300">
                                            <Lock className="w-3 h-3" />
                                        </div>
                                    </div>

                                    {/* Cover Mockup/Thumbnail */}
                                    <div className={`h-36 rounded-2xl bg-gradient-to-br ${report.color} border border-white/5 flex flex-col justify-between p-4 relative overflow-hidden`}>
                                        <div className="absolute top-2 right-2 opacity-10">
                                            <FileText className="w-16 h-16 text-white" />
                                        </div>
                                        <div className="font-mono text-[9px] text-neutral-400">MEMO #{30 + idx}</div>
                                        <div className="text-sm font-bold text-text-primary tracking-tight line-clamp-2">
                                            {report.title}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2">
                                        <p className="text-xs text-neutral-400 font-light leading-relaxed">
                                            {report.desc}
                                        </p>
                                    </div>
                                </div>

                                {/* Read Time Footer */}
                                <div className="mt-8 pt-4 border-t border-[#2E2E2E] flex items-center justify-between text-[10px] font-mono text-neutral-500 relative z-10">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{report.readTime}</span>
                                    </div>
                                    <span className="text-gold group-hover:underline">Unlock Memo ↗</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
