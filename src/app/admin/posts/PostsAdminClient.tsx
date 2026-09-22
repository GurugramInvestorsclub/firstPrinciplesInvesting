"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Eye, ExternalLink, Sparkles, Loader2, Search, CheckCircle2, ShieldAlert, FileText } from "lucide-react"

export interface AdminPostItem {
    _id: string
    title?: string
    slug?: { current?: string } | string
    excerpt?: string
    access?: "public" | "subscriber" | string
    approvalStatus?: "pending" | "approved" | string
    approvedAt?: string | null
    isFeatured?: boolean
    publishedAt?: string
    _updatedAt?: string
    _createdAt?: string
}

interface Props {
    posts: AdminPostItem[]
}

export function PostsAdminClient({ posts: initialPosts }: Props) {
    const [posts, setPosts] = useState<AdminPostItem[]>(initialPosts)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all")
    const [approvingId, setApprovingId] = useState<string | null>(null)

    const pendingCount = posts.filter(p => p.approvalStatus === "pending").length
    const approvedCount = posts.filter(p => p.approvalStatus !== "pending").length
    const subscriberCount = posts.filter(p => p.access === "subscriber").length

    const filteredPosts = posts.filter(post => {
        const slugStr = typeof post.slug === "object" ? post.slug?.current : post.slug
        const matchesSearch = !search.trim() || 
            (post.title?.toLowerCase().includes(search.toLowerCase()) || 
             slugStr?.toLowerCase().includes(search.toLowerCase()) ||
             post.excerpt?.toLowerCase().includes(search.toLowerCase()))

        const isPending = post.approvalStatus === "pending"
        const matchesStatus = 
            statusFilter === "all" ? true :
            statusFilter === "pending" ? isPending :
            !isPending

        return matchesSearch && matchesStatus
    })

    const handleQuickApprove = async (post: AdminPostItem) => {
        const slugStr = typeof post.slug === "object" ? post.slug?.current : post.slug
        if (!slugStr) return

        if (!confirm(`Approve and publish "${post.title || slugStr}" live to everyone?`)) {
            return
        }

        setApprovingId(post._id)
        try {
            const res = await fetch(`/api/admin/posts/${encodeURIComponent(slugStr)}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to approve")

            setPosts(prev => prev.map(p => p._id === post._id ? { ...p, approvalStatus: "approved", approvedAt: data.approvedAt } : p))
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error approving post")
        } finally {
            setApprovingId(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-gold" />
                        <span>CMS Posts & Live Previews</span>
                    </h1>
                    <p className="text-xs text-neutral-400 mt-1 font-mono">
                        Review pending insights, preview live on the site, and publish to members.
                    </p>
                </div>

                <a
                    href="/studio/structure/post"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold hover:bg-[#E0A800] text-black font-bold text-xs shadow-md transition-colors w-fit"
                >
                    <ExternalLink className="w-4 h-4" />
                    <span>Create / Edit in Studio</span>
                </a>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                    <span className="text-xs font-mono text-neutral-400 block">Total Posts</span>
                    <span className="text-2xl font-bold text-white mt-1 block">{posts.length}</span>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                    <span className="text-xs font-mono text-amber-400 block">Pending Approval</span>
                    <span className="text-2xl font-bold text-amber-300 mt-1 block">{pendingCount}</span>
                </div>

                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                    <span className="text-xs font-mono text-emerald-400 block">Live & Approved</span>
                    <span className="text-2xl font-bold text-emerald-300 mt-1 block">{approvedCount}</span>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                    <span className="text-xs font-mono text-neutral-400 block">Subscriber-Only</span>
                    <span className="text-2xl font-bold text-white mt-1 block">{subscriberCount}</span>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                            statusFilter === "all" ? "bg-white/20 text-white" : "text-neutral-400 hover:text-white bg-white/5"
                        }`}
                    >
                        All ({posts.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter("pending")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                            statusFilter === "pending"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "text-neutral-400 hover:text-amber-400 bg-white/5"
                        }`}
                    >
                        🟡 Pending ({pendingCount})
                    </button>
                    <button
                        onClick={() => setStatusFilter("approved")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                            statusFilter === "approved"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "text-neutral-400 hover:text-emerald-400 bg-white/5"
                        }`}
                    >
                        🟢 Live ({approvedCount})
                    </button>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-gold transition-colors font-mono"
                    />
                </div>
            </div>

            {/* Posts Table */}
            <div className="rounded-xl border border-white/10 overflow-hidden bg-[#141418] shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 border-b border-white/10 text-neutral-400 font-mono uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Post Title & Slug</th>
                                <th className="p-4">Access</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Updated / Published</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500 font-mono italic">
                                        No posts found matching the criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => {
                                    const slugStr = typeof post.slug === "object" ? post.slug?.current : post.slug
                                    const isPending = post.approvalStatus === "pending"
                                    const studioDocUrl = `/studio/structure/post;${post._id.replace("drafts.", "")}`
                                    const isApproving = approvingId === post._id

                                    return (
                                        <tr key={post._id} className="hover:bg-white/[0.02] transition-colors">
                                            {/* Title & Slug */}
                                            <td className="p-4">
                                                <div className="font-bold text-white text-sm line-clamp-1">
                                                    {post.title || "Untitled Post"}
                                                </div>
                                                <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                                                    /insights/{slugStr || "no-slug"}
                                                </div>
                                                {post.isFeatured && (
                                                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-gold/20 text-gold border border-gold/30">
                                                        ★ Featured
                                                    </span>
                                                )}
                                            </td>

                                            {/* Access Tier */}
                                            <td className="p-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                                                        post.access === "subscriber"
                                                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                                                            : "bg-white/10 border border-white/15 text-neutral-300"
                                                    }`}
                                                >
                                                    {post.access === "subscriber" ? "🔒 Subscriber" : "🌐 Public"}
                                                </span>
                                            </td>

                                            {/* Approval Status */}
                                            <td className="p-4 whitespace-nowrap">
                                                {isPending ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-medium font-mono">
                                                        <ShieldAlert className="w-3 h-3 text-amber-400" />
                                                        <span>Pending Approval</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium font-mono">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                        <span>Live</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Date */}
                                            <td className="p-4 font-mono text-neutral-400 text-[11px] whitespace-nowrap">
                                                {post._updatedAt ? new Date(post._updatedAt).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                }) : "—"}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center gap-2">
                                                    {slugStr && (
                                                        <Link
                                                            href={`/insights/${slugStr}`}
                                                            target="_blank"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-[11px] font-semibold transition-colors"
                                                            title="Open Live Preview on the site"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>Live Preview</span>
                                                        </Link>
                                                    )}

                                                    <a
                                                        href={studioDocUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white font-mono text-[11px] transition-colors"
                                                        title="Open in Sanity Studio"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        <span>Studio</span>
                                                    </a>

                                                    {isPending && slugStr && (
                                                        <button
                                                            onClick={() => handleQuickApprove(post)}
                                                            disabled={isApproving}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold hover:bg-[#E0A800] text-black font-bold text-[11px] shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                                                            title="Approve and make visible to public"
                                                        >
                                                            {isApproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                            <span>Approve</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
