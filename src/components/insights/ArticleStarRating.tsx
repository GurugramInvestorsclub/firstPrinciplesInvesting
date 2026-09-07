"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { submitArticleRating, RatingStats } from "@/app/actions/ratings"

interface ArticleStarRatingProps {
    postSlug: string
    initialStats: RatingStats
    hasAccess: boolean
    variant?: "header" | "interactive"
}

export function ArticleStarRating({
    postSlug,
    initialStats,
    hasAccess,
    variant = "interactive",
}: ArticleStarRatingProps) {
    const [stats, setStats] = useState<RatingStats>(initialStats)
    const [hoverRating, setHoverRating] = useState<number | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    const handleRate = async (rating: number) => {
        if (!hasAccess || submitting) return
        setSubmitting(true)
        setErrorMsg(null)
        setSuccessMsg(null)

        try {
            const result = await submitArticleRating(postSlug, rating)
            if (result.success && result.stats) {
                setStats(result.stats)
                setSuccessMsg(`Thank you! You rated this ${rating} star${rating !== 1 ? "s" : ""}.`)
            } else {
                setErrorMsg(result.error || "Failed to submit rating")
            }
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Error submitting rating")
        } finally {
            setSubmitting(false)
        }
    }

    // Header badge variant (compact overview)
    if (variant === "header") {
        if (stats.totalRatings === 0) {
            return (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-mono font-medium">
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    <span>New Memo</span>
                </div>
            )
        }

        return (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-gold/30 backdrop-blur-md shadow-sm text-xs font-mono">
                <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    <span className="font-bold text-gold">{stats.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-white/40">•</span>
                <span className="text-white/70 text-[11px]">
                    {stats.totalRatings} {stats.totalRatings === 1 ? "rating" : "ratings"}
                </span>
            </div>
        )
    }

    // Interactive card variant
    const currentActiveRating = hoverRating !== null ? hoverRating : (stats.userRating || 0)

    return (
        <section className="my-10 rounded-2xl border border-gold/30 bg-[radial-gradient(circle_at_top_left,rgba(245,184,0,0.08),transparent_60%),rgba(20,20,24,0.6)] p-6 md:p-8 backdrop-blur-md shadow-lg transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Rating Title & Average Stats */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
                            Member Feedback
                        </span>
                        {stats.userRating && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                Rated {stats.userRating} ★
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                        Rate this Research Memo
                    </h3>
                    <p className="text-xs text-white/60">
                        {stats.totalRatings > 0 ? (
                            <>
                                Average rating: <strong className="text-gold font-semibold">{stats.averageRating.toFixed(1)} / 5.0</strong> ({stats.totalRatings} member {stats.totalRatings === 1 ? "rating" : "ratings"})
                            </>
                        ) : (
                            "Be the first member to rate this deep dive!"
                        )}
                    </p>
                </div>

                {/* Star Selection Area */}
                <div className="flex flex-col items-start md:items-end gap-2">
                    {hasAccess ? (
                        <div className="flex items-center gap-1.5" onMouseLeave={() => setHoverRating(null)}>
                            {[1, 2, 3, 4, 5].map((starIndex) => {
                                const isFilled = starIndex <= currentActiveRating
                                return (
                                    <button
                                        key={starIndex}
                                        type="button"
                                        disabled={submitting}
                                        onMouseEnter={() => setHoverRating(starIndex)}
                                        onClick={() => handleRate(starIndex)}
                                        className={`p-1.5 rounded-lg transition-all transform duration-150 ${
                                            submitting
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:scale-125 cursor-pointer active:scale-95"
                                        }`}
                                        aria-label={`Rate ${starIndex} out of 5 stars`}
                                    >
                                        <Star
                                            className={`w-6 h-6 md:w-7 md:h-7 transition-colors ${
                                                isFilled
                                                    ? "fill-gold text-gold drop-shadow-[0_0_8px_rgba(245,184,0,0.5)]"
                                                    : "text-white/20 hover:text-gold/60"
                                            }`}
                                        />
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 font-mono">
                            🔒 Insights membership required to rate
                        </div>
                    )}

                    {/* Status Feedback Messages */}
                    {submitting && (
                        <span className="text-xs text-gold animate-pulse font-mono">Saving rating…</span>
                    )}
                    {successMsg && !submitting && (
                        <span className="text-xs text-emerald-400 font-mono">{successMsg}</span>
                    )}
                    {errorMsg && !submitting && (
                        <span className="text-xs text-rose-400 font-mono">{errorMsg}</span>
                    )}
                </div>
            </div>
        </section>
    )
}
