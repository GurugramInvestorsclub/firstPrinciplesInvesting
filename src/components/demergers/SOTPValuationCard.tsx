"use client"

import React from "react"
import { Calculator, ExternalLink, Layers, ArrowUpRight } from "lucide-react"

interface SOTPValuationCardProps {
    companyName: string
    demergedEntity: string
    symbol?: string
    newTicker?: string
    valuation?: string
    stageRaw?: string
    recordDate?: string
    exchangeLink?: string
}

export function SOTPValuationCard({
    companyName,
    demergedEntity,
    symbol,
    newTicker,
    valuation,
    stageRaw,
    recordDate,
    exchangeLink,
}: SOTPValuationCardProps) {
    return (
        <div className="space-y-4 p-5 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/[0.04] via-black/60 to-black/80 shadow-xl font-sans">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gold/15 text-gold border border-gold/30">
                        <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                            Excel Valuation & SOTP Status
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-400">Direct Feed from Spreadsheet</span>
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">Valuation Record</span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-gold">{valuation || "Open SOTP →"}</span>
                </div>
            </div>

            {/* Excel Row Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <span className="text-neutral-400 block text-[10px] uppercase mb-1">Parent Company</span>
                    <span className="text-white font-bold text-sm">{companyName}</span>
                    {symbol && <span className="text-gold block text-[10px] mt-0.5">BSE Code: {symbol}</span>}
                </div>

                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <span className="text-neutral-400 block text-[10px] uppercase mb-1">Resulting Entity (New)</span>
                    <span className="text-gold font-bold text-sm">{demergedEntity}</span>
                    {newTicker && <span className="text-neutral-400 block text-[10px] mt-0.5">Status/Ticker: {newTicker}</span>}
                </div>

                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <span className="text-neutral-400 block text-[10px] uppercase mb-1">Current Stage</span>
                    <span className="text-neutral-200 font-bold">{stageRaw || "Announced"}</span>
                </div>

                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <span className="text-neutral-400 block text-[10px] uppercase mb-1">Record Date</span>
                    <span className="text-emerald-400 font-bold">{recordDate || "TBD"}</span>
                </div>
            </div>

            {/* Note / Guidance */}
            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] text-[11px] text-neutral-400 leading-relaxed font-mono flex items-start gap-2">
                <ArrowUpRight className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>
                    This valuation data is synced live from your Google Sheet. To update target prices or multiples, edit the values in your spreadsheet.
                </span>
            </div>
        </div>
    )
}
