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
    parentId?: string | null;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
    replies?: CommentType[];
}

interface CommentsSectionProps {
    postSlug: string;
    initialComments: CommentType[];
    currentUserId?: string;
}

const CommentAvatar = ({ user }: { user: CommentType['user'] }) => {
    const [imgError, setImgError] = useState(false);

    if (user.image && !imgError) {
        return (
            <Image
                src={user.image}
                alt={user.name || "User"}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 object-cover"
                onError={() => setImgError(true)}
            />
        );
    }

    return (
        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-gold font-bold shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
        </div>
    );
};

const CommentItem = ({ 
    comment, 
    currentUserId, 
    onDelete, 
    onReply,
    isPending
}: {
    comment: CommentType;
    currentUserId?: string;
    onDelete: (id: string) => void;
    onReply: (parentId: string, content: string) => Promise<void>;
    isPending: boolean;
}) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        await onReply(comment.id, replyText);
        setReplyText("");
        setIsReplying(false);
    };

    return (
        <div className="flex flex-col gap-4 mb-2">
            <div className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex-shrink-0">
                    <CommentAvatar user={comment.user} />
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
                                onClick={() => onDelete(comment.id)}
                                disabled={isPending}
                                className="text-white/30 hover:text-red-400 transition-colors"
                                title="Delete comment"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed mb-2">
                        {comment.content}
                    </p>
                    {currentUserId && !isReplying && (
                        <button 
                            onClick={() => setIsReplying(true)}
                            className="text-xs text-gold hover:text-gold/80 font-semibold"
                        >
                            Reply
                        </button>
                    )}
                    
                    {isReplying && (
                        <form onSubmit={handleReplySubmit} className="mt-3 space-y-3">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold/50 transition-all min-h-[80px] resize-y"
                                disabled={isPending}
                            />
                            <div className="flex justify-end gap-2">
                                <Button 
                                    type="button" 
                                    onClick={() => setIsReplying(false)}
                                    variant="ghost"
                                    className="text-white/60 hover:text-white text-xs h-8 px-3"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isPending || !replyText.trim()}
                                    className="bg-gold text-black hover:bg-gold/90 font-bold text-xs h-8 px-4 rounded-full"
                                >
                                    Post Reply
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Render Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 space-y-4 border-l-2 border-white/10 pl-6">
                    {comment.replies.map(reply => (
                        <div key={reply.id} className="flex gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/5 relative">
                            {/* Visual connector line */}
                            <div className="absolute top-8 -left-6 w-4 h-[2px] bg-white/10"></div>
                            <div className="flex-shrink-0">
                                <CommentAvatar user={reply.user} />
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-white/90">
                                            {reply.user.name || "Anonymous User"}
                                        </span>
                                        <span className="text-xs text-white/40">
                                            {new Date(reply.createdAt).toLocaleDateString(undefined, { 
                                                month: 'short', day: 'numeric', year: 'numeric' 
                                            })}
                                        </span>
                                    </div>
                                    {currentUserId === reply.userId && (
                                        <button 
                                            type="button"
                                            onClick={() => onDelete(reply.id)}
                                            disabled={isPending}
                                            className="text-white/30 hover:text-red-400 transition-colors"
                                            title="Delete reply"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                                    {reply.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

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

    const handleAddReply = async (parentId: string, content: string) => {
        return new Promise<void>((resolve) => {
            startTransition(async () => {
                const result = await addComment(postSlug, content, parentId);
                if (result.success && result.comment) {
                    setComments(prev => prev.map(c => {
                        if (c.id === parentId) {
                            return {
                                ...c,
                                replies: [...(c.replies || []), result.comment as CommentType]
                            }
                        }
                        return c;
                    }))
                } else {
                    alert(result.error || "Failed to add reply")
                }
                resolve();
            });
        });
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return

        startTransition(async () => {
            const result = await deleteComment(commentId, postSlug)
            if (result.success) {
                setComments(prev => {
                    if (prev.find(c => c.id === commentId)) {
                        return prev.filter(c => c.id !== commentId)
                    }
                    return prev.map(c => ({
                        ...c,
                        replies: c.replies?.filter(r => r.id !== commentId)
                    }))
                })
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
                    {comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)}
                </span>
            </div>

            {currentUserId ? (
                <>
                    {/* Comment Form */}
                    <div className="mb-10">
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
                    </div>

                    {/* Comments List */}
                    <div className="space-y-6">
                        {comments.length === 0 ? (
                            <p className="text-center text-white/40 text-sm py-8 italic">No comments yet. Be the first to share your thoughts!</p>
                        ) : (
                            comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    currentUserId={currentUserId}
                                    onDelete={handleDelete}
                                    onReply={handleAddReply}
                                    isPending={isPending}
                                />
                            ))
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center my-8">
                    <p className="text-white/70 mb-4">Log in to view and join the discussion.</p>
                    <Link href={`/login?callbackUrl=/insights/${postSlug}`}>
                        <Button className="bg-gold text-black hover:bg-gold/90 font-bold px-6 rounded-full">
                            Log In To View Comments
                        </Button>
                    </Link>
                </div>
            )}
        </section>
    )
}
