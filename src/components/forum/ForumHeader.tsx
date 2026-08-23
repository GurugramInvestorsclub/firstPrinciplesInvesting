import React from "react"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"

interface ForumHeaderProps {
  forumName: string
  description: string
  badgeText: string
  accentColor?: string
  authorized?: boolean
  onNewDiscussion?: () => void
}

export function ForumHeader({
  forumName,
  description,
  badgeText,
  accentColor = "var(--gold, #f5b800)",
  authorized = true,
  onNewDiscussion,
}: ForumHeaderProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      {/* Back Link */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          href="/forum"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "rgba(255, 255, 255, 0.5)",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 500,
            transition: "color 0.15s ease",
          }}
          className="hover:text-white"
        >
          <ArrowLeft style={{ width: "15px", height: "15px" }} /> Back to Forum Hub
        </Link>
      </div>

      {/* Main Header Row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "0.02em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              {forumName}
            </h1>

            <span
              style={{
                fontSize: "11px",
                padding: "3px 8px",
                borderRadius: "4px",
                background: `${accentColor}1A`,
                color: accentColor,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {badgeText}
            </span>
          </div>

          <p
            style={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "14px",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            {description}
          </p>
        </div>

        {authorized && onNewDiscussion && (
          <button
            onClick={onNewDiscussion}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "8px",
              background: accentColor,
              color: "#000000",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.01em",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              transition: "transform 0.15s ease, filter 0.15s ease",
            }}
            className="hover:opacity-90 active:scale-95"
          >
            <Plus style={{ width: "16px", height: "16px", strokeWidth: 2.5 }} />
            New Discussion
          </button>
        )}
      </div>
    </div>
  )
}
