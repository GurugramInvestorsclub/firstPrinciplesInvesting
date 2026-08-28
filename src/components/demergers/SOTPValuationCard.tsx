"use client"

import React from "react"
import { ExternalLink, FileSpreadsheet, Layers } from "lucide-react"

interface SOTPValuationCardProps {
    companyName?: string
    demergedEntity?: string
    symbol?: string
    newTicker?: string
    valuation?: string
    stageRaw?: string
    recordDate?: string
    exchangeLink?: string
    sheetId?: string
    gid?: string
}

export function SOTPValuationCard({
    companyName,
    demergedEntity,
    sheetId = "1AXHfMMJT8kJHDyyMUltsaKISW-JvryacBI6McPlctiY",
    gid = "1568933591",
}: SOTPValuationCardProps) {
    const embedUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/preview`
    const directUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=${gid}`

    return (
        <div className="space-y-4 p-4 sm:p-5 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/[0.04] via-black/60 to-black/80 shadow-xl font-sans">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gold/15 text-gold border border-gold/30">
                        <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                            Sum of the Parts (SOTP) Valuation Sheet
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-400 block">
                            {companyName ? `Live Sheet • ${companyName}` : "Direct Live Embedded Valuation Model"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Embedded Live Google Sheet iframe */}
            <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-[#121212]">
                <iframe
                    src={embedUrl}
                    title="Sum of the Parts (SOTP) Valuation Sheet"
                    className="w-full h-[480px] border-0"
                    loading="lazy"
                />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 px-1">
                <span>Live Interactive Embed • Sum of the Parts Spreadsheet</span>
                <span className="text-gold">First Principles Research</span>
            </div>
        </div>
    )
}

