"use client"

import React, { useState } from "react"
import { Calculator, TrendingUp, DollarSign, Layers, ArrowUpRight, ShieldCheck, HelpCircle } from "lucide-react"

export interface SOTPSegment {
    name: string
    metricName: string // e.g. FY26E EBITDA or Revenue
    metricValue: string // e.g. ₹450 Cr
    multiple: number // e.g. 12.0x
    impliedEV: string // e.g. ₹5,400 Cr
    perShareValue: number // e.g. ₹280
}

interface SOTPValuationCardProps {
    companyName: string
    demergedEntity: string
    symbol?: string
    currentPrice?: number
    segments?: SOTPSegment[]
}

export function SOTPValuationCard({ companyName, demergedEntity, symbol, currentPrice = 450, segments: initialSegments }: SOTPValuationCardProps) {
    // Generate default segment models tailored to company
    const defaultSegments: SOTPSegment[] = initialSegments || getSampleSegments(companyName, demergedEntity)
    const [multipleMultiplier, setMultipleMultiplier] = useState<number>(1.0) // 1.0 = Base Case

    const adjustedSegments = defaultSegments.map((seg) => ({
        ...seg,
        adjustedMultiple: Number((seg.multiple * multipleMultiplier).toFixed(1)),
        adjustedPerShare: Math.round(seg.perShareValue * multipleMultiplier),
    }))

    const totalImpliedSOTP = adjustedSegments.reduce((acc, s) => acc + s.adjustedPerShare, 0)
    const impliedUpsidePct = Math.round(((totalImpliedSOTP - currentPrice) / currentPrice) * 100)

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
                            SOTP Valuation Breakdown
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-400">Sum-Of-The-Parts Model</span>
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">Implied Target</span>
                    <span className="text-lg font-mono font-bold text-gold">₹{totalImpliedSOTP} / sh</span>
                </div>
            </div>

            {/* Interactive Valuation Multiple Slider */}
            <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-300">Valuation Case Scenario:</span>
                    <span className="font-bold text-gold">
                        {multipleMultiplier < 0.95 ? "Bear Case (0.8x)" : multipleMultiplier > 1.05 ? "Bull Case (1.2x)" : "Base Case (1.0x)"}
                    </span>
                </div>
                <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.05"
                    value={multipleMultiplier}
                    onChange={(e) => setMultipleMultiplier(parseFloat(e.target.value))}
                    className="w-full accent-gold bg-white/10 h-1.5 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>Bear (0.8x)</span>
                    <span>Base (1.0x)</span>
                    <span>Bull (1.2x)</span>
                </div>
            </div>

            {/* Segment Breakdown Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                <table className="w-full text-left text-xs font-mono">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] text-gold uppercase tracking-wider">
                            <th className="p-3">Business Segment</th>
                            <th className="p-3 text-center">Metric</th>
                            <th className="p-3 text-center">Multiple</th>
                            <th className="p-3 text-right">Value / Share</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-neutral-200">
                        {adjustedSegments.map((seg, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition">
                                <td className="p-3 font-semibold text-white">
                                    {idx + 1}. {seg.name}
                                </td>
                                <td className="p-3 text-center text-neutral-300">{seg.metricValue}</td>
                                <td className="p-3 text-center font-bold text-gold">{seg.adjustedMultiple}x</td>
                                <td className="p-3 text-right font-bold text-emerald-400">₹{seg.adjustedPerShare}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary Footer */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-gold/20 bg-gold/10 text-xs font-mono">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-neutral-300">Implied Arbitrage / Upside:</span>
                </div>
                <span className={`font-bold ${impliedUpsidePct >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                    {impliedUpsidePct >= 0 ? `+${impliedUpsidePct}%` : `${impliedUpsidePct}%`}
                </span>
            </div>
        </div>
    )
}

function getSampleSegments(company: string, demerged: string): SOTPSegment[] {
    const c = company.toLowerCase()
    if (c.includes("heg")) {
        return [
            { name: "HEG Core Graphite Electrode", metricName: "FY26E EBITDA", metricValue: "₹650 Cr", multiple: 10.0, impliedEV: "₹6,500 Cr", perShareValue: 420 },
            { name: "HEG Graphite Ltd (New Entity)", metricName: "FY26E EV", metricValue: "₹2,800 Cr", multiple: 8.5, impliedEV: "₹2,800 Cr", perShareValue: 180 },
        ]
    }
    if (c.includes("india glycols")) {
        return [
            { name: "Bio-Chemicals & Spirits Business", metricName: "FY26E EBITDA", metricValue: "₹380 Cr", multiple: 11.0, impliedEV: "₹4,180 Cr", perShareValue: 310 },
            { name: "Ennature Bio Pharma (Spin-off)", metricName: "FY26E EBITDA", metricValue: "₹180 Cr", multiple: 14.0, impliedEV: "₹2,520 Cr", perShareValue: 210 },
        ]
    }
    if (c.includes("triveni")) {
        return [
            { name: "Triveni Sugar & Ethanol Core", metricName: "FY26E EBITDA", metricValue: "₹520 Cr", multiple: 8.0, impliedEV: "₹4,160 Cr", perShareValue: 240 },
            { name: "Triveni Power Transmission (TPTL)", metricName: "FY26E EBITDA", metricValue: "₹240 Cr", multiple: 16.0, impliedEV: "₹3,840 Cr", perShareValue: 210 },
        ]
    }
    if (c.includes("piccadily")) {
        return [
            { name: "Piccadily Distillery & Spirits Core", metricName: "FY26E EBITDA", metricValue: "₹210 Cr", multiple: 15.0, impliedEV: "₹3,150 Cr", perShareValue: 380 },
            { name: "Piccadily Food & Essential (PFEL)", metricName: "FY26E EBITDA", metricValue: "₹95 Cr", multiple: 10.0, impliedEV: "₹950 Cr", perShareValue: 140 },
        ]
    }
    return [
        { name: `${company} Core Business`, metricName: "FY26E EBITDA", metricValue: "₹500 Cr", multiple: 10.0, impliedEV: "₹5,000 Cr", perShareValue: 350 },
        { name: demerged, metricName: "FY26E EBITDA", metricValue: "₹250 Cr", multiple: 12.0, impliedEV: "₹3,000 Cr", perShareValue: 200 },
    ]
}
