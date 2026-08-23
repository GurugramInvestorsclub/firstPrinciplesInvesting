"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Key, CheckCircle2, AlertCircle } from "lucide-react"
import { ForumLayout } from "@/components/forum/ForumLayout"
import { ForumHeader } from "@/components/forum/ForumHeader"
import { ForumSearchFilter, CategoryFilter, SortOption } from "@/components/forum/ForumSearchFilter"
import { DiscussionListItem, ForumTopicData } from "@/components/forum/DiscussionListItem"
import { NewDiscussionModal } from "@/components/forum/NewDiscussionModal"
import { ForumEmptyState } from "@/components/forum/ForumEmptyState"
import { ForumSkeleton } from "@/components/forum/ForumSkeleton"

export default function Super30ForumPage() {
  const [topics, setTopics] = useState<ForumTopicData[]>([])
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [requiresAuth, setRequiresAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All")
  const [activeSort, setActiveSort] = useState<SortOption>("recently_active")

  // Passcode unlock modal state
  const [passcode, setPasscode] = useState("")
  const [unlocking, setUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState<string | null>(null)
  const [unlockSuccess, setUnlockSuccess] = useState<string | null>(null)

  // New discussion modal state
  const [showCreateModal, setShowCreateModal] = useState(false)

  const loadTopics = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("type", "SUPER_30")
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (activeCategory && activeCategory !== "All") params.set("category", activeCategory)
      if (activeSort) params.set("sort", activeSort)

      const res = await fetch(`/api/forum/topics?${params.toString()}`)
      const json = await res.json()

      if (res.ok && json.success) {
        setAuthorized(json.authorized)
        setRequiresAuth(Boolean(json.requiresAuth))
        setTopics(json.topics ?? [])
      }
    } catch {
      // Keep state clean
    } finally {
      setLoading(false)
    }
  }, [searchQuery, activeCategory, activeSort])

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

  return (
    <ForumLayout>
      <ForumHeader
        forumName="SUPER 30 FORUM"
        description="Discuss businesses, sectors, earnings and investment ideas with the Super 30 cohort."
        badgeText="PASSCODE REQUIRED"
        accentColor="var(--gold, #f5b800)"
        authorized={authorized === true}
        onNewDiscussion={() => setShowCreateModal(true)}
      />

      {/* Loading Skeleton */}
      {loading && <ForumSkeleton />}

      {/* Passcode Unlock Gate */}
      {!loading && authorized === false && (
        <div
          style={{
            background: "rgba(22, 22, 22, 0.85)",
            border: "1px solid rgba(245, 184, 0, 0.3)",
            borderRadius: "14px",
            padding: "48px 32px",
            textAlign: "center",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "rgba(245, 184, 0, 0.15)",
              color: "var(--gold, #f5b800)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Key style={{ width: "26px", height: "26px" }} />
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", margin: "0 0 10px 0" }}>
            Unlock Super 30 Forum
          </h2>

          <p style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: "14px", margin: "0 0 24px 0", lineHeight: "1.6" }}>
            {requiresAuth
              ? "Please log in to your account to redeem your Super 30 Passcode."
              : "Enter your Super 30 invitation passcode to unlock private cohort forum access."}
          </p>

          {requiresAuth ? (
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 26px",
                borderRadius: "8px",
                background: "var(--gold, #f5b800)",
                color: "#000000",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Log In to Redeem Code →
            </Link>
          ) : (
            <form onSubmit={handleUnlock} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {unlockError && (
                <div style={{ padding: "10px 14px", borderRadius: "6px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#ef4444", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertCircle style={{ width: "15px", height: "15px" }} />
                  {unlockError}
                </div>
              )}
              {unlockSuccess && (
                <div style={{ padding: "10px 14px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", color: "#10b981", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <CheckCircle2 style={{ width: "15px", height: "15px" }} /> {unlockSuccess}
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
                  padding: "11px 14px",
                  borderRadius: "8px",
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(245, 184, 0, 0.3)",
                  color: "#ffffff",
                  fontSize: "14.5px",
                  textAlign: "center",
                  letterSpacing: "0.05em",
                  fontWeight: 700,
                }}
              />

              <button
                type="submit"
                disabled={unlocking}
                style={{
                  width: "100%",
                  padding: "11px 20px",
                  borderRadius: "8px",
                  background: "var(--gold, #f5b800)",
                  color: "#000000",
                  fontWeight: 700,
                  fontSize: "14px",
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
          <ForumSearchFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            activeSort={activeSort}
            setActiveSort={setActiveSort}
            accentColor="var(--gold, #f5b800)"
          />

          {topics.length === 0 ? (
            <ForumEmptyState
              forumName="Super 30 Forum"
              onStartDiscussion={() => setShowCreateModal(true)}
              accentColor="var(--gold, #f5b800)"
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {topics.map((topic) => (
                <DiscussionListItem
                  key={topic.id}
                  topic={topic}
                  basePath="/forum/super30"
                  accentColor="var(--gold, #f5b800)"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Discussion Modal */}
      <NewDiscussionModal
        forumType="SUPER_30"
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadTopics}
        accentColor="var(--gold, #f5b800)"
      />
    </ForumLayout>
  )
}
