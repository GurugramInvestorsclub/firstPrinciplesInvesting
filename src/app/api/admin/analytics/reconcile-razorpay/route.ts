import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

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
        const requestedMonth = searchParams.get("month") // e.g., "2026-09"

        const now = new Date()
        const currentMonthKey = getMonthKey(now)
        const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/
        const targetMonth = requestedMonth && monthRegex.test(requestedMonth) ? requestedMonth : currentMonthKey

        const [yStr, mStr] = targetMonth.split("-")
        const year = parseInt(yStr, 10)
        const month = parseInt(mStr, 10)

        // Calculate IST month boundaries (UTC+05:30)
        // 00:00:00 IST of 1st day of month = 18:30:00 UTC of previous day
        const startIstUtcMs = Date.UTC(year, month - 1, 1, 0, 0, 0) - (5.5 * 60 * 60 * 1000)
        const nextMonthYear = month === 12 ? year + 1 : year
        const nextMonthNum = month === 12 ? 1 : month + 1
        const endIstUtcMs = Date.UTC(nextMonthYear, nextMonthNum - 1, 1, 0, 0, 0) - (5.5 * 60 * 60 * 1000) - 1000

        const fromTimestamp = Math.floor(startIstUtcMs / 1000)
        const toTimestamp = Math.floor(endIstUtcMs / 1000)

        const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET

        if (!keyId || !keySecret) {
            return NextResponse.json(
                { success: false, error: "Razorpay credentials are not configured on the server." },
                { status: 500 }
            )
        }

        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret })

        // 1. Fetch live Razorpay payments with pagination
        const allRzpPayments: Array<{
            id: string
            amount: number
            currency: string
            status: string
            method?: string
            email?: string
            contact?: string
            created_at: number
            order_id?: string | null
            invoice_id?: string | null
            description?: string | null
            notes?: Record<string, unknown> | null
        }> = []

        let skip = 0
        const count = 100
        let hasMore = true

        while (hasMore) {
            const resp: unknown = await rzp.payments.all({
                from: fromTimestamp,
                to: toTimestamp,
                count,
                skip,
            })

            const items = (resp as { items?: typeof allRzpPayments })?.items || []
            allRzpPayments.push(...items)

            if (items.length < count || allRzpPayments.length >= 1000) {
                hasMore = false
            } else {
                skip += count
            }
        }

        const capturedPayments = allRzpPayments.filter((p) => p.status === "captured")

        let rzpTotal = 0
        let rzpSubscriptionTotal = 0
        let rzpSubscriptionCount = 0
        let rzpWebinarTotal = 0
        let rzpWebinarCount = 0
        let rzpOtherTotal = 0
        let rzpOtherCount = 0

        const livePaymentItems = capturedPayments.map((p) => {
            const amountInRupees = Math.round(p.amount / 100)
            rzpTotal += amountInRupees

            let category: "subscription" | "webinar" | "other" = "other"
            if (p.invoice_id) {
                category = "subscription"
                rzpSubscriptionTotal += amountInRupees
                rzpSubscriptionCount++
            } else if (p.order_id) {
                category = "webinar"
                rzpWebinarTotal += amountInRupees
                rzpWebinarCount++
            } else {
                category = "other"
                rzpOtherTotal += amountInRupees
                rzpOtherCount++
            }

            return {
                id: p.id,
                amount: amountInRupees,
                currency: p.currency,
                status: p.status,
                method: p.method || "unknown",
                email: p.email || null,
                contact: p.contact || null,
                createdAt: new Date(p.created_at * 1000).toISOString(),
                category,
                orderId: p.order_id || null,
                invoiceId: p.invoice_id || null,
                description: p.description || null,
            }
        })

        // 2. Fetch database records for the month
        const webinarPayments = await prisma.payment.findMany({
            where: { status: "SUCCESS" },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        })

        let dbWebinarSales = 0
        let dbWebinarCount = 0
        webinarPayments.forEach((p) => {
            const date = p.paidAt || p.createdAt
            if (date && getMonthKey(date) === targetMonth) {
                const rupees = p.amount > 10000 ? Math.round(p.amount / 100) : p.amount
                dbWebinarSales += rupees
                dbWebinarCount++
            }
        })

        const subscriptions = await prisma.insightsSubscription.findMany({
            where: {
                OR: [
                    { paidCount: { gt: 0 } },
                    { status: { in: ["ACTIVE", "AUTHENTICATED", "CANCELLED", "CANCEL_REQUESTED", "PAUSED"] } },
                    { charges: { some: {} } },
                ],
            },
            include: {
                charges: true,
                user: { select: { id: true, name: true, email: true } },
            },
        })

        let dbSubscriptionSales = 0
        let dbSubscriptionCount = 0
        let manualOfflineCount = 0
        let manualOfflineSales = 0

        subscriptions.forEach((sub) => {
            if (sub.charges && sub.charges.length > 0) {
                sub.charges.forEach((c) => {
                    if (c.status === "CAPTURED" || c.status === "CREATED") {
                        const date = c.chargedAt || c.createdAt
                        if (date && getMonthKey(new Date(date)) === targetMonth) {
                            const rupees = c.amount > 10000 ? Math.round(c.amount / 100) : c.amount
                            dbSubscriptionSales += rupees
                            dbSubscriptionCount++
                        }
                    }
                })
            } else {
                const notesObj =
                    sub.notes && typeof sub.notes === "object" && !Array.isArray(sub.notes)
                        ? (sub.notes as Record<string, unknown>)
                        : null
                const amt = typeof notesObj?.amountPaid === "number" ? notesObj.amountPaid : 0
                if (amt > 0) {
                    const date = notesObj?.grantedAt ? new Date(notesObj.grantedAt as string) : sub.createdAt
                    if (date && getMonthKey(new Date(date)) === targetMonth) {
                        dbSubscriptionSales += amt
                        dbSubscriptionCount++
                        manualOfflineSales += amt
                        manualOfflineCount++
                    }
                }
            }
        })

        const dbTotalSales = dbWebinarSales + dbSubscriptionSales
        const dbTotalCount = dbWebinarCount + dbSubscriptionCount

        // 3. Reconciliation calculation
        const differenceAmount = rzpTotal - dbTotalSales
        const maxVal = Math.max(rzpTotal, dbTotalSales)
        const matchPercentage = maxVal > 0 ? Math.round(((maxVal - Math.abs(differenceAmount)) / maxVal) * 1000) / 10 : 100
        const isReconciled = matchPercentage >= 98 || Math.abs(differenceAmount) <= 500

        return NextResponse.json({
            success: true,
            data: {
                monthKey: targetMonth,
                monthLabel: formatMonthLabel(targetMonth),
                reconciliation: {
                    isReconciled,
                    matchPercentage,
                    differenceAmount,
                    rzpTotal,
                    rzpCount: capturedPayments.length,
                    dbTotal: dbTotalSales,
                    dbCount: dbTotalCount,
                    manualOfflineCount,
                    manualOfflineSales,
                },
                breakdown: {
                    subscriptions: {
                        razorpayAmount: rzpSubscriptionTotal,
                        razorpayCount: rzpSubscriptionCount,
                        databaseAmount: dbSubscriptionSales,
                        databaseCount: dbSubscriptionCount,
                    },
                    webinars: {
                        razorpayAmount: rzpWebinarTotal,
                        razorpayCount: rzpWebinarCount,
                        databaseAmount: dbWebinarSales,
                        databaseCount: dbWebinarCount,
                    },
                    otherRazorpay: {
                        amount: rzpOtherTotal,
                        count: rzpOtherCount,
                    },
                },
                livePayments: livePaymentItems.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ),
            },
        })
    } catch (error) {
        console.error("Razorpay reconciliation error:", error)
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
