import React from "react"
import Link from "next/link"
import { ArrowUpRight, ExternalLink, GitBranch } from "lucide-react"
import { ArticleUpdateItem } from "@/lib/types"

interface ArticleUpdatesBlockProps {
    updates?: ArticleUpdateItem[] | null
    className?: string
}

export function ArticleUpdatesBlock({ updates, className = "" }: ArticleUpdatesBlockProps) {
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
            className={`my-8 p-5 md:p-6 rounded-2xl border border-gold/35 bg-[radial-gradient(ellipse_at_top_left,rgba(245,184,0,0.08),transparent_60%)] bg-[#FAFAF7] dark:bg-[#151411] shadow-[0_4px_24px_rgba(245,184,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-gold/15 text-gold border border-gold/30">
                        <GitBranch className="w-3.5 h-3.5 text-gold" />
                    </span>
                    <div>
                        <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider font-mono text-text-primary">
                            Article Updates &amp; Linked Coverage
                        </h2>
                    </div>
                </div>
                <span className="text-[10px] font-mono font-semibold text-neutral-500 dark:text-neutral-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full border border-black/5 dark:border-white/5">
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

                    const cardKey = item._key || `update-item-${index}`

                    const CardContent = (
                        <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 md:p-4 rounded-xl border border-black/5 dark:border-white/5 bg-white/80 dark:bg-white/[0.03] hover:border-gold/50 dark:hover:border-gold/40 hover:bg-gold/[0.03] dark:hover:bg-gold/[0.05] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                            <div className="space-y-1.5 min-w-0 flex-1 text-left">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                                        {effectiveBadge}
                                    </span>
                                    {effectiveDate && (
                                        <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                                            {effectiveDate}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-sm md:text-base font-bold text-text-primary group-hover:text-gold transition-colors tracking-tight line-clamp-2 leading-snug">
                                    {effectiveTitle}
                                </h3>
                                {item.description && (
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed pt-0.5">
                                        {item.description}
                                    </p>
                                )}
                            </div>

                            <div className="self-end sm:self-center shrink-0">
                                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-gold bg-gold/10 group-hover:bg-gold/20 px-3 py-1.5 rounded-lg border border-gold/25 transition-all">
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
