"use client"

import React, { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
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

    const renderTOCItem = (heading: HeadingItem, index: number) => {
        const isActive = activeId === heading.id
        const level = heading.level || 2
        const isFirst = index === 0

        // Spacing rules: H2 sections after first get larger separation (18-24px)
        // H3 items: 6-10px, H4-H6: 4-8px
        let spacingClass = "mt-1"
        if (level <= 2) {
            spacingClass = isFirst ? "mt-0" : "mt-4.5"
        } else if (level === 3) {
            spacingClass = "mt-1.5"
        } else {
            spacingClass = "mt-1"
        }

        // Font hierarchy & Indentation rules:
        // H2: 13-14px, 600, no indent
        // H3: 12-13px, 500, indent ~16px
        // H4: 11-12px, 400-500, indent ~28px
        // H5: 11px, 400, indent ~40px
        // H6: 10-11px, 400, indent ~52px
        let textStyles = ""
        let paddingLeft = "pl-2.5"

        if (level === 3) {
            textStyles = isActive
                ? "text-[12px] font-semibold text-white"
                : "text-[12px] font-medium text-neutral-400 group-hover:text-neutral-200"
            paddingLeft = "pl-[18px]"
        } else if (level === 4) {
            textStyles = isActive
                ? "text-[11px] font-semibold text-white"
                : "text-[11px] font-medium text-neutral-400/80 group-hover:text-neutral-200"
            paddingLeft = "pl-[30px]"
        } else if (level === 5) {
            textStyles = isActive
                ? "text-[11px] font-semibold text-white"
                : "text-[11px] font-normal text-neutral-500 group-hover:text-neutral-300"
            paddingLeft = "pl-[42px]"
        } else if (level >= 6) {
            textStyles = isActive
                ? "text-[10px] font-semibold text-white"
                : "text-[10px] font-normal text-neutral-500/80 group-hover:text-neutral-300"
            paddingLeft = "pl-[54px]"
        } else {
            // H2
            textStyles = isActive
                ? "text-[13px] font-semibold text-white"
                : "text-[13px] font-semibold text-neutral-300 group-hover:text-white"
            paddingLeft = "pl-2.5"
        }

        const lineCount = Math.max(0, level - 2)

        return (
            <li key={heading.id} className={spacingClass}>
                <a
                    href={`#${heading.id}`}
                    onClick={(e) => scrollToHeading(e, heading.id)}
                    className={`group relative flex items-center py-1 pr-2 rounded-r-[2px] transition-all duration-150 cursor-pointer ${paddingLeft} ${
                        isActive
                            ? "border-l-2 border-gold bg-gold/[0.08] shadow-[inset_1px_0_0_0_rgba(245,184,0,0.25)]"
                            : "border-l-2 border-transparent hover:border-neutral-700/60 hover:bg-white/[0.03]"
                    }`}
                >
                    {/* Subtle hierarchy guide lines for nested items (H3-H6) */}
                    {lineCount > 0 &&
                        Array.from({ length: lineCount }).map((_, i) => (
                            <span
                                key={i}
                                aria-hidden="true"
                                className={`absolute top-0 bottom-0 w-[1px] pointer-events-none transition-colors duration-150 ${
                                    isActive
                                        ? i === lineCount - 1
                                            ? "bg-gold/50"
                                            : "bg-gold/20"
                                        : "bg-white/[0.07] group-hover:bg-white/[0.16]"
                                }`}
                                style={{ left: `${6 + i * 12}px` }}
                            />
                        ))}

                    <span className={`leading-snug break-words max-w-full select-none ${textStyles}`}>
                        {heading.text}
                    </span>
                </a>
            </li>
        )
    }

    if (variant === "mobile") {
        return (
            <div className={`rounded-md border border-neutral-800 bg-[#121212] p-3.5 mb-8 text-sm shadow-md transition-all ${className}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full text-left font-mono text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold/80 cursor-pointer select-none"
                    aria-expanded={isOpen}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-gold text-[12px] font-bold leading-none">☷</span>
                        <span className="tracking-[0.1em] text-[11px] font-mono text-gold/90 font-semibold">
                            In This Memo ({headings.length})
                        </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gold/80 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                    <nav className="mt-3 pt-2.5 border-t border-white/10 space-y-0.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                        <ul className="list-none p-0 m-0">
                            {headings.map((heading, index) => renderTOCItem(heading, index))}
                        </ul>
                    </nav>
                )}
            </div>
        )
    }

    // Desktop Variant (Sticky Sidebar)
    return (
        <nav
            aria-label="Table of contents"
            className={`w-full font-sans select-none rounded-md border border-neutral-800/80 bg-[#121212]/95 backdrop-blur-sm p-3.5 shadow-xl ${className}`}
        >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                <span className="text-gold text-[12px] font-bold leading-none select-none">☷</span>
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-gold/90">
                    In This Memo
                </span>
            </div>

            <ul className="list-none p-0 m-0 max-h-[calc(100vh-11rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-gold/30">
                {headings.map((heading, index) => renderTOCItem(heading, index))}
            </ul>
        </nav>
    )
}

