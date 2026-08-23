"use client"

import { useCallback, useEffect, useState, use } from "react"
import Link from "next/link"
import {
  Sparkles,
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  Send,
  Eye,
  Key,
  Lock,
} from "lucide-react"

interface Author {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

interface ForumPost {
  id: string
  content: string
  parentId: string | null
  createdAt: string
  author: Author
}

interface ForumTopicDetail {
  id: string
  title: string
  slug: string
  content: string
  isPinned: boolean
  isLocked: boolean
  viewsCount: number
  createdAt: string
  author: Author
  posts: ForumPost[]
}

export default function Super30TopicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const { slug } = resolvedParams

  const [topic, setTopic] = useState<ForumTopicDetail | null>(null)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reply input state
  const [replyContent, setReplyContent] = useState("")
  const [submittingReply, setSubmittingReply] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  const loadTopic = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/forum/topics/${slug}`)
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load topic")
      }

      setAuthorized(json.authorized)
      setTopic(json.topic)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load thread")
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    loadTopic()
  }, [loadTopic])

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setSubmittingReply(true)
    setReplyError(null)

    try {
      const res = await fetch(`/api/forum/topics/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent.trim() }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to post reply")
      }

      setReplyContent("")
      loadTopic()
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Failed to post reply")
    } finally {
      setSubmittingReply(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep, #0a0a0a)", color: "#fff", padding: "40px 24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Back Link */}
        <div style={{ marginBottom: "24px" }}>
          <Link
            href="/forum/super30"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} /> Back to Super 30 Forum
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.6)" }}>
            <RefreshCw className="animate-spin" style={{ width: "28px", height: "28px", color: "var(--gold, #f5b800)", margin: "0 auto 12px" }} />
            <div>Loading Topic...</div>
          </div>
        )}

        {/* Unauthorized Passcode Gate */}
        {!loading && authorized === false && (
          <div style={{ background: "rgba(26, 26, 26, 0.8)", border: "1px solid rgba(245, 184, 0, 0.3)", borderRadius: "16px", padding: "48px 32px", textAlign: "center" }}>
            <Key style={{ width: "32px", height: "32px", color: "var(--gold, #f5b800)", margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>
              Super 30 Passcode Required
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", maxWidth: "480px", margin: "0 auto 24px" }}>
              Please unlock the Super 30 Forum with your invitation passcode to view this topic discussion.
            </p>
            <Link
              href="/forum/super30"
              style={{ display: "inline-flex", padding: "12px 24px", borderRadius: "8px", background: "var(--gold, #f5b800)", color: "#000", fontWeight: 700, textDecoration: "none" }}
            >
              Enter Super 30 Passcode →
            </Link>
          </div>
        )}

        {/* Authorized Topic Details */}
        {!loading && authorized === true && topic && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Topic Main Card */}
            <div style={{ background: "rgba(26, 26, 26, 0.8)", border: "1px solid rgba(245, 184, 0, 0.25)", borderRadius: "16px", padding: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", padding: "3px 8px", borderRadius: "6px", background: "rgba(245, 184, 0, 0.15)", color: "var(--gold, #f5b800)", fontWeight: 700 }}>
                  SUPER 30 FORUM
                </span>
                {topic.isLocked && (
                  <span style={{ fontSize: "12px", padding: "3px 8px", borderRadius: "6px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Lock style={{ width: "12px", height: "12px" }} /> LOCKED
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: "0 0 16px 0", letterSpacing: "-0.02em" }}>
                {topic.title}
              </h1>

              {/* Author & Meta Row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", marginBottom: "20px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(245, 184, 0, 0.2)", color: "var(--gold, #f5b800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    {(topic.author.name || "M")[0].toUpperCase()}
                  </div>
                  <div>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{topic.author.name || "Member"}</span>
                    <span style={{ margin: "0 6px" }}>•</span>
                    <span>{new Date(topic.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Eye style={{ width: "15px", height: "15px" }} /> {topic.viewsCount} views
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <MessageSquare style={{ width: "15px", height: "15px" }} /> {topic.posts.length} replies
                  </span>
                </div>
              </div>

              {/* Topic Body Content */}
              <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.9)", lineHeight: "1.7", whitespace: "pre-wrap" }}>
                {topic.content}
              </div>
            </div>

            {/* Reply Editor Box */}
            {!topic.isLocked && (
              <div style={{ background: "rgba(26, 26, 26, 0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginTop: 0, marginBottom: "12px" }}>
                  Post a Reply
                </h3>

                {replyError && (
                  <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#ef4444", fontSize: "13px", marginBottom: "12px" }}>
                    {replyError}
                  </div>
                )}

                <form onSubmit={handlePostReply}>
                  <textarea
                    rows={4}
                    placeholder="Write your response or analysis for the Super 30 cohort..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontSize: "14px",
                      outline: "none",
                      marginBottom: "12px",
                      resize: "vertical",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      disabled={submittingReply}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        background: "var(--gold, #f5b800)",
                        color: "#000",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      <Send style={{ width: "15px", height: "15px" }} />
                      {submittingReply ? "Posting..." : "Submit Reply"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Replies List */}
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>
                Replies ({topic.posts.length})
              </h3>

              {topic.posts.length === 0 ? (
                <div style={{ background: "rgba(26, 26, 26, 0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
                  No replies yet. Be the first to join the conversation!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {topic.posts.map((post) => (
                    <div key={post.id} style={{ background: "rgba(26, 26, 26, 0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", fontSize: "13px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(245, 184, 0, 0.2)", color: "var(--gold, #f5b800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px" }}>
                            {(post.author.name || "M")[0].toUpperCase()}
                          </div>
                          <span style={{ color: "#fff", fontWeight: 600 }}>{post.author.name || "Member"}</span>
                        </div>
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                          {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: "1.6", whitespace: "pre-wrap" }}>
                        {post.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
