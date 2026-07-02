"use client"

import { useState } from "react"
import { Award, ShieldAlert, BarChart3, TrendingUp, Layers, Calendar, ArrowRight } from "lucide-react"
import { mockCompanies, mockReports } from "./mockData"

interface CompaniesViewProps {
    selectedCompanyId?: string
    onSelectReport: (slug: string) => void
    onCloseCompany?: () => void
}

export function CompaniesView({ selectedCompanyId, onSelectReport, onCloseCompany }: CompaniesViewProps) {
    const [activeCompanyId, setActiveCompanyId] = useState<string | null>(selectedCompanyId || null)

    // Sync selectedCompanyId if passed via props
    const companyId = selectedCompanyId || activeCompanyId
    const selectedCompany = mockCompanies.find(c => c.id === companyId)

    const handleBack = () => {
        if (onCloseCompany) {
            onCloseCompany()
        }
        setActiveCompanyId(null)
    }

    if (selectedCompany) {
        // Find reports relevant to this company
        const relatedReports = mockReports.filter(r => r.bodyMarkdown.toLowerCase().includes(selectedCompany.name.toLowerCase().split(" ")[0]))

        return (
            <div className="space-y-10 text-left">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-gold transition-colors cursor-pointer"
                >
                    <span>← Back to Directory</span>
                </button>

                {/* Company Title Header */}
                <div className="border-b border-[#2E2E2E] pb-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-2">
                            <span className="text-xs font-mono text-gold font-bold uppercase tracking-wider bg-gold/10 px-3 py-1 rounded-full">
                                {selectedCompany.ticker} · {selectedCompany.industry}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight font-sans">
                                {selectedCompany.name}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 font-mono text-xs text-emerald-400 font-bold">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>CONVICTION: HIGH</span>
                        </div>
                    </div>
                    <p className="text-sm text-neutral-400 font-light max-w-3xl leading-relaxed">
                        {selectedCompany.summary}
                    </p>
                </div>

                {/* Main Content Layout */}
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Thesis, Updates, Commentary (8 columns) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Investment Thesis */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4">
                            <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                                <Award className="w-4 h-4 text-gold" />
                                <span>Core Investment Thesis</span>
                            </h3>
                            <p className="text-sm text-neutral-300 font-light leading-relaxed">
                                {selectedCompany.thesis}
                            </p>
                        </div>

                        {/* Quarterly Update Tracking */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-6">
                            <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                                <Calendar className="w-4 h-4 text-gold" />
                                <span>Quarterly Update Tracking Ledger</span>
                            </h3>
                            
                            <div className="space-y-6">
                                {selectedCompany.updates.map((up, idx) => (
                                    <div key={idx} className="relative pl-6 border-l-2 border-neutral-700 space-y-1.5">
                                        <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-gold" />
                                        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                                            <span>{up.quarter} REPORT</span>
                                            <span>{up.date}</span>
                                        </div>
                                        <p className="text-xs text-neutral-300 font-light leading-relaxed">
                                            {up.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Management Commentary */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4">
                            <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                                <Layers className="w-4 h-4 text-gold" />
                                <span>Management Call commentary</span>
                            </h3>
                            <blockquote className="border-l-4 border-gold/30 pl-4 italic text-sm text-neutral-400 font-light leading-relaxed">
                                "{selectedCompany.commentary}"
                            </blockquote>
                        </div>

                        {/* Conviction Timeline Evolution */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-6">
                            <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                                <TrendingUp className="w-4 h-4 text-gold" />
                                <span>Conviction Timeline Evolution</span>
                            </h3>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                {selectedCompany.timeline.map((time, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-bg-deep border border-[#2E2E2E] space-y-2">
                                        <div className="flex justify-between items-center text-xs font-mono">
                                            <span className="text-gold font-bold">{time.year}</span>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                time.conviction === "High" ? "bg-emerald-500/10 text-emerald-400" :
                                                time.conviction === "Medium" ? "bg-amber-500/10 text-amber-400" :
                                                "bg-rose-500/10 text-rose-400"
                                            }`}>{time.conviction} Conviction</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-text-primary">{time.title}</h4>
                                        <p className="text-[10px] text-neutral-400 font-light leading-relaxed">{time.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right: Valuations, Risks, Reports (4 columns) */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Valuation Sensitivity Table */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4">
                            <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                                <BarChart3 className="w-4 h-4 text-gold" />
                                <span>Valuation Sensitivity</span>
                            </h3>
                            <div className="space-y-4 text-xs font-mono">
                                {selectedCompany.valuation.map((val, idx) => (
                                    <div key={idx} className="space-y-1 pb-3 border-b border-[#2E2E2E]/60 last:border-b-0 last:pb-0">
                                        <span className="text-neutral-500 uppercase text-[9px]">{val.metric}</span>
                                        <div className="grid grid-cols-3 text-center gap-1">
                                            <div className="bg-bg-deep p-1.5 rounded">
                                                <div className="text-[8px] text-neutral-500">BEAR</div>
                                                <div className="text-rose-400 font-bold">{val.bear}</div>
                                            </div>
                                            <div className="bg-bg-deep p-1.5 rounded border border-gold/10">
                                                <div className="text-[8px] text-gold">BASE</div>
                                                <div className="text-gold font-bold">{val.base}</div>
                                            </div>
                                            <div className="bg-bg-deep p-1.5 rounded">
                                                <div className="text-[8px] text-neutral-500">BULL</div>
                                                <div className="text-emerald-400 font-bold">{val.bull}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Risks & Vulnerabilities */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4">
                            <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                                <ShieldAlert className="w-4 h-4 text-gold" />
                                <span>Key Thesis Risks</span>
                            </h3>
                            <ul className="space-y-3.5 text-xs text-neutral-300 font-light leading-relaxed">
                                {selectedCompany.risks.map((risk, idx) => (
                                    <li key={idx} className="flex gap-2 items-start">
                                        <span className="text-rose-500 font-bold shrink-0">!</span>
                                        <span>{risk}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Associated Reports */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4">
                            <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                                <Layers className="w-4 h-4 text-gold" />
                                <span>Associated Memos</span>
                            </h3>
                            <div className="space-y-3">
                                {relatedReports.map(rep => (
                                    <button
                                        key={rep.id}
                                        onClick={() => onSelectReport(rep.slug)}
                                        className="w-full text-left p-3 rounded-xl bg-bg-deep border border-[#2E2E2E] hover:border-gold/20 hover:text-gold transition-all text-xs font-semibold text-text-primary flex justify-between items-center cursor-pointer group"
                                    >
                                        <span className="truncate pr-4">{rep.title}</span>
                                        <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-gold shrink-0 transition-transform group-hover:translate-x-1" />
                                    </button>
                                ))}
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
                    Company Directory
                </h1>
                <p className="text-sm text-neutral-400 font-light mt-1 text-left">
                    Living knowledge pages for tracked businesses. These are not static reports, but evolving theses monitored quarter-by-quarter.
                </p>
            </div>

            {/* List Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockCompanies.map((company) => (
                    <div 
                        key={company.id}
                        onClick={() => setActiveCompanyId(company.id)}
                        className="p-1 rounded-[1.8rem] bg-white/5 border border-white/5 shadow-md hover:border-gold/20 hover:bg-white/10 transition-all duration-300 cursor-pointer group flex flex-col justify-stretch"
                    >
                        <div className="rounded-[1.6rem] bg-bg-deep border border-[#2E2E2E] p-6 flex flex-col justify-between h-full min-h-[180px] text-left">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 uppercase">
                                    <span className="text-gold font-bold">{company.ticker}</span>
                                    <span>{company.industry}</span>
                                </div>
                                <h3 className="text-base font-bold text-text-primary group-hover:text-gold transition-colors">
                                    {company.name}
                                </h3>
                                <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                                    {company.summary}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-[#2E2E2E]/60 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                                <span>{company.updates.length} UPDATES LOGGED</span>
                                <span className="text-gold group-hover:underline">Explore Thesis ↗</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}
