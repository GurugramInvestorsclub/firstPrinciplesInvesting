"use client"

import React, { useEffect, useState } from "react"
import { ChevronDown, PanelLeftClose, PanelLeftOpen, List, ArrowUp } from "lucide-react"
import { HeadingItem } from "@/lib/toc"

interface TableOfContentsProps {
    headings: HeadingItem[]
    variant?: "desktop" | "mobile"
    className?: string
}

export function TableOfContents({ headings, variant = "desktop", className = "" }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>("")
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
    const [theme, setTheme] = useState<"dark" | "light">("dark")

    useEffect(() => {
        const saved = localStorage.getItem("fpi-toc-collapsed")
        if (saved === "true") {
            setIsCollapsed(true)
        }
    }, [])

    const toggleCollapsed = (collapsed: boolean) => {
        setIsCollapsed(collapsed)
        localStorage.setItem("fpi-toc-collapsed", collapsed ? "true" : "false")
    }

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

    useEffect(() => {
        const savedTheme = localStorage.getItem("fpi-article-theme") as "dark" | "light" | null
        if (savedTheme === "light" || savedTheme === "dark") {
            setTheme(savedTheme)
        }

        const handleThemeChange = () => {
            const currentTheme = localStorage.getItem("fpi-article-theme") as "dark" | "light" | null
            if (currentTheme) {
                setTheme(currentTheme)
            }
        }

        window.addEventListener("fpi-article-theme-change", handleThemeChange)
        return () => window.removeEventListener("fpi-article-theme-change", handleThemeChange)
    }, [])

    if (!headings || headings.length < 2) {
        return null
    }

    const isLight = theme === "light"

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

        // Spacing rules: H2 sections after first get separation (~16px)
        // H3 items: 6-10px, H4-H6: 4-8px
        let spacingClass = "mt-1"
        if (level <= 2) {
            spacingClass = isFirst ? "mt-0" : "mt-3.5"
        } else if (level === 3) {
            spacingClass = "mt-1.5"
        } else {
            spacingClass = "mt-1"
        }

        // Font hierarchy & Indentation rules per theme:
        let textStyles = ""
        let paddingLeft = "pl-2.5"

        if (level === 3) {
            textStyles = isActive
                ? isLight
                    ? "text-[12px] font-semibold text-[#0F172A]"
                    : "text-[12px] font-semibold text-white"
                : isLight
                    ? "text-[12px] font-medium text-slate-600 group-hover:text-[#0F172A]"
                    : "text-[12px] font-medium text-neutral-400 group-hover:text-neutral-200"
            paddingLeft = "pl-[18px]"
        } else if (level === 4) {
            textStyles = isActive
                ? isLight
                    ? "text-[11px] font-semibold text-[#0F172A]"
                    : "text-[11px] font-semibold text-white"
                : isLight
                    ? "text-[11px] font-medium text-slate-500 group-hover:text-[#0F172A]"
                    : "text-[11px] font-medium text-neutral-400/80 group-hover:text-neutral-200"
            paddingLeft = "pl-[30px]"
        } else if (level === 5) {
            textStyles = isActive
                ? isLight
                    ? "text-[11px] font-semibold text-[#0F172A]"
                    : "text-[11px] font-semibold text-white"
                : isLight
                    ? "text-[11px] font-normal text-slate-500 group-hover:text-[#0F172A]"
                    : "text-[11px] font-normal text-neutral-500 group-hover:text-neutral-300"
            paddingLeft = "pl-[42px]"
        } else if (level >= 6) {
            textStyles = isActive
                ? isLight
                    ? "text-[10px] font-semibold text-[#0F172A]"
                    : "text-[10px] font-semibold text-white"
                : isLight
                    ? "text-[10px] font-normal text-slate-500 group-hover:text-[#0F172A]"
                    : "text-[10px] font-normal text-neutral-500/80 group-hover:text-neutral-300"
            paddingLeft = "pl-[54px]"
        } else {
            // H2
            textStyles = isActive
                ? isLight
                    ? "text-[13px] font-semibold text-[#0F172A]"
                    : "text-[13px] font-semibold text-white"
                : isLight
                    ? "text-[13px] font-semibold text-[#334155] group-hover:text-[#0F172A]"
                    : "text-[13px] font-semibold text-neutral-300 group-hover:text-white"
            paddingLeft = "pl-2.5"
        }

        const lineCount = Math.max(0, level - 2)

        const activeItemClasses = isLight
            ? "border-l-2 border-[#D97706] bg-[#F5B800]/12 shadow-[inset_1px_0_0_0_rgba(217,119,6,0.3)]"
            : "border-l-2 border-gold bg-gold/[0.08] shadow-[inset_1px_0_0_0_rgba(245,184,0,0.25)]"

        const inactiveItemClasses = isLight
            ? "border-l-2 border-transparent hover:border-slate-300 hover:bg-black/[0.04]"
            : "border-l-2 border-transparent hover:border-neutral-700/60 hover:bg-white/[0.03]"

        return (
            <li key={heading.id} className={spacingClass}>
                <a
                    href={`#${heading.id}`}
                    onClick={(e) => scrollToHeading(e, heading.id)}
                    className={`group relative flex items-center py-1 pr-2 rounded-r-[2px] transition-all duration-150 cursor-pointer ${paddingLeft} ${
                        isActive ? activeItemClasses : inactiveItemClasses
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
                                        ? isLight
                                            ? i === lineCount - 1
                                                ? "bg-[#D97706]/70"
                                                : "bg-[#D97706]/30"
                                            : i === lineCount - 1
                                                ? "bg-gold/50"
                                                : "bg-gold/20"
                                        : isLight
                                            ? "bg-slate-300/70 group-hover:bg-slate-400"
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
            <div
                className={`rounded-xl border transition-all duration-200 p-3.5 mb-8 text-sm ${
                    isLight
                        ? "border-[#E5E1D8] bg-[#F7F7F5] text-[#1A1A1A] shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                        : "border-neutral-800 bg-[#141414] text-neutral-200 shadow-md"
                } ${className}`}
            >
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center justify-between w-full text-left font-mono text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors ${
                        isLight ? "text-[#1A1A1A] hover:text-[#0F172A]" : "text-gold hover:text-gold/80"
                    }`}
                    aria-expanded={isOpen}
                >
                    <div className="flex items-center gap-2">
                        <span className={`${isLight ? "text-[#D97706]" : "text-gold"} text-[12px] font-bold leading-none`}>☷</span>
                        <span className={`tracking-[0.1em] text-[11px] font-mono font-semibold ${isLight ? "text-[#1A1A1A]" : "text-gold/90"}`}>
                            In This Memo ({headings.length})
                        </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 ${isLight ? "text-slate-600" : "text-gold/80"} transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                    <nav className={`mt-3 pt-2.5 border-t space-y-0.5 max-h-80 overflow-y-auto pr-1 ${
                        isLight
                            ? "border-[#E5E1D8] scrollbar-thin scrollbar-thumb-neutral-300"
                            : "border-white/10 scrollbar-thin scrollbar-thumb-white/10"
                    }`}>
                        <ul className="list-none p-0 m-0">
                            {headings.map((heading, index) => renderTOCItem(heading, index))}
                        </ul>
                    </nav>
                )}
            </div>
        )
    }

    // Desktop Variant (Edge-aligned fixed sidebar with close/open toggle)
    if (isCollapsed) {
        return (
            <div className={`hidden lg:block fixed left-0 top-28 z-40 ${className}`}>
                <button
                    onClick={() => toggleCollapsed(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-r-xl border border-l-0 shadow-2xl transition-all duration-300 cursor-pointer group select-none ${
                        isLight
                            ? "bg-[#F7F7F5] border-[#E5E1D8] text-slate-700 hover:text-black hover:bg-white"
                            : "bg-[#141414]/95 border-gold/40 text-gold hover:bg-[#1E1E1E] hover:border-gold/70 shadow-[0_0_25px_rgba(245,184,0,0.25)]"
                    }`}
                    title="Open Table of Contents"
                    aria-label="Open Table of Contents"
                >
                    <PanelLeftOpen className="w-4 h-4 text-gold shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    <span className={`text-[11px] font-mono font-semibold uppercase tracking-wider ${
                        isLight ? "text-slate-800" : "text-neutral-200"
                    }`}>
                        Contents
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isLight ? "bg-slate-200 text-slate-700" : "bg-gold/10 text-gold border border-gold/20"
                    }`}>
                        {headings.length}
                    </span>
                </button>
            </div>
        )
    }

    return (
        <aside
            aria-label="Table of contents"
            className={`hidden lg:flex fixed left-0 top-24 bottom-6 z-40 w-72 max-w-[85vw] flex-col transition-all duration-300 ease-in-out shadow-2xl rounded-r-2xl border-y border-r select-none ${
                isLight
                    ? "bg-[#F7F7F5]/95 border-[#E5E1D8] text-[#1A1A1A] backdrop-blur-md"
                    : "bg-[#12110F]/95 border-neutral-800/80 text-neutral-200 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
            } ${className}`}
        >
            {/* Sidebar Header */}
            <div className={`flex items-center justify-between p-3.5 border-b shrink-0 ${
                isLight ? "border-[#E5E1D8]" : "border-white/10"
            }`}>
                <div className="flex items-center gap-2 min-w-0">
                    <List className={`w-4 h-4 shrink-0 ${isLight ? "text-[#D97706]" : "text-gold"}`} />
                    <span className={`text-[11px] font-mono font-semibold uppercase tracking-[0.1em] truncate ${
                        isLight ? "text-[#1A1A1A]" : "text-gold/90"
                    }`}>
                        In This Memo
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        isLight ? "bg-slate-200 text-slate-700" : "bg-gold/10 text-gold border border-gold/20"
                    }`}>
                        {headings.length}
                    </span>
                </div>
                <button
                    onClick={() => toggleCollapsed(true)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isLight 
                            ? "hover:bg-slate-200 text-slate-600 hover:text-black" 
                            : "hover:bg-white/10 text-neutral-400 hover:text-white"
                    }`}
                    title="Close sidebar"
                    aria-label="Close sidebar"
                >
                    <PanelLeftClose className="w-4 h-4" />
                </button>
            </div>

            {/* Heading List */}
            <div className={`flex-1 overflow-y-auto p-3.5 pr-2 ${
                isLight
                    ? "scrollbar-thin scrollbar-thumb-neutral-300 hover:scrollbar-thumb-neutral-400"
                    : "scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-gold/30"
            }`}>
                <ul className="list-none p-0 m-0 space-y-0.5">
                    {headings.map((heading, index) => renderTOCItem(heading, index))}
                </ul>
            </div>

            {/* Sidebar Footer */}
            <div className={`p-2.5 px-3.5 border-t text-[10px] font-mono flex items-center justify-between shrink-0 ${
                isLight ? "border-[#E5E1D8] text-slate-500" : "border-white/5 text-neutral-500"
            }`}>
                <span className="truncate max-w-[180px]">
                    {headings.find(h => h.id === activeId)?.text || "Top of page"}
                </span>
                <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="hover:text-gold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Scroll to top"
                >
                    <ArrowUp className="w-3 h-3" />
                    <span>Top</span>
                </button>
            </div>
        </aside>
    )
}
