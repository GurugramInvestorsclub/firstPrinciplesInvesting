"use client"

import { useState } from "react"
import { Layers, Compass, ArrowRight, TrendingUp, Cpu, Landmark } from "lucide-react"
import { mockIndustries, mockReports, mockCompanies } from "./mockData"

interface IndustriesViewProps {
    onSelectReport: (slug: string) => void
    onSelectCompany: (id: string) => void
}

export function IndustriesView({ onSelectReport, onSelectCompany }: IndustriesViewProps) {
    const [selectedIndId, setSelectedIndId] = useState<string | null>(null)

    const selectedIndustry = mockIndustries.find(i => i.id === selectedIndId)

    if (selectedIndustry) {
        // Find reports and companies mapped to this industry
        const relatedReports = mockReports.filter(r => r.industry.toLowerCase().includes(selectedIndustry.name.toLowerCase().split(" ")[0].toLowerCase()))
        const relatedCompanies = mockCompanies.filter(c => c.industry.toLowerCase().includes(selectedIndustry.name.toLowerCase().split(" ")[0].toLowerCase()))

        return (
            <div className="space-y-10 text-left">
                {/* Back Button */}
                <button
                    onClick={() => setSelectedIndId(null)}
                    className="flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-gold transition-colors cursor-pointer"
                >
                    <span>← Back to Hubs</span>
                </button>

                {/* Industry Header */}
                <div className="border-b border-[#2E2E2E] pb-6 space-y-3">
                    <span className="text-xs font-mono text-gold font-bold uppercase tracking-wider bg-gold/10 px-3 py-1 rounded-full">
                        ACTIVE SECTOR HUB
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight font-sans">
                        {selectedIndustry.name}
                    </h1>
                    <p className="text-sm text-neutral-400 font-light max-w-3xl leading-relaxed">
                        {selectedIndustry.overview}
                    </p>
                </div>

                {/* Industry Breakdown Panels */}
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Ecosystem Map (8 columns) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Supply Chain / Value Map */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-6">
                            <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                                <Landmark className="w-4 h-4 text-gold" />
                                <span>Value Chain Landscape Mappings</span>
                            </h3>

                            <div className="space-y-4">
                                {selectedIndustry.map.map((tier, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-bg-deep border border-[#2E2E2E] flex flex-col md:flex-row justify-between gap-4">
                                        <span className="font-mono text-xs text-gold font-bold shrink-0">{tier.segment}</span>
                                        <div className="flex flex-wrap gap-2">
                                            {tier.players.map((player, pIdx) => {
                                                const matchCompany = mockCompanies.find(c => c.name.toLowerCase().includes(player.toLowerCase().split(" ")[0]))
                                                return (
                                                    <button
                                                        key={pIdx}
                                                        onClick={() => {
                                                            if (matchCompany) {
                                                                onSelectCompany(matchCompany.id)
                                                            } else {
                                                                alert(`Currently mapping ${player} details. Stay tuned.`)
                                                            }
                                                        }}
                                                        className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-xs text-text-primary hover:border-gold/30 hover:text-gold transition-colors font-sans cursor-pointer"
                                                    >
                                                        {player} {matchCompany ? "↗" : ""}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Regulatory / Industry Developments */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4">
                            <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                                <TrendingUp className="w-4 h-4 text-gold" />
                                <span>Recent Macro Developments</span>
                            </h3>
                            <ul className="space-y-4">
                                {selectedIndustry.developments.map((dev, idx) => (
                                    <li key={idx} className="text-xs text-neutral-300 font-light leading-relaxed flex items-start gap-2.5">
                                        <span className="text-gold font-mono font-bold mt-0.5">•</span>
                                        <span>{dev}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right: Reading paths & Related reports (4 columns) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Recommended Reading Path */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4">
                            <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                                <Compass className="w-4 h-4 text-gold" />
                                <span>Curated Reading Path</span>
                            </h3>
                            <ol className="space-y-4">
                                {selectedIndustry.readingPath.map((path, idx) => (
                                    <li key={idx} className="flex gap-3 text-xs font-mono text-neutral-400">
                                        <span className="text-gold font-bold">0{idx + 1}.</span>
                                        <span className="text-left leading-relaxed">{path}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Associated Memos */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4">
                            <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                                <Cpu className="w-4 h-4 text-gold" />
                                <span>Relevant Sector Memos</span>
                            </h3>
                            <div className="space-y-3">
                                {relatedReports.length > 0 ? (
                                    relatedReports.map(rep => (
                                        <button
                                            key={rep.id}
                                            onClick={() => onSelectReport(rep.slug)}
                                            className="w-full text-left p-3 rounded-xl bg-bg-deep border border-[#2E2E2E] hover:border-gold/20 hover:text-gold transition-all text-xs font-semibold text-text-primary flex justify-between items-center cursor-pointer group"
                                        >
                                            <span className="truncate pr-4">{rep.title}</span>
                                            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-gold shrink-0 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-neutral-500 text-xs italic">No specific memos found for this segment.</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary tracking-tight font-sans text-left">
                    Industry Hubs
                </h1>
                <p className="text-sm text-neutral-400 font-light mt-1 text-left">
                    Dissecting complex economic structures. Select an industry knowledge cluster to map raw value networks, companies, and developments.
                </p>
            </div>

            {/* Hubs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockIndustries.map((ind) => (
                    <div 
                        key={ind.id}
                        onClick={() => setSelectedIndId(ind.id)}
                        className="p-1 rounded-[1.8rem] bg-white/5 border border-white/5 shadow-md hover:border-gold/20 hover:bg-white/10 transition-all duration-300 cursor-pointer group flex flex-col justify-stretch"
                    >
                        <div className="rounded-[1.6rem] bg-bg-deep border border-[#2E2E2E] p-6 flex flex-col justify-between h-full min-h-[200px] text-left">
                            <div className="space-y-4">
                                <div className="p-2.5 rounded-xl bg-[#1E1E1E] text-gold border border-white/5 w-fit">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-bold text-text-primary group-hover:text-gold transition-colors">
                                    {ind.name}
                                </h3>
                                <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                                    {ind.overview}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-[#2E2E2E]/60 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                                <span>{ind.map.length} VALUE SEGMENTS MAPPED</span>
                                <span className="text-gold group-hover:underline">Explore Hub ↗</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}
