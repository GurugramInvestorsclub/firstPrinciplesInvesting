"use client"

import React, { useState } from "react"
import { X, Loader2, Save, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface PostData {
    _id?: string
    title?: string
    slug?: { current?: string } | string
    excerpt?: string
    access?: "public" | "subscriber" | string
    isFeatured?: boolean
    paywallHeadline?: string | null
    paywallCtaText?: string | null
}

interface AdminPostQuickEditDrawerProps {
    post: PostData
    slug: string
    isOpen: boolean
    onClose: () => void
}

export function AdminPostQuickEditDrawer({
    post,
    slug,
    isOpen,
    onClose,
}: AdminPostQuickEditDrawerProps) {
    const router = useRouter()
    const [title, setTitle] = useState(post.title || "")
    const [excerpt, setExcerpt] = useState(post.excerpt || "")
    const [access, setAccess] = useState(post.access === "subscriber" ? "subscriber" : "public")
    const [isFeatured, setIsFeatured] = useState(Boolean(post.isFeatured))
    const [paywallHeadline, setPaywallHeadline] = useState(post.paywallHeadline || "")
    const [paywallCtaText, setPaywallCtaText] = useState(post.paywallCtaText || "")

    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const res = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    excerpt,
                    access,
                    isFeatured,
                    paywallHeadline: access === "subscriber" ? paywallHeadline : null,
                    paywallCtaText: access === "subscriber" ? paywallCtaText : null,
                }),
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Failed to update post")
            }

            setSuccessMessage("Changes saved! Refreshing preview...")
            setTimeout(() => {
                router.refresh()
                onClose()
            }, 1000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error saving changes")
        } finally {
            setSaving(false)
        }
    }

    const studioUrl = post._id ? `/studio/structure/post;${post._id.replace("drafts.", "")}` : `/studio`

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Slide-out Panel */}
            <div className="relative w-full max-w-lg bg-[#141418] border-l border-white/10 text-white shadow-2xl p-6 sm:p-8 flex flex-col h-full overflow-y-auto z-10">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
                            <h2 className="text-lg font-bold text-white tracking-tight">Quick Edit Post</h2>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5 font-mono">Editing slug: {slug}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-5 flex-grow">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold mb-1.5">
                            Post Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                        />
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold mb-1.5">
                            Excerpt / Summary
                        </label>
                        <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-y"
                        />
                        <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                            Displayed on feed cards and social previews.
                        </span>
                    </div>

                    {/* Access Tier */}
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold mb-2">
                            Access Tier
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                    access === "public"
                                        ? "bg-gold/10 border-gold text-white font-bold"
                                        : "bg-white/5 border-white/10 text-neutral-400 hover:border-white/20"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="access"
                                    value="public"
                                    checked={access === "public"}
                                    onChange={() => setAccess("public")}
                                    className="accent-[#F5B800]"
                                />
                                <span className="text-xs">Public Access</span>
                            </label>

                            <label
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                    access === "subscriber"
                                        ? "bg-gold/10 border-gold text-white font-bold"
                                        : "bg-white/5 border-white/10 text-neutral-400 hover:border-white/20"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="access"
                                    value="subscriber"
                                    checked={access === "subscriber"}
                                    onChange={() => setAccess("subscriber")}
                                    className="accent-[#F5B800]"
                                />
                                <span className="text-xs">Subscriber Only</span>
                            </label>
                        </div>
                    </div>

                    {/* Featured Insight Toggle */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/5">
                        <div>
                            <span className="text-xs font-semibold text-white block">Featured Insight</span>
                            <span className="text-[11px] text-neutral-400">Pin to top hero of Insights page</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="w-4 h-4 accent-[#F5B800] cursor-pointer"
                        />
                    </div>

                    {/* Paywall customization if Subscriber */}
                    {access === "subscriber" && (
                        <div className="space-y-4 pt-2 border-t border-white/10">
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold mb-1.5">
                                    Custom Paywall Headline (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={paywallHeadline}
                                    onChange={(e) => setPaywallHeadline(e.target.value)}
                                    placeholder="e.g. Read the Full Research Memo"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold mb-1.5">
                                    Custom Paywall CTA Text (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={paywallCtaText}
                                    onChange={(e) => setPaywallCtaText(e.target.value)}
                                    placeholder="e.g. Start Membership to Unlock"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs leading-relaxed">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                            {successMessage}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                        <a
                            href={studioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-gold transition-colors font-mono"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Edit in Sanity Studio</span>
                        </a>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-neutral-300 hover:bg-white/5 font-semibold transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gold hover:bg-[#E0A800] text-black font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
