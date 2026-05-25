"use client"

import { useState, useTransition } from "react"
import { addComment, deleteComment } from "@/app/actions/comments"
import { Button } from "@/components/ui/button"
import { Trash2, MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export type CommentType = {
    id: string;
    content: string;
    postSlug: string;
    userId: string;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    }
}

interface CommentsSectionProps {
    postSlug: string;
    initialComments: CommentType[];
    currentUserId?: string;
}

export function CommentsSection({ postSlug, initialComments, currentUserId }: CommentsSectionProps) {
    const [comments, setComments] = useState<CommentType[]>(initialComments)
    const [newComment, setNewComment] = useState("")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setError(null)
        const commentText = newComment

        startTransition(async () => {
            const result = await addComment(postSlug, commentText)
            if (result.success && result.comment) {
                setComments(prev => [result.comment as CommentType, ...prev])
                setNewComment("")
            } else {
                setError(result.error || "Failed to add comment")
            }
        })
    }

    const handleDelete = async (commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return

        startTransition(async () => {
            const result = await deleteComment(commentId, postSlug)
            if (result.success) {
                setComments(prev => prev.filter(c => c.id !== commentId))
            } else {
                alert(result.error || "Failed to delete comment")
            }
        })
    }

    return (
        <section className="mt-16 pt-10 border-t border-white/10">
            <div className="flex items-center gap-2 mb-8">
                <MessageSquare className="w-5 h-5 text-gold" />
                <h3 className="text-2xl font-bold text-white">Discussion</h3>
                <span className="bg-white/10 text-white/70 px-2 py-0.5 rounded-full text-xs font-mono ml-2">
                    {comments.length}
                </span>
            </div>

            {/* Comment Form */}
            <div className="mb-10">
                {currentUserId ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts on this insight..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all min-h-[120px] resize-y"
                            disabled={isPending}
                        />
                        {error && <p className="text-red-400 text-xs">{error}</p>}
                        <div className="flex justify-end">
                            <Button 
                                type="submit" 
                                disabled={isPending || !newComment.trim()}
                                className="bg-gold text-black hover:bg-gold/90 font-bold px-6 rounded-full"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Post Comment
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                        <p className="text-white/70 mb-4">Log in to join the discussion.</p>
                        <Link href={`/login?callbackUrl=/insights/${postSlug}`}>
                            <Button className="bg-gold text-black hover:bg-gold/90 font-bold px-6 rounded-full">
                                Log In To Comment
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-center text-white/40 text-sm py-8 italic">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex-shrink-0">
                                {comment.user.image ? (
                                    <Image
                                        src={comment.user.image}
                                        alt={comment.user.name || "User"}
                                        width={40}
                                        height={40}
                                        className="rounded-full bg-white/10 border border-white/20"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-gold font-bold">
                                        {comment.user.name ? comment.user.name.charAt(0).toUpperCase() : "?"}
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-white/90">
                                            {comment.user.name || "Anonymous User"}
                                        </span>
                                        <span className="text-xs text-white/40">
                                            {new Date(comment.createdAt).toLocaleDateString(undefined, { 
                                                month: 'short', day: 'numeric', year: 'numeric' 
                                            })}
                                        </span>
                                    </div>
                                    {currentUserId === comment.userId && (
                                        <button 
                                            type="button"
                                            onClick={() => handleDelete(comment.id)}
                                            disabled={isPending}
                                            className="text-white/30 hover:text-red-400 transition-colors"
                                            title="Delete comment"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}
