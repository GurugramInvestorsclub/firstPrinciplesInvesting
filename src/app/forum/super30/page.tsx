"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  Plus,
  MessageSquare,
  Eye,
  Pin,
  Lock,
  Search,
  RefreshCw,
  ArrowLeft,
  Key,
  CheckCircle2,
} from "lucide-react"

interface TopicAuthor {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

interface ForumTopicItem {
  id: string
  title: string
  slug: string
  content: string
  isPinned: boolean
  isLocked: boolean
  viewsCount: number
  repliesCount: number
  createdAt: string
  updatedAt: string
  author: TopicAuthor
}

export default function Super30ForumPage() {
  const [topics, setTopics] = useState<ForumTopicItem[]>([])
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [requiresAuth, setRequiresAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Passcode unlock modal state
  const [passcode, setPasscode] = useState("")
  const [unlocking, setUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState<string | null>(null)
  const [unlockSuccess, setUnlockSuccess] = useState<string | null>(null)

  // New topic modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const loadTopics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/forum/topics?type=SUPER_30")
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load topics")
      }

      setAuthorized(json.authorized)
      setRequiresAuth(Boolean(json.requiresAuth))
      setTopics(json.topics ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load forum")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTopics()
  }, [loadTopics])

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcode.trim()) return

    setUnlocking(true)
    setUnlockError(null)
    setUnlockSuccess(null)

    try {
      const res = await fetch("/api/forum/super30/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: passcode.trim() }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Invalid passcode")
      }

      setUnlockSuccess(json.message || "Passcode redeemed successfully!")
      setPasscode("")
      setTimeout(() => {
        loadTopics()
      }, 1000)
    } catch (err) {
      setUnlockError(err instanceof Error ? err.message : "Failed to unlock passcode")
    } finally {
      setUnlocking(false)
    }
  }

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    setSubmitting(true)
    setCreateError(null)

    try {
      const res = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          type: "SUPER_30",
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create topic")
      }

      setNewTitle("")
      setNewContent("")
      setShowCreateModal(false)
      loadTopics()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to post topic")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep, #0a0a0a)", color: "#fff", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Back Link */}
        <div style={{ marginBottom: "24px" }}>
          <Link
            href="/forum"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} /> Back to Forum Hub
          </Link>
        </div>

        {/* Forum Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(245, 184, 0, 0.15)", color: "var(--gold, #f5b800)" }}>
                <Sparkles style={{ width: "24px", height: "24px" }} />
              </div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                Super 30 Forum
              </h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginTop: "6px", margin: 0 }}>
              Private cohort discussion space for Super 30 members.
            </p>
          </div>

          {authorized && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                background: "var(--gold, #f5b800)",
                color: "#000",
                fontWeight: 700,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Plus style={{ width: "18px", height: "18px" }} />
              New Topic
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.6)" }}>
            <RefreshCw className="animate-spin" style={{ width: "28px", height: "28px", color: "var(--gold, #f5b800)", margin: "0 auto 12px" }} />
            <div>Loading Super 30 Forum...</div>
          </div>
        )}

        {/* Passcode Unlock Block */}
        {!loading && authorized === false && (
          <div
            style={{
              background: "rgba(26, 26, 26, 0.8)",
              border: "1px solid rgba(245, 184, 0, 0.3)",
              borderRadius: "16px",
              padding: "48px 32px",
              textAlign: "center",
              backdropFilter: "blur(12px)",
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(245, 184, 0, 0.15)", color: "var(--gold, #f5b800)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Key style={{ width: "30px", height: "30px" }} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginTop: 0, marginBottom: "12px" }}>
              Unlock Super 30 Forum
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
              {requiresAuth
                ? "Please log in to redeem your Super 30 Passcode."
                : "Enter your Super 30 invitation passcode to unlock private forum access."}
            </p>

            {requiresAuth ? (
              <Link
                href="/login"
                style={{ display: "inline-flex", padding: "12px 28px", borderRadius: "10px", background: "var(--gold, #f5b800)", color: "#000", fontWeight: 700, textDecoration: "none" }}
              >
                Log In to Redeem Code →
              </Link>
            ) : (
              <form onSubmit={handleUnlock} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {unlockError && (
                  <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#ef4444", fontSize: "13px" }}>
                    {unlockError}
                  </div>
                )}
                {unlockSuccess && (
                  <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", color: "#10b981", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <CheckCircle2 style={{ width: "16px", height: "16px" }} /> {unlockSuccess}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Enter your Passcode (e.g. SUPER30-XXXX)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(245, 184, 0, 0.3)",
                    color: "#fff",
                    fontSize: "15px",
                    textAlign: "center",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                  }}
                />

                <button
                  type="submit"
                  disabled={unlocking}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    background: "var(--gold, #f5b800)",
                    color: "#000",
                    fontWeight: 700,
                    fontSize: "15px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {unlocking ? "Unlocking Access..." : "Unlock Super 30 Access"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Authorized Forum Content */}
        {!loading && authorized === true && (
          <div>
            {/* Search Bar */}
            <div style={{ marginBottom: "24px", position: "relative" }}>
              <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "rgba(255,255,255,0.4)" }} />
              <input
                type="text"
                placeholder="Search topics in Super 30 Forum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 44px",
                  borderRadius: "10px",
                  background: "rgba(26, 26, 26, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* Topic List */}
            {filteredTopics.length === 0 ? (
              <div style={{ background: "rgba(26, 26, 26, 0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
                {searchQuery ? "No topics matched your search query." : "No topics posted yet in Super 30 Forum."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/forum/super30/${topic.slug}`}
                    style={{
                      display: "block",
                      background: "rgba(26, 26, 26, 0.8)",
                      border: topic.isPinned ? "1px solid rgba(245, 184, 0, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      padding: "20px 24px",
                      textDecoration: "none",
                      color: "#fff",
                      transition: "transform 0.15s ease, border-color 0.15s ease",
                    }}
                    className="hover:border-gold-500/50"
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          {topic.isPinned && (
                            <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", background: "rgba(245, 184, 0, 0.15)", color: "var(--gold, #f5b800)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Pin style={{ width: "12px", height: "12px" }} /> PINNED
                            </span>
                          )}
                          {topic.isLocked && (
                            <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Lock style={{ width: "12px", height: "12px" }} /> LOCKED
                            </span>
                          )}
                          <h3 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: "#fff" }}>
                            {topic.title}
                          </h3>
                        </div>

                        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.5" }}>
                          {topic.content}
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px", fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                          <span>By {topic.author.name || "Member"}</span>
                          <span>•</span>
                          <span>{new Date(topic.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", paddingTop: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <MessageSquare style={{ width: "15px", height: "15px" }} />
                          <span>{topic.repliesCount}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Eye style={{ width: "15px", height: "15px" }} />
                          <span>{topic.viewsCount}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Topic Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "rgba(26, 26, 26, 0.95)", border: "1px solid rgba(245, 184, 0, 0.4)", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "560px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: 0, marginBottom: "16px" }}>
              Start a New Topic in Super 30 Forum
            </h2>

            {createError && (
              <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#ef4444", fontSize: "13px", marginBottom: "16px" }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateTopic} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "6px" }}>
                  Topic Title
                </label>
                <input
                  type="text"
                  placeholder="Super 30 Cohort discussion title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "6px" }}>
                  Topic Content
                </label>
                <textarea
                  rows={5}
                  placeholder="Share cohort insights, analysis, or questions..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: "10px 16px", borderRadius: "8px", background: "transparent", color: "rgba(255,255,255,0.7)", border: "none", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: "10px 20px", borderRadius: "8px", background: "var(--gold, #f5b800)", color: "#000", fontWeight: 700, border: "none", cursor: "pointer" }}
                >
                  {submitting ? "Posting..." : "Post Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
