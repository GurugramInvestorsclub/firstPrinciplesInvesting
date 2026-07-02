"use client"

import { useState, useEffect } from "react"
import { Bookmark, FolderPlus, Trash2, ArrowRight, MessageSquare, Plus, FileText, Landmark } from "lucide-react"
import { mockReports, mockCompanies } from "./mockData"

interface BookmarksViewProps {
    savedSlugs: string[]
    onToggleBookmark: (slug: string) => void
    onSelectReport: (slug: string) => void
    onSelectCompany: (id: string) => void
}

interface Collection {
    id: string
    name: string
    itemSlugs: string[]
}

export function BookmarksView({ savedSlugs, onToggleBookmark, onSelectReport, onSelectCompany }: BookmarksViewProps) {
    const [collections, setCollections] = useState<Collection[]>([
        { id: "col-1", name: "Defense Holdings", itemSlugs: ["defense-electronics-radar-avionics"] },
        { id: "col-2", name: "Space Watchlist", itemSlugs: ["space-sector-launch-systems"] }
    ])
    const [newColName, setNewColName] = useState("")
    const [allNotes, setAllNotes] = useState<{ slug: string; reportTitle: string; notes: any[] }[]>([])

    // Load collections from local storage
    useEffect(() => {
        const savedCollections = localStorage.getItem("fpi-collections")
        if (savedCollections) {
            try {
                setCollections(JSON.parse(savedCollections))
            } catch (e) {
                console.error(e)
            }
        }

        // Aggregate all notes from localStorage
        const notesList: { slug: string; reportTitle: string; notes: any[] }[] = []
        mockReports.forEach(r => {
            const data = localStorage.getItem(`fpi-notes-${r.slug}`)
            if (data) {
                try {
                    const parsed = JSON.parse(data)
                    if (parsed.length > 0) {
                        notesList.push({
                            slug: r.slug,
                            reportTitle: r.title,
                            notes: parsed
                        })
                    }
                } catch (e) {
                    console.error(e)
                }
            }
        })
        setAllNotes(notesList)
    }, [savedSlugs])

    const saveCollections = (updated: Collection[]) => {
        setCollections(updated)
        localStorage.setItem("fpi-collections", JSON.stringify(updated))
    }

    const createCollection = () => {
        if (!newColName.trim()) return
        const newCol: Collection = {
            id: `col-${Date.now()}`,
            name: newColName.trim(),
            itemSlugs: []
        }
        const updated = [...collections, newCol]
        saveCollections(updated)
        setNewColName("")
    }

    const deleteCollection = (id: string) => {
        const updated = collections.filter(c => c.id !== id)
        saveCollections(updated)
    }

    const toggleReportInCollection = (colId: string, slug: string) => {
        const updated = collections.map(c => {
            if (c.id === colId) {
                const alreadyHas = c.itemSlugs.includes(slug)
                return {
                    ...c,
                    itemSlugs: alreadyHas 
                        ? c.itemSlugs.filter(item => item !== slug) 
                        : [...c.itemSlugs, slug]
                }
            }
            return c
        })
        saveCollections(updated)
    }

    return (
        <div className="space-y-12 text-left">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary tracking-tight font-sans">
                    Bookmarks & Workspace
                </h1>
                <p className="text-sm text-neutral-400 font-light mt-1">
                    Manage your saved reports, organize research into custom collections, and view your study notes.
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Saved Reports & Custom Collections (8 columns) */}
                <div className="lg:col-span-8 space-y-10">
                    
                    {/* Saved Memos */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-text-primary border-b border-[#2E2E2E] pb-3 flex items-center gap-2">
                            <Bookmark className="w-4 h-4 text-gold" />
                            <span>Saved Memos</span>
                        </h2>

                        {savedSlugs.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {savedSlugs.map(slug => {
                                    const report = mockReports.find(r => r.slug === slug)
                                    if (!report) return null
                                    return (
                                        <div 
                                            key={report.id}
                                            className="p-5 rounded-2xl border border-white/5 bg-[#1E1E1E] flex flex-col justify-between hover:border-gold/20 transition-all group"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500 uppercase">
                                                    <span>{report.industry}</span>
                                                    <button 
                                                        onClick={() => onToggleBookmark(slug)}
                                                        className="text-neutral-500 hover:text-rose-400"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <h3 
                                                    onClick={() => onSelectReport(slug)}
                                                    className="text-sm font-bold text-text-primary group-hover:text-gold transition-colors cursor-pointer"
                                                >
                                                    {report.title}
                                                </h3>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-[#2E2E2E] flex justify-between items-center text-[10px] font-mono text-neutral-500">
                                                <span>{report.readTime}</span>
                                                <button 
                                                    onClick={() => onSelectReport(slug)}
                                                    className="text-gold hover:underline flex items-center gap-1 cursor-pointer"
                                                >
                                                    Read Now <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="p-8 border border-dashed border-[#2E2E2E] rounded-2xl text-center text-xs text-neutral-500">
                                No saved research reports. Start bookmarking memos in the library.
                            </div>
                        )}
                    </div>

                    {/* Custom Folder Collections */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-[#2E2E2E] pb-3">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <FolderPlus className="w-4 h-4 text-gold" />
                                <span>Custom Folders & Collections</span>
                            </h2>

                            {/* Create Collection input */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Collection name..."
                                    value={newColName}
                                    onChange={(e) => setNewColName(e.target.value)}
                                    className="bg-bg-deep border border-white/5 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:border-gold/30 outline-none font-sans"
                                />
                                <button
                                    onClick={createCollection}
                                    className="p-2 bg-gold hover:bg-[#E0A800] text-bg-deep rounded-xl flex items-center justify-center cursor-pointer"
                                    title="Create Folder"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {collections.length > 0 ? (
                            <div className="space-y-4">
                                {collections.map(col => (
                                    <div key={col.id} className="p-5 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4">
                                        <div className="flex justify-between items-center border-b border-[#2E2E2E]/60 pb-3">
                                            <span className="font-bold text-xs uppercase tracking-wider text-text-primary">{col.name}</span>
                                            <button 
                                                onClick={() => deleteCollection(col.id)}
                                                className="text-neutral-500 hover:text-rose-400"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {/* List items in collection */}
                                        {col.itemSlugs.length > 0 ? (
                                            <ul className="space-y-2">
                                                {col.itemSlugs.map(slug => {
                                                    const report = mockReports.find(r => r.slug === slug)
                                                    if (!report) return null
                                                    return (
                                                        <li key={slug} className="flex justify-between items-center text-xs font-mono text-neutral-400">
                                                            <button 
                                                                onClick={() => onSelectReport(slug)}
                                                                className="hover:text-gold flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <FileText className="w-3.5 h-3.5 text-neutral-500" />
                                                                <span>{report.title}</span>
                                                            </button>
                                                            <button 
                                                                onClick={() => toggleReportInCollection(col.id, slug)}
                                                                className="text-neutral-500 hover:text-rose-400"
                                                            >
                                                                Remove
                                                            </button>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        ) : (
                                            <div className="text-[10px] font-mono text-neutral-500 italic">No memos assigned to this folder.</div>
                                        )}

                                        {/* Add reports to collection trigger list */}
                                        <div className="pt-2 flex flex-wrap items-center gap-2 text-[9px] font-mono">
                                            <span className="text-neutral-500">ADD SAVED REPORT:</span>
                                            {savedSlugs.map(slug => {
                                                const rep = mockReports.find(r => r.slug === slug)
                                                if (!rep) return null
                                                const isInCol = col.itemSlugs.includes(slug)
                                                return (
                                                    <button
                                                        key={slug}
                                                        onClick={() => toggleReportInCollection(col.id, slug)}
                                                        className={`px-2 py-1 rounded border cursor-pointer ${
                                                            isInCol 
                                                                ? "bg-gold/10 border-gold/30 text-gold" 
                                                                : "bg-bg-deep border-white/5 text-neutral-400 hover:border-gold/20"
                                                        }`}
                                                    >
                                                        {rep.title.split(":")[0]}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 border border-dashed border-[#2E2E2E] rounded-2xl text-center text-xs text-neutral-500">
                                No custom collections created yet. Use the tool on the right to start categorizing.
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Side: Saved Notes Log (4 columns) */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-lg font-bold text-text-primary border-b border-[#2E2E2E] pb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gold" />
                        <span>Recent Study Notes</span>
                    </h2>

                    {allNotes.length > 0 ? (
                        <div className="space-y-4">
                            {allNotes.map(item => (
                                <div key={item.slug} className="p-4 rounded-xl border border-white/5 bg-[#1E1E1E] space-y-3">
                                    <span className="text-[9px] font-mono text-gold uppercase tracking-wider block font-bold border-b border-[#2E2E2E]/60 pb-1.5">
                                        REPORT: {item.reportTitle.split(":")[0]}
                                    </span>
                                    <div className="space-y-2">
                                        {item.notes.map((note, noteIdx) => {
                                            if (!note.note) return null
                                            return (
                                                <div key={noteIdx} className="text-xs font-mono bg-bg-deep p-2.5 rounded-lg border border-[#2E2E2E]">
                                                    <span className="text-[8px] text-neutral-500">PARAGRAPH {note.paragraphIdx + 1}</span>
                                                    <p className="mt-1 text-text-primary font-sans font-light">"{note.note}"</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <button 
                                        onClick={() => onSelectReport(item.slug)}
                                        className="text-[9px] font-mono text-gold hover:underline cursor-pointer flex items-center gap-1"
                                    >
                                        Jump to reader ↗
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 border border-dashed border-[#2E2E2E] rounded-2xl text-center text-xs text-neutral-500">
                            No private notes recorded. Notes written inside the reader will aggregate here.
                        </div>
                    )}
                </div>

            </div>

        </div>
    )
}
