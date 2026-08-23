import React, { useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Lock, Eye, MessageSquare, Users, Pin } from "lucide-react"
import { ReplyItem, ReplyData } from "./ReplyItem"
import { ReplyComposer } from "./ReplyComposer"

export interface TopicDetailData {
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
  contributorsCount: number
  lastActiveAt: string
  createdAt: string
  author: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  posts: ReplyData[]
}

interface DiscussionDetailProps {
  topic: TopicDetailData
  forumType: "SUBSCRIBERS" | "SUPER_30"
  backPath: string
  backLabel: string
  onPostReply: (content: string) => Promise<void>
  accentColor?: string
}

export function DiscussionDetail({
  topic,
  forumType,
  backPath,
  backLabel,
  onPostReply,
  accentColor = "var(--gold, #f5b800)",
}: DiscussionDetailProps) {
  const composerRef = useRef<HTMLTextAreaElement | null>(null)

  const companyLabel = topic.companyName || "GENERAL RESEARCH"
  const memberBadge = forumType === "SUPER_30" ? "Super 30 Member" : "FPI Insights Member"
  const formattedDate = new Date(topic.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const handleQuote = (authorName: string, text: string) => {
    if (composerRef.current) {
      const quoteString = `> ${authorName}: ${text.split("\n").join("\n> ")}\n\n`
      composerRef.current.value += quoteString
      composerRef.current.focus()
    }
  }

  const handleReplyToAuthor = (authorName: string) => {
    if (composerRef.current) {
      composerRef.current.value += `@${authorName} `
      composerRef.current.focus()
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Back Breadcrumb */}
      <div>
        <Link
          href={backPath}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "rgba(255, 255, 255, 0.5)",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 500,
          }}
          className="hover:text-white"
        >
          <ArrowLeft style={{ width: "15px", height: "15px" }} /> {backLabel}
        </Link>
      </div>

      {/* Header Info Block */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
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
            <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)", background: "rgba(255, 255, 255, 0.05)", padding: "1px 6px", borderRadius: "4px" }}>
              {topic.category}
            </span>
          )}
        </div>

        <h1
          style={{
            fontSize: "26px",
            fontWeight: 800,
            color: "#ffffff",
            margin: "0 0 10px 0",
            letterSpacing: "-0.02em",
            lineHeight: "1.35",
          }}
        >
          {topic.title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", fontSize: "13px", color: "rgba(255, 255, 255, 0.5)" }}>
          <div>
            Started by <strong style={{ color: "#ffffff" }}>{topic.author.name || "Member"}</strong> · {formattedDate}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Eye style={{ width: "14px", height: "14px" }} /> {topic.viewsCount} views
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <MessageSquare style={{ width: "14px", height: "14px" }} /> {topic.posts.length} replies
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Users style={{ width: "14px", height: "14px" }} /> {topic.contributorsCount || 1} contributors
            </span>
          </div>
        </div>

        {/* Tags */}
        {topic.tags && topic.tags.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
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

      {/* ORIGINAL DISCUSSION SECTION */}
      <div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
          ORIGINAL DISCUSSION
        </div>

        <div
          style={{
            background: "rgba(22, 22, 22, 0.85)",
            border: `1px solid ${accentColor}33`,
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `${accentColor}22`, color: accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px" }}>
              {(topic.author.name || "M")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "14px" }}>
                {topic.author.name || "Member"}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)" }}>
                {memberBadge}
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: "15px",
              color: "rgba(255, 255, 255, 0.92)",
              lineHeight: "1.65",
              whiteSpace: "pre-wrap",
            }}
          >
            {topic.content}
          </div>
        </div>
      </div>

      {/* REPLIES SECTION */}
      <div>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
          DISCUSSION ({topic.posts.length} {topic.posts.length === 1 ? "reply" : "replies"})
        </div>

        {topic.posts.length === 0 ? (
          <div
            style={{
              background: "rgba(22, 22, 22, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "10px",
              padding: "24px",
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.45)",
              fontSize: "13px",
            }}
          >
            No replies yet. Share your analysis below to start the conversation!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topic.posts.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                forumType={forumType}
                onQuote={handleQuote}
                onReply={handleReplyToAuthor}
                accentColor={accentColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* REPLY COMPOSER */}
      <ReplyComposer
        ref={composerRef}
        onSubmit={onPostReply}
        isLocked={topic.isLocked}
        accentColor={accentColor}
      />
    </div>
  )
}
