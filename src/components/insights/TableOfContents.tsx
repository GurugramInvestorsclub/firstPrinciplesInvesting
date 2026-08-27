"use client"

import React, { useEffect, useState } from "react"
import { List, ChevronDown } from "lucide-react"
import { HeadingItem } from "@/lib/toc"

interface TableOfContentsProps {
    headings: HeadingItem[]
    variant?: "desktop" | "mobile"
    className?: string
}

export function TableOfContents({ headings, variant = "desktop", className = "" }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>("")
    const [isOpen, setIsOpen] = useState<boolean>(false)

    useEffect(() => {
        if (!headings || headings.length < 2) return

        // Set initial active heading
        if (headings[0]) {
            setActiveId(headings[0].id)
        }

        const handleIntersect: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.id)
                }
            })
        }

        const observer = new IntersectionObserver(handleIntersect, {
            rootMargin: "-90px 0px -60% 0px",
            threshold: 0.1,
        })

        headings.forEach((heading) => {
            const el = document.getElementById(heading.id)
            if (el) {
                observer.observe(el)
            }
        })

        return () => {
            observer.disconnect()
        }
    }, [headings])

    if (!headings || headings.length < 2) {
        return null
    }

    const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault()
        setActiveId(id)
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" })
            // Update URL hash without triggering default jump
            window.history.pushState(null, "", `#${id}`)
        }
        if (variant === "mobile") {
            setIsOpen(false)
        }
    }

    if (variant === "mobile") {
        return (
            <div className={`rounded-2xl border border-gold/30 bg-gold/5 backdrop-blur-md p-4 mb-8 text-sm transition-all duration-300 ${className}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full text-left font-mono text-xs font-bold uppercase tracking-wider text-gold hover:text-gold/80 cursor-pointer"
                    aria-expanded={isOpen}
                >
                    <div className="flex items-center gap-2">
                        <List className="w-4 h-4 text-gold" />
                        <span>Table of Contents ({headings.length})</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gold transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                    <nav className="mt-3 pt-3 border-t border-gold/20 space-y-1.5 max-h-72 overflow-y-auto">
                        {headings.map((heading) => {
                            const isActive = activeId === heading.id
                            const indentClass = heading.level === 3 ? "pl-4" : heading.level >= 4 ? "pl-7" : "pl-1"

                            return (
                                <a
                                    key={heading.id}
                                    href={`#${heading.id}`}
                                    onClick={(e) => scrollToHeading(e, heading.id)}
                                    className={`block py-1 px-2 rounded-md transition-colors text-xs leading-relaxed ${indentClass} ${
                                        isActive
                                            ? "bg-gold/20 text-gold font-semibold"
                                            : "text-text-primary/80 hover:text-gold hover:bg-gold/10"
                                    }`}
                                >
                                    {heading.text}
                                </a>
                            )
                        })}
                    </nav>
                )}
            </div>
        )
    }

    // Desktop Variant (Sticky Sidebar)
    return (
        <nav
            aria-label="Table of contents"
            className={`w-full font-sans text-sm select-none ${className}`}
        >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gold/30">
                <List className="w-4 h-4 text-gold" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold">
                    In This Memo
                </span>
            </div>

            <ul className="space-y-1 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gold/20">
                {headings.map((heading) => {
                    const isActive = activeId === heading.id
                    const isSub = heading.level === 3
                    const isDeepSub = heading.level >= 4

                    return (
                        <li key={heading.id}>
                            <a
                                href={`#${heading.id}`}
                                onClick={(e) => scrollToHeading(e, heading.id)}
                                className={`group flex items-start gap-2 py-1.5 px-2 rounded-lg transition-all text-xs leading-relaxed ${
                                    isSub ? "pl-4" : isDeepSub ? "pl-7" : "pl-2"
                                } ${
                                    isActive
                                        ? "bg-gold/15 text-gold font-semibold border-l-2 border-gold shadow-sm"
                                        : "text-neutral-400 hover:text-gold hover:bg-white/5 border-l-2 border-transparent"
                                }`}
                            >
                                <span className={`transition-all duration-200 ${isActive ? "text-gold" : "text-neutral-500 group-hover:text-gold"}`}>
                                    {heading.text}
                                </span>
                            </a>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
