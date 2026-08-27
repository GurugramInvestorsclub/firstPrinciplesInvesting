"use client"

import React, { useState, useMemo } from "react"
import { Search, Filter, RefreshCw, LayoutGrid, Table as TableIcon, ExternalLink, Calendar, Info, Layers, Tag, CheckCircle2, Clock, AlertCircle, LineChart } from "lucide-react"
import { DemergerRecord } from "@/lib/demergers"
import { SOTPValuationCard } from "./SOTPValuationCard"

interface DemergerTrackerTableProps {
    initialRecords: DemergerRecord[]
    lastUpdated: string
    isLive: boolean
}

export function DemergerTrackerTable({ initialRecords, lastUpdated: initialLastUpdated, isLive: initialIsLive }: DemergerTrackerTableProps) {
    const [records, setRecords] = useState<DemergerRecord[]>(initialRecords)
    const [lastUpdated, setLastUpdated] = useState<string>(initialLastUpdated)
    const [isLive, setIsLive] = useState<boolean>(initialIsLive)
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

    const [searchTerm, setSearchTerm] = useState<string>("")
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL")
    const [selectedSector, setSelectedSector] = useState<string>("ALL")
    const [viewMode, setViewMode] = useState<"table" | "grid">("table")
    const [selectedRecord, setSelectedRecord] = useState<DemergerRecord | null>(null)

    // Extract unique sectors
    const sectors = useMemo(() => {
        const set = new Set<string>()
        records.forEach((r) => {
            if (r.sector) set.add(r.sector)
        })
        return ["ALL", ...Array.from(set)]
    }, [records])

    // Filter records
    const filteredRecords = useMemo(() => {
        return records.filter((item) => {
            const matchesSearch =
                !searchTerm ||
                item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.symbol && item.symbol.toLowerCase().includes(searchTerm.toLowerCase())) ||
                item.demergedEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.sector && item.sector.toLowerCase().includes(searchTerm.toLowerCase()))

            const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus
            const matchesSector = selectedSector === "ALL" || item.sector === selectedSector

            return matchesSearch && matchesStatus && matchesSector
        })
    }, [records, searchTerm, selectedStatus, selectedSector])

    // Stats
    const stats = useMemo(() => {
        const total = records.length
        const recordDateSet = records.filter((r) => r.status === "Record Date Set").length
        const pending = records.filter((r) => r.status === "NCLT Approval Pending" || r.status === "Announced").length
        const listed = records.filter((r) => r.status === "Listed").length
        return { total, recordDateSet, pending, listed }
    }, [records])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            const res = await fetch("/api/demergers/sync", { cache: "no-store" })
            if (res.ok) {
                const data = await res.json()
                if (data.records && data.records.length > 0) {
                    setRecords(data.records)
                    setLastUpdated(data.lastUpdated || "Just now")
                    setIsLive(data.isLive)
                }
            }
        } catch (error) {
            console.error("Failed to refresh demerger tracker data:", error)
        } finally {
            setTimeout(() => setIsRefreshing(false), 600)
        }
    }

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "Listed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Listed
                    </span>
                )
            case "Record Date Set":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gold/15 text-gold border border-gold/40">
                        <Calendar className="w-3.5 h-3.5 text-gold" />
                        Record Date Set
                    </span>
                )
            case "NCLT Approval Pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        NCLT Pending
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-neutral-300 border border-slate-500/30">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {status}
                    </span>
                )
        }
    }

    return (
        <div className="space-y-8 font-sans">
            {/* Sync bar & Stats Overview */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                    <span className="text-xs font-mono text-neutral-300">
                        {isLive ? `Live Sync Active • Updated ${lastUpdated}` : `Dataset Status: ${lastUpdated}`}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                        <span>{isRefreshing ? "Syncing..." : "Refresh Sheet Data"}</span>
                    </button>
                </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent space-y-1">
                    <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Total Tracked</p>
                    <p className="text-3xl font-bold text-white font-mono">{stats.total}</p>
                </div>
                <div className="p-5 rounded-2xl border border-gold/30 bg-gold/[0.04] space-y-1">
                    <p className="text-xs font-mono text-gold uppercase tracking-wider">Record Date Set</p>
                    <p className="text-3xl font-bold text-gold font-mono">{stats.recordDateSet}</p>
                </div>
                <div className="p-5 rounded-2xl border border-blue-500/30 bg-blue-500/[0.04] space-y-1">
                    <p className="text-xs font-mono text-blue-400 uppercase tracking-wider">Approval Pending</p>
                    <p className="text-3xl font-bold text-blue-400 font-mono">{stats.pending}</p>
                </div>
                <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] space-y-1">
                    <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Completed / Listed</p>
                    <p className="text-3xl font-bold text-emerald-400 font-mono">{stats.listed}</p>
                </div>
            </div>

            {/* Filter and Control Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-bg-deep/80 backdrop-blur-xl">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search company, symbol, or spin-off entity..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold/50 transition"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-neutral-400 hidden sm:inline" />
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="py-2.5 px-3 rounded-xl border border-white/10 bg-bg-deep text-xs font-mono text-neutral-200 focus:outline-none focus:border-gold/50 cursor-pointer"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="Announced">Announced</option>
                        <option value="NCLT Approval Pending">NCLT Pending</option>
                        <option value="Record Date Set">Record Date Set</option>
                        <option value="Listed">Listed</option>
                    </select>

                    {/* Sector Filter */}
                    <select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="py-2.5 px-3 rounded-xl border border-white/10 bg-bg-deep text-xs font-mono text-neutral-200 focus:outline-none focus:border-gold/50 cursor-pointer max-w-[150px]"
                    >
                        {sectors.map((sec) => (
                            <option key={sec} value={sec}>
                                {sec === "ALL" ? "All Sectors" : sec}
                            </option>
                        ))}
                    </select>

                    {/* View Switcher */}
                    <div className="flex items-center gap-1 border border-white/10 p-1 rounded-xl bg-white/5">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-1.5 rounded-lg transition ${viewMode === "table" ? "bg-gold text-black" : "text-neutral-400 hover:text-white"}`}
                            title="Table View"
                        >
                            <TableIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-gold text-black" : "text-neutral-400 hover:text-white"}`}
                            title="Card Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Data Container */}
            {filteredRecords.length === 0 ? (
                <div className="p-12 text-center border border-white/10 rounded-2xl bg-white/[0.01]">
                    <p className="text-neutral-400 text-sm">No demerger records found matching your filters.</p>
                </div>
            ) : viewMode === "table" ? (
                /* TABLE VIEW */
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.01]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.03] text-xs font-mono text-gold uppercase tracking-wider">
                                <th className="p-4">Parent Company</th>
                                <th className="p-4">Resulting Entity (New)</th>
                                <th className="p-4">Current Stage</th>
                                <th className="p-4">Record Date</th>
                                <th className="p-4">Valuation / Disclosure</th>
                                <th className="p-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredRecords.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => setSelectedRecord(item)}
                                    className="hover:bg-white/[0.03] transition cursor-pointer group"
                                >
                                    <td className="p-4 font-semibold text-white group-hover:text-gold transition">
                                        <div className="font-bold text-sm text-white">{item.companyName}</div>
                                        {item.symbol && <span className="text-[10px] font-mono text-gold/80 block">BSE Code: {item.symbol}</span>}
                                    </td>
                                    <td className="p-4 text-neutral-200">
                                        <div className="flex items-center gap-1.5 font-medium text-xs sm:text-sm">
                                            <Layers className="w-3.5 h-3.5 text-gold/80 shrink-0" />
                                            <span>{item.demergedEntity}</span>
                                        </div>
                                        {item.newTicker && <span className="text-[10px] font-mono text-neutral-400 block pl-5">{item.newTicker}</span>}
                                    </td>
                                    <td className="p-4">
                                        {renderStatusBadge(item.status)}
                                        {item.stageRaw && (
                                            <span className="text-[10px] font-mono text-neutral-400 block mt-1">{item.stageRaw}</span>
                                        )}
                                    </td>
                                    <td className="p-4 font-mono text-xs font-semibold text-gold">
                                        {item.recordDate || "TBD"}
                                    </td>
                                    <td className="p-4 font-mono text-xs text-neutral-300">
                                        <div>{item.valuation || item.exchangeLink || "Open SOTP →"}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 rounded-lg bg-white/5 text-neutral-300 group-hover:bg-gold group-hover:text-black transition">
                                            <Info className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* GRID CARD VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecords.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedRecord(item)}
                            className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-gold/40 hover:bg-white/[0.04] transition-all cursor-pointer space-y-4 group flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    {renderStatusBadge(item.status)}
                                    {item.marketCap && <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded">{item.marketCap}</span>}
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-gold transition">{item.companyName}</h3>
                                    {item.sector && <p className="text-xs font-mono text-neutral-400">{item.sector}</p>}
                                </div>

                                <div className="p-3 rounded-xl border border-white/5 bg-black/40 space-y-1">
                                    <span className="text-[10px] font-mono uppercase text-neutral-400 block">Demerged Entity</span>
                                    <p className="text-xs font-semibold text-neutral-200">{item.demergedEntity}</p>
                                </div>

                                <div className="flex items-center justify-between text-xs font-mono">
                                    <span className="text-neutral-400">Swap Ratio:</span>
                                    <span className="font-bold text-gold">{item.ratio}</span>
                                </div>
                            </div>

                            {item.rationale && (
                                <p className="text-xs text-neutral-400 line-clamp-2 italic pt-2 border-t border-white/5">
                                    "{item.rationale}"
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* DETAIL MODAL DRAWER */}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl border border-gold/40 bg-bg-deep shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                            <div>
                                <div className="mb-2">{renderStatusBadge(selectedRecord.status)}</div>
                                <h2 className="text-2xl font-bold text-white">{selectedRecord.companyName}</h2>
                                {selectedRecord.sector && <span className="text-xs font-mono text-gold">{selectedRecord.sector}</span>}
                            </div>
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="p-2 rounded-full border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                <span className="text-xs font-mono text-neutral-400 block mb-1">Spin-off Entity</span>
                                <span className="text-sm font-bold text-white">{selectedRecord.demergedEntity}</span>
                            </div>
                            <div className="p-4 rounded-xl border border-gold/20 bg-gold/[0.05]">
                                <span className="text-xs font-mono text-gold block mb-1">Entitlement Ratio</span>
                                <span className="text-sm font-bold text-gold">{selectedRecord.ratio}</span>
                            </div>
                        </div>

                        {/* Dates Timeline */}
                        <div className="space-y-2 p-4 rounded-xl border border-white/10 bg-black/40">
                            <h4 className="text-xs font-mono text-gold uppercase tracking-wider mb-2">Key Timeline Dates</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                                <div>
                                    <span className="text-neutral-400 block">Announcement:</span>
                                    <span className="text-white">{selectedRecord.announcementDate || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-neutral-400 block">Record Date:</span>
                                    <span className="text-gold font-bold">{selectedRecord.recordDate || "TBD"}</span>
                                </div>
                                <div>
                                    <span className="text-neutral-400 block">Listing Date:</span>
                                    <span className="text-emerald-400">{selectedRecord.listingDate || "TBD"}</span>
                                </div>
                            </div>
                        </div>

                        {/* SOTP Valuation Model Section */}
                        <SOTPValuationCard
                            companyName={selectedRecord.companyName}
                            demergedEntity={selectedRecord.demergedEntity}
                            symbol={selectedRecord.symbol}
                        />

                        {/* Rationale */}
                        {selectedRecord.rationale && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-mono text-neutral-300 uppercase tracking-wider">Strategic Rationale & Catalyst</h4>
                                <p className="text-sm text-neutral-200 leading-relaxed p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                    {selectedRecord.rationale}
                                </p>
                            </div>
                        )}

                        {/* Links */}
                        {selectedRecord.exchangeLink && (
                            <div className="pt-2">
                                <a
                                    href={selectedRecord.exchangeLink}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex items-center gap-2 text-xs font-mono font-bold text-gold hover:underline"
                                >
                                    <span>View Official Exchange Filing</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
