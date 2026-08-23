import React, { forwardRef, useState } from "react"
import { Send, AlertCircle, CheckCircle2 } from "lucide-react"

interface ReplyComposerProps {
  onSubmit: (content: string) => Promise<void>
  isLocked?: boolean
  accentColor?: string
}

export const ReplyComposer = forwardRef<HTMLTextAreaElement, ReplyComposerProps>(
  ({ onSubmit, isLocked = false, accentColor = "var(--gold, #f5b800)" }, ref) => {
    const [content, setContent] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    if (isLocked) {
      return (
        <div
          style={{
            background: "rgba(22, 22, 22, 0.75)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "center",
            color: "rgba(239, 68, 68, 0.8)",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          🔒 This discussion is locked for new replies.
        </div>
      )
    }

    const handleSubmit = async (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      if (!content.trim() || submitting) return

      setSubmitting(true)
      setError(null)
      setSuccessMessage(null)

      try {
        await onSubmit(content.trim())
        setContent("")
        setSuccessMessage("Reply posted successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to post reply")
      } finally {
        setSubmitting(false)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleSubmit()
      }
    }

    return (
      <div
        style={{
          background: "rgba(22, 22, 22, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <h3
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color: accentColor,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            JOIN THE DISCUSSION
          </h3>
          <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.5)", margin: "4px 0 0 0" }}>
            Share your analysis, ask a question, or challenge an idea.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "6px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #ef4444",
              color: "#ef4444",
              fontSize: "13px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AlertCircle style={{ width: "15px", height: "15px" }} />
            {error}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "6px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid #10b981",
              color: "#10b981",
              fontSize: "13px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <CheckCircle2 style={{ width: "15px", height: "15px" }} />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <textarea
            ref={ref}
            rows={4}
            placeholder="Write your response... (Ctrl+Enter to post)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            required
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "8px",
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: "14px",
              outline: "none",
              resize: "vertical",
              lineHeight: "1.5",
              minHeight: "90px",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "12px",
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            <span>Markdown supported · Ctrl+Enter to submit</span>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                borderRadius: "6px",
                background: accentColor,
                color: "#000000",
                fontWeight: 700,
                fontSize: "13px",
                border: "none",
                cursor: submitting || !content.trim() ? "not-allowed" : "pointer",
                opacity: submitting || !content.trim() ? 0.6 : 1,
                transition: "all 0.15s ease",
              }}
            >
              <Send style={{ width: "13px", height: "13px" }} />
              {submitting ? "Posting..." : "Post Reply"}
            </button>
          </div>
        </form>
      </div>
    )
  }
)

ReplyComposer.displayName = "ReplyComposer"
