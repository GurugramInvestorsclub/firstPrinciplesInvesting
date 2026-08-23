import React from "react"
import { Plus, MessageSquareDashed } from "lucide-react"

interface ForumEmptyStateProps {
  forumName: string
  onStartDiscussion?: () => void
  accentColor?: string
}

export function ForumEmptyState({
  forumName,
  onStartDiscussion,
  accentColor = "var(--gold, #f5b800)",
}: ForumEmptyStateProps) {
  return (
    <div
      style={{
        background: "rgba(22, 22, 22, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "12px",
        padding: "36px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: `${accentColor}1A`,
          color: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >
        <MessageSquareDashed style={{ width: "22px", height: "22px" }} />
      </div>

      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: "0 0 4px 0" }}>
        No discussions yet
      </h3>

      <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", margin: "0 0 20px 0", maxWidth: "400px" }}>
        Start the first investment discussion in the {forumName}.
      </p>

      {onStartDiscussion && (
        <button
          onClick={onStartDiscussion}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 16px",
            borderRadius: "6px",
            background: accentColor,
            color: "#000000",
            fontWeight: 700,
            fontSize: "13px",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus style={{ width: "14px", height: "14px", strokeWidth: 2.5 }} />
          Start a Discussion
        </button>
      )}
    </div>
  )
}
