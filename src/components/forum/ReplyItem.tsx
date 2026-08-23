import React from "react"
import { Quote, Reply as ReplyIcon } from "lucide-react"

export interface ReplyAuthor {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export interface ReplyData {
  id: string
  content: string
  parentId: string | null
  createdAt: string
  author: ReplyAuthor
}

interface ReplyItemProps {
  reply: ReplyData
  forumType: "SUBSCRIBERS" | "SUPER_30"
  onQuote?: (authorName: string, text: string) => void
  onReply?: (authorName: string) => void
  accentColor?: string
}

export function ReplyItem({
  reply,
  forumType,
  onQuote,
  onReply,
  accentColor = "var(--gold, #f5b800)",
}: ReplyItemProps) {
  const memberBadge = forumType === "SUPER_30" ? "Super 30 Member" : "FPI Insights Member"
  const authorName = reply.author.name || "Member"
  const formattedDate = new Date(reply.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div
      style={{
        background: "rgba(22, 22, 22, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.07)",
        borderRadius: "10px",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Reply Header: Author Avatar, Name, Badge, Date */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: `${accentColor}22`,
              color: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "12px",
            }}
          >
            {authorName[0].toUpperCase()}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "13.5px" }}>
                {authorName}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "rgba(255, 255, 255, 0.5)",
                }}
              >
                {memberBadge}
              </span>
            </div>
          </div>
        </div>

        <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.45)" }}>
          {formattedDate}
        </span>
      </div>

      {/* Reply Body Content */}
      <div
        style={{
          fontSize: "14px",
          color: "rgba(255, 255, 255, 0.88)",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap",
        }}
      >
        {reply.content}
      </div>

      {/* Actions: Reply & Quote */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "4px" }}>
        {onReply && (
          <button
            onClick={() => onReply(authorName)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              transition: "color 0.15s ease",
            }}
            className="hover:text-white"
          >
            <ReplyIcon style={{ width: "13px", height: "13px" }} /> Reply
          </button>
        )}

        {onQuote && (
          <button
            onClick={() => onQuote(authorName, reply.content)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              transition: "color 0.15s ease",
            }}
            className="hover:text-white"
          >
            <Quote style={{ width: "13px", height: "13px" }} /> Quote
          </button>
        )}
      </div>
    </div>
  )
}
