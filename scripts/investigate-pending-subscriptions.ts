import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import Razorpay from "razorpay"
import * as fs from "fs"
import * as path from "path"

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ])
}

async function main() {
  console.log("=== Fetching Subscriptions from Database ===")

  const allSubs = await prisma.insightsSubscription.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  console.log(`Total subscriptions in DB: ${allSubs.length}`)

  // Get all subscriptions with status PENDING, HALTED, or PAUSED
  const targetSubs = allSubs.filter(
    (s) => s.status === "PENDING" || s.status === "HALTED" || s.status === "PAUSED"
  )

  console.log(`Found ${targetSubs.length} subscriptions with status PENDING/HALTED/PAUSED in DB.`)

  const results: any[] = []
  const concurrency = 4
  let currentIndex = 0

  async function worker(workerId: number) {
    while (currentIndex < targetSubs.length) {
      const idx = currentIndex++
      const sub = targetSubs[idx]
      console.log(`[Worker ${workerId}] (${idx + 1}/${targetSubs.length}) Checking ${sub.user?.email || "No Email"} (${sub.razorpaySubscriptionId || "No RZP ID"})`)

      const itemResult: any = {
        index: idx + 1,
        dbSubscriptionId: sub.id,
        dbStatus: sub.status,
        currentStartAt: sub.currentStartAt ? new Date(sub.currentStartAt).toISOString() : null,
        currentEndAt: sub.currentEndAt ? new Date(sub.currentEndAt).toISOString() : null,
        paidCountDb: sub.paidCount,
        user: {
          id: sub.user?.id,
          name: sub.user?.name || "Subscriber",
          email: sub.user?.email || "N/A",
          phone: null as string | null,
        },
        razorpaySubscriptionId: sub.razorpaySubscriptionId,
        razorpayStatus: null as string | null,
        authAttempts: 0,
        paidCountRzp: 0,
        totalCountRzp: 0,
        paymentMethod: null as string | null,
        cardIssuer: null as string | null,
        cardNetwork: null as string | null,
        cardType: null as string | null,
        cardLast4: null as string | null,
        subscriptionShortUrl: null as string | null,
        unpaidInvoice: null as any,
        paidInvoicesCount: 0,
        rootCauseCategory: "UNKNOWN",
        rootCauseDetail: "",
        actionRecommendation: "",
      }

      if (!sub.razorpaySubscriptionId) {
        itemResult.rootCauseCategory = "NO_RAZORPAY_ID"
        itemResult.rootCauseDetail = "No Razorpay Subscription ID in database (offline grant or abandoned signup)"
        itemResult.actionRecommendation = "Extend access manually via Admin Portal or ask user to subscribe online."
        results.push(itemResult)
        continue
      }

      try {
        // Fetch Razorpay subscription with 6s timeout
        const rzpSub: any = await withTimeout(
          razorpay.subscriptions.fetch(sub.razorpaySubscriptionId),
          6000,
          null
        )

        if (!rzpSub) {
          itemResult.rootCauseCategory = "RZP_FETCH_TIMEOUT"
          itemResult.rootCauseDetail = "Razorpay API timed out while fetching subscription"
          itemResult.actionRecommendation = "Re-check Razorpay dashboard for subscription status."
          results.push(itemResult)
          continue
        }

        itemResult.razorpayStatus = rzpSub.status
        itemResult.authAttempts = rzpSub.auth_attempts || 0
        itemResult.paidCountRzp = rzpSub.paid_count || 0
        itemResult.totalCountRzp = rzpSub.total_count || 0
        itemResult.paymentMethod = rzpSub.payment_method || "card"
        itemResult.subscriptionShortUrl = rzpSub.short_url || null
        if (rzpSub.customer_contact) {
          itemResult.user.phone = rzpSub.customer_contact
        }

        // Fetch invoices with 6s timeout
        const invoicesResp: any = await withTimeout(
          razorpay.invoices.all({ subscription_id: sub.razorpaySubscriptionId }),
          6000,
          { entity: "collection", count: 0, items: [] } as any
        )
        const invoices = invoicesResp?.items || []

        // Find unpaid/issued invoice
        const issuedInvoice = invoices.find((inv: any) => inv.status === "issued" || inv.status === "pending")
        if (issuedInvoice) {
          itemResult.unpaidInvoice = {
            id: issuedInvoice.id,
            amount: issuedInvoice.amount ? issuedInvoice.amount / 100 : 0,
            status: issuedInvoice.status,
            issuedAt: issuedInvoice.issued_at ? new Date(issuedInvoice.issued_at * 1000).toISOString() : null,
            billingStart: issuedInvoice.billing_start ? new Date(issuedInvoice.billing_start * 1000).toISOString() : null,
            billingEnd: issuedInvoice.billing_end ? new Date(issuedInvoice.billing_end * 1000).toISOString() : null,
            shortUrl: issuedInvoice.short_url || null,
          }
          if (!itemResult.user.phone && issuedInvoice.customer_details?.contact) {
            itemResult.user.phone = issuedInvoice.customer_details.contact
          }
        }

        // Count paid invoices and fetch initial payment for card info
        const paidInvoices = invoices.filter((inv: any) => inv.status === "paid")
        itemResult.paidInvoicesCount = paidInvoices.length

        if (paidInvoices.length > 0 && paidInvoices[paidInvoices.length - 1].payment_id) {
          const firstPaymentId = paidInvoices[paidInvoices.length - 1].payment_id
          const p: any = await withTimeout(
            razorpay.payments.fetch(firstPaymentId),
            3000,
            null
          )
          if (p) {
            if (!itemResult.user.phone && p.contact) {
              itemResult.user.phone = p.contact
            }
            if (p.card) {
              itemResult.cardIssuer = p.card.issuer || null
              itemResult.cardNetwork = p.card.network || null
              itemResult.cardType = p.card.type || null
              itemResult.cardLast4 = p.card.last4 || null
            }
          }
        }

        // Root cause classification
        if (rzpSub.status === "active" && sub.status !== "ACTIVE") {
          itemResult.rootCauseCategory = "DESYNC_ACTIVE_IN_RAZORPAY"
          itemResult.rootCauseDetail = `Subscription is actually ACTIVE on Razorpay (${rzpSub.paid_count} cycles paid). Database was not updated by webhook.`
          itemResult.actionRecommendation = "Click 'Sync' in Admin Portal to immediately activate access."
        } else if (rzpSub.status === "paused") {
          itemResult.rootCauseCategory = "SUBSCRIPTION_PAUSED"
          itemResult.rootCauseDetail = "Subscription was paused by user or admin on Razorpay."
          itemResult.actionRecommendation = "Resume subscription or reach out to check if member wants to unpause."
        } else if (rzpSub.status === "created") {
          itemResult.rootCauseCategory = "ABANDONED_CHECKOUT"
          itemResult.rootCauseDetail = "User initiated checkout but never completed initial authentication / payment."
          itemResult.actionRecommendation = "Send fresh checkout link or coupon to complete sign-up."
        } else if (rzpSub.status === "pending" || rzpSub.status === "halted") {
          if (rzpSub.auth_attempts >= 2) {
            const cardInfo = itemResult.cardIssuer ? `${itemResult.cardIssuer} ${itemResult.cardType || "Card"}` : "Credit/Debit Card"
            itemResult.rootCauseCategory = "RECURRING_AUTH_ATTEMPTS_EXHAUSTED"
            itemResult.rootCauseDetail = `Auto-debit recurring renewal failed ${rzpSub.auth_attempts} times on ${cardInfo}. Under RBI e-mandate guidelines, the bank declined automated debit without 2FA, or customer pre-debit notice was unapproved.`
            itemResult.actionRecommendation = itemResult.unpaidInvoice?.shortUrl
              ? `Send direct renewal invoice link (${itemResult.unpaidInvoice.shortUrl}) or collect via UPI and use '➕ Extend Access'.`
              : "Generate manual renewal link or collect via UPI and use '➕ Extend Access'."
          } else {
            itemResult.rootCauseCategory = "RECURRING_IN_PROGRESS"
            itemResult.rootCauseDetail = `Renewal attempt pending (${rzpSub.auth_attempts} attempts). Razorpay may retry automatically.`
            itemResult.actionRecommendation = "Monitor for next retry or share direct invoice payment link."
          }
        } else {
          itemResult.rootCauseCategory = `RZP_${rzpSub.status.toUpperCase()}`
          itemResult.rootCauseDetail = `Subscription status on Razorpay is '${rzpSub.status}'.`
          itemResult.actionRecommendation = "Review on Razorpay dashboard or contact subscriber."
        }
      } catch (err: any) {
        console.error(`Error processing ${sub.razorpaySubscriptionId}:`, err.message)
        itemResult.rootCauseCategory = "PROCESSING_ERROR"
        itemResult.rootCauseDetail = `Error: ${err.message}`
        itemResult.actionRecommendation = "Check manually on Razorpay dashboard."
      }

      results.push(itemResult)
    }
  }

  // Run concurrency workers
  await Promise.all(
    Array.from({ length: concurrency }).map((_, workerId) => worker(workerId + 1))
  )

  // Sort by index
  results.sort((a, b) => a.index - b.index)

  // Aggregate stats
  const categoryCounts: Record<string, number> = {}
  const bankCounts: Record<string, number> = {}
  results.forEach((r) => {
    categoryCounts[r.rootCauseCategory] = (categoryCounts[r.rootCauseCategory] || 0) + 1
    if (r.cardIssuer) {
      bankCounts[r.cardIssuer] = (bankCounts[r.cardIssuer] || 0) + 1
    }
  })

  console.log("\n=================== ANALYSIS COMPLETE ===================")
  console.log("Category Breakdown:", JSON.stringify(categoryCounts, null, 2))
  console.log("Card Issuer Breakdown:", JSON.stringify(bankCounts, null, 2))

  const outputPath = path.join(process.cwd(), "scripts", "pending_subscriptions_report.json")
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalPending: results.length,
        categoryCounts,
        bankCounts,
        subscriptions: results,
      },
      null,
      2
    )
  )

  console.log(`Saved full report to ${outputPath}`)
}

main()
  .catch((e) => {
    console.error("Fatal:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
