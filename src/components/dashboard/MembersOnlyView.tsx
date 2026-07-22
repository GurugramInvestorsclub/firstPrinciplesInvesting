"use client"

import { useState } from "react"
import { Search, Clock, ArrowUpDown, Filter, FileText, X } from "lucide-react"
import Image from "next/image"
import { urlForImage } from "@/lib/sanity.image"
import { RecordingsCarousel } from "@/components/insights/RecordingsCarousel"
import { RichText } from "@/components/sanity/RichText"

interface MembersOnlyViewProps {
    onSelectReport: (slug: string) => void
    posts: any[]
    hasSubscriptionAccess?: boolean
    recordings?: any[]
    notes?: any[]
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

function getNotePreview(content: any[] | undefined): string {

    if (!content || !Array.isArray(content)) return ""
    let text = ""
    content.forEach((block: any) => {
        if (block._type === "block" && block.children) {
            block.children.forEach((child: any) => {
                if (child.text) {
                    text += " " + child.text
                }
            })
        }
    })
    return text.trim()
}

export function MembersOnlyView({ onSelectReport, posts, hasSubscriptionAccess = false, recordings = [], notes = [] }: MembersOnlyViewProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("newest")
    const [selectedNote, setSelectedNote] = useState<any | null>(null)

    // Filter reports (access === "subscriber" only)
    const filteredReports = posts.filter(report => {
        if (report.access !== "subscriber") return false

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

    // Filter recordings
    const filteredRecordings = recordings.filter(rec => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (rec.title || "").toLowerCase().includes(query) || (rec.description || "").toLowerCase().includes(query)
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Filter notes
    const filteredNotes = notes.filter(note => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (note.title || "").toLowerCase().includes(query) || 
               getNotePreview(note.content).toLowerCase().includes(query)
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const upcomingTitle = "Upcoming Premium Deep Dive"
    const upcomingExcerpt = "We are currently conducting detailed in-depth equity analysis on our next high-conviction company. Full research briefing and valuation model coming soon."
    const isUpcomingVisible = !searchQuery || 
        upcomingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        upcomingExcerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        "upcoming".includes(searchQuery.toLowerCase()) ||
        "coming soon".includes(searchQuery.toLowerCase())


    return (
        <div className="space-y-8 text-left max-w-4xl mx-auto py-4">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary tracking-tight font-sans">
                    Members Only Research
                </h1>
                <p className="text-sm text-neutral-400 font-light mt-1">
                    Access our detailed in-depth equity analysis memos built from first principles.
                </p>
            </div>

            {/* WhatsApp Invite Banner for Active Members */}
            {hasSubscriptionAccess && (
                <div className="p-[1px] bg-gradient-to-r from-emerald-500/30 via-gold/20 to-emerald-500/30 rounded-2xl shadow-[0_8px_32px_0_rgba(16,185,129,0.05)]">
                    <div className="bg-[#1E1E1E] p-6 rounded-[15px] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-3 max-w-xl text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-[0.15em] font-mono font-bold">
                                    Member Benefit
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <h2 className="text-xl font-bold text-text-primary tracking-tight font-sans">
                                Join the Exclusive WhatsApp Group
                            </h2>
                            <p className="text-xs text-neutral-400 leading-relaxed font-light">
                                Connect with fellow members in our private community. Get instant notifications when new deep dives are published and discuss investment opportunities in real-time.
                            </p>
                        </div>
                        <a
                            href="https://chat.whatsapp.com/EmjQIzJjtQ26PPrqqpKFOI"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs px-5 py-3 rounded-full transition-all duration-500 shadow-[0_4px_20px_0_rgba(16,185,129,0.2)] hover:shadow-[0_4px_25px_0_rgba(16,185,129,0.3)] shrink-0 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
                        >
                            <span>Join WhatsApp Group</span>
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-all duration-500 group-hover:translate-x-1 group-hover:scale-105 ease-[cubic-bezier(0.32,0.72,0,1)]">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.852.002-2.63-1.023-5.101-2.887-6.968C16.58 1.966 14.11 .941 11.48.941 6.046.941 1.62 5.362 1.616 10.793c-.001 1.639.499 3.23 1.448 4.82l-.995 3.648 3.743-.982zm12.5-3.327c-.273-.137-1.619-.8-1.867-.89-.248-.09-.43-.137-.61.137-.18.273-.7.89-.858 1.07-.158.18-.315.2-.588.064-.273-.137-1.155-.426-2.202-1.36-0.815-.727-1.366-1.624-1.526-1.897-.16-.273-.017-.42.12-.556.123-.122.273-.32.41-.48.137-.16.183-.273.273-.455.09-.18.045-.34-.022-.48-.067-.137-.61-1.468-.836-2.01-.22-.53-.44-.46-.61-.46-.16 0-.34-.02-.52-.02-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.62 1.11 2.8c.14.18 1.94 2.96 4.69 4.15 1.8.78 2.45.63 2.92.56.5-.07 1.62-.66 1.85-1.3.23-.64.23-1.18.16-1.3-.07-.12-.25-.2-.53-.34z" />
                                </svg>
                            </span>
                        </a>
                    </div>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="p-4 rounded-xl border border-white/5 bg-[#1E1E1E] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search premium memos..."
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
            {(filteredReports.length > 0 || isUpcomingVisible) ? (
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
                                        <span className="text-gold bg-gold/10 px-2 py-0.5 rounded font-bold">PREMIUM</span>
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

                    {/* Upcoming Case Study Card */}
                    {isUpcomingVisible && (
                        <div 
                            className="flex flex-col border border-white/5 hover:border-gold/15 bg-[#1E1E1E]/50 rounded-2xl overflow-hidden relative group opacity-90 hover:opacity-100 transition-all duration-300 select-none"
                        >
                            {/* Card Cover image */}
                            <div className="relative aspect-[16/9] w-full overflow-hidden">
                                <Image
                                    src="/images/upcoming_research.png"
                                    alt="Upcoming Premium Deep Dive"
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/40 to-transparent opacity-80" />
                            </div>

                            <div className="p-6 flex flex-col justify-between flex-grow min-h-[220px]">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 uppercase">
                                        <span>COMING SOON</span>
                                        <span className="text-gold/80 bg-gold/5 border border-gold/10 px-2 py-0.5 rounded font-mono font-bold tracking-wider text-[9px]">PREMIUM</span>
                                    </div>
                                    <h3 className="text-base font-bold text-neutral-300 leading-snug line-clamp-2">
                                        Upcoming Premium Deep Dive
                                    </h3>
                                    <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                                        Our research team is currently conducting detailed in-depth equity analysis on our next high-conviction company.
                                    </p>
                                </div>

                                <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-neutral-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-neutral-500" />
                                        <span>Research In Progress</span>
                                    </div>
                                    <span className="text-neutral-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                                        Drafting Phase
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-16 border border-dashed border-[#2E2E2E] rounded-2xl text-center text-xs text-neutral-500">
                    No premium research memos found.
                </div>
            )}

            {/* Session Recordings Archive Carousel */}
            <RecordingsCarousel recordings={filteredRecordings} />

            {/* Research Notes Section */}
            <div className="pt-16 border-t border-white/5 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold/80 block mb-0.5">MEMBERS EXCLUSIVE</span>
                        <h2 className="text-xl md:text-2xl font-sans font-bold text-white tracking-tight">Research Notes</h2>
                    </div>
                </div>

                {filteredNotes.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {filteredNotes.map((note) => (
                            <div
                                key={note._id}
                                onClick={() => setSelectedNote(note)}
                                className="group flex flex-col justify-between border border-white/10 hover:border-gold/30 bg-[#1E1E1E] p-6 rounded-2xl cursor-pointer hover:shadow-[0_12px_40px_rgba(255,199,44,0.08)] transition-all duration-300 text-left"
                            >
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 uppercase">
                                        <span>{new Date(note.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                        <span className="text-gold/85 font-bold">NOTE</span>
                                    </div>
                                    <h3 className="text-base font-bold text-white group-hover:text-gold transition-colors leading-snug line-clamp-2">
                                        {note.title}
                                    </h3>
                                    <p className="text-xs text-neutral-400 font-light line-clamp-3 leading-relaxed">
                                        {getNotePreview(note.content)}
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/5 flex justify-end text-[10px] font-mono text-gold font-bold">
                                    <span>Read Note ↗</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                        <p className="text-sm text-neutral-400 font-sans">No research notes found.</p>
                    </div>
                )}
            </div>

            {/* Note Reader Modal Overlay */}
            {selectedNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
                    <div className="absolute inset-0" onClick={() => setSelectedNote(null)} />
                    <div className="relative w-full max-w-2xl bg-[#1E1E1E] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[85vh] flex flex-col z-10">
                        <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-6">
                            <div>
                                <span className="text-[10px] font-mono text-gold/80 uppercase tracking-widest block mb-1">
                                    {new Date(selectedNote.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                    {selectedNote.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="p-1.5 rounded-full border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-4 text-left font-sans text-neutral-300 leading-relaxed font-light text-sm md:text-base selection:bg-gold/20">
                            <RichText value={selectedNote.content} />
                        </div>
                        <div className="border-t border-white/5 pt-4 mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-muted text-bg-deep font-bold text-xs transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}


