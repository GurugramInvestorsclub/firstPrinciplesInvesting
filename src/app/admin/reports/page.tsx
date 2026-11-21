"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  CreditCard,
  RefreshCw,
  Compass,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Download,
  Trash2,
  CheckCircle2,
  BookOpen,
  DollarSign,
  Filter,
  Sparkles,
  Layers,
  Search,
} from "lucide-react"

interface TopPageItem {
  path: string
  views: number
}

interface ReferrerItem {
  source: string
  count: number
}

interface WowMetrics {
  visitorGrowthPct: number | null
  pageviewsGrowthPct: number | null
  subscriptionGrowthPct: number | null
  revenueGrowthPct: number | null
  signupsGrowthPct: number | null
}

interface DetailedBreakdown {
  planDistribution?: {
    monthly: number
    threeMonthly: number
    yearly: number
  }
  cancellations?: number
  webinarRegistrationsCount?: number
  avgRevenuePerSubscriber?: number
  topArticles?: Array<{ path: string; views: number }>
}

interface ReportItem {
  id?: string
  reportType: "WEEKLY" | "CUSTOM"
  title: string
  year?: number
  weekNumber?: number
  startDate: string
  endDate: string
  totalVisitors: number
  totalPageviews: number
  topPagePath: string
  topPageViews: number
  topPages?: TopPageItem[]
  insightsVisitors: number
  insightsPageviews: number
  topReferrers?: ReferrerItem[]
  totalNewSubscriptions: number
  activeSubscriptions: number
  subscriptionRevenue: number
  webinarRevenue: number
  totalRevenue: number
  newSignups: number
  wowMetrics?: WowMetrics | null
  detailedBreakdown?: DetailedBreakdown
  status: "GENERATED" | "PARTIAL" | "FAILED"
  errorMessage?: string | null
  generatedAt?: string
}

const cardStyle: React.CSSProperties = {
  background: "rgba(26, 26, 26, 0.8)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "14px",
  padding: "24px",
  backdropFilter: "blur(12px)",
}

const subCardStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.07)",
  borderRadius: "10px",
  padding: "16px",
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<"weekly" | "custom">("weekly")

  // Weekly Archive State
  const [reportsList, setReportsList] = useState<ReportItem[]>([])
  const [selectedReportId, setSelectedReportId] = useState<string>("")
  const [currentReport, setCurrentReport] = useState<ReportItem | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [generatingWeekly, setGeneratingWeekly] = useState(false)

  // Custom Range State
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split("T")[0]
  })
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0]
  })
  const [customReport, setCustomReport] = useState<ReportItem | null>(null)
  const [loadingCustom, setLoadingCustom] = useState(false)
  const [savingCustomToArchive, setSavingCustomToArchive] = useState(false)

  // Feedback State
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Format Helpers
  const formatCurrency = (val?: number) => {
    if (typeof val !== "number") return "₹0"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const formatNumber = (val?: number) => {
    if (typeof val !== "number") return "0"
    return new Intl.NumberFormat("en-IN").format(val)
  }

  const formatDateLabel = (isoDate: string) => {
    if (!isoDate) return ""
    return new Date(isoDate).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    })
  }

  // Fetch all archived reports
  const fetchReportsList = useCallback(async (selectLatest = false) => {
    setLoadingList(true)
    try {
      const res = await fetch("/api/admin/reports?limit=50")
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setReportsList(json.data)
        if (json.data.length > 0) {
          if (selectLatest || !selectedReportId) {
            setSelectedReportId(json.data[0].id)
            setCurrentReport(json.data[0])
          } else {
            const found = json.data.find((r: ReportItem) => r.id === selectedReportId)
            setCurrentReport(found || json.data[0])
          }
        } else {
          setCurrentReport(null)
        }
      }
    } catch (err) {
      console.error("Failed to load reports list:", err)
      showNotification("Failed to load reports archive", "error")
    } finally {
      setLoadingList(false)
    }
  }, [selectedReportId])

  useEffect(() => {
    fetchReportsList(true)
  }, [fetchReportsList])

  // Change selected weekly report
  const handleSelectReport = (id: string) => {
    setSelectedReportId(id)
    const found = reportsList.find((r) => r.id === id)
    if (found) setCurrentReport(found)
  }

  // Trigger manual generation for latest week
  const handleGenerateWeeklyReport = async () => {
    setGeneratingWeekly(true)
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType: "WEEKLY" }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate weekly report")
      }
      showNotification("Weekly report generated successfully!")
      await fetchReportsList(true)
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Generation failed", "error")
    } finally {
      setGeneratingWeekly(false)
    }
  }

  // Trigger custom date report fetch
  const handleFetchCustomReport = async (save = false) => {
    if (!customStartDate || !customEndDate) {
      showNotification("Please select both start and end dates", "error")
      return
    }

    if (new Date(customStartDate) > new Date(customEndDate)) {
      showNotification("Start date must be before or equal to end date", "error")
      return
    }

    if (save) setSavingCustomToArchive(true)
    else setLoadingCustom(true)

    try {
      const url = `/api/admin/reports/custom?startDate=${customStartDate}&endDate=${customEndDate}&save=${save}`
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to compute custom report")
      }
      setCustomReport(json.data)
      if (save) {
        showNotification("Custom report saved to archive!")
        fetchReportsList()
      } else {
        showNotification("Custom report fetched successfully")
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Failed to load custom report", "error")
    } finally {
      setLoadingCustom(false)
      setSavingCustomToArchive(false)
    }
  }

  // Quick Preset handler for custom dates
  const applyDatePreset = (preset: "7d" | "14d" | "30d" | "thisMonth" | "lastMonth") => {
    const today = new Date()
    const endStr = today.toISOString().split("T")[0]
    let startD = new Date()

    if (preset === "7d") {
      startD.setDate(today.getDate() - 7)
    } else if (preset === "14d") {
      startD.setDate(today.getDate() - 14)
    } else if (preset === "30d") {
      startD.setDate(today.getDate() - 30)
    } else if (preset === "thisMonth") {
      startD = new Date(today.getFullYear(), today.getMonth(), 1)
    } else if (preset === "lastMonth") {
      startD = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
      setCustomStartDate(startD.toISOString().split("T")[0])
      setCustomEndDate(lastMonthEnd.toISOString().split("T")[0])
      return
    }

    setCustomStartDate(startD.toISOString().split("T")[0])
    setCustomEndDate(endStr)
  }

  // Delete an archived report
  const handleDeleteReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this report from the archive?")) return
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete")
      showNotification("Report deleted")
      fetchReportsList(true)
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Delete failed", "error")
    }
  }

  // Export active report as CSV
  const handleExportCsv = (rep: ReportItem | null) => {
    if (!rep) return
    const rows = [
      ["Metric", "Value"],
      ["Report Title", rep.title],
      ["Type", rep.reportType],
      ["Period", `${formatDateLabel(rep.startDate)} to ${formatDateLabel(rep.endDate)}`],
      ["Total Subscriptions (New)", rep.totalNewSubscriptions],
      ["Active Subscribers Base", rep.activeSubscriptions],
      ["Subscription Revenue (INR)", rep.subscriptionRevenue],
      ["Webinar Revenue (INR)", rep.webinarRevenue],
      ["Total Combined Revenue (INR)", rep.totalRevenue],
      ["Total Unique Visitors", rep.totalVisitors],
      ["Total Pageviews", rep.totalPageviews],
      ["Most Visited Page", rep.topPagePath],
      ["Most Visited Page Views", rep.topPageViews],
      ["Insights Section Visitors", rep.insightsVisitors],
      ["Insights Section Pageviews", rep.insightsPageviews],
      ["New Signups", rep.newSignups],
      [""],
      ["Top Visited Pages", "Views"],
      ...(rep.topPages || []).map((p) => [p.path, p.views]),
      [""],
      ["Top Referrers", "Visitors"],
      ...(rep.topReferrers || []).map((r) => [r.source, r.count]),
    ]

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `fpi-report-${rep.startDate.split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotification("Report exported to CSV")
  }

  // The active report to display in hero cards
  const displayReport: ReportItem | null = activeTab === "weekly" ? currentReport : customReport

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: notification.type === "success" ? "#10b981" : "#ef4444",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {notification.type === "success" ? <CheckCircle2 style={{ width: "18px", height: "18px" }} /> : <AlertCircle style={{ width: "18px", height: "18px" }} />}
          {notification.message}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "rgba(245, 184, 0, 0.15)", padding: "10px", borderRadius: "10px" }}>
              <FileText style={{ width: "24px", height: "24px", color: "var(--gold)" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>
                Performance & Telemetry Reports
              </h1>
              <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px", margin: "4px 0 0 0" }}>
                Automated Monday morning executive summaries and on-demand custom date range analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action: Export Active CSV */}
        {displayReport && (
          <button
            onClick={() => handleExportCsv(displayReport)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Download style={{ width: "16px", height: "16px" }} />
            Export CSV
          </button>
        )}
      </div>

      {/* Mode Selector Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          paddingBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setActiveTab("weekly")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            border: "1px solid",
            borderColor: activeTab === "weekly" ? "var(--gold)" : "rgba(255, 255, 255, 0.12)",
            background: activeTab === "weekly" ? "rgba(245, 184, 0, 0.15)" : "rgba(255, 255, 255, 0.03)",
            color: activeTab === "weekly" ? "var(--gold)" : "rgba(255, 255, 255, 0.7)",
            transition: "all 0.15s ease",
          }}
        >
          <Calendar style={{ width: "16px", height: "16px" }} />
          Weekly Reports (Monday Schedule)
        </button>

        <button
          onClick={() => {
            setActiveTab("custom")
            if (!customReport) handleFetchCustomReport(false)
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            border: "1px solid",
            borderColor: activeTab === "custom" ? "var(--gold)" : "rgba(255, 255, 255, 0.12)",
            background: activeTab === "custom" ? "rgba(245, 184, 0, 0.15)" : "rgba(255, 255, 255, 0.03)",
            color: activeTab === "custom" ? "var(--gold)" : "rgba(255, 255, 255, 0.7)",
            transition: "all 0.15s ease",
          }}
        >
          <Filter style={{ width: "16px", height: "16px" }} />
          Custom Date Range & On-Demand
        </button>
      </div>

      {/* TAB 1: WEEKLY REPORTS CONTROLS */}
      {activeTab === "weekly" && (
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
              Select Archived Week:
            </span>
            <select
              value={selectedReportId}
              onChange={(e) => handleSelectReport(e.target.value)}
              style={{
                background: "rgba(255, 255, 255, 0.07)",
                border: "1px solid rgba(245, 184, 0, 0.3)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                borderRadius: "8px",
                padding: "8px 14px",
                cursor: "pointer",
                outline: "none",
                minWidth: "280px",
              }}
            >
              {reportsList.map((r) => (
                <option key={r.id} value={r.id} style={{ background: "#1a1a1a", color: "#fff" }}>
                  {r.title} ({formatDateLabel(r.startDate)} - {formatDateLabel(r.endDate)})
                </option>
              ))}
              {reportsList.length === 0 && (
                <option value="" disabled style={{ background: "#1a1a1a", color: "rgba(255,255,255,0.5)" }}>
                  No reports generated yet
                </option>
              )}
            </select>

            <button
              onClick={() => fetchReportsList(false)}
              title="Refresh Reports List"
              style={{
                padding: "8px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <RefreshCw className={loadingList ? "animate-spin" : ""} style={{ width: "16px", height: "16px" }} />
            </button>
          </div>

          {/* Trigger Immediate Weekly Report */}
          <button
            onClick={handleGenerateWeeklyReport}
            disabled={generatingWeekly}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "8px",
              background: "var(--gold)",
              color: "#000",
              fontWeight: 700,
              fontSize: "13px",
              border: "none",
              cursor: generatingWeekly ? "not-allowed" : "pointer",
              opacity: generatingWeekly ? 0.7 : 1,
              transition: "all 0.15s ease",
            }}
          >
            <RefreshCw className={generatingWeekly ? "animate-spin" : ""} style={{ width: "16px", height: "16px" }} />
            {generatingWeekly ? "Generating Report..." : "Generate Current Week Report Now"}
          </button>
        </div>
      )}

      {/* TAB 2: CUSTOM DATE RANGE CONTROLS */}
      {activeTab === "custom" && (
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", margin: 0 }}>
                Query Custom Date Range
              </h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", margin: "4px 0 0 0" }}>
                Select any custom window to compute subscriptions, total visitors, most visited page, and insights traffic.
              </p>
            </div>

            {/* Quick Preset Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginRight: "4px" }}>Presets:</span>
              {(["7d", "14d", "30d", "thisMonth", "lastMonth"] as const).map((preset) => {
                const labelMap = { "7d": "Last 7 Days", "14d": "Last 14 Days", "30d": "Last 30 Days", thisMonth: "This Month", lastMonth: "Last Month" }
                return (
                  <button
                    key={preset}
                    onClick={() => applyDatePreset(preset)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 500,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.8)",
                      cursor: "pointer",
                    }}
                  >
                    {labelMap[preset]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date Inputs & Submit */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            <button
              onClick={() => handleFetchCustomReport(false)}
              disabled={loadingCustom}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "8px",
                background: "var(--gold)",
                color: "#000",
                fontWeight: 700,
                fontSize: "13px",
                border: "none",
                cursor: loadingCustom ? "not-allowed" : "pointer",
                opacity: loadingCustom ? 0.7 : 1,
              }}
            >
              <Search style={{ width: "15px", height: "15px" }} />
              {loadingCustom ? "Computing..." : "Fetch Custom Report"}
            </button>

            <button
              onClick={() => handleFetchCustomReport(true)}
              disabled={savingCustomToArchive}
              title="Save this custom date analysis permanently into the Reports Archive"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                color: "#34d399",
                fontWeight: 600,
                fontSize: "13px",
                cursor: savingCustomToArchive ? "not-allowed" : "pointer",
              }}
            >
              <ShieldCheck style={{ width: "15px", height: "15px" }} />
              {savingCustomToArchive ? "Saving..." : "Save to Archive"}
            </button>
          </div>
        </div>
      )}

      {/* MAIN REPORT DASHBOARD (Hero Cards & Breakdowns) */}
      {displayReport ? (
        <>
          {/* Active Report Title Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(90deg, rgba(245, 184, 0, 0.1) 0%, rgba(20, 20, 20, 0.6) 100%)",
              border: "1px solid rgba(245, 184, 0, 0.25)",
              borderRadius: "12px",
              padding: "16px 24px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                  {displayReport.title}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    background: displayReport.status === "GENERATED" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 184, 0, 0.2)",
                    color: displayReport.status === "GENERATED" ? "#34d399" : "var(--gold)",
                  }}
                >
                  {displayReport.status}
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>
                Range: {formatDateLabel(displayReport.startDate)} &rarr; {formatDateLabel(displayReport.endDate)}
                {displayReport.generatedAt && ` • Generated on ${new Date(displayReport.generatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Combined Revenue</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--gold)" }}>
                  {formatCurrency(displayReport.totalRevenue)}
                </div>
              </div>
            </div>
          </div>

          {/* THE 4 KEY MONITORABLES CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" }}>
            {/* Card 1: Total Subscriptions */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", fontWeight: 500 }}>
                  Total Subscriptions in Period
                </span>
                <div style={{ background: "rgba(245, 184, 0, 0.15)", padding: "8px", borderRadius: "8px" }}>
                  <CreditCard style={{ width: "20px", height: "20px", color: "var(--gold)" }} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "32px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                  {displayReport.totalNewSubscriptions}
                </span>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>new</span>
                {displayReport.wowMetrics?.subscriptionGrowthPct != null && (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: displayReport.wowMetrics.subscriptionGrowthPct >= 0 ? "#10b981" : "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    {displayReport.wowMetrics.subscriptionGrowthPct >= 0 ? <TrendingUp style={{ width: "14px", height: "14px" }} /> : <TrendingDown style={{ width: "14px", height: "14px" }} />}
                    {displayReport.wowMetrics.subscriptionGrowthPct > 0 ? "+" : ""}{displayReport.wowMetrics.subscriptionGrowthPct}% WoW
                  </span>
                )}
              </div>

              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginTop: "8px" }}>
                Revenue: <strong style={{ color: "#fff" }}>{formatCurrency(displayReport.subscriptionRevenue)}</strong>
              </div>

              {/* Tier breakdown pills */}
              <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: "4px", color: "rgba(255,255,255,0.8)" }}>
                  Monthly: {displayReport.detailedBreakdown?.planDistribution?.monthly ?? 0}
                </span>
                <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: "4px", color: "rgba(255,255,255,0.8)" }}>
                  3-Month: {displayReport.detailedBreakdown?.planDistribution?.threeMonthly ?? 0}
                </span>
                <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: "4px", color: "rgba(255,255,255,0.8)" }}>
                  Yearly: {displayReport.detailedBreakdown?.planDistribution?.yearly ?? 0}
                </span>
              </div>
            </div>

            {/* Card 2: Total Visitors */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", fontWeight: 500 }}>
                  Total Visitors
                </span>
                <div style={{ background: "rgba(59, 130, 246, 0.15)", padding: "8px", borderRadius: "8px" }}>
                  <Users style={{ width: "20px", height: "20px", color: "#3b82f6" }} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "32px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                  {formatNumber(displayReport.totalVisitors)}
                </span>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>unique</span>
                {displayReport.wowMetrics?.visitorGrowthPct != null && (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: displayReport.wowMetrics.visitorGrowthPct >= 0 ? "#10b981" : "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    {displayReport.wowMetrics.visitorGrowthPct >= 0 ? <TrendingUp style={{ width: "14px", height: "14px" }} /> : <TrendingDown style={{ width: "14px", height: "14px" }} />}
                    {displayReport.wowMetrics.visitorGrowthPct > 0 ? "+" : ""}{displayReport.wowMetrics.visitorGrowthPct}% WoW
                  </span>
                )}
              </div>

              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginTop: "8px" }}>
                Total Pageviews: <strong style={{ color: "#fff" }}>{formatNumber(displayReport.totalPageviews)}</strong>
              </div>

              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "14px" }}>
                Avg {displayReport.totalVisitors > 0 ? (displayReport.totalPageviews / displayReport.totalVisitors).toFixed(1) : "0"} views per visitor
              </div>
            </div>

            {/* Card 3: Most Visited Page */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", fontWeight: 500 }}>
                  Page with Most Visits
                </span>
                <div style={{ background: "rgba(16, 185, 129, 0.15)", padding: "8px", borderRadius: "8px" }}>
                  <Eye style={{ width: "20px", height: "20px", color: "#10b981" }} />
                </div>
              </div>

              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--gold)", wordBreak: "break-all", minHeight: "48px" }}>
                {displayReport.topPagePath || "/"}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "6px" }}>
                <span style={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}>
                  {formatNumber(displayReport.topPageViews)}
                </span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                  views ({displayReport.totalPageviews > 0 ? ((displayReport.topPageViews / displayReport.totalPageviews) * 100).toFixed(1) : 0}% of traffic)
                </span>
              </div>

              <div style={{ marginTop: "12px" }}>
                <a
                  href={displayReport.topPagePath}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "12px",
                    textDecoration: "none",
                  }}
                >
                  Visit Page <ExternalLink style={{ width: "12px", height: "12px" }} />
                </a>
              </div>
            </div>

            {/* Card 4: Total Visitors on Insights Page */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", fontWeight: 500 }}>
                  Visitors on Insights Page
                </span>
                <div style={{ background: "rgba(168, 85, 247, 0.15)", padding: "8px", borderRadius: "8px" }}>
                  <BookOpen style={{ width: "20px", height: "20px", color: "#a855f7" }} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "32px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                  {formatNumber(displayReport.insightsVisitors)}
                </span>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>visitors</span>
              </div>

              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginTop: "8px" }}>
                Insights Pageviews: <strong style={{ color: "#fff" }}>{formatNumber(displayReport.insightsPageviews)}</strong>
              </div>

              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "14px" }}>
                {displayReport.totalVisitors > 0
                  ? `${((displayReport.insightsVisitors / displayReport.totalVisitors) * 100).toFixed(1)}% of all site visitors visited Insights`
                  : "Insights section activity"}
              </div>
            </div>
          </div>

          {/* SECONDARY ROW: WEBINARS, SIGNUPS & AUDIENCE */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div style={subCardStyle}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 600 }}>
                Webinar Ticket Sales
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
                {formatCurrency(displayReport.webinarRevenue)}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>
                {displayReport.detailedBreakdown?.webinarRegistrationsCount ?? 0} registrations
              </div>
            </div>

            <div style={subCardStyle}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 600 }}>
                New Registered Users
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
                {displayReport.newSignups}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>
                Account signups during period
              </div>
            </div>

            <div style={subCardStyle}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 600 }}>
                Active Subscriber Base
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>
                {displayReport.activeSubscriptions}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>
                {displayReport.detailedBreakdown?.cancellations ?? 0} cancelled in period
              </div>
            </div>

            <div style={subCardStyle}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 600 }}>
                Avg Revenue Per Subscriber
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
                {formatCurrency(displayReport.detailedBreakdown?.avgRevenuePerSubscriber ?? 0)}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>
                Across new subscribers
              </div>
            </div>
          </div>

          {/* DETAILED TABLES: TOP 10 PAGES & TOP REFERRERS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "20px" }}>
            {/* Top Visited Pages Ranking Table */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Eye style={{ width: "18px", height: "18px", color: "var(--gold)" }} />
                  Top Visited Pages (Ranking)
                </h3>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                  {(displayReport.topPages || []).length} pages listed
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left", color: "rgba(255,255,255,0.5)" }}>
                      <th style={{ padding: "8px 10px", width: "40px" }}>#</th>
                      <th style={{ padding: "8px 10px" }}>Page Path</th>
                      <th style={{ padding: "8px 10px", textAlign: "right" }}>Views</th>
                      <th style={{ padding: "8px 10px", textAlign: "right" }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(displayReport.topPages || []).map((page, idx) => {
                      const sharePct = displayReport.totalPageviews > 0 ? ((page.views / displayReport.totalPageviews) * 100).toFixed(1) : "0"
                      return (
                        <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "10px", color: idx === 0 ? "var(--gold)" : "rgba(255,255,255,0.6)", fontWeight: 700 }}>
                            #{idx + 1}
                          </td>
                          <td style={{ padding: "10px", fontFamily: "monospace", color: "#fff" }}>
                            {page.path}
                          </td>
                          <td style={{ padding: "10px", textAlign: "right", fontWeight: 600, color: "#fff" }}>
                            {formatNumber(page.views)}
                          </td>
                          <td style={{ padding: "10px", textAlign: "right", color: "rgba(255,255,255,0.6)" }}>
                            {sharePct}%
                          </td>
                        </tr>
                      )
                    })}
                    {(!displayReport.topPages || displayReport.topPages.length === 0) && (
                      <tr>
                        <td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                          No page tracking data recorded for this window.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Referrers & Acquisition Sources */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Compass style={{ width: "18px", height: "18px", color: "#3b82f6" }} />
                  Traffic Referrers & Sources
                </h3>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left", color: "rgba(255,255,255,0.5)" }}>
                      <th style={{ padding: "8px 10px" }}>Source</th>
                      <th style={{ padding: "8px 10px", textAlign: "right" }}>Visitors</th>
                      <th style={{ padding: "8px 10px", textAlign: "right" }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(displayReport.topReferrers || []).map((ref, idx) => {
                      const sharePct = displayReport.totalVisitors > 0 ? ((ref.count / displayReport.totalVisitors) * 100).toFixed(1) : "0"
                      return (
                        <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "10px", color: "#fff", fontWeight: 500 }}>
                            {ref.source}
                          </td>
                          <td style={{ padding: "10px", textAlign: "right", fontWeight: 600, color: "#fff" }}>
                            {formatNumber(ref.count)}
                          </td>
                          <td style={{ padding: "10px", textAlign: "right", color: "rgba(255,255,255,0.6)" }}>
                            {sharePct}%
                          </td>
                        </tr>
                      )
                    })}
                    {(!displayReport.topReferrers || displayReport.topReferrers.length === 0) && (
                      <tr>
                        <td colSpan={3} style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                          Direct / Organic search constitutes primary traffic.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ ...cardStyle, textAlign: "center", padding: "60px 20px" }}>
          <FileText style={{ width: "40px", height: "40px", color: "rgba(255,255,255,0.3)", margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
            No Report Selected
          </h3>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", maxWidth: "450px", margin: "0 auto 20px" }}>
            Click &quot;Generate Current Week Report Now&quot; above, or select a custom date range to compute telemetry and financial monitorables.
          </p>
        </div>
      )}

      {/* HISTORICAL ARCHIVE TABLE (Visible in Weekly Mode) */}
      {activeTab === "weekly" && (
        <div style={{ ...cardStyle, marginTop: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", margin: 0 }}>
                Historical Reports Archive
              </h3>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0 0" }}>
                All automated Monday reports and saved custom runs stored in the database.
              </p>
            </div>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
              Total Archived: {reportsList.length}
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", textAlign: "left", color: "rgba(255,255,255,0.6)" }}>
                  <th style={{ padding: "12px 14px" }}>Report Title & Period</th>
                  <th style={{ padding: "12px 14px" }}>Type</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Visitors</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Subscriptions</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Revenue</th>
                  <th style={{ padding: "12px 14px" }}>Top Visited Page</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reportsList.map((rep) => {
                  const isSelected = selectedReportId === rep.id
                  return (
                    <tr
                      key={rep.id}
                      onClick={() => handleSelectReport(rep.id!)}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        background: isSelected ? "rgba(245, 184, 0, 0.08)" : "transparent",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, color: isSelected ? "var(--gold)" : "#fff" }}>
                          {rep.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                          {formatDateLabel(rep.startDate)} - {formatDateLabel(rep.endDate)}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: rep.reportType === "WEEKLY" ? "rgba(59, 130, 246, 0.15)" : "rgba(168, 85, 247, 0.15)",
                            color: rep.reportType === "WEEKLY" ? "#60a5fa" : "#c084fc",
                            textTransform: "uppercase",
                          }}
                        >
                          {rep.reportType}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, color: "#fff" }}>
                        {formatNumber(rep.totalVisitors)}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, color: "#fff" }}>
                        {rep.totalNewSubscriptions} new
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, color: "var(--gold)" }}>
                        {formatCurrency(rep.totalRevenue)}
                      </td>

                      <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>
                        {rep.topPagePath || "/"}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleExportCsv(rep)
                            }}
                            title="Export CSV"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "rgba(255,255,255,0.6)",
                              cursor: "pointer",
                              padding: "4px",
                            }}
                          >
                            <Download style={{ width: "15px", height: "15px" }} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteReport(rep.id!, e)}
                            title="Delete Report"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "4px",
                            }}
                          >
                            <Trash2 style={{ width: "15px", height: "15px" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {reportsList.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: "30px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                      No reports generated yet. Click &quot;Generate Current Week Report Now&quot; above to create your first report.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
