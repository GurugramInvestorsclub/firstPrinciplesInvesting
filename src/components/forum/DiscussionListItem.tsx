import React from "react"
import Link from "next/link"
import { Pin, Lock, MessageSquare, Users, Clock } from "lucide-react"

export interface ForumTopicData {
  id: string
  title: string
  slug: string
  content: string
  companyName?: string | null
  category?: string
  tags?: string[]
  isPinned: boolean
  isLocked: boolean
  viewsCount: number
  repliesCount: number
  contributorsCount: number
  lastActiveAt: string
  createdAt: string
  author: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

interface DiscussionListItemProps {
  topic: ForumTopicData
  basePath: string // e.g. "/forum/subscribers" or "/forum/super30"
  accentColor?: string
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  const minutes = Math.floor(diffInSeconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function DiscussionListItem({ topic, basePath, accentColor = "var(--gold, #f5b800)" }: DiscussionListItemProps) {
  const companyLabel = topic.companyName || "GENERAL RESEARCH"
  const formattedDate = new Date(topic.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const relativeLastActive = formatRelativeTime(topic.lastActiveAt)

  return (
    <Link
      href={`${basePath}/${topic.slug}`}
      style={{
        display: "block",
        background: "rgba(22, 22, 22, 0.75)",
        border: topic.isPinned ? `1px solid ${accentColor}44` : "1px solid rgba(255, 255, 255, 0.07)",
        borderRadius: "10px",
        padding: "16px 20px",
        textDecoration: "none",
        color: "#ffffff",
        transition: "all 0.15s ease",
      }}
      className="hover:border-white/20 hover:bg-white/[0.03]"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {/* Row 1: Company Header & Badges */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: accentColor,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {companyLabel}
            </span>

            {topic.category && (
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.45)",
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "1px 6px",
                  borderRadius: "4px",
                }}
              >
                {topic.category}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {topic.isPinned && (
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: `${accentColor}20`,
                  color: accentColor,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <Pin style={{ width: "11px", height: "11px" }} /> PINNED
              </span>
            )}
            {topic.isLocked && (
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#ef4444",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <Lock style={{ width: "11px", height: "11px" }} /> LOCKED
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Title */}
        <h3
          style={{
            fontSize: "15.5px",
            fontWeight: 700,
            color: "#ffffff",
            margin: "2px 0 4px 0",
            letterSpacing: "-0.01em",
            lineHeight: "1.4",
          }}
        >
          {topic.title}
        </h3>

        {/* Row 3: Meta & Activity Stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "12.5px",
            color: "rgba(255, 255, 255, 0.5)",
            marginTop: "2px",
          }}
        >
          {/* Author & Date */}
          <div>
            <span style={{ color: "rgba(255, 255, 255, 0.85)", fontWeight: 500 }}>
              {topic.author.name || "Member"}
            </span>{" "}
            · <span>{formattedDate}</span>
          </div>

          {/* Activity Breakdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <MessageSquare style={{ width: "13px", height: "13px" }} />
              <strong style={{ color: "rgba(255,255,255,0.8)" }}>{topic.repliesCount}</strong> replies
            </span>

            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Users style={{ width: "13px", height: "13px" }} />
              <strong style={{ color: "rgba(255,255,255,0.8)" }}>{topic.contributorsCount || 1}</strong> contributors
            </span>

            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Clock style={{ width: "13px", height: "13px" }} />
              Last active {relativeLastActive}
            </span>
          </div>
        </div>

        {/* Row 4: Subtle Tags */}
        {topic.tags && topic.tags.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
            {topic.tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.45)",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  padding: "1px 6px",
                  borderRadius: "4px",
                }}
              >
                [{tag}]
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
