"use client"

import { useState, useEffect, useRef } from "react"
import { 
    ArrowLeft, Eye, EyeOff, Bookmark, Highlighter, 
    MessageSquare, Download, Check, HelpCircle, Sparkles 
} from "lucide-react"
import { mockReports } from "./mockData"

interface ReaderViewProps {
    slug: string
    onBack: () => void
    isBookmarked: boolean
    onToggleBookmark: (slug: string) => void
}

interface SavedNote {
    paragraphIdx: number
    note: string
    isHighlighted: boolean
}

export function ReaderView({ slug, onBack, isBookmarked, onToggleBookmark }: ReaderViewProps) {
    const report = mockReports.find(r => r.slug === slug)
    const [distractionFree, setDistractionFree] = useState(false)
    const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base")
    const [savedNotes, setSavedNotes] = useState<SavedNote[]>([])
    const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null)
    const [noteInput, setNoteInput] = useState("")
    const [showExportSuccess, setShowExportSuccess] = useState(false)
    const [rocMultiple, setRocMultiple] = useState(15) // Interactive Chart State
    const [capexGrowth, setCapexGrowth] = useState(20) // Interactive Chart State

    const readerRef = useRef<HTMLDivElement>(null)

    if (!report) {
        return (
            <div className="p-12 text-center text-neutral-400">
                <p>Report not found.</p>
                <button onClick={onBack} className="text-gold underline mt-4">Go Back</button>
            </div>
        )
    }

    // Split paragraphs from body markdown to allow paragraph-level note attaching
    const paragraphs = report.bodyMarkdown
        .split("\n\n")
        .filter(p => p.trim().length > 0)

    // Load notes & highlights from localStorage
    useEffect(() => {
        const key = `fpi-notes-${slug}`
        const localData = localStorage.getItem(key)
        if (localData) {
            try {
                setSavedNotes(JSON.parse(localData))
            } catch (e) {
                console.error(e)
            }
        }

        // Save last read report for dashboard "Continue Reading" widget
        localStorage.setItem("fpi-reader-progress", JSON.stringify({ slug, percent: 35 }))
    }, [slug])

    // Save notes to localStorage
    const saveNotesToLocal = (updated: SavedNote[]) => {
        setSavedNotes(updated)
        localStorage.setItem(`fpi-notes-${slug}`, JSON.stringify(updated))
    }

    const toggleHighlight = (idx: number) => {
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
        const text = savedNotes
            .map(n => {
                const quoteText = paragraphs[n.paragraphIdx]?.replace(/^[#>\-\s]+/g, "")
                return `[PARAGRAPH]: "${quoteText}"\n${n.isHighlighted ? "[HIGHLIGHTED]\n" : ""}${n.note ? `[NOTE]: ${n.note}\n` : ""}`
            })
            .join("\n---\n\n")
        
        navigator.clipboard.writeText(`Notes for: ${report.title}\n\n${text}`)
        setShowExportSuccess(true)
        setTimeout(() => setShowExportSuccess(false), 2000)
    }

    // Interactive ROCE Calculator valuation output
    const ROCE = (rocMultiple * 1.25 + capexGrowth * 0.35).toFixed(1)
    const impliedMultipleValuation = (parseFloat(ROCE) * 2.8).toFixed(0)

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
        <div ref={readerRef} className="space-y-8 max-w-6xl mx-auto font-sans relative">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4 select-none">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-gold transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Exit Desk (ESC)</span>
                </button>

                <div className="flex items-center gap-4 text-xs font-mono">
                    {/* Font sizes */}
                    <div className="flex border border-[#2E2E2E] bg-black/20 rounded-xl p-0.5">
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
                    <button
                        onClick={() => onToggleBookmark(slug)}
                        className={`p-2 rounded-xl border border-white/5 bg-[#1E1E1E] hover:border-gold/30 hover:bg-gold/10 transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isBookmarked ? "text-gold" : "text-neutral-400"
                        }`}
                    >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-gold/10" : ""}`} />
                        <span>{isBookmarked ? "Saved" : "Save"}</span>
                    </button>

                    {/* Distraction Free Toggle */}
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
                    <div className="lg:col-span-3 sticky top-24 space-y-6 hidden lg:block text-left select-none">
                        <div className="border border-white/5 bg-black/10 rounded-2xl p-6 space-y-4">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold border-b border-[#2E2E2E] pb-2">
                                Table of Contents
                            </span>
                            <nav className="flex flex-col gap-2.5 text-xs text-neutral-400">
                                <a href="#sec-1" className="hover:text-gold transition-colors font-medium">1. Industry Structure</a>
                                <a href="#sec-2" className="hover:text-gold transition-colors font-medium">2. Moat Analysis</a>
                                <a href="#sec-3" className="hover:text-gold transition-colors font-medium">3. Financial Projections</a>
                                <a href="#sec-4" className="hover:text-gold transition-colors font-medium">4. Key Risk Vectors</a>
                            </nav>
                        </div>

                        <div className="border border-white/5 bg-black/10 rounded-2xl p-6 space-y-4 text-xs">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold border-b border-[#2E2E2E] pb-2">
                                Notes & Study Tools
                            </span>
                            <p className="text-neutral-500 leading-relaxed font-light">
                                Double-click or click any paragraph comment icon to highlight and record private research notes.
                            </p>
                            <button
                                onClick={handleExport}
                                className="w-full py-2 bg-white/5 hover:bg-gold/10 hover:border-gold/30 hover:text-gold text-text-primary rounded-xl border border-white/5 font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                {showExportSuccess ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-gold" />
                                        <span>Notes Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Export Study Memo</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Right Side: Article Body (9 columns or 12 if focus mode) */}
                <div className={`${distractionFree ? "lg:col-span-12" : "lg:col-span-9"} space-y-12`}>
                    
                    {/* Title Metadata */}
                    <div className="space-y-4 text-left border-b border-[#2E2E2E] pb-8">
                        <span className="text-xs font-mono text-gold font-bold uppercase tracking-wider bg-gold/10 px-3 py-1 rounded-full">
                            {report.industry} · {report.difficulty}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary leading-[1.1] font-sans">
                            {report.title}
                        </h1>
                        <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
                            <span>PUBLISHED: {report.publishedAt}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                            <span>{report.readTime}</span>
                        </div>
                    </div>

                    {/* Markdown Body Parsed Paragraphs */}
                    <div className="space-y-6 text-left">
                        {paragraphs.map((p, idx) => {
                            const isHeader = p.startsWith("#")
                            const noteObj = savedNotes.find(n => n.paragraphIdx === idx)
                            const isHighlighted = noteObj?.isHighlighted
                            const hasNote = noteObj?.note && noteObj.note.trim().length > 0

                            if (isHeader) {
                                // Draw section headings
                                const headingText = p.replace(/^[#\s]+/g, "")
                                const level = p.match(/^#+/)?.[0].length || 1
                                const id = headingText.toLowerCase().includes("structure") ? "sec-1" :
                                           headingText.toLowerCase().includes("moat") ? "sec-2" :
                                           headingText.toLowerCase().includes("projections") ? "sec-3" : "sec-4"
                                
                                return (
                                    <h2 
                                        key={idx} 
                                        id={id}
                                        className={`font-sans font-bold text-text-primary tracking-tight mt-12 mb-4 border-b border-[#2E2E2E]/60 pb-2 ${
                                            level === 1 ? "text-2xl md:text-3xl mt-16" : 
                                            level === 2 ? "text-xl md:text-2xl" : "text-lg"
                                        }`}
                                    >
                                        {headingText}
                                    </h2>
                                )
                            }

                            // Dynamic interactive chart insertion in the Projections section
                            const showChart = p.includes("Financial Projections & CAPEX Cycle")
                            
                            return (
                                <div key={idx} className="relative group/p flex items-start gap-4">
                                    
                                    {/* Action Buttons next to paragraphs (shown on hover) */}
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

                                    {/* Paragraph text with layout support */}
                                    <div className="flex-1 space-y-4">
                                        <p 
                                            className={`font-sans leading-relaxed tracking-wide text-neutral-300 font-light ${
                                                fontSize === "sm" ? "text-sm" : 
                                                fontSize === "lg" ? "text-lg leading-loose" : "text-base"
                                            } ${isHighlighted ? "bg-gold/10 text-text-primary px-3 py-1.5 rounded-lg border-l-2 border-gold" : ""}`}
                                        >
                                            {p}
                                        </p>

                                        {/* Show inline note if exists */}
                                        {hasNote && (
                                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-neutral-300 font-mono flex items-start gap-2 max-w-2xl">
                                                <Sparkles className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="text-neutral-500 font-bold">MY RESEARCH NOTE:</span>
                                                    <p className="mt-1 text-text-primary">{noteObj.note}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Note editing box */}
                                        {activeNoteIdx === idx && (
                                            <div className="p-4 rounded-xl border border-gold/30 bg-[#2E2E2E] space-y-3 max-w-lg mt-2 relative z-10">
                                                <textarea
                                                    value={noteInput}
                                                    onChange={(e) => setNoteInput(e.target.value)}
                                                    placeholder="Type your study note or thesis comment..."
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

                                        {/* Interactive Valuation chart integration inside projections page */}
                                        {showChart && (
                                            <div className="p-6 my-8 border border-white/10 rounded-3xl bg-black/40 space-y-6 max-w-2xl">
                                                <div className="flex justify-between items-center border-b border-[#2E2E2E] pb-3">
                                                    <span className="text-xs font-mono text-gold font-bold uppercase tracking-wider">
                                                        Interactive Sensitivity Matrix
                                                    </span>
                                                    <span className="text-[10px] font-mono text-neutral-500">
                                                        MODEL: REVERSE CASH FLOW
                                                    </span>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-1.5 text-xs text-neutral-300 font-mono">
                                                        <div className="flex justify-between">
                                                            <span>1. Capex Compounding Rate:</span>
                                                            <span className="text-gold font-bold">{capexGrowth}% CAGR</span>
                                                        </div>
                                                        <input 
                                                            type="range" 
                                                            min="5" 
                                                            max="35" 
                                                            value={capexGrowth}
                                                            onChange={(e) => setCapexGrowth(parseInt(e.target.value))}
                                                            className="w-full accent-gold bg-[#2E2E2E] h-1.5 rounded-full cursor-pointer"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5 text-xs text-neutral-300 font-mono">
                                                        <div className="flex justify-between">
                                                            <span>2. Target EBIT Multiple:</span>
                                                            <span className="text-gold font-bold">{rocMultiple}x Multiple</span>
                                                        </div>
                                                        <input 
                                                            type="range" 
                                                            min="8" 
                                                            max="32" 
                                                            value={rocMultiple}
                                                            onChange={(e) => setRocMultiple(parseInt(e.target.value))}
                                                            className="w-full accent-gold bg-[#2E2E2E] h-1.5 rounded-full cursor-pointer"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 border-t border-[#2E2E2E] pt-4 font-mono text-[10px] text-neutral-500">
                                                    <div>
                                                        <span>IMPLIED ROCE</span>
                                                        <div className="text-base font-bold text-text-primary mt-1">{ROCE}%</div>
                                                    </div>
                                                    <div>
                                                        <span>IMPLIED VALUE (₹ Cr)</span>
                                                        <div className="text-base font-bold text-emerald-400 mt-1">₹{impliedMultipleValuation} Cr</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Disclaimer Footnote */}
                    <div className="border-t border-[#2E2E2E] pt-8 text-[10px] font-mono text-neutral-500 leading-relaxed text-left">
                        <span className="text-neutral-400 font-bold uppercase block mb-1">DISCLAIMER:</span>
                        First Principles Investing is an independent research house. We do not provide personalized stock recommendations or advisory calls. This research is for educational and learning purposes. All investments are subject to capital risk.
                    </div>

                </div>

            </div>

        </div>
    )
}
