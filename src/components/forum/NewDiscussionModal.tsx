import React, { useState } from "react"
import { X, Sparkles, AlertCircle } from "lucide-react"

interface NewDiscussionModalProps {
  forumType: "SUBSCRIBERS" | "SUPER_30"
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  accentColor?: string
}

const CATEGORIES = [
  "Investment Thesis",
  "Earnings Discussion",
  "Industry Discussion",
  "Valuation",
  "Question",
  "Management Commentary",
  "Red Flag",
  "General Discussion",
]

export function NewDiscussionModal({
  forumType,
  isOpen,
  onClose,
  onSuccess,
  accentColor = "var(--gold, #f5b800)",
}: NewDiscussionModalProps) {
  const [companyName, setCompanyName] = useState("")
  const [category, setCategory] = useState("Investment Thesis")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const res = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: forumType,
          companyName: companyName.trim() || null,
          category,
          title: title.trim(),
          content: content.trim(),
          tags: tagsArray,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create discussion")
      }

      // Reset form & close
      setCompanyName("")
      setTitle("")
      setContent("")
      setTagsInput("")
      onClose()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post discussion")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "rgba(22, 22, 22, 0.95)",
          border: `1px solid ${accentColor}44`,
          borderRadius: "14px",
          padding: "28px",
          width: "100%",
          maxWidth: "620px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.01em" }}>
              Start a Discussion
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", margin: "4px 0 0 0" }}>
              Share research, analyze companies, or post a question for the {forumType === "SUPER_30" ? "Super 30 cohort" : "Insights community"}.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "none",
              color: "rgba(255, 255, 255, 0.6)",
              borderRadius: "6px",
              padding: "6px",
              cursor: "pointer",
            }}
            className="hover:text-white"
          >
            <X style={{ width: "18px", height: "18px" }} />
          </button>
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
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AlertCircle style={{ width: "15px", height: "15px" }} />
            {error}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Grid: Company Name + Discussion Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255, 255, 255, 0.8)", marginBottom: "6px" }}>
                Company Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. AETHER INDUSTRIES"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255, 255, 255, 0.8)", marginBottom: "6px" }}>
                Discussion Type
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ background: "#1a1a1a", color: "#fff" }}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255, 255, 255, 0.8)", marginBottom: "6px" }}>
              Discussion Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Can the new businesses materially change the earnings profile?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {/* Content */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255, 255, 255, 0.8)", marginBottom: "6px" }}>
              Your Analysis / Research Thesis *
            </label>
            <textarea
              rows={6}
              placeholder="Write your long-form investment thesis, analysis, or question details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                fontSize: "13.5px",
                outline: "none",
                resize: "vertical",
                lineHeight: "1.5",
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "rgba(255, 255, 255, 0.8)", marginBottom: "6px" }}>
              Tags (Optional, comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Chemicals, Investment Thesis, FY27"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 16px",
                borderRadius: "6px",
                background: "transparent",
                color: "rgba(255, 255, 255, 0.6)",
                border: "none",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              style={{
                padding: "9px 20px",
                borderRadius: "6px",
                background: accentColor,
                color: "#000000",
                fontWeight: 700,
                fontSize: "13px",
                border: "none",
                cursor: submitting || !title.trim() || !content.trim() ? "not-allowed" : "pointer",
                opacity: submitting || !title.trim() || !content.trim() ? 0.6 : 1,
              }}
            >
              {submitting ? "Publishing..." : "Publish Discussion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
