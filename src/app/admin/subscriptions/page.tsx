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
  const [enabled, setEnabled] = useState(false)
  const [checkoutReady, setCheckoutReady] = useState(false)
  const [webhookReady, setWebhookReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [reconcilingId, setReconcilingId] = useState<string | null>(null)

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
        <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Insights Subscriptions</h1>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
          Review premium Insights memberships, current billing windows, and the latest recurring charge recorded for each user.
        </p>
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
              color: actionMessage.toLowerCase().includes("unable") ? "#fca5a5" : "#6ee7b7",
              fontSize: "13px",
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
                {rows.map((row) => {
                  const canReconcile = canReconcileSubscription(row)
                  const isReconciling = reconcilingId === row.id

                  return (
                    <tr key={row.id}>
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: 600 }}>{row.userName || "Unknown"}</div>
                        <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>{row.userEmail || "No email"}</div>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ textTransform: "capitalize", fontWeight: 600 }}>{row.planKey}</div>
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
                        <div style={{ wordBreak: "break-all" }}>{row.razorpaySubscriptionId || "No subscription ID"}</div>
                        <div style={{ color: "var(--text-secondary)", marginTop: "6px", wordBreak: "break-all" }}>
                          {row.razorpayPlanId}
                        </div>
                        {row.latestCharge?.razorpayPaymentId ? (
                          <div style={{ color: "var(--text-secondary)", marginTop: "6px", wordBreak: "break-all" }}>
                            Payment: {row.latestCharge.razorpayPaymentId}
                          </div>
                        ) : null}
                      </td>
                      <td style={tableCellStyle}>
                        {canReconcile ? (
                          <button
                            type="button"
                            onClick={() => reconcilePayment(row)}
                            disabled={isReconciling}
                            style={{
                              minWidth: "138px",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              border: "1px solid rgba(250,204,21,0.35)",
                              background: "rgba(250,204,21,0.12)",
                              color: "#fde68a",
                              fontWeight: 700,
                              cursor: isReconciling ? "wait" : "pointer",
                              opacity: isReconciling ? 0.7 : 1,
                            }}
                          >
                            {isReconciling ? "Reconciling..." : "Reconcile Payment"}
                          </button>
                        ) : (
                          <span style={{ color: "var(--text-secondary)" }}>-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function canReconcileSubscription(row: SubscriptionRow) {
  if (["active", "authenticated", "cancel_requested"].includes(row.status)) {
    return false
  }

  if (!row.razorpaySubscriptionId) {
    return false
  }

  if (!row.latestCharge) {
    return true
  }

  return (
    row.latestCharge.status === "failed" ||
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

