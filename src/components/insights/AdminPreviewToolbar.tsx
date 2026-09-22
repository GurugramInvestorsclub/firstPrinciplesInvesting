"use client"

import React, { useState } from "react"
import { CheckCircle2, Edit3, ExternalLink, Loader2, Eye, ShieldAlert, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { AdminPostQuickEditDrawer } from "./AdminPostQuickEditDrawer"

interface PostData {
    _id?: string
    title?: string
    slug?: { current?: string } | string
    excerpt?: string
    access?: "public" | "subscriber" | string
    isFeatured?: boolean
    approvalStatus?: "pending" | "approved" | string
    approvedAt?: string | null
    paywallHeadline?: string | null
    paywallCtaText?: string | null
}

interface AdminPreviewToolbarProps {
    post: PostData
    slug: string
}

export function AdminPreviewToolbar({ post, slug }: AdminPreviewToolbarProps) {
    const router = useRouter()
    const [status, setStatus] = useState<string>(post.approvalStatus || "approved")
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
    const [approving, setApproving] = useState(false)
    const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null)

    const isPending = status === "pending"
    const studioUrl = post._id ? `/studio/structure/post;${post._id.replace("drafts.", "")}` : `/studio`

    const handleApprove = async () => {
        if (!confirm(`Are you ready to approve "${post.title || slug}" and make it visible to all users?`)) {
            return
        }

        setApproving(true)
        setFeedback(null)

        try {
            const res = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Failed to approve post")
            }

            setStatus("approved")
            setFeedback({ message: data.message || "Post approved and published live!", type: "success" })
            setTimeout(() => {
                router.refresh()
            }, 1200)
        } catch (err) {
            setFeedback({
                message: err instanceof Error ? err.message : "Error approving post",
                type: "error",
            })
        } finally {
            setApproving(false)
        }
    }

    return (
        <>
            <aside aria-label="Admin live preview controls" className="sticky top-0 z-50 w-full bg-[#0E0E12]/95 backdrop-blur-md border-b border-amber-500/30 text-white shadow-xl transition-all select-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Left: Mode & Status badges */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                            <Eye className="w-3.5 h-3.5" />
                            Admin Live Preview
                        </span>

                        {isPending ? (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-400/40 text-amber-300 font-semibold text-[11px]">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                                <span>🟡 Pending Approval (Hidden from Public)</span>
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>🟢 Approved & Live</span>
                            </span>
                        )}

                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300 font-mono text-[10px] uppercase">
                            {post.access === "subscriber" ? "🔒 Subscriber Only" : "🌐 Public"}
                        </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Quick Edit Button */}
                        <button
                            onClick={() => setIsEditDrawerOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white font-medium transition-colors cursor-pointer"
                            title="Quickly edit Title, Excerpt, or Access"
                        >
                            <Edit3 className="w-3.5 h-3.5 text-gold" />
                            <span>Quick Edit</span>
                        </button>

                        {/* Open in Studio Link */}
                        <a
                            href={studioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 font-mono text-[11px] transition-colors"
                            title="Open in Sanity Studio"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Studio</span>
                        </a>

                        {/* Approve Button (shown if pending) */}
                        {isPending ? (
                            <button
                                onClick={handleApprove}
                                disabled={approving}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gold hover:bg-[#E0A800] text-black font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                            >
                                {approving ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Publishing…</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Approve & Make Live</span>
                                    </>
                                )}
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* Feedback Toast Notice */}
                {feedback && (
                    <div
                        className={`px-4 py-1.5 text-center text-xs font-mono border-t ${
                            feedback.type === "success"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}
                    >
                        {feedback.message}
                    </div>
                )}
            </aside>

            {/* Quick Edit Drawer */}
            <AdminPostQuickEditDrawer
                post={post}
                slug={slug}
                isOpen={isEditDrawerOpen}
                onClose={() => setIsEditDrawerOpen(false)}
            />
        </>
    )
}
