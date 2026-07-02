"use client"

import { useState, useEffect } from "react"
import { Search, Grid, List, Clock, Filter, ArrowUpDown, Bookmark, Star } from "lucide-react"
import { mockReports } from "./mockData"

interface ResearchLibraryViewProps {
    onSelectReport: (slug: string) => void
    savedSlugs: string[]
    onToggleBookmark: (slug: string) => void
}

export function ResearchLibraryView({ onSelectReport, savedSlugs, onToggleBookmark }: ResearchLibraryViewProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [difficultyFilter, setDifficultyFilter] = useState("All")
    const [industryFilter, setIndustryFilter] = useState("All")
    const [sortBy, setSortBy] = useState("newest")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    const filteredReports = mockReports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              report.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              report.industry.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesDifficulty = difficultyFilter === "All" || report.difficulty === difficultyFilter
        const matchesIndustry = industryFilter === "All" || report.industry === industryFilter

        return matchesSearch && matchesDifficulty && matchesIndustry
    }).sort((a, b) => {
        if (sortBy === "newest") {
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        }
        if (sortBy === "readTime") {
            return parseInt(a.readTime) - parseInt(b.readTime)
        }
        return 0
    })

    const industries = ["All", ...Array.from(new Set(mockReports.map(r => r.industry)))]

    return (
        <div className="space-y-8">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary tracking-tight font-sans text-left">
                    Research Library
                </h1>
                <p className="text-sm text-neutral-400 font-light mt-1 text-left">
                    Explore our comprehensive equity research vault. Browse deep-dives by industry, complexity, or publication date.
                </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl border border-white/5 bg-[#1E1E1E] flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search memos, sectors, themes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-bg-deep border border-white/5 rounded-xl text-text-primary focus:border-gold/30 outline-none font-sans"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    
                    {/* Industry Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5 text-neutral-500" />
                        <select
                            value={industryFilter}
                            onChange={(e) => setIndustryFilter(e.target.value)}
                            className="bg-bg-deep border border-white/5 rounded-xl px-3 py-2 text-neutral-400 focus:border-gold/30 outline-none cursor-pointer"
                        >
                            {industries.map((ind) => (
                                <option key={ind} value={ind}>{ind === "All" ? "All Industries" : ind}</option>
                            ))}
                        </select>
                    </div>

                    {/* Difficulty Filter */}
                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="bg-bg-deep border border-white/5 rounded-xl px-3 py-2 text-neutral-400 focus:border-gold/30 outline-none cursor-pointer"
                    >
                        <option value="All">All Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-bg-deep border border-white/5 rounded-xl px-3 py-2 text-neutral-400 focus:border-gold/30 outline-none cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="readTime">Shortest Read</option>
                        </select>
                    </div>

                    {/* View Toggle */}
                    <div className="flex border border-[#2E2E2E] bg-bg-deep rounded-xl p-0.5">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-lg cursor-pointer ${viewMode === "grid" ? "bg-[#2E2E2E] text-gold" : "text-neutral-500 hover:text-text-primary"}`}
                            aria-label="Grid view"
                        >
                            <Grid className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-lg cursor-pointer ${viewMode === "list" ? "bg-[#2E2E2E] text-gold" : "text-neutral-500 hover:text-text-primary"}`}
                            aria-label="List view"
                        >
                            <List className="w-3.5 h-3.5" />
                        </button>
                    </div>

                </div>
            </div>

            {/* Results Grid / List */}
            {filteredReports.length > 0 ? (
                viewMode === "grid" ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReports.map((report) => {
                            const isBookmarked = savedSlugs.includes(report.slug)
                            return (
                                <div 
                                    key={report.id}
                                    className="p-1 rounded-[1.8rem] bg-white/5 border border-white/5 shadow-md hover:border-gold/20 hover:bg-white/10 transition-all duration-300 relative group flex flex-col justify-stretch"
                                >
                                    <div className="rounded-[1.6rem] bg-bg-deep border border-[#2E2E2E] p-6 flex flex-col justify-between h-full min-h-[220px]">
                                        
                                        <div className="space-y-4">
                                            {/* Top badges */}
                                            <div className="flex justify-between items-start">
                                                <span className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">
                                                    {report.industry}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onToggleBookmark(report.slug)
                                                    }}
                                                    className="w-7 h-7 rounded-full bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-gold/10 hover:text-gold flex items-center justify-center text-neutral-400 transition-colors"
                                                >
                                                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "text-gold fill-gold/20" : ""}`} />
                                                </button>
                                            </div>

                                            {/* Title & Excerpt */}
                                            <div 
                                                onClick={() => onSelectReport(report.slug)}
                                                className="space-y-2 cursor-pointer text-left"
                                            >
                                                <h3 className="text-base font-bold text-text-primary group-hover:text-gold transition-colors leading-snug">
                                                    {report.title}
                                                </h3>
                                                <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                                                    {report.excerpt}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Footer Metadata */}
                                        <div 
                                            onClick={() => onSelectReport(report.slug)}
                                            className="mt-6 pt-4 border-t border-[#2E2E2E]/60 flex justify-between items-center text-[9px] font-mono text-neutral-500 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{report.readTime}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gold font-bold">{report.difficulty}</span>
                                                <span className="w-1 h-1 rounded-full bg-neutral-600" />
                                                <span>{report.publishedAt}</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="border border-[#2E2E2E] rounded-2xl bg-black/10 overflow-hidden text-left divide-y divide-[#2E2E2E]">
                        {filteredReports.map((report) => {
                            const isBookmarked = savedSlugs.includes(report.slug)
                            return (
                                <div 
                                    key={report.id}
                                    onClick={() => onSelectReport(report.slug)}
                                    className="p-6 flex items-center justify-between gap-6 hover:bg-white/5 transition-colors duration-300 cursor-pointer group"
                                >
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-500 uppercase">
                                            <span>{report.industry}</span>
                                            <span className="w-1 h-1 rounded-full bg-neutral-600" />
                                            <span>{report.publishedAt}</span>
                                        </div>
                                        <h3 className="text-base font-bold text-text-primary group-hover:text-gold transition-colors">
                                            {report.title}
                                        </h3>
                                        <p className="text-xs text-neutral-400 font-light line-clamp-1 max-w-2xl leading-relaxed">
                                            {report.excerpt}
                                        </p>
                                    </div>

                                    {/* Action Meta Right */}
                                    <div className="flex items-center gap-6 shrink-0 font-mono text-xs text-neutral-400">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{report.readTime}</span>
                                        </div>
                                        <span className="text-gold font-bold">{report.difficulty}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onToggleBookmark(report.slug)
                                            }}
                                            className="w-8 h-8 rounded-full bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-gold/10 hover:text-gold flex items-center justify-center text-neutral-400 transition-colors"
                                        >
                                            <Bookmark className={`w-4 h-4 ${isBookmarked ? "text-gold fill-gold/20" : ""}`} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            ) : (
                <div className="p-16 border border-dashed border-[#2E2E2E] rounded-3xl text-center space-y-4">
                    <p className="text-neutral-400 text-lg">No research reports match your search or filters.</p>
                    <button
                        onClick={() => {
                            setSearchQuery("")
                            setDifficultyFilter("All")
                            setIndustryFilter("All")
                        }}
                        className="px-5 py-2.5 bg-gold/10 border border-gold/20 text-gold rounded-full text-xs font-mono font-bold hover:bg-gold/20 transition-all cursor-pointer"
                    >
                        Reset All Filters
                    </button>
                </div>
            )}

        </div>
    )
}
