import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

interface UserLtvMap {
    id: string
    name: string | null
    email: string
    webinarSpend: number
    subscriptionSpend: number
    totalLtv: number
    transactionCount: number
    firstPurchaseDate: Date | null
    latestPurchaseDate: Date | null
}

function getMonthKey(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
}

function formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split("-")
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

export async function GET(request: NextRequest) {
    try {
        if (!(await isAdminAuthenticated())) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const timeframe = searchParams.get("timeframe") || "12m" // "3m", "6m", "12m", "all", "month"
        const selectedMonth = searchParams.get("month") // "YYYY-MM" e.g., "2026-03"

        const now = new Date()

        // 1. Fetch Subscriptions & Charges (Only Real Paid/Active Subscriptions)
        const subscriptions = await prisma.insightsSubscription.findMany({
            where: {
                OR: [
                    { paidCount: { gt: 0 } },
                    { status: { in: ["ACTIVE", "AUTHENTICATED", "CANCELLED", "CANCEL_REQUESTED", "PAUSED"] } },
                    { charges: { some: {} } },
                ],
            },
            include: {
                charges: {
                    orderBy: { createdAt: "asc" },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        })

        // 2. Fetch Webinar Payments (Only SUCCESS status)
        const webinarPayments = await prisma.payment.findMany({
            where: { status: "SUCCESS" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        })

        // Collect all distinct months from real data
        const monthSet = new Set<string>()

        // Add last 12 months by default to ensure continuous timeline
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            monthSet.add(getMonthKey(d))
        }

        subscriptions.forEach((sub) => {
            if (sub.createdAt) monthSet.add(getMonthKey(sub.createdAt))
            if (sub.currentStartAt) monthSet.add(getMonthKey(sub.currentStartAt))
            if (sub.cancelledAt) monthSet.add(getMonthKey(sub.cancelledAt))
            sub.charges.forEach((c) => {
                const date = c.chargedAt || c.createdAt
                if (date) monthSet.add(getMonthKey(new Date(date)))
            })
        })

        webinarPayments.forEach((p) => {
            const date = p.paidAt || p.createdAt
            if (date) monthSet.add(getMonthKey(date))
        })

        const allMonthsSorted = Array.from(monthSet).sort()

        // Filter months based on requested timeframe / month selection
        let filteredMonths = [...allMonthsSorted]

        if (timeframe === "3m") {
            filteredMonths = filteredMonths.slice(-3)
        } else if (timeframe === "6m") {
            filteredMonths = filteredMonths.slice(-6)
        } else if (timeframe === "12m") {
            filteredMonths = filteredMonths.slice(-12)
        } else if (timeframe === "month" && selectedMonth) {
            filteredMonths = filteredMonths.filter((m) => m === selectedMonth)
        }

        // ==========================================
        // RETENTION RATE METRICS BY MONTH
        // ==========================================
        // A renewal charge (2nd, 3rd, etc.) is mapped to the month in which it was charged.
        const monthlyRetentionData = filteredMonths.map((monthKey) => {
            const [yearStr, monthStr] = monthKey.split("-")
            const monthEnd = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0, 23, 59, 59, 999)
            let retained = 0
            let cancelled = 0

            subscriptions.forEach((sub) => {
                // Check if any renewal charge (index >= 1, i.e., 2nd charge onwards) happened in this month
                const renewalChargesInMonth = sub.charges.filter((c, idx) => {
                    if (idx === 0) return false // 1st charge is initial purchase
                    const date = c.chargedAt || c.createdAt
                    return date && getMonthKey(new Date(date)) === monthKey
                })

                if (renewalChargesInMonth.length > 0) {
                    retained += renewalChargesInMonth.length
                } else if (sub.paidCount >= 2) {
                    const startAt = sub.currentStartAt ? new Date(sub.currentStartAt) : null
                    if (startAt && getMonthKey(startAt) === monthKey) {
                        retained++
                    }
                }

                // Check if cancelled in this month and endAt <= monthEnd
                const isCancelled =
                    sub.status === "CANCELLED" ||
                    sub.status === "CANCEL_REQUESTED" ||
                    sub.status === "HALTED" ||
                    sub.cancelledAt !== null ||
                    sub.cancelRequestedAt !== null

                const endAt = sub.currentEndAt ? new Date(sub.currentEndAt) : null
                if (isCancelled && endAt && endAt <= monthEnd && getMonthKey(endAt) === monthKey) {
                    cancelled++
                }
            })

            const totalDue = retained + cancelled
            const retentionRatePct = totalDue > 0 ? Math.round((retained / totalDue) * 1000) / 10 : 100.0

            return {
                monthKey,
                monthLabel: formatMonthLabel(monthKey),
                totalDue,
                retained,
                cancelled,
                retentionRatePct,
            }
        })

        // Overall KPI Retention Rate Across All Subscriptions
        let renewedCount = 0
        let renewalCancelledPastDueCount = 0
        let cancellationPendingFutureCount = 0
        let initialCycleActiveCount = 0

        subscriptions.forEach((sub) => {
            const hasRenewed = sub.paidCount >= 2 || sub.charges.length >= 2
            const isCancelled =
                sub.status === "CANCELLED" ||
                sub.status === "CANCEL_REQUESTED" ||
                sub.status === "HALTED" ||
                sub.cancelledAt !== null ||
                sub.cancelRequestedAt !== null

            const endAt = sub.currentEndAt ? new Date(sub.currentEndAt) : null
            const isPastDue = endAt ? endAt <= now : false

            if (hasRenewed) {
                renewedCount++
            } else if (isCancelled) {
                if (isPastDue) {
                    renewalCancelledPastDueCount++
                } else {
                    cancellationPendingFutureCount++
                    initialCycleActiveCount++
                }
            } else {
                initialCycleActiveCount++
            }
        })

        const totalRenewalDueCount = renewedCount + renewalCancelledPastDueCount
        const currentRetentionRatePct =
            totalRenewalDueCount > 0 ? Math.round((renewedCount / totalRenewalDueCount) * 1000) / 10 : 100.0

        // ==========================================
        // CANCELLED & PAUSED SUBSCRIBERS DETAILS
        // ==========================================
        const cancelledSubscribers = subscriptions
            .filter(
                (s) =>
                    s.status === "CANCELLED" ||
                    s.status === "CANCEL_REQUESTED" ||
                    s.status === "PAUSED" ||
                    s.status === "HALTED" ||
                    s.cancelledAt !== null ||
                    s.cancelRequestedAt !== null
            )
            .map((s) => {
                let amountPaid = 0
                if (s.charges && s.charges.length > 0) {
                    s.charges.forEach((c) => {
                        if (c.status === "CAPTURED" || c.status === "CREATED") {
                            amountPaid += c.amount > 10000 ? Math.round(c.amount / 100) : c.amount
                        }
                    })
                } else {
                    const notesObj =
                        s.notes && typeof s.notes === "object" && !Array.isArray(s.notes)
                            ? (s.notes as Record<string, unknown>)
                            : null
                    if (typeof notesObj?.amountPaid === "number") {
                        amountPaid += notesObj.amountPaid
                    }
                }

                return {
                    id: s.id,
                    userName: s.user?.name || "Member",
                    userEmail: s.user?.email || "No Email",
                    planKey: s.planKey,
                    status: s.status,
                    cancelledAt: s.cancelledAt,
                    cancelRequestedAt: s.cancelRequestedAt,
                    createdAt: s.createdAt,
                    paidCount: s.paidCount,
                    amountPaid,
                }
            })
            .sort((a, b) => {
                const dateA = a.cancelledAt || a.cancelRequestedAt || a.createdAt
                const dateB = b.cancelledAt || b.cancelRequestedAt || b.createdAt
                return new Date(dateB).getTime() - new Date(dateA).getTime()
            })

        // ==========================================
        // LIFETIME VALUE (LTV) & RECOGNIZED REVENUE
        // ==========================================
        const customerMap = new Map<string, UserLtvMap>()

        const getOrCreateCustomer = (email: string, userId?: string, name?: string | null, userCreatedAt?: Date) => {
            const key = (email || userId || `unknown_${Math.random()}`).toLowerCase().trim()
            if (!customerMap.has(key)) {
                customerMap.set(key, {
                    id: userId || key,
                    name: name || null,
                    email: email.toLowerCase().trim(),
                    webinarSpend: 0,
                    subscriptionSpend: 0,
                    totalLtv: 0,
                    transactionCount: 0,
                    firstPurchaseDate: userCreatedAt || null,
                    latestPurchaseDate: null,
                })
            }
            const cust = customerMap.get(key)!
            if (name && !cust.name) cust.name = name
            if (userId && cust.id.startsWith("unknown_")) cust.id = userId
            return cust
        }

        // 1. Process Webinar Payments (Recognized Revenue)
        let totalWebinarRevenue = 0
        webinarPayments.forEach((p) => {
            const email = p.user?.email
            if (!email) return
            const cust = getOrCreateCustomer(email, p.user?.id, p.user?.name, p.user?.createdAt)

            const rupees = p.amount > 10000 ? Math.round(p.amount / 100) : p.amount
            totalWebinarRevenue += rupees
            cust.webinarSpend += rupees
            cust.totalLtv += rupees
            cust.transactionCount++

            const txDate = p.paidAt || p.createdAt
            if (txDate) {
                if (!cust.firstPurchaseDate || txDate < cust.firstPurchaseDate) cust.firstPurchaseDate = txDate
                if (!cust.latestPurchaseDate || txDate > cust.latestPurchaseDate) cust.latestPurchaseDate = txDate
            }
        })

        // 2. Process Subscription Charges (Recognized Revenue)
        let totalSubscriptionRevenue = 0
        subscriptions.forEach((sub) => {
            const email = sub.user?.email
            if (!email) return
            const cust = getOrCreateCustomer(email, sub.user?.id, sub.user?.name, sub.user?.createdAt)

            let subRev = 0
            if (sub.charges && sub.charges.length > 0) {
                sub.charges.forEach((c) => {
                    if (c.status === "CAPTURED" || c.status === "CREATED") {
                        const rupees = c.amount > 10000 ? Math.round(c.amount / 100) : c.amount
                        subRev += rupees
                        const txDate = c.chargedAt || c.createdAt
                        if (txDate) {
                            if (!cust.firstPurchaseDate || txDate < cust.firstPurchaseDate) cust.firstPurchaseDate = txDate
                            if (!cust.latestPurchaseDate || txDate > cust.latestPurchaseDate) cust.latestPurchaseDate = txDate
                        }
                    }
                })
            } else {
                const notesObj = sub.notes && typeof sub.notes === "object" && !Array.isArray(sub.notes)
                    ? (sub.notes as Record<string, unknown>)
                    : null
                if (typeof notesObj?.amountPaid === "number") {
                    subRev += notesObj.amountPaid
                }
            }

            totalSubscriptionRevenue += subRev
            cust.subscriptionSpend += subRev
            cust.totalLtv += subRev
            cust.transactionCount += Math.max(1, sub.charges.length)

            if (sub.createdAt) {
                if (!cust.firstPurchaseDate || sub.createdAt < cust.firstPurchaseDate) cust.firstPurchaseDate = sub.createdAt
                if (!cust.latestPurchaseDate || sub.createdAt > cust.latestPurchaseDate) cust.latestPurchaseDate = sub.createdAt
            }
        })

        const allCustomers = Array.from(customerMap.values())
        const payingCustomers = allCustomers.filter((c) => c.totalLtv > 0)

        const totalRevenue = totalWebinarRevenue + totalSubscriptionRevenue
        const totalCustomerCount = payingCustomers.length
        const averageLtv = totalCustomerCount > 0 ? Math.round(totalRevenue / totalCustomerCount) : 0

        // Sort Top Customers by LTV
        const topCustomers = [...payingCustomers]
            .sort((a, b) => b.totalLtv - a.totalLtv)
            .slice(0, 25)

        // LTV Tiers Breakdown
        const ltvTiers = {
            under1k: payingCustomers.filter((c) => c.totalLtv < 1000).length,
            between1k3k: payingCustomers.filter((c) => c.totalLtv >= 1000 && c.totalLtv < 3000).length,
            between3k5k: payingCustomers.filter((c) => c.totalLtv >= 3000 && c.totalLtv < 5000).length,
            between5k10k: payingCustomers.filter((c) => c.totalLtv >= 5000 && c.totalLtv < 10000).length,
            above10k: payingCustomers.filter((c) => c.totalLtv >= 10000).length,
        }

        // Monthly LTV Trend
        const monthlyLtvTrend = filteredMonths.map((monthKey) => {
            const [yearStr, monthStr] = monthKey.split("-")
            const monthEnd = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0, 23, 59, 59, 999)

            const activeCustomersUpToMonth = payingCustomers.filter(
                (c) => c.firstPurchaseDate && new Date(c.firstPurchaseDate) <= monthEnd
            )

            const totalRevUpToMonth = activeCustomersUpToMonth.reduce((acc, c) => acc + c.totalLtv, 0)
            const count = activeCustomersUpToMonth.length
            const avgLtvMonth = count > 0 ? Math.round(totalRevUpToMonth / count) : 0

            return {
                monthKey,
                monthLabel: formatMonthLabel(monthKey),
                customerCount: count,
                cumulativeRevenue: totalRevUpToMonth,
                avgLtv: avgLtvMonth,
            }
        })

        // Active Subscribers Count (Exact 113)
        const activeSubscribersCount = subscriptions.filter(
            (s) => s.status === "ACTIVE" || s.status === "AUTHENTICATED"
        ).length

        return NextResponse.json({
            success: true,
            data: {
                availableMonths: allMonthsSorted.reverse(),
                selectedTimeframe: timeframe,
                selectedMonth: selectedMonth || null,
                kpis: {
                    averageLtv,
                    totalRevenue,
                    totalWebinarRevenue,
                    totalSubscriptionRevenue,
                    totalPayingCustomers: totalCustomerCount,
                    currentRetentionRatePct,
                    retainedCount: renewedCount,
                    cancelledCount: renewalCancelledPastDueCount,
                    cancellationPendingFutureCount,
                    totalDueCount: totalRenewalDueCount,
                    initialCycleActiveCount,
                    activeSubscribers: activeSubscribersCount,
                },
                retention: {
                    monthly: monthlyRetentionData,
                    cancelledSubscribers,
                },
                ltv: {
                    averageLtv,
                    tiers: ltvTiers,
                    monthlyTrend: monthlyLtvTrend,
                    topCustomers,
                },
            },
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
