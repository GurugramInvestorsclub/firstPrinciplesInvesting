"use client"

import { CSSProperties, useCallback, useEffect, useState } from "react"
import { Key, Plus, Copy, Check, Users, RefreshCw, AlertCircle, Sparkles } from "lucide-react"

interface UserAccess {
  id: string
  unlockedAt: string
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

interface Super30CodeRow {
  id: string
  code: string
  maxUses: number | null
  usedCount: number
  expiryDate: string | null
  isActive: boolean
  createdAt: string
  accesses: UserAccess[]
}

const cardStyle: CSSProperties = {
  background: "rgba(26, 26, 26, 0.8)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "12px",
  padding: "24px",
  backdropFilter: "blur(8px)",
}

const tableCellStyle: CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  verticalAlign: "middle",
  fontSize: "13px",
}

export default function AdminSuper30CodesPage() {
  const [codes, setCodes] = useState<Super30CodeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Modal / Create state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [customCode, setCustomCode] = useState("")
  const [maxUsesInput, setMaxUsesInput] = useState("")
  const [expiryInput, setExpiryInput] = useState("")
  const [creating, setCreating] = useState(false)
  const [createMessage, setCreateMessage] = useState<string | null>(null)

  const loadCodes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/super30-codes")
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load codes")
      }
      setCodes(json.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load passcodes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCodes()
  }, [loadCodes])

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateMessage(null)

    try {
      const payload: Record<string, unknown> = {}
      if (customCode.trim()) payload.code = customCode.trim()
      if (maxUsesInput.trim()) payload.maxUses = parseInt(maxUsesInput, 10)
      if (expiryInput.trim()) payload.expiryDate = expiryInput

      const res = await fetch("/api/admin/super30-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate passcode")
      }

      setCreateMessage(`Successfully generated passcode '${json.data.code}'!`)
      setCustomCode("")
      setMaxUsesInput("")
      setExpiryInput("")
      setShowCreateModal(false)
      loadCodes()
    } catch (err) {
      setCreateMessage(err instanceof Error ? err.message : "Creation failed")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <Key style={{ color: "var(--gold)" }} />
            Super 30 Access Codes
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px", marginTop: "4px", margin: 0 }}>
            Generate passcodes to grant users private access to the Super 30 Forum.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "8px",
              background: "var(--gold)",
              color: "#000",
              fontWeight: 600,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            Generate New Passcode
          </button>

          <button
            onClick={loadCodes}
            style={{
              padding: "10px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      </div>

      {createMessage && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(245, 184, 0, 0.15)", border: "1px solid var(--gold)", color: "var(--gold)", fontSize: "14px" }}>
          {createMessage}
        </div>
      )}

      {/* Passcodes Table */}
      <div style={cardStyle}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", textAlign: "left" }}>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Passcode</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Usage Status</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Expiry Date</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Members Unlocked</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && codes.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tableCellStyle, textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.5)" }}>
                    Loading Super 30 passcodes...
                  </td>
                </tr>
              ) : codes.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tableCellStyle, textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.4)" }}>
                    No Super 30 passcodes generated yet. Click "Generate New Passcode" to create one.
                  </td>
                </tr>
              ) : (
                codes.map((row) => {
                  const isMaxedOut = row.maxUses !== null && row.usedCount >= row.maxUses
                  const isExpired = row.expiryDate ? new Date(row.expiryDate) < new Date() : false
                  const isJustCopied = copiedCode === row.code

                  return (
                    <tr key={row.id} style={{ transition: "background 0.15s ease" }} className="hover:bg-white/5">
                      <td style={{ ...tableCellStyle, fontWeight: 700, fontFamily: "monospace", fontSize: "15px", color: "var(--gold)" }}>
                        {row.code}
                      </td>
                      <td style={{ ...tableCellStyle }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 600 }}>
                            {row.usedCount} / {row.maxUses !== null ? row.maxUses : "∞"} used
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontWeight: 700,
                              background: isMaxedOut || isExpired ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                              color: isMaxedOut || isExpired ? "#ef4444" : "#10b981",
                            }}
                          >
                            {isMaxedOut ? "MAXED OUT" : isExpired ? "EXPIRED" : "ACTIVE"}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...tableCellStyle, color: "rgba(255,255,255,0.7)" }}>
                        {row.expiryDate ? new Date(row.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never"}
                      </td>
                      <td style={{ ...tableCellStyle }}>
                        {row.accesses.length === 0 ? (
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>None yet</span>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {row.accesses.map((acc) => (
                              <div key={acc.id} style={{ fontSize: "12px" }}>
                                <span style={{ color: "#fff", fontWeight: 500 }}>{acc.user.name || "Member"}</span>{" "}
                                <span style={{ color: "rgba(255,255,255,0.5)" }}>({acc.user.email})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ ...tableCellStyle }}>
                        <button
                          onClick={() => handleCopy(row.code)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            background: isJustCopied ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.06)",
                            color: isJustCopied ? "#10b981" : "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {isJustCopied ? <Check style={{ width: "14px", height: "14px" }} /> : <Copy style={{ width: "14px", height: "14px" }} />}
                          {isJustCopied ? "Copied" : "Copy Code"}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ ...cardStyle, width: "100%", maxWidth: "480px", border: "1px solid var(--gold)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: 0, marginBottom: "8px" }}>
              Generate Super 30 Passcode
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginBottom: "20px" }}>
              Leave code blank to auto-generate a random passcode, or specify a custom code.
            </p>

            <form onSubmit={handleCreateCode} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "6px" }}>
                  Custom Passcode (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SUPER30-BATCH4"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "6px" }}>
                  Maximum Redemptions (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 30 (Leave blank for unlimited)"
                  value={maxUsesInput}
                  onChange={(e) => setMaxUsesInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "6px" }}>
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryInput}
                  onChange={(e) => setExpiryInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: "transparent",
                    color: "rgba(255,255,255,0.7)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    background: "var(--gold)",
                    color: "#000",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {creating ? "Generating..." : "Create Passcode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
