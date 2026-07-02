"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Eye, EyeOff, Bookmark, Highlighter, MessageSquare, Lock } from "lucide-react"
import { RichText } from "../sanity/RichText"
import { CopyProtection } from "../insights/CopyProtection"


interface ReaderViewProps {
    slug: string
    onBack: () => void
    isBookmarked: boolean
    onToggleBookmark: (slug: string) => void
    posts: any[]
    hasSubscriptionAccess?: boolean
    onNavigate?: (tab: string, arg?: string) => void
}

interface SavedNote {
    paragraphIdx: number
    note: string
    isHighlighted: boolean
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

function getBlockText(block: any): string {
    if (!block) return ""
    if (block._type === "block" && block.children) {
        return block.children.map((child: any) => child.text || "").join("")
    }
    return ""
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

export function ReaderView({ 
    slug, 
    onBack, 
    isBookmarked, 
    onToggleBookmark, 
    posts, 
    hasSubscriptionAccess = false,
    onNavigate
}: ReaderViewProps) {
    const report = posts.find(r => r.slug?.current === slug)
    const [distractionFree, setDistractionFree] = useState(false)
    const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base")
    const [savedNotes, setSavedNotes] = useState<SavedNote[]>([])
    const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null)
    const [noteInput, setNoteInput] = useState("")
    const [showExportSuccess, setShowExportSuccess] = useState(false)

    if (!report) {
        return (
            <div className="p-12 text-center text-neutral-400">
                <p>Report not found.</p>
                <button onClick={onBack} className="text-gold underline mt-4">Go Back</button>
            </div>
        )
    }

    const isSubscriberOnly = report.access === "subscriber"
    const shouldLockContent = isSubscriberOnly && !hasSubscriptionAccess

    // Helper to get 10% preview if user doesn't have access
    const getPreviewBlocks = (blocks: any[]) => {
        if (report.previewBody && report.previewBody.length > 0) {
            return report.previewBody
        }
        if (!blocks || blocks.length === 0) {
            return []
        }
        const previewCount = Math.max(1, Math.ceil(blocks.length * 0.1))
        return blocks.slice(0, previewCount)
    }

    const rawBlocks = report.body || []
    const bodyBlocks = shouldLockContent ? getPreviewBlocks(rawBlocks) : rawBlocks

    // Load notes & highlights from localStorage
    useEffect(() => {
        if (shouldLockContent) return // Don't track progress for locked teaser
        const key = `fpi-notes-${slug}`
        const localData = localStorage.getItem(key)
        if (localData) {
            try {
                setSavedNotes(JSON.parse(localData))
            } catch (e) {
                console.error(e)
            }
        }

        // Save last read report progress
        localStorage.setItem("fpi-reader-progress", JSON.stringify({ slug, percent: 55 }))
    }, [slug, shouldLockContent])

    // Save notes to localStorage
    const saveNotesToLocal = (updated: SavedNote[]) => {
        setSavedNotes(updated)
        localStorage.setItem(`fpi-notes-${slug}`, JSON.stringify(updated))
    }

    const toggleHighlight = (idx: number) => {
        if (shouldLockContent) return
        const existing = savedNotes.find(n => n.paragraphIdx === idx)
        let updated: SavedNote[] = []
        if (existing) {
            updated = savedNotes.map(n => 
                n.paragraphIdx === idx ? { ...n, isHighlighted: !n.isHighlighted } : n
            )
        } else {
            updated = [...savedNotes, { paragraphIdx: idx, note: "", isHighlighted: true }]
        }
        saveNotesToLocal(updated)
    }

    const openNoteBox = (idx: number) => {
        if (shouldLockContent) return
        setActiveNoteIdx(idx)
        const existing = savedNotes.find(n => n.paragraphIdx === idx)
        setNoteInput(existing?.note || "")
    }

    const saveNoteText = (idx: number) => {
        const existing = savedNotes.find(n => n.paragraphIdx === idx)
        let updated: SavedNote[] = []
        if (existing) {
            updated = savedNotes.map(n => 
                n.paragraphIdx === idx ? { ...n, note: noteInput } : n
            )
        } else {
            updated = [...savedNotes, { paragraphIdx: idx, note: noteInput, isHighlighted: false }]
        }
        saveNotesToLocal(updated)
        setActiveNoteIdx(null)
        setNoteInput("")
    }

    const handleExport = () => {
        if (shouldLockContent) return
        const text = savedNotes
            .filter(n => n.note && n.note.trim().length > 0)
            .map(n => `[NOTE ON PARAGRAPH ${n.paragraphIdx + 1}]: ${n.note}`)
            .join("\n\n")
        
        navigator.clipboard.writeText(`My Notes for: ${report.title}\n\n${text}`)
        setShowExportSuccess(true)
        setTimeout(() => setShowExportSuccess(false), 2000)
    }


    // Keyboard Shortcuts
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                if (activeNoteIdx !== null) {
                    setActiveNoteIdx(null)
                } else {
                    onBack()
                }
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [activeNoteIdx, onBack])

    return (
        <div className="space-y-8 max-w-5xl mx-auto font-sans relative">
            <CopyProtection />

            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 select-none">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-gold transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Exit Reader (ESC)</span>
                </button>

                <div className="flex items-center gap-4 text-xs font-mono">
                    {/* Font sizes */}
                    <div className="flex border border-white/5 bg-black/20 rounded-xl p-0.5">
                        {["sm", "base", "lg"].map((size) => (
                            <button
                                key={size}
                                onClick={() => setFontSize(size as any)}
                                className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-bold cursor-pointer ${
                                    fontSize === size ? "bg-[#2E2E2E] text-gold" : "text-neutral-500 hover:text-text-primary"
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    {/* Bookmark */}
                    {!shouldLockContent && (
                        <button
                            onClick={() => onToggleBookmark(slug)}
                            className={`p-2 rounded-xl border border-white/5 bg-[#1E1E1E] hover:border-gold/30 hover:bg-gold/10 transition-colors flex items-center gap-1.5 cursor-pointer ${
                                isBookmarked ? "text-gold" : "text-neutral-400"
                            }`}
                        >
                            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-gold/10" : ""}`} />
                            <span>{isBookmarked ? "Saved" : "Save"}</span>
                        </button>
                    )}

                    {/* Focus Toggle */}
                    <button
                        onClick={() => setDistractionFree(!distractionFree)}
                        className="p-2 rounded-xl border border-white/5 bg-[#1E1E1E] hover:border-gold/30 hover:bg-white/10 text-neutral-400 hover:text-text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        {distractionFree ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{distractionFree ? "Normal Mode" : "Focus Mode"}</span>
                    </button>
                </div>
            </div>

            {/* Reading Grid */}
            <div className="grid lg:grid-cols-12 gap-12 items-start">
                
                {/* Left Side: Sticky TOC (3 columns) - Hidden in Distraction Free Mode */}
                {!distractionFree && (
                    <div className="lg:col-span-3 sticky top-24 space-y-6 hidden lg:block text-left select-none font-mono">
                        <div className="border border-white/5 bg-black/10 rounded-2xl p-6 space-y-4">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold border-b border-white/5 pb-2">
                                Navigation
                            </span>
                            <p className="text-neutral-500 text-[11px] leading-relaxed">
                                {shouldLockContent 
                                    ? "This preview covers introductory sectors. Subscribe to unlock chapters." 
                                    : "Use the scrollbar to navigate the deep dive. Section highlights and figures are displayed inline."}
                            </p>
                        </div>

                        {!shouldLockContent && (
                            <div className="border border-white/5 bg-black/10 rounded-2xl p-6 space-y-4 text-xs font-mono">
                                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold border-b border-white/5 pb-2">
                                    Study Tools
                                </span>
                                <p className="text-neutral-500 leading-relaxed font-light text-[11px]">
                                    Double-click or click comment icons next to paragraphs to highlight sections and add notes.
                                </p>
                                <button
                                    onClick={handleExport}
                                    className="w-full py-2 bg-white/5 hover:bg-gold/10 hover:border-gold/30 hover:text-gold text-text-primary rounded-xl border border-white/5 text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    {showExportSuccess ? (
                                        <span>Notes Copied!</span>
                                    ) : (
                                        <span>Copy Study Memo</span>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Right Side: Article Body (9 columns or 12 if focus mode) */}
                <div className={`${distractionFree ? "lg:col-span-12" : "lg:col-span-9"} space-y-12`}>
                    
                    {/* Title Metadata */}
                    <div className="space-y-4 text-left border-b border-white/5 pb-8">
                        <span className="text-xs font-mono text-gold font-bold uppercase tracking-wider bg-gold/10 px-3 py-1 rounded-full">
                            {isSubscriberOnly ? "Members Only" : "Free Access"}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary leading-[1.1] font-sans">
                            {report.title}
                        </h1>
                        <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
                            <span>PUBLISHED: {formatDate(report.publishedAt)}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                            <span>{calculateReadingTime(rawBlocks)}</span>
                        </div>
                    </div>

                    {/* Markdown Body */}
                    <div className="space-y-6 text-left max-w-[65ch] mx-auto">
                        {bodyBlocks.map((block: any, idx: number) => {
                            const isHeader = block._type === "block" && (block.style === "h1" || block.style === "h2" || block.style === "h3")
                            const paragraphKey = block._key || `p-${idx}`
                            const noteObj = savedNotes.find(n => n.paragraphIdx === idx)
                            const isHighlighted = noteObj?.isHighlighted
                            const hasNote = noteObj?.note && noteObj.note.trim().length > 0

                            if (isHeader) {
                                return (
                                    <div key={paragraphKey} className="mt-10 mb-4">
                                        <RichText value={[block]} />
                                    </div>
                                )
                            }

                            return (
                                <div key={paragraphKey} className="relative group/p flex items-start gap-4">
                                    {/* Action Buttons next to paragraphs (shown on hover) - Hidden in lock content mode */}
                                    {!shouldLockContent && (
                                        <div className="absolute left-[-45px] top-1 flex flex-col gap-1 opacity-0 group-hover/p:opacity-100 transition-opacity duration-300 select-none">
                                            <button 
                                                onClick={() => toggleHighlight(idx)}
                                                className={`p-1.5 rounded-lg border border-[#2E2E2E] hover:border-gold/30 hover:bg-gold/10 transition-colors ${
                                                    isHighlighted ? "bg-gold text-bg-deep border-gold" : "bg-bg-deep text-neutral-400"
                                                }`}
                                                title="Highlight paragraph"
                                            >
                                                <Highlighter className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => openNoteBox(idx)}
                                                className={`p-1.5 rounded-lg border border-[#2E2E2E] hover:border-gold/30 hover:bg-gold/10 transition-colors ${
                                                    hasNote ? "bg-gold/10 border-gold/30 text-gold" : "bg-bg-deep text-neutral-400"
                                                }`}
                                                title="Add study note"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Paragraph text */}
                                    <div className="flex-1 space-y-4">
                                        <div 
                                            className={`font-sans leading-relaxed tracking-wide text-neutral-300 font-light ${
                                                fontSize === "sm" ? "text-sm" : 
                                                fontSize === "lg" ? "text-lg leading-loose" : "text-base"
                                            } ${isHighlighted ? "bg-gold/10 text-text-primary px-3 py-1.5 rounded-lg border-l-2 border-gold" : ""}`}
                                        >
                                            <RichText value={[block]} />
                                        </div>

                                        {/* Show inline note if exists */}
                                        {hasNote && !shouldLockContent && (
                                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-neutral-300 font-mono flex items-start gap-2 max-w-xl">
                                                <div>
                                                    <span className="text-neutral-500 font-bold">MY RESEARCH NOTE:</span>
                                                    <p className="mt-1 text-text-primary font-sans font-light">{noteObj.note}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Note editing box */}
                                        {activeNoteIdx === idx && !shouldLockContent && (
                                            <div className="p-4 rounded-xl border border-gold/30 bg-[#2E2E2E] space-y-3 max-w-lg mt-2 relative z-10">
                                                <textarea
                                                    value={noteInput}
                                                    onChange={(e) => setNoteInput(e.target.value)}
                                                    placeholder="Type your study note..."
                                                    className="w-full bg-bg-deep border border-[#2E2E2E] rounded-lg p-2 text-xs text-text-primary outline-none focus:border-gold/40 h-20"
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2 text-[10px] font-mono">
                                                    <button 
                                                        onClick={() => setActiveNoteIdx(null)}
                                                        className="px-3 py-1.5 bg-black/20 rounded-md text-neutral-400 hover:text-text-primary"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={() => saveNoteText(idx)}
                                                        className="px-3 py-1.5 bg-gold text-bg-deep font-bold rounded-md"
                                                    >
                                                        Save Note
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {/* Paywall locked box for non-subscribers */}
                        {shouldLockContent && (
                            <section className="mt-12 rounded-3xl border border-gold/20 bg-[radial-gradient(circle_at_top_right,rgba(245,184,0,0.12),transparent_45%),rgba(255,255,255,0.03)] p-6 md:p-8 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-1.5 text-gold/80 text-[10px] font-mono font-bold uppercase tracking-widest">
                                        <Lock className="w-3.5 h-3.5" />
                                        <span>Subscriber Insight</span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                        {report.paywallHeadline ?? "Unlock the full memo with an Insights membership"}
                                    </h2>
                                    <p className="text-xs leading-relaxed text-white/60">
                                        Read the complete analysis, future member-only notes, and our full historical archive with an active Insights membership.
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={() => onNavigate?.("profile")}
                                        className="px-6 py-3 bg-gold hover:bg-[#E0A800] text-bg-deep font-bold rounded-full text-xs transition-transform active:scale-[0.98]"
                                    >
                                        {report.paywallCtaText ?? "Upgrade to Subscriber Access"}
                                    </button>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Disclaimer Footnote */}
                    {!shouldLockContent && (
                        report.disclaimer ? (
                            <div className="border-t border-white/5 pt-8 text-[10px] font-mono text-neutral-500 leading-relaxed text-left max-w-[65ch] mx-auto">
                                <span className="text-neutral-400 font-bold uppercase block mb-1">DISCLAIMER:</span>
                                <RichText value={report.disclaimer} />
                            </div>
                        ) : (
                            <div className="border-t border-white/5 pt-8 text-[10px] font-mono text-neutral-500 leading-relaxed text-left max-w-[65ch] mx-auto">
                                <span className="text-neutral-400 font-bold uppercase block mb-1">DISCLAIMER:</span>
                                First Principles Investing is an independent research house. We do not provide personalized stock recommendations or advisory calls. This research is for educational and learning purposes. All investments are subject to capital risk.
                            </div>
                        )
                    )}

                </div>

            </div>

        </div>
    )
}
