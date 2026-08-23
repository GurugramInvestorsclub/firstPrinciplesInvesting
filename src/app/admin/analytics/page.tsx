"use client"

import { CSSProperties, useCallback, useEffect, useState } from "react"
import {
  TrendingUp,
  Users,
  DollarSign,
  CreditCard,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  BarChart3,
  Award,
  RefreshCw,
  Info,
  ShieldCheck,
} from "lucide-react"

interface RetentionMonthData {
  monthKey: string
  monthLabel: string
  totalDue: number
  retained: number
  cancelled: number
  retentionRatePct: number
}

interface LtvTrendMonthData {
  monthKey: string
  monthLabel: string
  customerCount: number
  cumulativeRevenue: number
  avgLtv: number
}

interface TopCustomer {
  id: string
  name: string | null
  email: string
  webinarSpend: number
  subscriptionSpend: number
  totalLtv: number
  transactionCount: number
  firstPurchaseDate: string | null
  latestPurchaseDate: string | null
}

interface AnalyticsPayload {
  availableMonths: string[]
  selectedTimeframe: string
  selectedMonth: string | null
  kpis: {
    averageLtv: number
    totalRevenue: number
    totalWebinarRevenue: number
    totalSubscriptionRevenue: number
    totalPayingCustomers: number
    currentRetentionRatePct: number
    retainedCount: number
    cancelledCount: number
    totalDueCount: number
    activeSubscribers: number
  }
  retention: {
    monthly: RetentionMonthData[]
  }
  ltv: {
    averageLtv: number
    tiers: {
      under1k: number
      between1k3k: number
      between3k5k: number
      between5k10k: number
      above10k: number
    }
    monthlyTrend: LtvTrendMonthData[]
    topCustomers: TopCustomer[]
  }
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

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [timeframe, setTimeframe] = useState<"3m" | "6m" | "12m" | "all" | "month">("12m")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredRetentionIndex, setHoveredRetentionIndex] = useState<number | null>(null)
  const [hoveredLtvIndex, setHoveredLtvIndex] = useState<number | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let url = `/api/admin/analytics?timeframe=${timeframe}`
      if (timeframe === "month" && selectedMonth) {
        url += `&month=${selectedMonth}`
      }

      const res = await fetch(url)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch analytics data")
      }

      setData(json.data)
      if (json.data.availableMonths && json.data.availableMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(json.data.availableMonths[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [timeframe, selectedMonth])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const handleTimeframeChange = (newTimeframe: "3m" | "6m" | "12m" | "all") => {
    setTimeframe(newTimeframe)
  }

  const handleMonthSelectChange = (monthKey: string) => {
    if (!monthKey) return
    setSelectedMonth(monthKey)
    setTimeframe("month")
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const formatMonthLabel = (mKey: string) => {
    if (!mKey) return ""
    const [year, month] = mKey.split("-")
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1)
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  if (loading && !data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "16px" }}>
        <RefreshCw className="animate-spin text-gold" style={{ width: "32px", height: "32px", color: "var(--gold)" }} />
        <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px" }}>Loading Analytics Dashboard...</span>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div style={{ ...cardStyle, border: "1px solid rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.05)", textAlign: "center", padding: "40px" }}>
        <XCircle style={{ width: "40px", height: "40px", color: "#ef4444", margin: "0 auto 16px" }} />
        <h3 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Failed to load Analytics</h3>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", marginBottom: "20px" }}>{error}</p>
        <button
          onClick={fetchAnalytics}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            background: "var(--gold)",
            color: "#000",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Retry Loading
        </button>
      </div>
    )
  }

  const kpis = data?.kpis || {
    averageLtv: 0,
    totalRevenue: 0,
    totalWebinarRevenue: 0,
    totalSubscriptionRevenue: 0,
    totalPayingCustomers: 0,
    currentRetentionRatePct: 100,
    retainedCount: 0,
    cancelledCount: 0,
    totalDueCount: 0,
    activeSubscribers: 0,
  }

  const retentionMonthly = data?.retention?.monthly || []
  const ltvTrend = data?.ltv?.monthlyTrend || []
  const ltvTiers = data?.ltv?.tiers || { under1k: 0, between1k3k: 0, between3k5k: 0, between5k10k: 0, above10k: 0 }
  const topCustomers = data?.ltv?.topCustomers || []

  // Retention Chart SVG prep
  const retentionSvgWidth = 800
  const retentionSvgHeight = 260
  const paddingX = 40
  const paddingY = 30

  const maxRetentionRate = 100
  const minRetentionRate = 0

  const getRetentionPoint = (index: number, val: number, total: number) => {
    const x = total <= 1 ? retentionSvgWidth / 2 : paddingX + (index / (total - 1)) * (retentionSvgWidth - paddingX * 2)
    const y = retentionSvgHeight - paddingY - ((val - minRetentionRate) / (maxRetentionRate - minRetentionRate)) * (retentionSvgHeight - paddingY * 2)
    return { x, y }
  }

  const retentionPoints = retentionMonthly.map((item, idx) =>
    getRetentionPoint(idx, item.retentionRatePct, retentionMonthly.length)
  )

  const retentionPathD = retentionPoints.length > 0
    ? retentionPoints.reduce((acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), "")
    : ""

  const retentionAreaD = retentionPoints.length > 0
    ? `${retentionPathD} L ${retentionPoints[retentionPoints.length - 1].x} ${retentionSvgHeight - paddingY} L ${retentionPoints[0].x} ${retentionSvgHeight - paddingY} Z`
    : ""

  // LTV Trend Chart SVG prep
  const maxLtvVal = Math.max(...ltvTrend.map((d) => d.avgLtv), 1000)
  const ltvPoints = ltvTrend.map((item, idx) => {
    const x = ltvTrend.length <= 1 ? retentionSvgWidth / 2 : paddingX + (idx / (ltvTrend.length - 1)) * (retentionSvgWidth - paddingX * 2)
    const y = retentionSvgHeight - paddingY - (item.avgLtv / maxLtvVal) * (retentionSvgHeight - paddingY * 2)
    return { x, y }
  })

  const ltvPathD = ltvPoints.length > 0
    ? ltvPoints.reduce((acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), "")
    : ""

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>
            Analytics Dashboard
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px", marginTop: "4px", margin: 0 }}>
            Track monthly subscription retention rates and customer lifetime value (LTV).
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Preset Buttons */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", padding: "4px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
            {(["3m", "6m", "12m", "all"] as const).map((tf) => {
              const labelMap = { "3m": "3 Months", "6m": "6 Months", "12m": "12 Months", all: "All Time" }
              const isSelected = timeframe === tf
              return (
                <button
                  key={tf}
                  onClick={() => handleTimeframeChange(tf)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: isSelected ? 600 : 400,
                    background: isSelected ? "var(--gold)" : "transparent",
                    color: isSelected ? "#000" : "rgba(255, 255, 255, 0.7)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {labelMap[tf]}
                </button>
              )
            })}
          </div>

          {/* Individual Month Selector Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Calendar style={{ width: "16px", height: "16px", color: "var(--gold)" }} />
            <select
              value={timeframe === "month" ? selectedMonth : ""}
              onChange={(e) => handleMonthSelectChange(e.target.value)}
              style={{
                background: "transparent",
                color: timeframe === "month" ? "var(--gold)" : "#fff",
                fontSize: "13px",
                fontWeight: 500,
                border: "none",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="" disabled style={{ background: "#1a1a1a", color: "rgba(255,255,255,0.5)" }}>
                Select Specific Month...
              </option>
              {data?.availableMonths?.map((mKey) => (
                <option key={mKey} value={mKey} style={{ background: "#1a1a1a", color: "#fff" }}>
                  {formatMonthLabel(mKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchAnalytics}
            title="Refresh Data"
            style={{
              padding: "8px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        {/* Card 1: Average LTV */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", fontWeight: 500 }}>
              Average Lifetime Value (LTV)
            </span>
            <div style={{ background: "rgba(245, 184, 0, 0.15)", padding: "8px", borderRadius: "8px" }}>
              <TrendingUp style={{ width: "20px", height: "20px", color: "var(--gold)" }} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
            {formatCurrency(kpis.averageLtv)}
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "6px" }}>
            Across {kpis.totalPayingCustomers} total paying customers
          </div>
        </div>

        {/* Card 2: Current Subscription Retention Rate */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", fontWeight: 500 }}>
              Subscription Retention Rate
            </span>
            <div style={{ background: "rgba(16, 185, 129, 0.15)", padding: "8px", borderRadius: "8px" }}>
              <ShieldCheck style={{ width: "20px", height: "20px", color: "#10b981" }} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#10b981", letterSpacing: "-0.02em" }}>
            {kpis.currentRetentionRatePct.toFixed(1)}%
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "6px" }}>
            {kpis.retainedCount} retained / {kpis.totalDueCount} due for renewal
          </div>
        </div>

        {/* Card 3: Subscription Revenue */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", fontWeight: 500 }}>
              Subscription Revenue
            </span>
            <div style={{ background: "rgba(59, 130, 246, 0.15)", padding: "8px", borderRadius: "8px" }}>
              <CreditCard style={{ width: "20px", height: "20px", color: "#3b82f6" }} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
            {formatCurrency(kpis.totalSubscriptionRevenue)}
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "6px" }}>
            {kpis.activeSubscribers} currently active subscribers
          </div>
        </div>

        {/* Card 4: Webinar Revenue */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", fontWeight: 500 }}>
              Webinar Revenue
            </span>
            <div style={{ background: "rgba(168, 85, 247, 0.15)", padding: "8px", borderRadius: "8px" }}>
              <Users style={{ width: "20px", height: "20px", color: "#a855f7" }} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
            {formatCurrency(kpis.totalWebinarRevenue)}
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "6px" }}>
            Total revenue from webinar registrations
          </div>
        </div>
      </div>

      {/* SECTION 1: SUBSCRIPTION RETENTION RATE GRAPH */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart3 style={{ width: "20px", height: "20px", color: "var(--gold)" }} />
              Monthly Subscription Retention Rate (%)
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", margin: "4px 0 0 0" }}>
              Track percentage of subscribers who renewed vs cancelled each month.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--gold)" }}></span>
              Retention Rate (%)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#10b981" }}></span>
              Retained
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#ef4444" }}></span>
              Cancelled
            </div>
          </div>
        </div>

        {/* SVG Retention Graph */}
        <div style={{ width: "100%", overflowX: "auto", position: "relative" }}>
          <svg viewBox={`0 0 ${retentionSvgWidth} ${retentionSvgHeight}`} style={{ width: "100%", height: "auto", minWidth: "600px", overflow: "visible" }}>
            <defs>
              <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Y Lines */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = retentionSvgHeight - paddingY - (val / 100) * (retentionSvgHeight - paddingY * 2)
              return (
                <g key={val}>
                  <line x1={paddingX} y1={y} x2={retentionSvgWidth - paddingX} y2={y} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="4 4" />
                  <text x={paddingX - 8} y={y + 4} fill="rgba(255, 255, 255, 0.4)" fontSize="10" textAnchor="end">
                    {val}%
                  </text>
                </g>
              )
            })}

            {/* Area under curve */}
            {retentionAreaD && <path d={retentionAreaD} fill="url(#retentionGradient)" />}

            {/* Line curve */}
            {retentionPathD && <path d={retentionPathD} fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

            {/* Data Points */}
            {retentionPoints.map((pt, idx) => {
              const item = retentionMonthly[idx]
              const isHovered = hoveredRetentionIndex === idx

              return (
                <g key={idx} onMouseEnter={() => setHoveredRetentionIndex(idx)} onMouseLeave={() => setHoveredRetentionIndex(null)} style={{ cursor: "pointer" }}>
                  {/* Vertical Guide Line on Hover */}
                  {isHovered && (
                    <line x1={pt.x} y1={paddingY} x2={pt.x} y2={retentionSvgHeight - paddingY} stroke="rgba(245, 184, 0, 0.4)" strokeDasharray="3 3" />
                  )}

                  {/* Outer glow ring */}
                  <circle cx={pt.x} cy={pt.y} r={isHovered ? 8 : 5} fill="var(--gold)" opacity={isHovered ? 1 : 0.8} />
                  <circle cx={pt.x} cy={pt.y} r={isHovered ? 4 : 2.5} fill="#1a1a1a" />

                  {/* X Axis Month Label */}
                  <text x={pt.x} y={retentionSvgHeight - 8} fill={isHovered ? "var(--gold)" : "rgba(255, 255, 255, 0.5)"} fontSize="11" textAnchor="middle" fontWeight={isHovered ? 600 : 400}>
                    {item.monthLabel}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredRetentionIndex !== null && retentionMonthly[hoveredRetentionIndex] && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(18, 18, 18, 0.95)",
                border: "1px solid var(--gold)",
                borderRadius: "8px",
                padding: "12px 16px",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--gold)", marginBottom: "6px" }}>
                {retentionMonthly[hoveredRetentionIndex].monthLabel} Retention
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Retention Rate:</span>
                  <span style={{ fontWeight: 700, color: "#10b981" }}>
                    {retentionMonthly[hoveredRetentionIndex].retentionRatePct}%
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Retained Subscriptions:</span>
                  <span style={{ fontWeight: 600, color: "#fff" }}>
                    {retentionMonthly[hoveredRetentionIndex].retained}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Cancelled Subscriptions:</span>
                  <span style={{ fontWeight: 600, color: "#ef4444" }}>
                    {retentionMonthly[hoveredRetentionIndex].cancelled}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Total Due for Renewal:</span>
                  <span style={{ fontWeight: 600, color: "#fff" }}>
                    {retentionMonthly[hoveredRetentionIndex].totalDue}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: CUSTOMER LIFETIME VALUE (LTV) TREND & TIERS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
        {/* LTV Monthly Average Trend */}
        <div style={{ ...cardStyle, gridColumn: "span 2" }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp style={{ width: "20px", height: "20px", color: "var(--gold)" }} />
              Customer LTV Growth Trend
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", margin: "4px 0 0 0" }}>
              Average revenue generated per customer over time.
            </p>
          </div>

          <div style={{ width: "100%", overflowX: "auto" }}>
            <svg viewBox={`0 0 ${retentionSvgWidth} ${retentionSvgHeight}`} style={{ width: "100%", height: "auto", minWidth: "550px" }}>
              <defs>
                <linearGradient id="ltvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.5, 1.0].map((pct, idx) => {
                const val = Math.round(maxLtvVal * pct)
                const y = retentionSvgHeight - paddingY - (pct) * (retentionSvgHeight - paddingY * 2)
                return (
                  <g key={idx}>
                    <line x1={paddingX} y1={y} x2={retentionSvgWidth - paddingX} y2={y} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="4 4" />
                    <text x={paddingX - 8} y={y + 4} fill="rgba(255, 255, 255, 0.4)" fontSize="10" textAnchor="end">
                      ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                    </text>
                  </g>
                )
              })}

              {/* LTV Line */}
              {ltvPathD && <path d={ltvPathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />}

              {/* Points */}
              {ltvPoints.map((pt, idx) => {
                const item = ltvTrend[idx]
                const isHovered = hoveredLtvIndex === idx

                return (
                  <g key={idx} onMouseEnter={() => setHoveredLtvIndex(idx)} onMouseLeave={() => setHoveredLtvIndex(null)} style={{ cursor: "pointer" }}>
                    <circle cx={pt.x} cy={pt.y} r={isHovered ? 7 : 4} fill="#3b82f6" />
                    <text x={pt.x} y={retentionSvgHeight - 8} fill="rgba(255, 255, 255, 0.5)" fontSize="11" textAnchor="middle">
                      {item.monthLabel}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* LTV Distribution Tiers */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>
            Customer LTV Distribution
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", marginBottom: "20px" }}>
            Breakdown of paying users by lifetime spending bracket.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "< ₹1,000", count: ltvTiers.under1k, color: "#6b7280" },
              { label: "₹1,000 - ₹3,000", count: ltvTiers.between1k3k, color: "#3b82f6" },
              { label: "₹3,000 - ₹5,000", count: ltvTiers.between3k5k, color: "#10b981" },
              { label: "₹5,000 - ₹10,000", count: ltvTiers.between5k10k, color: "var(--gold)" },
              { label: "> ₹10,000 (VIP)", count: ltvTiers.above10k, color: "#a855f7" },
            ].map((tier, idx) => {
              const total = kpis.totalPayingCustomers || 1
              const pct = Math.round((tier.count / total) * 100)
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{tier.label}</span>
                    <span style={{ color: "#fff", fontWeight: 600 }}>
                      {tier.count} users ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: tier.color, borderRadius: "4px" }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: MONTHLY RETENTION BREAKDOWN TABLE */}
      <div style={cardStyle}>
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", margin: 0 }}>
            Monthly Subscription Retention Data Table
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", marginTop: "4px" }}>
            Exhaustive monthly stats for active, retained, and churned subscriptions.
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", textAlign: "left" }}>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Month</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Due for Renewal</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Retained (Renewed)</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Cancelled / Churned</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Retention Rate</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Performance</th>
              </tr>
            </thead>
            <tbody>
              {retentionMonthly.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tableCellStyle, textAlign: "center", padding: "30px", color: "rgba(255,255,255,0.4)" }}>
                    No subscription data available for selected timeframe.
                  </td>
                </tr>
              ) : (
                retentionMonthly.map((r, idx) => {
                  const isHigh = r.retentionRatePct >= 80
                  const isMed = r.retentionRatePct >= 50 && r.retentionRatePct < 80
                  return (
                    <tr key={idx} style={{ transition: "background 0.15s ease" }} className="hover:bg-white/5">
                      <td style={{ ...tableCellStyle, fontWeight: 600 }}>{r.monthLabel}</td>
                      <td style={{ ...tableCellStyle }}>{r.totalDue}</td>
                      <td style={{ ...tableCellStyle, color: "#10b981", fontWeight: 600 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <CheckCircle2 style={{ width: "14px", height: "14px" }} />
                          {r.retained}
                        </span>
                      </td>
                      <td style={{ ...tableCellStyle, color: r.cancelled > 0 ? "#ef4444" : "rgba(255,255,255,0.6)" }}>
                        {r.cancelled > 0 ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <XCircle style={{ width: "14px", height: "14px" }} />
                            {r.cancelled}
                          </span>
                        ) : (
                          "0"
                        )}
                      </td>
                      <td style={{ ...tableCellStyle, fontWeight: 700, fontSize: "14px", color: isHigh ? "#10b981" : isMed ? "var(--gold)" : "#ef4444" }}>
                        {r.retentionRatePct}%
                      </td>
                      <td style={{ ...tableCellStyle }}>
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontWeight: 600,
                            background: isHigh ? "rgba(16, 185, 129, 0.15)" : isMed ? "rgba(245, 184, 0, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: isHigh ? "#10b981" : isMed ? "var(--gold)" : "#ef4444",
                          }}
                        >
                          {isHigh ? "HEALTHY" : isMed ? "MODERATE" : "ATTENTION NEEDED"}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: TOP HIGH-LTV CUSTOMERS TABLE */}
      <div style={cardStyle}>
        <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Award style={{ width: "20px", height: "20px", color: "var(--gold)" }} />
              Top Customers by Lifetime Value (LTV)
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", marginTop: "4px" }}>
              Highest spending accounts combined across webinars and subscriptions.
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", textAlign: "left" }}>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Rank & Customer</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Total LTV</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Webinar Spend</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Subscription Spend</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Txns</th>
                <th style={{ ...tableCellStyle, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>First Join Date</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tableCellStyle, textAlign: "center", padding: "30px", color: "rgba(255,255,255,0.4)" }}>
                    No customer purchase records found.
                  </td>
                </tr>
              ) : (
                topCustomers.map((cust, idx) => (
                  <tr key={cust.id || idx} style={{ transition: "background 0.15s ease" }} className="hover:bg-white/5">
                    <td style={{ ...tableCellStyle }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: idx < 3 ? "rgba(245, 184, 0, 0.2)" : "rgba(255,255,255,0.06)",
                            color: idx < 3 ? "var(--gold)" : "rgba(255,255,255,0.6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, color: "#fff" }}>{cust.name || "Anonymous Member"}</div>
                          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{cust.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...tableCellStyle, fontWeight: 700, color: "var(--gold)", fontSize: "14px" }}>
                      {formatCurrency(cust.totalLtv)}
                    </td>
                    <td style={{ ...tableCellStyle, color: "rgba(255,255,255,0.8)" }}>
                      {formatCurrency(cust.webinarSpend)}
                    </td>
                    <td style={{ ...tableCellStyle, color: "rgba(255,255,255,0.8)" }}>
                      {formatCurrency(cust.subscriptionSpend)}
                    </td>
                    <td style={{ ...tableCellStyle }}>{cust.transactionCount}</td>
                    <td style={{ ...tableCellStyle, color: "rgba(255,255,255,0.5)" }}>
                      {cust.firstPurchaseDate
                        ? new Date(cust.firstPurchaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
