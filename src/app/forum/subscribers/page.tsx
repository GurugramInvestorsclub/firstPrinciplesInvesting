"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ShieldCheck, Crown } from "lucide-react"
import { ForumLayout } from "@/components/forum/ForumLayout"
import { ForumHeader } from "@/components/forum/ForumHeader"
import { ForumSearchFilter, CategoryFilter, SortOption } from "@/components/forum/ForumSearchFilter"
import { DiscussionListItem, ForumTopicData } from "@/components/forum/DiscussionListItem"
import { NewDiscussionModal } from "@/components/forum/NewDiscussionModal"
import { ForumEmptyState } from "@/components/forum/ForumEmptyState"
import { ForumSkeleton } from "@/components/forum/ForumSkeleton"

export default function SubscribersForumPage() {
  const [topics, setTopics] = useState<ForumTopicData[]>([])
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [requiresAuth, setRequiresAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All")
  const [activeSort, setActiveSort] = useState<SortOption>("recently_active")

  // New discussion modal state
  const [showCreateModal, setShowCreateModal] = useState(false)

  const loadTopics = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("type", "SUBSCRIBERS")
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
      // Keep state clean on network error
    } finally {
      setLoading(false)
    }
  }, [searchQuery, activeCategory, activeSort])

  useEffect(() => {
    loadTopics()
  }, [loadTopics])

  return (
    <ForumLayout>
      <ForumHeader
        forumName="SUBSCRIBERS FORUM"
        description="Exclusive research discussions for FPI Insights members."
        badgeText="SUBSCRIBERS ONLY"
        accentColor="#10b981"
        authorized={authorized === true}
        onNewDiscussion={() => setShowCreateModal(true)}
      />

      {/* Loading Skeleton */}
      {loading && <ForumSkeleton />}

      {/* Paywall / Authorization Gate */}
      {!loading && authorized === false && (
        <div
          style={{
            background: "rgba(22, 22, 22, 0.85)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "14px",
            padding: "48px 32px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Crown style={{ width: "26px", height: "26px" }} />
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", margin: "0 0 10px 0" }}>
            Subscribers Exclusive Forum
          </h2>

          <p style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: "14.5px", maxWidth: "500px", margin: "0 auto 24px", lineHeight: "1.6" }}>
            {requiresAuth
              ? "Please log in with your FPI subscriber account to view and participate in research discussions."
              : "This forum is reserved exclusively for active FPI Insights members. Subscribe to unlock full research access."}
          </p>

          <Link
            href={requiresAuth ? "/login" : "/membership"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 26px",
              borderRadius: "8px",
              background: "#10b981",
              color: "#000000",
              fontWeight: 700,
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            {requiresAuth ? "Log In to Your Account" : "Subscribe to Insights →"}
          </Link>
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
            accentColor="#10b981"
          />

          {topics.length === 0 ? (
            <ForumEmptyState
              forumName="Subscribers Forum"
              onStartDiscussion={() => setShowCreateModal(true)}
              accentColor="#10b981"
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {topics.map((topic) => (
                <DiscussionListItem
                  key={topic.id}
                  topic={topic}
                  basePath="/forum/subscribers"
                  accentColor="#10b981"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Discussion Modal */}
      <NewDiscussionModal
        forumType="SUBSCRIBERS"
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadTopics}
        accentColor="#10b981"
      />
    </ForumLayout>
  )
}
