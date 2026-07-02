"use client"

import { Calendar, Search, Users, FileText } from "lucide-react"

export function RoadmapSection() {
    const roadmapItems = [
        {
            month: "July 2026",
            title: "Railway Infrastructure & Sub-systems",
            status: "Management Call Phase",
            details: "Analyzing indigenization mandates, railway signaling vendors, and coach shell manufacturers.",
            icon: Users,
            color: "border-gold/30 text-gold",
            progress: "75%"
        },
        {
            month: "August 2026",
            title: "Hydrogen Economy & Fuel Cells",
            status: "Scuttlebutt & Supplier Audit",
            details: "Mapping electrolyzer component suppliers, storage tank carbon-fiber linkages, and pilot plants.",
            icon: Search,
            color: "border-neutral-700 text-neutral-400",
            progress: "45%"
        },
        {
            month: "September 2026",
            title: "Specialty APIs & Key Starting Materials",
            status: "Data Compilation Phase",
            details: "Sifting through customs import data for API sourcing, pricing power dynamics, and Chinese supply dependencies.",
            icon: FileText,
            color: "border-neutral-700 text-neutral-400",
            progress: "20%"
        }
    ]

    return (
        <section className="py-24 md:py-32 bg-bg-deep border-b border-[#2E2E2E] overflow-hidden">
            <div className="container max-w-7xl px-6 mx-auto relative z-10">
                
                {/* Header */}
                <div className="max-w-3xl mb-16 md:mb-24">
                    <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                        Active Pipeline
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mt-4 leading-tight">
                        The Research Roadmap.
                    </h2>
                    <p className="text-neutral-400 mt-4 text-lg font-light">
                        Our research is continuous. See what industries we are currently mapping to position your knowledge before the broader market.
                    </p>
                </div>

                {/* Timeline Grid */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                    {roadmapItems.map((item, idx) => {
                        const Icon = item.icon
                        return (
                            <div 
                                key={idx}
                                className="p-2 rounded-[2rem] bg-white/5 border border-white/5 shadow-lg flex flex-col justify-stretch"
                            >
                                <div className="rounded-[1.8rem] bg-[#1E1E1E] border border-white/5 p-8 flex flex-col justify-between h-full relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4">
                                            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                                                <Calendar className="w-3.5 h-3.5 text-gold" />
                                                <span>{item.month}</span>
                                            </div>
                                            <span className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-neutral-400">
                                                STAGE {idx + 1}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-[10px] font-mono text-gold uppercase tracking-wider">
                                                {item.status}
                                            </span>
                                            <h3 className="text-lg font-bold text-text-primary tracking-tight leading-snug">
                                                {item.title}
                                            </h3>
                                        </div>

                                        <p className="text-xs text-neutral-400 leading-relaxed font-light">
                                            {item.details}
                                        </p>
                                    </div>

                                    {/* Progress Indicator */}
                                    <div className="mt-8 space-y-2">
                                        <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                                            <span>COMPILATION PROGRESS</span>
                                            <span className="text-text-primary">{item.progress}</span>
                                        </div>
                                        <div className="h-1 w-full bg-[#2E2E2E] rounded-full overflow-hidden">
                                            <div className="h-full bg-gold rounded-full" style={{ width: item.progress }} />
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
