"use client"

import { CSSProperties, useCallback, useEffect, useState } from "react"

interface SubscriptionRow {
  id: string
  userId: string
  userName: string | null
  userEmail: string | null
  planKey: "monthly" | "three_monthly" | "yearly"
  status: string
  cancelAtCycleEnd: boolean
  currentStartAt: string | null
  currentEndAt: string | null
  cancelRequestedAt: string | null
  cancelledAt: string | null
  endedAt: string | null
  razorpaySubscriptionId: string | null
  razorpayPlanId: string
  source?: string | null
  notes?: Record<string, any> | null
  createdAt: string
  updatedAt: string
  latestCharge: {
    amount: number
    currency: string
    status: string
    chargedAt: string | null
    failureReason: string | null
    razorpayPaymentId: string | null
    razorpayInvoiceId: string | null
  } | null
}

const tableCellStyle: CSSProperties = {
  padding: "14px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  verticalAlign: "top",
  fontSize: "13px",
}

export default function AdminSubscriptionsPage() {
  const [rows, setRows] = useState<SubscriptionRow[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [enabled, setEnabled] = useState(false)
  const [checkoutReady, setCheckoutReady] = useState(false)
  const [webhookReady, setWebhookReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [reconcilingId, setReconcilingId] = useState<string | null>(null)

  // Manual Grant Modal State
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [modalEmail, setModalEmail] = useState("")
  const [modalName, setModalName] = useState("")
  const [modalDurationPreset, setModalDurationPreset] = useState<"3_months" | "1_year">("3_months")
  const [modalPaymentMethod, setModalPaymentMethod] = useState("NEFT")
  const [modalUtrNumber, setModalUtrNumber] = useState("")
  const [modalAmountPaid, setModalAmountPaid] = useState("2999")
  const [modalAdminNotes, setModalAdminNotes] = useState("")
  const [modalSendEmail, setModalSendEmail] = useState(true)
  const [submittingGrant, setSubmittingGrant] = useState(false)

  // View Notes Modal State
  const [selectedNotesRow, setSelectedNotesRow] = useState<SubscriptionRow | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/subscriptions")
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to load subscriptions")
      }

      setEnabled(Boolean(payload.data?.config?.enabled))
      setCheckoutReady(Boolean(payload.data?.config?.checkoutReady))
      setWebhookReady(Boolean(payload.data?.config?.webhookReady))
      setRows(payload.data?.rows ?? [])
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load subscriptions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const reconcilePayment = useCallback(
    async (row: SubscriptionRow) => {
      const initialPaymentId = row.latestCharge?.razorpayPaymentId ?? ""
      const razorpayPaymentId = window.prompt("Razorpay payment ID", initialPaymentId)

      if (!razorpayPaymentId?.trim()) {
        return
      }

      if (!window.confirm("Reconcile this captured Razorpay payment and enable the subscription?")) {
        return
      }

      setReconcilingId(row.id)
      setActionMessage(null)

      try {
        const response = await fetch("/api/admin/subscriptions/manual-activate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscriptionId: row.id,
            razorpayPaymentId: razorpayPaymentId.trim(),
          }),
        })
        const payload = await response.json()

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || payload.error || "Unable to reconcile payment")
        }

        setActionMessage("Payment reconciled and subscription updated.")
        await loadData()
      } catch (reconcileError) {
        setActionMessage(
          reconcileError instanceof Error ? reconcileError.message : "Unable to reconcile payment"
        )
      } finally {
        setReconcilingId(null)
      }
    },
    [loadData]
  )

  const handleGrantManualAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalEmail.trim() || !modalEmail.includes("@")) {
      window.alert("Please enter a valid user email address.")
      return
    }

    setSubmittingGrant(true)
    setActionMessage(null)

    try {
      const response = await fetch("/api/admin/subscriptions/manual-grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: modalEmail.trim(),
          name: modalName.trim() || null,
          durationPreset: modalDurationPreset,
          paymentMethod: modalPaymentMethod,
          utrNumber: modalUtrNumber.trim() || null,
          amountPaid: modalAmountPaid ? Number(modalAmountPaid) : null,
          adminNotes: modalAdminNotes.trim() || null,
          sendEmailNotification: modalSendEmail,
        }),
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || payload.error || "Failed to grant manual access")
      }

      setActionMessage(
        `Successfully granted ${modalDurationPreset === "1_year" ? "1-Year" : "3-Month"} Insights access to ${modalEmail.trim()}!`
      )
      setShowGrantModal(false)
      setModalEmail("")
      setModalName("")
      setModalUtrNumber("")
      setModalAdminNotes("")
      await loadData()
    } catch (grantErr) {
      setActionMessage(grantErr instanceof Error ? grantErr.message : "Failed to grant manual access")
    } finally {
      setSubmittingGrant(false)
    }
  }

  const handleRevokeManualAccess = async (row: SubscriptionRow) => {
    const confirmRevoke = window.confirm(
      `Are you sure you want to revoke manual access for ${row.userEmail || row.userName || row.id}?`
    )
    if (!confirmRevoke) return

    setRevokingId(row.id)
    setActionMessage(null)

    try {
      const response = await fetch("/api/admin/subscriptions/manual-revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: row.id,
          adminNotes: "Revoked by admin from dashboard",
        }),
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || payload.error || "Failed to revoke access")
      }

      setActionMessage(`Revoked access for ${row.userEmail || row.id}`)
      await loadData()
    } catch (revokeErr) {
      setActionMessage(revokeErr instanceof Error ? revokeErr.message : "Failed to revoke access")
    } finally {
      setRevokingId(null)
    }
  }

  const uniqueStatuses = Array.from(new Set(rows.map((row) => row.status)))

  const filteredRows = rows.filter((row) => {
    if (statusFilter !== "ALL" && row.status.toUpperCase() !== statusFilter.toUpperCase()) {
      return false
    }

    if (startDate || endDate) {
      const rowLocalDate = getLocalDateString(row.createdAt)
      if (startDate && rowLocalDate < startDate) return false
      if (endDate && rowLocalDate > endDate) return false
    }

    return true
  })

  const exportToCsv = useCallback(() => {
    if (filteredRows.length === 0) {
      window.alert("No records to export.")
      return
    }

    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`

    const csvContent =
      "\uFEFF" +
      [
        ["User Name", "Email", "Billing Window Start", "Billing Window End"].map(escapeCsv).join(","),
        ...filteredRows.map((row) =>
          [
            row.userName || "Unknown",
            row.userEmail || "No email",
            formatDate(row.currentStartAt),
            formatDate(row.currentEndAt),
          ]
            .map(escapeCsv)
            .join(",")
        ),
      ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `subscriptions_${statusFilter.toLowerCase()}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filteredRows, statusFilter])

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <section
        style={{
          padding: "24px",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Insights Subscriptions</h1>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
              Review premium Insights memberships, current billing windows, and manually grant or manage offline (NEFT) access.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGrantModal(true)}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "1px solid #FFC72C",
              background: "linear-gradient(180deg, #FFD54F 0%, #FFC72C 100%)",
              color: "#000",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(255,199,44,0.25)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            + Grant Manual Access (NEFT)
          </button>
        </div>
        <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <span
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              background: enabled ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
              color: enabled ? "#6ee7b7" : "#fcd34d",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {enabled ? "Feature Enabled" : "Feature Disabled"}
          </span>
          <span
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              background: checkoutReady ? "rgba(16,185,129,0.12)" : "rgba(148,163,184,0.12)",
              color: checkoutReady ? "#6ee7b7" : "#cbd5e1",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {checkoutReady ? "Checkout Ready" : "Checkout Not Ready"}
          </span>
          <span
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              background: webhookReady ? "rgba(16,185,129,0.12)" : "rgba(148,163,184,0.12)",
              color: webhookReady ? "#6ee7b7" : "#cbd5e1",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {webhookReady ? "Webhook Ready" : "Webhook Not Ready"}
          </span>
        </div>
        {actionMessage ? (
          <div
            style={{
              marginTop: "16px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: actionMessage.toLowerCase().includes("unable") || actionMessage.toLowerCase().includes("fail")
                ? "rgba(239,68,68,0.12)"
                : "rgba(16,185,129,0.12)",
              border: actionMessage.toLowerCase().includes("unable") || actionMessage.toLowerCase().includes("fail")
                ? "1px solid rgba(239,68,68,0.3)"
                : "1px solid rgba(16,185,129,0.3)",
              color: actionMessage.toLowerCase().includes("unable") || actionMessage.toLowerCase().includes("fail")
                ? "#fca5a5"
                : "#6ee7b7",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {actionMessage}
          </div>
        ) : null}
      </section>

      <section
        style={{
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: "32px", color: "var(--text-secondary)" }}>Loading subscriptions...</div>
        ) : error ? (
          <div style={{ padding: "32px", color: "#fca5a5" }}>{error}</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "32px", color: "var(--text-secondary)" }}>
            No Insights subscriptions recorded yet.
          </div>
        ) : (
          <>
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                Records ({filteredRows.length} shown of {rows.length})
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <label htmlFor="status-filter" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    Status:
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      color: "#fff",
                      padding: "6px 12px",
                      fontSize: "13px",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="ALL">All Statuses</option>
                    {uniqueStatuses.sort().map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <label htmlFor="start-date" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    From:
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      color: "#fff",
                      padding: "5px 12px",
                      fontSize: "13px",
                      outline: "none",
                      colorScheme: "dark",
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <label htmlFor="end-date" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    To:
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      color: "#fff",
                      padding: "5px 12px",
                      fontSize: "13px",
                      outline: "none",
                      colorScheme: "dark",
                    }}
                  />
                </div>

                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate("")
                      setEndDate("")
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.06)",
                      color: "#e2e8f0",
                      fontSize: "13px",
                      cursor: "pointer",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.12)"
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)"
                    }}
                  >
                    Clear Dates
                  </button>
                )}

                <button
                  type="button"
                  onClick={exportToCsv}
                  style={{
                    marginLeft: "4px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(250,204,21,0.35)",
                    background: "rgba(250,204,21,0.12)",
                    color: "#fde68a",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(250,204,21,0.2)"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(250,204,21,0.12)"
                  }}
                >
                  Export to Excel
                </button>
              </div>
            </div>

            {filteredRows.length === 0 ? (
              <div style={{ padding: "48px 32px", color: "var(--text-secondary)", textAlign: "center" }}>
                No subscriptions match the selected filters.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1220px" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)", textAlign: "left" }}>
                      <th style={tableCellStyle}>User</th>
                      <th style={tableCellStyle}>Plan</th>
                      <th style={tableCellStyle}>Status</th>
                      <th style={tableCellStyle}>Billing Window</th>
                      <th style={tableCellStyle}>Last Charge</th>
                      <th style={tableCellStyle}>Provider IDs</th>
                      <th style={tableCellStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const canReconcile = canReconcileSubscription(row)
                      const isReconciling = reconcilingId === row.id
                      const isManual = row.source === "manual_neft" || row.razorpayPlanId === "MANUAL_GRANT"
                      const isRevoking = revokingId === row.id

                      return (
                        <tr key={row.id}>
                          <td style={tableCellStyle}>
                            <div style={{ fontWeight: 600 }}>{row.userName || "Unknown"}</div>
                            <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>{row.userEmail || "No email"}</div>
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ textTransform: "capitalize", fontWeight: 600 }}>{row.planKey}</div>
                            {isManual ? (
                              <div style={{ marginTop: "6px" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    background: "rgba(59,130,246,0.15)",
                                    color: "#93c5fd",
                                    border: "1px solid rgba(59,130,246,0.3)",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    letterSpacing: "0.04em",
                                  }}
                                >
                                  MANUAL (NEFT)
                                </span>
                              </div>
                            ) : null}
                            <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                              Created {formatDate(row.createdAt)}
                            </div>
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ textTransform: "capitalize", fontWeight: 600 }}>{row.status.replace(/_/g, " ")}</div>
                            {row.cancelAtCycleEnd ? (
                              <div style={{ color: "#fcd34d", marginTop: "6px" }}>Cycle-end cancellation requested</div>
                            ) : null}
                            {row.cancelRequestedAt ? (
                              <div style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
                                Requested {formatDate(row.cancelRequestedAt)}
                              </div>
                            ) : null}
                          </td>
                          <td style={tableCellStyle}>
                            <div>Start: {formatDate(row.currentStartAt)}</div>
                            <div style={{ marginTop: "6px" }}>End: {formatDate(row.currentEndAt)}</div>
                            {row.cancelledAt ? (
                              <div style={{ marginTop: "6px" }}>Cancelled: {formatDate(row.cancelledAt)}</div>
                            ) : null}
                            {row.endedAt ? (
                              <div style={{ marginTop: "6px" }}>Ended: {formatDate(row.endedAt)}</div>
                            ) : null}
                          </td>
                          <td style={tableCellStyle}>
                            {row.latestCharge ? (
                              <>
                                <div>
                                  {row.latestCharge.currency} {(row.latestCharge.amount / 100).toFixed(2)}
                                </div>
                                <div style={{ marginTop: "6px", textTransform: "capitalize" }}>
                                  {row.latestCharge.status}
                                </div>
                                {row.latestCharge.chargedAt ? (
                                  <div style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
                                    {formatDate(row.latestCharge.chargedAt)}
                                  </div>
                                ) : null}
                                {row.latestCharge.failureReason ? (
                                  <div style={{ color: "#fca5a5", marginTop: "6px" }}>
                                    {row.latestCharge.failureReason}
                                  </div>
                                ) : null}
                              </>
                            ) : (
                              <span style={{ color: "var(--text-secondary)" }}>No charge recorded yet</span>
                            )}
                          </td>
                          <td style={tableCellStyle}>
                            {isManual ? (
                              <>
                                <div style={{ color: "#93c5fd", fontWeight: 600 }}>Manual Offline Grant</div>
                                {row.notes?.utrNumber ? (
                                  <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                                    UTR: <code style={{ color: "#FFC72C" }}>{row.notes.utrNumber}</code>
                                  </div>
                                ) : null}
                                {row.notes?.paymentMethod ? (
                                  <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                                    Method: {row.notes.paymentMethod}
                                  </div>
                                ) : null}
                              </>
                            ) : (
                              <>
                                <div style={{ wordBreak: "break-all" }}>{row.razorpaySubscriptionId || "No subscription ID"}</div>
                                <div style={{ color: "var(--text-secondary)", marginTop: "6px", wordBreak: "break-all" }}>
                                  {row.razorpayPlanId}
                                </div>
                                {row.latestCharge?.razorpayPaymentId ? (
                                  <div style={{ color: "var(--text-secondary)", marginTop: "6px", wordBreak: "break-all" }}>
                                    Payment: {row.latestCharge.razorpayPaymentId}
                                  </div>
                                ) : null}
                              </>
                            )}
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {canReconcile ? (
                                <button
                                  type="button"
                                  onClick={() => reconcilePayment(row)}
                                  disabled={isReconciling}
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    border: "1px solid rgba(250,204,21,0.35)",
                                    background: "rgba(250,204,21,0.12)",
                                    color: "#fde68a",
                                    fontWeight: 600,
                                    fontSize: "12px",
                                    cursor: isReconciling ? "wait" : "pointer",
                                    opacity: isReconciling ? 0.7 : 1,
                                  }}
                                >
                                  {isReconciling ? "Reconciling..." : "Reconcile Payment"}
                                </button>
                              ) : null}

                              {row.notes ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedNotesRow(row)}
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    background: "rgba(255,255,255,0.06)",
                                    color: "#e2e8f0",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                  }}
                                >
                                  View Details / UTR
                                </button>
                              ) : null}

                              {isManual && row.status === "active" ? (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeManualAccess(row)}
                                  disabled={isRevoking}
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    border: "1px solid rgba(239,68,68,0.35)",
                                    background: "rgba(239,68,68,0.12)",
                                    color: "#fca5a5",
                                    fontWeight: 600,
                                    fontSize: "12px",
                                    cursor: isRevoking ? "wait" : "pointer",
                                    opacity: isRevoking ? 0.7 : 1,
                                  }}
                                >
                                  {isRevoking ? "Revoking..." : "Revoke Access"}
                                </button>
                              ) : null}

                              {!canReconcile && !row.notes && (!isManual || row.status !== "active") ? (
                                <span style={{ color: "var(--text-secondary)" }}>-</span>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      {/* Grant Manual Access Modal */}
      {showGrantModal ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#121216",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Grant Manual Access (NEFT / Offline)</h2>
              <button
                type="button"
                onClick={() => setShowGrantModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGrantManualAccess} style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
                  User Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="customer@example.com"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
                  User Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
                  Select Preset Duration *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setModalDurationPreset("3_months")
                      setModalAmountPaid("2999")
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: modalDurationPreset === "3_months" ? "2px solid #FFC72C" : "1px solid rgba(255,255,255,0.15)",
                      background: modalDurationPreset === "3_months" ? "rgba(255,199,44,0.12)" : "rgba(255,255,255,0.04)",
                      color: modalDurationPreset === "3_months" ? "#FFC72C" : "#ccc",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "13px",
                      textAlign: "center",
                    }}
                  >
                    3 Months Pass<br />
                    <span style={{ fontSize: "11px", fontWeight: 400, opacity: 0.8 }}>₹2,999</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalDurationPreset("1_year")
                      setModalAmountPaid("9999")
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: modalDurationPreset === "1_year" ? "2px solid #FFC72C" : "1px solid rgba(255,255,255,0.15)",
                      background: modalDurationPreset === "1_year" ? "rgba(255,199,44,0.12)" : "rgba(255,255,255,0.04)",
                      color: modalDurationPreset === "1_year" ? "#FFC72C" : "#ccc",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "13px",
                      textAlign: "center",
                    }}
                  >
                    1 Year Pass<br />
                    <span style={{ fontSize: "11px", fontWeight: 400, opacity: 0.8 }}>₹9,999</span>
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
                    Payment Method
                  </label>
                  <select
                    value={modalPaymentMethod}
                    onChange={(e) => setModalPaymentMethod(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "#1f1f24",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  >
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="IMPS">IMPS</option>
                    <option value="UPI_DIRECT">UPI Direct Transfer</option>
                    <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                    <option value="CASH">Cash / Offline</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="2999"
                    value={modalAmountPaid}
                    onChange={(e) => setModalAmountPaid(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
                  UTR / Bank Transaction Reference Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR1234567890"
                  value={modalUtrNumber}
                  onChange={(e) => setModalUtrNumber(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
                  Internal Admin Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received via HDFC Bank transfer on Aug 3"
                  value={modalAdminNotes}
                  onChange={(e) => setModalAdminNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  id="send-email-check"
                  checked={modalSendEmail}
                  onChange={(e) => setModalSendEmail(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="send-email-check" style={{ fontSize: "13px", color: "#d1d5db", cursor: "pointer" }}>
                  Send confirmation welcome email to customer
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#ccc",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGrant}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid #FFC72C",
                    background: "linear-gradient(180deg, #FFD54F 0%, #FFC72C 100%)",
                    color: "#000",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: submittingGrant ? "wait" : "pointer",
                    opacity: submittingGrant ? 0.7 : 1,
                  }}
                >
                  {submittingGrant ? "Granting Access..." : "Grant Access Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* View Details Modal */}
      {selectedNotesRow ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#121216",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
              padding: "24px",
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Offline Grant & Note Details</h2>
              <button
                type="button"
                onClick={() => setSelectedNotesRow(null)}
                style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "16px", fontSize: "13px", lineHeight: "1.8" }}>
              <div><strong>User Email:</strong> {selectedNotesRow.userEmail || "-"}</div>
              <div><strong>User Name:</strong> {selectedNotesRow.userName || "-"}</div>
              <div><strong>Payment Method:</strong> {selectedNotesRow.notes?.paymentMethod || "NEFT"}</div>
              <div><strong>UTR / Ref Number:</strong> <code style={{ color: "#FFC72C" }}>{selectedNotesRow.notes?.utrNumber || "-"}</code></div>
              <div><strong>Amount Paid:</strong> ₹{selectedNotesRow.notes?.amountPaid || (selectedNotesRow.latestCharge ? (selectedNotesRow.latestCharge.amount / 100).toFixed(0) : "-")}</div>
              <div><strong>Admin Notes:</strong> {selectedNotesRow.notes?.adminNotes || "-"}</div>
              <div><strong>Granted At:</strong> {selectedNotesRow.notes?.grantedAt ? formatDate(selectedNotesRow.notes.grantedAt) : formatDate(selectedNotesRow.currentStartAt)}</div>
              <div><strong>Valid Until:</strong> {formatDate(selectedNotesRow.currentEndAt)}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => setSelectedNotesRow(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function canReconcileSubscription(row: SubscriptionRow) {
  if (!row.razorpaySubscriptionId) {
    return false
  }

  if (!row.latestCharge) {
    return true
  }

  return (
    row.latestCharge.status !== "captured" ||
    row.latestCharge.failureReason === "PAYMENT_NOT_CAPTURED"
  )
}

function formatDate(value: string | null) {
  if (!value) {
    return "-"
  }

  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getLocalDateString(dateStr: string) {
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

