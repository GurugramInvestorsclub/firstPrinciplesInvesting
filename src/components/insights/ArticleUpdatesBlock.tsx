"use client"

import React from "react"
import Link from "next/link"
import { ArrowUpRight, ExternalLink, GitBranch, Lock } from "lucide-react"
import { ArticleUpdateItem } from "@/lib/types"
import { useArticleTheme } from "./ArticleThemeWrapper"

interface ArticleUpdatesBlockProps {
    updates?: ArticleUpdateItem[] | null
    className?: string
}

export function ArticleUpdatesBlock({ updates, className = "" }: ArticleUpdatesBlockProps) {
    const { theme } = useArticleTheme()
    const isLight = theme === "light"

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return null
    }

    // Filter out items that have neither a link nor a referenced post
    const validUpdates = updates.filter((item) => {
        const hasUrl = typeof item.url === "string" && item.url.trim().length > 0
        const hasPostRef = Boolean(item.post?.slug?.current)
        return hasUrl || hasPostRef
    })

    if (validUpdates.length === 0) {
        return null
    }

    return (
        <section
            aria-label="Article updates and linked coverage"
            className={`article-updates-container my-8 p-5 md:p-6 rounded-2xl border transition-all duration-300 ${
                isLight
                    ? "bg-white border-amber-300/80 shadow-[0_4px_24px_rgba(217,119,6,0.08)]"
                    : "bg-[#141311] border-gold/35 shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-[radial-gradient(ellipse_at_top_left,rgba(245,184,0,0.06),transparent_65%)]"
            } ${className}`}
        >
            {/* Header */}
            <div
                className={`article-updates-header-border flex items-center justify-between pb-3.5 mb-4 border-b ${
                    isLight ? "border-slate-200" : "border-white/10"
                }`}
            >
                <div className="flex items-center gap-2.5">
                    <span
                        className={`article-updates-header-icon p-1.5 rounded-lg border flex items-center justify-center ${
                            isLight
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : "bg-gold/15 text-gold border-gold/30"
                        }`}
                    >
                        <GitBranch className="w-3.5 h-3.5" />
                    </span>
                    <div>
                        <h2
                            className={`article-updates-header-title text-xs md:text-sm font-bold uppercase tracking-wider font-mono ${
                                isLight ? "text-slate-900" : "text-[#F0EDE8]"
                            }`}
                        >
                            Article Updates &amp; Linked Coverage
                        </h2>
                    </div>
                </div>
                <span
                    className={`article-updates-header-count text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                        isLight
                            ? "text-slate-600 bg-slate-100 border-slate-200"
                            : "text-neutral-400 bg-white/5 border-white/10"
                    }`}
                >
                    {validUpdates.length} {validUpdates.length === 1 ? "Link" : "Links"}
                </span>
            </div>

            {/* List of update cards */}
            <div className="space-y-3">
                {validUpdates.map((item, index) => {
                    const effectiveUrl =
                        (typeof item.url === "string" && item.url.trim().length > 0)
                            ? item.url.trim()
                            : item.post?.slug?.current
                            ? `/insights/${item.post.slug.current}`
                            : "#"

                    const effectiveTitle =
                        item.title?.trim() ||
                        item.post?.title?.trim() ||
                        "View Linked Article"

                    const effectiveBadge = item.badge?.trim() || "Update"
                    const effectiveDate =
                        item.date?.trim() ||
                        (item.post?.publishedAt
                            ? new Date(item.post.publishedAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  timeZone: "Asia/Kolkata",
                              })
                            : null)

                    const isExternal =
                        effectiveUrl.startsWith("http://") ||
                        effectiveUrl.startsWith("https://")

                    const isSubscriberOnly = item.post?.access === "subscriber"
                    const cardKey = item._key || `update-item-${index}`

                    const CardContent = (
                        <div
                            className={`article-updates-card group flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                                isLight
                                    ? "bg-slate-50 hover:bg-amber-50/70 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md"
                                    : "bg-[#1D1C18] hover:bg-[#24221C] border-white/10 hover:border-gold/50 shadow-sm hover:shadow-lg"
                            }`}
                        >
                            <div className="space-y-1.5 min-w-0 flex-1 text-left">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`article-updates-badge text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                            isLight
                                                ? "bg-amber-100 text-amber-950 border-amber-300"
                                                : "bg-gold/15 text-gold border-gold/30"
                                        }`}
                                    >
                                        {effectiveBadge}
                                    </span>
                                    {isSubscriberOnly && (
                                        <span
                                            className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                                isLight
                                                    ? "bg-amber-50 text-amber-900 border-amber-200"
                                                    : "bg-amber-950/50 text-amber-300 border-amber-800/60"
                                            }`}
                                        >
                                            <Lock className="w-2.5 h-2.5" />
                                            Members
                                        </span>
                                    )}
                                    {effectiveDate && (
                                        <span
                                            className={`article-updates-date text-[11px] font-mono ${
                                                isLight ? "text-slate-600 font-medium" : "text-neutral-400"
                                            }`}
                                        >
                                            {effectiveDate}
                                        </span>
                                    )}
                                </div>
                                <h3
                                    className={`article-updates-title text-sm md:text-base font-bold transition-colors tracking-tight line-clamp-2 leading-snug ${
                                        isLight
                                            ? "text-slate-900 group-hover:text-amber-800"
                                            : "text-[#F0EDE8] group-hover:text-gold"
                                    }`}
                                >
                                    {effectiveTitle}
                                </h3>
                                {item.description && (
                                    <p
                                        className={`article-updates-desc text-xs md:text-sm line-clamp-2 leading-relaxed pt-0.5 ${
                                            isLight ? "text-slate-700" : "text-neutral-300"
                                        }`}
                                    >
                                        {item.description}
                                    </p>
                                )}
                            </div>

                            <div className="self-end sm:self-center shrink-0">
                                <span
                                    className={`article-updates-cta inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg border transition-all ${
                                        isLight
                                            ? "bg-amber-100 text-amber-950 group-hover:bg-amber-600 group-hover:text-white border-amber-300/80 group-hover:border-amber-600 shadow-xs"
                                            : "bg-gold/15 text-gold group-hover:bg-gold group-hover:text-black border-gold/30 group-hover:border-gold shadow-xs"
                                    }`}
                                >
                                    <span>Read</span>
                                    {isExternal ? (
                                        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                    ) : (
                                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    )}
                                </span>
                            </div>
                        </div>
                    )

                    if (isExternal) {
                        return (
                            <a
                                key={cardKey}
                                href={effectiveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block no-underline"
                            >
                                {CardContent}
                            </a>
                        )
                    }

                    return (
                        <Link key={cardKey} href={effectiveUrl} className="block no-underline">
                            {CardContent}
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

