"use client"

import { useState } from "react"
import { FileText, X } from "lucide-react"
import { RichText } from "@/components/sanity/RichText"

interface Note {
    _id: string
    title: string
    date: string
    content: any[]
}

interface NotesSectionProps {
    notes: Note[]
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

export function NotesSection({ notes }: NotesSectionProps) {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null)

    return (
        <div className="pt-16 border-t border-white/5 space-y-8 w-full">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold">
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold/80 block mb-0.5">MEMBERS EXCLUSIVE</span>
                    <h2 className="text-xl md:text-2xl font-sans font-bold text-white tracking-tight">Research Notes</h2>
                </div>
            </div>

            {/* Grid of Notes */}
            {notes && notes.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6 w-full">
                    {notes.map((note) => (
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
