"use client"

import { useState } from "react"
import { Search, Clock, ArrowUpDown, Filter } from "lucide-react"
import Image from "next/image"
import { urlForImage } from "@/lib/sanity.image"

interface FreeResearchViewProps {
    onSelectReport: (slug: string) => void
    posts: any[]
}

function calculateReadingTime(body: any[] | undefined): string {
    if (!body || !Array.isArray(body)) return "15 min read"
    let text = ""
    body.forEach((block: any) => {
        if (block._type === "block" && block.children) {
            block.children.forEach((child: any) => {
                if (child.text) {
                    text += " " + child.text
                }
            })
        }
    })
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length
    if (wordCount === 0) return "15 min read"
    const min = Math.ceil(wordCount / 220)
    return `${min} min read`
}

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        })
    } catch (e) {
        return dateStr
    }
}

export function FreeResearchView({ onSelectReport, posts }: FreeResearchViewProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("newest")

    // Filter reports (access !== "subscriber" only)
    const filteredReports = posts.filter(report => {
        if (report.access === "subscriber") return false

        const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              report.excerpt.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesSearch
    }).sort((a, b) => {
        if (sortBy === "newest") {
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        }
        if (sortBy === "oldest") {
            return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        }
        if (sortBy === "readTime") {
            return parseInt(calculateReadingTime(a.body)) - parseInt(calculateReadingTime(b.body))
        }
        return 0
    })

    return (
        <div className="space-y-8 text-left max-w-4xl mx-auto py-4">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary tracking-tight font-sans">
                    Free Research Notes
                </h1>
                <p className="text-sm text-neutral-400 font-light mt-1">
                    Examine our basic framework briefings and educational articles open to public readers.
                </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 rounded-xl border border-white/5 bg-[#1E1E1E] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search free articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-bg-deep border border-white/5 rounded-lg text-text-primary focus:border-gold/30 outline-none font-sans"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    
                    {/* Sorting */}
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-bg-deep border border-white/5 rounded-lg px-3 py-2 text-neutral-400 focus:border-gold/30 outline-none cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="readTime">Shortest Read</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* Results Grid */}
            {filteredReports.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map((report) => (
                        <div 
                            key={report._id || report.id}
                            onClick={() => onSelectReport(report.slug?.current)}
                            className="flex flex-col border border-white/5 hover:border-gold/25 bg-[#1E1E1E] rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-300 cursor-pointer group"
                        >
                            {/* Cover image if available */}
                            {report.mainImage && (
                                <div className="relative aspect-[16/9] w-full overflow-hidden">
                                    <Image
                                        src={urlForImage(report.mainImage).width(400).height(225).fit("crop").url()}
                                        alt={report.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                </div>
                            )}

                            <div className="p-6 flex flex-col justify-between flex-grow min-h-[220px]">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 uppercase">
                                        <span>{formatDate(report.publishedAt)}</span>
                                        <span className="text-neutral-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-bold">FREE</span>
                                    </div>
                                    <h3 className="text-base font-bold text-text-primary group-hover:text-gold transition-colors leading-snug line-clamp-2">
                                        {report.title}
                                    </h3>
                                    <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                                        {report.excerpt}
                                    </p>
                                </div>

                                <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-neutral-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-neutral-500" />
                                        <span>{calculateReadingTime(report.body)}</span>
                                    </div>
                                    <span className="text-gold">Read Article ↗</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-16 border border-dashed border-[#2E2E2E] rounded-2xl text-center text-xs text-neutral-500">
                    No free research notes found.
                </div>
            )}

        </div>
    )
}
