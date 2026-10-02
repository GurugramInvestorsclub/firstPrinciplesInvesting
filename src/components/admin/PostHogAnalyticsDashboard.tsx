"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
    TrendingUp,
    Users,
    CreditCard,
    ArrowDownRight,
    ArrowUpRight,
    Eye,
    BookOpen,
    Calendar,
    RefreshCw,
    ShieldCheck,
    AlertCircle,
    Activity,
    ExternalLink,
    Filter,
    DollarSign,
    CheckCircle2,
    Layers,
    UserCheck,
    Video,
    Compass,
} from "lucide-react"
import { PostHogAnalyticsDashboardData } from "@/lib/analytics/server"

type TimeframeOption = "today" | "7d" | "30d" | "90d" | "custom"

const cardStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "24px",
    backdropFilter: "blur(10px)",
}

export function PostHogAnalyticsDashboard() {
    const [timeframe, setTimeframe] = useState<TimeframeOption>("30d")
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<PostHogAnalyticsDashboardData | null>(null)

    const fetchAnalytics = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            let url = `/api/admin/posthog-analytics?timeframe=${timeframe}`
            if (timeframe === "custom" && startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`
            }

            const res = await fetch(url)
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || "Failed to load PostHog analytics")
            }

            setData(json.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Network error")
        } finally {
            setLoading(false)
        }
    }, [timeframe, startDate, endDate])

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

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

    const overview = data?.overview
    const funnel = data?.funnel
    const traffic = data?.traffic
    const content = data?.content
    const webinars = data?.webinars
    const subscriptions = data?.subscriptions

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Top Toolbar: Title, Date Filter, and Refresh */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    paddingBottom: "16px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                }}
            >
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                        <Activity style={{ width: "24px", height: "24px", color: "var(--gold)" }} />
                        User Journey & Funnel Analytics
                    </h1>
                    <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "14px", marginTop: "4px" }}>
                        PostHog Behavioral Telemetry & Authoritative Payment Conversions
                    </p>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                    {/* Timeframe Buttons */}
                    <div
                        style={{
                            display: "flex",
                            background: "rgba(255, 255, 255, 0.05)",
                            padding: "4px",
                            borderRadius: "10px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                    >
                        {(["today", "7d", "30d", "90d", "custom"] as TimeframeOption[]).map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    border: "none",
                                    background: timeframe === tf ? "var(--gold)" : "transparent",
                                    color: timeframe === tf ? "#000" : "rgba(255, 255, 255, 0.7)",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {tf === "today" ? "Today" : tf === "7d" ? "7 Days" : tf === "30d" ? "30 Days" : tf === "90d" ? "90 Days" : "Custom"}
                            </button>
                        ))}
                    </div>

                    {timeframe === "custom" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    color: "#fff",
                                    padding: "6px 10px",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                }}
                            />
                            <span style={{ color: "rgba(255,255,255,0.4)" }}>to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    color: "#fff",
                                    padding: "6px 10px",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                }}
                            />
                        </div>
                    )}

                    <button
                        onClick={fetchAnalytics}
                        title="Refresh"
                        style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            color: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                        }}
                    >
                        <RefreshCw className={loading ? "animate-spin" : ""} style={{ width: "15px", height: "15px" }} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* PostHog Configuration Banner if personal key not yet populated */}
            {data && (!data.hasPersonalApiKey || !data.hasProjectId) && (
                <div
                    style={{
                        background: "rgba(245, 184, 0, 0.08)",
                        border: "1px solid rgba(245, 184, 0, 0.25)",
                        borderRadius: "12px",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "14px",
                    }}
                >
                    <AlertCircle style={{ width: "20px", height: "20px", color: "var(--gold)", flexShrink: 0, marginTop: "2px" }} />
                    <div style={{ fontSize: "13px", lineHeight: "1.6", color: "rgba(255, 255, 255, 0.85)" }}>
                        <strong style={{ color: "var(--gold)" }}>PostHog Client Active & Tracking:</strong> User events, pageviews, and authoritative payment conversions are flowing safely. To enable server-side HogQL live queries directly into these dashboard cards, add <code style={{ background: "rgba(0,0,0,0.4)", padding: "2px 6px", borderRadius: "4px" }}>POSTHOG_PERSONAL_API_KEY</code> and <code style={{ background: "rgba(0,0,0,0.4)", padding: "2px 6px", borderRadius: "4px" }}>POSTHOG_PROJECT_ID</code> to your environment variables.
                    </div>
                </div>
            )}

            {error && (
                <div
                    style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        padding: "14px 18px",
                        borderRadius: "10px",
                        color: "#f87171",
                        fontSize: "14px",
                    }}
                >
                    {error}
                </div>
            )}

            {/* 1. OVERVIEW KPI CARDS */}
            <div>
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "14px", letterSpacing: "0.03em" }}>
                    OVERVIEW PERFORMANCE
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                    <div style={cardStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Total Visitors</span>
                            <Eye style={{ width: "18px", height: "18px", color: "var(--gold)" }} />
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>
                            {formatNumber(overview?.totalVisitors)}
                        </div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>Unique sessions tracked</div>
                    </div>

                    <div style={cardStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Signups</span>
                            <Users style={{ width: "18px", height: "18px", color: "#38bdf8" }} />
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>
                            {formatNumber(overview?.signups)}
                        </div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>Registered user accounts</div>
                    </div>

                    <div style={cardStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Successful Payments</span>
                            <CreditCard style={{ width: "18px", height: "18px", color: "#4ade80" }} />
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>
                            {formatNumber(overview?.successfulPayments)}
                        </div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>Verified Razorpay transactions</div>
                    </div>

                    <div style={cardStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Total Revenue</span>
                            <DollarSign style={{ width: "18px", height: "18px", color: "var(--gold)" }} />
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>
                            {formatCurrency(overview?.revenue)}
                        </div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>Subscriptions & webinars</div>
                    </div>

                    <div style={cardStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Conversion Rate</span>
                            <TrendingUp style={{ width: "18px", height: "18px", color: "#a855f7" }} />
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>
                            {overview?.conversionRate ?? 0}%
                        </div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>Visitors &rarr; Paid Customers</div>
                    </div>
                </div>
            </div>

            {/* 2. CONVERSION FUNNEL (Visitors -> Signup -> Checkout -> Payment) */}
            <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Layers style={{ width: "20px", height: "20px", color: "var(--gold)" }} />
                            Conversion Funnel: Visitor to Paid Customer
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "2px" }}>
                            Visualizes step-by-step user retention and conversion drop-offs
                        </p>
                    </div>
                    <div style={{ background: "rgba(245, 184, 0, 0.15)", padding: "6px 12px", borderRadius: "8px", color: "var(--gold)", fontWeight: 700, fontSize: "14px" }}>
                        Overall: {funnel?.overallConversionPct ?? 0}%
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {funnel?.steps.map((step, idx) => {
                        const stepPct = funnel.steps[0].count > 0 ? Math.max(8, Math.round((step.count / funnel.steps[0].count) * 100)) : 0
                        return (
                            <div key={step.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                                    <span style={{ fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "var(--gold)" }}>
                                            {idx + 1}
                                        </span>
                                        {step.name}
                                    </span>
                                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                        <span style={{ fontWeight: 700, color: "#fff" }}>{formatNumber(step.count)} users</span>
                                        {idx > 0 && (
                                            <span style={{ color: step.dropOffRate > 50 ? "#f87171" : "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                                                Drop-off: {step.dropOffRate}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ height: "10px", width: "100%", background: "rgba(255,255,255,0.06)", borderRadius: "6px", overflow: "hidden" }}>
                                    <div
                                        style={{
                                            height: "100%",
                                            width: `${stepPct}%`,
                                            background: idx === 0 ? "#3b82f6" : idx === 1 ? "#06b6d4" : idx === 2 ? "#eab308" : "#22c55e",
                                            borderRadius: "6px",
                                            transition: "width 0.5s ease",
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 3. TRAFFIC & POPULAR PAGES */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                {/* Traffic Breakdown */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Compass style={{ width: "18px", height: "18px", color: "var(--gold)" }} />
                        Traffic Sources
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {traffic?.topReferrers.map((ref) => (
                            <div key={ref.source} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>{ref.source}</span>
                                <span style={{ color: "#fff", fontWeight: 600, fontSize: "13px" }}>{formatNumber(ref.visitors)} visits</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Visited Pages */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Eye style={{ width: "18px", height: "18px", color: "var(--gold)" }} />
                        Top Pages
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {traffic?.topPages && traffic.topPages.length > 0 ? (
                            traffic.topPages.map((page) => (
                                <div key={page.path} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", fontFamily: "monospace" }}>{page.path}</span>
                                    <span style={{ color: "#fff", fontWeight: 600, fontSize: "13px" }}>{formatNumber(page.views)} views</span>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>No pageviews captured in this period yet.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. PRODUCT ENGAGEMENT: WEBINARS & SUBSCRIPTIONS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                {/* Webinars Card */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Video style={{ width: "18px", height: "18px", color: "var(--gold)" }} />
                        Webinars & Events
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Webinar Views</div>
                            <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>{formatNumber(webinars?.views)}</div>
                        </div>
                        <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Registrations</div>
                            <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>{formatNumber(webinars?.registrations)}</div>
                        </div>
                        <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Checkout Starts</div>
                            <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>{formatNumber(webinars?.checkoutStarts)}</div>
                        </div>
                        <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Conv. Rate</div>
                            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--gold)", marginTop: "4px" }}>{webinars?.conversionRate ?? 0}%</div>
                        </div>
                    </div>
                </div>

                {/* Subscriptions Card */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <UserCheck style={{ width: "18px", height: "18px", color: "var(--gold)" }} />
                        Subscriptions Lifecycle
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Active Subscribers</div>
                            <div style={{ fontSize: "20px", fontWeight: 700, color: "#4ade80", marginTop: "4px" }}>{formatNumber(subscriptions?.totalSubscribers)}</div>
                        </div>
                        <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Successful Renewals</div>
                            <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>{formatNumber(subscriptions?.successfulPayments)}</div>
                        </div>
                        <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Failed Debits</div>
                            <div style={{ fontSize: "20px", fontWeight: 700, color: "#f87171", marginTop: "4px" }}>{formatNumber(subscriptions?.failedPayments)}</div>
                        </div>
                        <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Cancellations</div>
                            <div style={{ fontSize: "20px", fontWeight: 700, color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>{formatNumber(subscriptions?.cancellations)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. RETENTION COHORT MATRIX */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <TrendingUp style={{ width: "18px", height: "18px", color: "var(--gold)" }} />
                    Cohort Retention Analysis
                </h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "16px" }}>
                    Measures whether new users return to read articles or attend sessions in subsequent weeks
                </p>

                {data?.retention.hasEnoughData ? (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                    <th style={{ padding: "10px", color: "rgba(255,255,255,0.5)" }}>Cohort</th>
                                    <th style={{ padding: "10px", color: "rgba(255,255,255,0.5)" }}>Size</th>
                                    <th style={{ padding: "10px", color: "rgba(255,255,255,0.5)" }}>Week 1</th>
                                    <th style={{ padding: "10px", color: "rgba(255,255,255,0.5)" }}>Week 2</th>
                                    <th style={{ padding: "10px", color: "rgba(255,255,255,0.5)" }}>Week 4</th>
                                    <th style={{ padding: "10px", color: "rgba(255,255,255,0.5)" }}>Week 8</th>
                                    <th style={{ padding: "10px", color: "rgba(255,255,255,0.5)" }}>Week 12</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.retention.cohorts.map((c) => (
                                    <tr key={c.cohort} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <td style={{ padding: "10px", color: "#fff" }}>{c.cohort}</td>
                                        <td style={{ padding: "10px", color: "rgba(255,255,255,0.8)" }}>{c.size}</td>
                                        <td style={{ padding: "10px", color: "var(--gold)" }}>{c.week1 !== null ? `${c.week1}%` : "-"}</td>
                                        <td style={{ padding: "10px", color: "var(--gold)" }}>{c.week2 !== null ? `${c.week2}%` : "-"}</td>
                                        <td style={{ padding: "10px", color: "var(--gold)" }}>{c.week4 !== null ? `${c.week4}%` : "-"}</td>
                                        <td style={{ padding: "10px", color: "var(--gold)" }}>{c.week8 !== null ? `${c.week8}%` : "-"}</td>
                                        <td style={{ padding: "10px", color: "var(--gold)" }}>{c.week12 !== null ? `${c.week12}%` : "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: "24px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: 0 }}>
                            Not enough data yet. Cohort retention requires user return activity across 4+ weeks.
                        </p>
                    </div>
                )}
            </div>

            {/* 6. RECENT MEANINGFUL ACTIVITY STREAM */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Activity style={{ width: "18px", height: "18px", color: "var(--gold)" }} />
                    Recent Meaningful Events
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {data?.recentActivity && data.recentActivity.length > 0 ? (
                        data.recentActivity.map((act, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "10px 14px",
                                    background: "rgba(255,255,255,0.02)",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(255,255,255,0.05)",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span
                                        style={{
                                            padding: "2px 8px",
                                            borderRadius: "4px",
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            background:
                                                act.event.includes("payment") ? "rgba(74, 222, 128, 0.15)" :
                                                act.event.includes("checkout") ? "rgba(245, 184, 0, 0.15)" :
                                                act.event.includes("signup") ? "rgba(56, 189, 248, 0.15)" :
                                                "rgba(255, 255, 255, 0.08)",
                                            color:
                                                act.event.includes("payment") ? "#4ade80" :
                                                act.event.includes("checkout") ? "var(--gold)" :
                                                act.event.includes("signup") ? "#38bdf8" :
                                                "rgba(255, 255, 255, 0.7)",
                                        }}
                                    >
                                        {act.event}
                                    </span>
                                    <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px" }}>{act.summary}</span>
                                </div>
                                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                                    {new Date(act.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>No recent events recorded.</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PostHogAnalyticsDashboard

