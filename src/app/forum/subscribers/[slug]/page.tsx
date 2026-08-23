"use client"

import { useCallback, useEffect, useState, use } from "react"
import Link from "next/link"
import { Crown } from "lucide-react"
import { ForumLayout } from "@/components/forum/ForumLayout"
import { DiscussionDetail, TopicDetailData } from "@/components/forum/DiscussionDetail"
import { ForumSkeleton } from "@/components/forum/ForumSkeleton"

export default function SubscriberTopicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const { slug } = resolvedParams

  const [topic, setTopic] = useState<TopicDetailData | null>(null)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  const loadTopic = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/forum/topics/${slug}`)
      const json = await res.json()
      if (res.ok && json.success) {
        setAuthorized(json.authorized)
        setTopic(json.topic)
      }
    } catch {
      // Keep state clean on error
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    loadTopic()
  }, [loadTopic])

  const handlePostReply = async (content: string) => {
    const res = await fetch(`/api/forum/topics/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })

    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to post reply")
    }

    loadTopic()
  }

  return (
    <ForumLayout>
      {loading && <ForumSkeleton />}

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
          <Crown style={{ width: "32px", height: "32px", color: "#10b981", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", margin: "0 0 10px 0" }}>
            Subscribers Membership Required
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: "14px", maxWidth: "480px", margin: "0 auto 24px" }}>
            This investment research discussion is reserved for active FPI Insights members.
          </p>
          <Link
            href="/membership"
            style={{
              display: "inline-flex",
              padding: "12px 24px",
              borderRadius: "8px",
              background: "#10b981",
              color: "#000000",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Unlock Insights Subscription →
          </Link>
        </div>
      )}

      {!loading && authorized === true && topic && (
        <DiscussionDetail
          topic={topic}
          forumType="SUBSCRIBERS"
          backPath="/forum/subscribers"
          backLabel="Back to Subscribers Forum"
          onPostReply={handlePostReply}
          accentColor="#10b981"
        />
      )}
    </ForumLayout>
  )
}
