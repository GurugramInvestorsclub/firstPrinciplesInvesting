"use client"

import { CSSProperties, FormEvent, useCallback, useEffect, useMemo, useState } from "react"

interface EventPricingRow {
  id: string
  eventId: string
  pricePaise: number
  priceRupees: number
  updatedAt: string
}

interface CouponRow {
  id: string
  code: string
  type: "percentage" | "flat"
  value: number
  valueRupees: number | null
  maxUses: number | null
  usedCount: number
  remainingUses: number | null
  expiryDate: string
  isActive: boolean
  eventId: string | null
  perUserLimit: number | null
  redemptionCount: number
  updatedAt: string
}

const inputStyle: CSSProperties = {
  padding: "10px 14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(107,107,107,0.2)",
  borderRadius: "8px",
  color: "var(--text-primary)",
  fontSize: "14px",
  outline: "none",
}

const buttonStyle: CSSProperties = {
  padding: "10px 18px",
  background: "linear-gradient(135deg, var(--gold), var(--gold-muted))",
  color: "#1A1A1A",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  letterSpacing: "0.02em",
  boxShadow: "0 2px 8px rgba(245,184,0,0.25)",
}

export default function AdminCouponsPage() {
  const [events, setEvents] = useState<EventPricingRow[]>([])
  const [coupons, setCoupons] = useState<CouponRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingEvent, setSavingEvent] = useState(false)
  const [savingCoupon, setSavingCoupon] = useState(false)

  const [eventIdInput, setEventIdInput] = useState("")
  const [eventPriceInput, setEventPriceInput] = useState("")

  const [couponCode, setCouponCode] = useState("")
  const [couponType, setCouponType] = useState<"percentage" | "flat">("percentage")
  const [couponValue, setCouponValue] = useState("")
  const [couponMaxUses, setCouponMaxUses] = useState("")
  const [couponPerUserLimit, setCouponPerUserLimit] = useState("")
  const [couponExpiry, setCouponExpiry] = useState("")
  const [couponEventId, setCouponEventId] = useState("")
  const [couponActive, setCouponActive] = useState(true)
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null)
  const [editExpiry, setEditExpiry] = useState("")
  const [editValue, setEditValue] = useState("")

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.eventId.localeCompare(b.eventId)),
    [events]
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [eventsRes, couponsRes] = await Promise.all([
        fetch("/api/admin/events"),
        fetch("/api/admin/coupons"),
      ])

      const [eventsPayload, couponsPayload] = await Promise.all([
        eventsRes.json(),
        couponsRes.json(),
      ])

      if (!eventsRes.ok || !eventsPayload.success) {
        throw new Error(eventsPayload.error || "Failed to load event pricing")
      }

      if (!couponsRes.ok || !couponsPayload.success) {
        throw new Error(couponsPayload.error || "Failed to load coupons")
      }

      setEvents(eventsPayload.data)
      setCoupons(couponsPayload.data)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveEventPricing = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSavingEvent(true)

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: eventIdInput,
          price: eventPriceInput,
        }),
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to save event pricing")
      }

      setEventIdInput("")
      setEventPriceInput("")
      await loadData()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save event pricing")
    } finally {
      setSavingEvent(false)
    }
  }

  const handleCreateCoupon = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSavingCoupon(true)

    try {
      const expiryDate = new Date(couponExpiry)
      if (Number.isNaN(expiryDate.getTime())) {
        throw new Error("Expiry date is invalid")
      }

      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          type: couponType,
          value: couponValue,
          maxUses: couponMaxUses || null,
          perUserLimit: couponPerUserLimit || null,
          expiryDate: expiryDate.toISOString(),
          eventId: couponEventId || null,
          isActive: couponActive,
        }),
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to create coupon")
      }

      setCouponCode("")
      setCouponValue("")
      setCouponMaxUses("")
      setCouponPerUserLimit("")
      setCouponExpiry("")
      setCouponEventId("")
      setCouponActive(true)
      await loadData()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to create coupon")
    } finally {
      setSavingCoupon(false)
    }
  }

  const toggleCouponStatus = async (coupon: CouponRow) => {
    setError(null)

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: coupon.id,
          isActive: !coupon.isActive,
        }),
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to update coupon")
      }

      await loadData()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update coupon")
    }
  }

  const handleUpdateCoupon = async (couponId: string) => {
    setError(null)

    try {
      const expiryDate = new Date(editExpiry)
      if (Number.isNaN(expiryDate.getTime())) {
        throw new Error("Expiry date is invalid")
      }

      const response = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: couponId,
          expiryDate: expiryDate.toISOString(),
          value: editValue,
        }),
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to update coupon")
      }

      setEditingCouponId(null)
      await loadData()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update coupon")
    }
  }

  const startEditing = (coupon: CouponRow) => {
    setEditingCouponId(coupon.id)
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const date = new Date(coupon.expiryDate)
    const formattedDate = date.toISOString().slice(0, 16)
    setEditExpiry(formattedDate)

    // Set edit value
    if (coupon.type === "percentage") {
      setEditValue(String(coupon.value))
    } else {
      setEditValue(String(coupon.valueRupees ?? 0))
    }
  }

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value)

  const handleDeleteEvent = async (id: string, eventId: string) => {
    if (!window.confirm(`Are you sure you want to delete pricing for event '${eventId}'? This action cannot be undone.`)) return

    setError(null)
    setSavingEvent(true)
    try {
      const response = await fetch(`/api/admin/events?id=${id}`, {
        method: "DELETE",
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to delete event pricing")
      }
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event pricing")
    } finally {
      setSavingEvent(false)
    }
  }

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon '${code}'? This action cannot be undone.`)) return

    setError(null)
    try {
      const response = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to delete coupon")
      }
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete coupon")
    }
  }

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          Coupons & Event Pricing
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "6px" }}>
          Backend pricing is authoritative for billing. CMS price is display-only.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.08)",
            color: "#f87171",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <section
        style={{
          borderRadius: "12px",
          border: "1px solid rgba(107,107,107,0.2)",
          background: "rgba(255,255,255,0.02)",
          padding: "20px",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "12px", fontSize: "18px" }}>Event Pricing (Backend Source of Truth)</h2>

        <form onSubmit={handleSaveEventPricing} style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <input
              style={inputStyle}
              type="text"
              placeholder="Event ID (e.g. APR2026_MASTERCLASS)"
              value={eventIdInput}
              onChange={(e) => setEventIdInput(e.target.value.toUpperCase())}
              required
            />
            <input
              style={inputStyle}
              type="number"
              step="0.01"
              min="1"
              placeholder="Price in INR"
              value={eventPriceInput}
              onChange={(e) => setEventPriceInput(e.target.value)}
              required
            />
          </div>

          <div>
            <button type="submit" style={buttonStyle} disabled={savingEvent}>
              {savingEvent ? "Saving..." : "Save Event Pricing"}
            </button>
          </div>
        </form>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(107,107,107,0.2)" }}>
                <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-secondary)", fontWeight: 600 }}>Event ID</th>
                <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-secondary)", fontWeight: 600 }}>Price</th>
                <th style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-secondary)", fontWeight: 600 }}>Updated</th>
                <th style={{ textAlign: "right", padding: "10px 8px", color: "var(--text-secondary)", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ padding: "14px 8px", color: "var(--text-secondary)" }}>
                    Loading...
                  </td>
                </tr>
              ) : sortedEvents.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: "14px 8px", color: "var(--text-secondary)" }}>
                    No backend event pricing configured yet.
                  </td>
                </tr>
              ) : (
                sortedEvents.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid rgba(107,107,107,0.1)" }}>
                    <td style={{ padding: "10px 8px", color: "var(--text-primary)", fontWeight: 500 }}>{row.eventId}</td>
                    <td style={{ padding: "10px 8px", color: "var(--text-primary)" }}>{formatMoney(row.priceRupees)}</td>
                    <td style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>
                      {new Date(row.updatedAt).toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "right" }}>
                      <button
                        onClick={() => handleDeleteEvent(row.id, row.eventId)}
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          color: "#ef4444",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section
        style={{
          borderRadius: "12px",
          border: "1px solid rgba(107,107,107,0.2)",
          background: "rgba(255,255,255,0.02)",
          padding: "20px",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "12px", fontSize: "18px" }}>Create Coupon</h2>

        <form onSubmit={handleCreateCoupon} style={{ display: "grid", gap: "12px" }}>
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <input
              style={inputStyle}
              type="text"
              placeholder="Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              required
            />

            <select
              style={inputStyle}
              value={couponType}
              onChange={(e) => setCouponType(e.target.value as "percentage" | "flat")}
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat (INR)</option>
            </select>

            <input
              style={inputStyle}
              type="number"
              min="1"
              step={couponType === "percentage" ? "1" : "0.01"}
              placeholder={couponType === "percentage" ? "Value (%)" : "Value (INR)"}
              value={couponValue}
              onChange={(e) => setCouponValue(e.target.value)}
              required
            />

            <input
              style={inputStyle}
              type="number"
              min="1"
              step="1"
              placeholder="Max uses (optional)"
              value={couponMaxUses}
              onChange={(e) => setCouponMaxUses(e.target.value)}
            />

            <input
              style={inputStyle}
              type="number"
              min="1"
              step="1"
              placeholder="Per-user limit (optional)"
              value={couponPerUserLimit}
              onChange={(e) => setCouponPerUserLimit(e.target.value)}
            />

            <input
              style={inputStyle}
              type="datetime-local"
              value={couponExpiry}
              onChange={(e) => setCouponExpiry(e.target.value)}
              required
            />

            <select
              style={inputStyle}
              value={couponEventId}
              onChange={(e) => setCouponEventId(e.target.value)}
            >
              <option value="">All events</option>
              {sortedEvents.map((eventRow) => (
                <option key={eventRow.id} value={eventRow.eventId}>
                  {eventRow.eventId}
                </option>
              ))}
            </select>

            <select
              style={inputStyle}
              value={couponActive ? "active" : "inactive"}
              onChange={(e) => setCouponActive(e.target.value === "active")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <button type="submit" style={buttonStyle} disabled={savingCoupon}>
              {savingCoupon ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </form>
      </section>

      <section
        style={{
          borderRadius: "12px",
          border: "1px solid rgba(107,107,107,0.2)",
          background: "rgba(255,255,255,0.02)",
          padding: "20px",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "12px", fontSize: "18px" }}>Coupons</h2>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(107,107,107,0.2)" }}>
                {[
                  "Code",
                  "Type",
                  "Value",
                  "Uses",
                  "Per User",
                  "Event",
                  "Expiry",
                  "Status",
                  "Action",
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: "left",
                      padding: "10px 8px",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: "14px 8px", color: "var(--text-secondary)" }}>
                    Loading...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "14px 8px", color: "var(--text-secondary)" }}>
                    No coupons created yet.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const usageText =
                    coupon.maxUses === null
                      ? `${coupon.usedCount} used`
                      : `${coupon.usedCount}/${coupon.maxUses} used`

                  const valueText =
                    coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : formatMoney(coupon.valueRupees ?? 0)

                  return (
                    <tr key={coupon.id} style={{ borderBottom: "1px solid rgba(107,107,107,0.1)" }}>
                      <td style={{ padding: "10px 8px", color: "var(--text-primary)", fontWeight: 600 }}>
                        {coupon.code}
                      </td>
                      <td style={{ padding: "10px 8px", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                        {coupon.type}
                      </td>
                      <td style={{ padding: "10px 8px", color: "var(--text-primary)" }}>
                        {editingCouponId === coupon.id ? (
                          <input
                            type="number"
                            step={coupon.type === "percentage" ? "1" : "0.01"}
                            style={{ ...inputStyle, padding: "4px 8px", fontSize: "12px", width: "80px" }}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                          />
                        ) : (
                          valueText
                        )}
                      </td>
                      <td style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>{usageText}</td>
                      <td style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>
                        {coupon.perUserLimit ?? "-"}
                      </td>
                      <td style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>
                        {coupon.eventId ?? "All"}
                      </td>
                      <td style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>
                        {editingCouponId === coupon.id ? (
                          <input
                            type="datetime-local"
                            style={{ ...inputStyle, padding: "4px 8px", fontSize: "12px" }}
                            value={editExpiry}
                            onChange={(e) => setEditExpiry(e.target.value)}
                          />
                        ) : (
                          new Date(coupon.expiryDate).toLocaleString("en-IN")
                        )}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "6px",
                            background: coupon.isActive
                              ? "rgba(34,197,94,0.12)"
                              : "rgba(239,68,68,0.12)",
                            color: coupon.isActive ? "#4ade80" : "#f87171",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {editingCouponId === coupon.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateCoupon(coupon.id)}
                                style={{
                                  ...buttonStyle,
                                  padding: "6px 10px",
                                  fontSize: "12px",
                                }}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCouponId(null)}
                                style={{
                                  ...buttonStyle,
                                  background: "rgba(255,255,255,0.08)",
                                  color: "var(--text-primary)",
                                  boxShadow: "none",
                                  padding: "6px 10px",
                                  fontSize: "12px",
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditing(coupon)}
                                style={{
                                  ...buttonStyle,
                                  background: "rgba(255,255,255,0.08)",
                                  color: "var(--text-primary)",
                                  boxShadow: "none",
                                  padding: "6px 10px",
                                  fontSize: "12px",
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleCouponStatus(coupon)}
                                style={{
                                  ...buttonStyle,
                                  background: coupon.isActive
                                    ? "rgba(239,68,68,0.18)"
                                    : "rgba(34,197,94,0.18)",
                                  color: coupon.isActive ? "#fca5a5" : "#86efac",
                                  boxShadow: "none",
                                  padding: "6px 10px",
                                  fontSize: "12px",
                                }}
                              >
                                {coupon.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                                style={{
                                  ...buttonStyle,
                                  background: "rgba(239,68,68,0.1)",
                                  color: "#ef4444",
                                  border: "1px solid rgba(239,68,68,0.2)",
                                  boxShadow: "none",
                                  padding: "6px 10px",
                                  fontSize: "12px",
                                }}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
