import { ReportData } from "./weekly-report-service"

export const DEFAULT_REPORT_RECIPIENTS = [
  "rahul@firstprinciplesresearch.in",
  "rakshithsantosh@gmail.com",
]

export function getReportRecipients(): string[] {
  const envVal = process.env.REPORT_RECIPIENT_EMAILS || process.env.REPORT_RECIPIENT_EMAIL
  if (!envVal) {
    return DEFAULT_REPORT_RECIPIENTS
  }
  const parsed = envVal.split(",").map((e) => e.trim()).filter(Boolean)
  if (!parsed.includes("rakshithsantosh@gmail.com") && !process.env.REPORT_RECIPIENT_EMAILS) {
    parsed.push("rakshithsantosh@gmail.com")
  }
  return parsed.length > 0 ? parsed : DEFAULT_REPORT_RECIPIENTS
}

export async function sendWeeklyReportEmail(report: ReportData): Promise<boolean> {
  const brevoApiKey = process.env.BREVO_API_KEY
  const resendApiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM || "support@firstprinciplesresearch.in"
  const recipients = getReportRecipients()
  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://firstprinciplesresearch.in"

  if (!brevoApiKey && !resendApiKey) {
    console.warn("[WeeklyReportEmail] Neither BREVO_API_KEY nor RESEND_API_KEY is configured. Skipping email dispatch.")
    return false
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("en-IN").format(val)
  }

  const subject = `Weekly Performance Report: ${report.title}`

  const segmentation = report.detailedBreakdown?.subscriptionSegmentation
  const newSubsCount = segmentation?.newSubscribersCount ?? report.totalNewSubscriptions
  const renewingSubsCount = segmentation?.renewingSubscribersCount ?? (report.renewingSubscriptions || 0)
  const totalPaidInPeriod = segmentation?.totalPaidSubscribers ?? (newSubsCount + renewingSubsCount)

  const retention = report.detailedBreakdown?.renewalRetention
  const upcoming = report.detailedBreakdown?.upcomingRenewals
  const trafficTrend = report.detailedBreakdown?.trafficTrend30d

  const topPagesRows = (report.topPages || [])
    .slice(0, 5)
    .map(
      (p, i) => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 12px; font-weight: 600; color: #555;">#${i + 1}</td>
        <td style="padding: 10px 12px; font-family: monospace; color: #111;">${p.path}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #111;">${formatNumber(p.views)}</td>
      </tr>
    `
    )
    .join("")

  // 30-Day Traffic Movement Visual Chart
  let trafficTrendHtml = ""
  if (trafficTrend && trafficTrend.weeks && trafficTrend.weeks.length > 0) {
    const maxVis = Math.max(...trafficTrend.weeks.map((w) => w.visitors), 1)
    const trendRows = trafficTrend.weeks
      .map((w) => {
        const barWidthPct = Math.max(8, Math.round((w.visitors / maxVis) * 100))
        const wowBadge =
          w.wowGrowthPct != null
            ? `<span style="font-size: 11px; font-weight: 700; color: ${w.wowGrowthPct >= 0 ? "#15803d" : "#b91c1c"};">${w.wowGrowthPct >= 0 ? "+" : ""}${w.wowGrowthPct}% WoW</span>`
            : `<span style="font-size: 11px; color: #94a3b8;">—</span>`
        return `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 10px; font-size: 12px; color: #1e293b; width: 34%;">
              <strong>${w.weekLabel}</strong>
            </td>
            <td style="padding: 8px 10px; width: 36%;">
              <div style="background: #e2e8f0; border-radius: 4px; height: 10px; width: 100%; overflow: hidden;">
                <div style="background: #F5B800; height: 10px; width: ${barWidthPct}%; border-radius: 4px;"></div>
              </div>
            </td>
            <td style="padding: 8px 10px; font-size: 12px; text-align: right; color: #0f172a; width: 15%;">
              <strong>${formatNumber(w.visitors)}</strong> <span style="font-size: 10px; color: #64748b;">vis</span>
            </td>
            <td style="padding: 8px 10px; text-align: right; width: 15%;">
              ${wowBadge}
            </td>
          </tr>
        `
      })
      .join("")

    trafficTrendHtml = `
      <!-- 30-Day Traffic Movement Visual -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 24px 0;">
        <div style="margin-bottom: 8px;">
          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0;">
            📈 30-Day Traffic Movement (Week-on-Week)
          </h3>
          <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">
            Daily Average: <strong>${formatNumber(trafficTrend.avgDailyVisitors)}</strong> visitors/day &bull; Total Month: <strong>${formatNumber(trafficTrend.totalMonthVisitors)}</strong> visitors
          </p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px;">
          <thead>
            <tr style="background: #f8fafc; color: #475569; font-size: 11px; text-transform: uppercase;">
              <th style="padding: 6px 10px; text-align: left;">Period</th>
              <th style="padding: 6px 10px; text-align: left;">Volume</th>
              <th style="padding: 6px 10px; text-align: right;">Visitors</th>
              <th style="padding: 6px 10px; text-align: right;">WoW Growth</th>
            </tr>
          </thead>
          <tbody>
            ${trendRows}
          </tbody>
        </table>
      </div>
    `
  }

  // Renewal Performance & Upcoming Pipeline Section
  const renewalSectionHtml =
    retention || upcoming
      ? `
      <!-- Renewal Health & Upcoming Pipeline -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 24px 0;">
        <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px;">
          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0;">
            🔄 Subscription Renewals & Retention
          </h3>
        </div>
        
        <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin-bottom: 12px;">
          <tr>
            <!-- Past Week Retention -->
            <td style="width: 50%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; vertical-align: top;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">
                Past Week Retention Rate
              </div>
              <div style="font-size: 22px; font-weight: 700; color: ${retention && retention.retentionRatePct >= 80 ? "#15803d" : "#b45309"};">
                ${retention?.retentionRatePct != null ? `${retention.retentionRatePct}%` : "100%"}
              </div>
              <div style="font-size: 12px; color: #475569; margin-top: 6px; line-height: 1.4;">
                Converted: <strong>${retention?.renewalsConvertedCount ?? 0}</strong> of <strong>${retention?.renewalsDueCount ?? 0}</strong> due<br/>
                ${
                  retention && retention.renewalsFailedOrChurnedCount > 0
                    ? `<span style="color: #b91c1c;">${retention.renewalsFailedOrChurnedCount} churned / did not renew</span>`
                    : '<span style="color: #15803d; font-weight: 500;">✓ 100% renewal retention</span>'
                }
              </div>
            </td>

            <!-- Next Week Due -->
            <td style="width: 50%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; vertical-align: top;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">
                Upcoming Renewals (Next 7 Days)
              </div>
              <div style="font-size: 22px; font-weight: 700; color: #0f172a;">
                ${upcoming?.totalDueCount ?? 0} due
              </div>
              <div style="font-size: 12px; color: #475569; margin-top: 6px; line-height: 1.4;">
                Potential Revenue: <strong>${formatCurrency(upcoming?.potentialRevenue ?? 0)}</strong><br/>
                ${upcoming?.autoRenewingCount ?? 0} auto-renewing &bull; ${upcoming?.slatedForCancellationCount ?? 0} cancelling
              </div>
            </td>
          </tr>
        </table>

        ${
          upcoming && upcoming.items && upcoming.items.length > 0
            ? `
          <div style="margin-top: 12px;">
            <div style="font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 6px;">
              Subscribers Due for Renewal in the Next 7 Days:
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; background: #ffffff; border: 1px solid #edf2f7; border-radius: 6px; overflow: hidden;">
              <thead>
                <tr style="background: #f1f5f9; text-align: left; color: #475569; font-size: 11px; text-transform: uppercase;">
                  <th style="padding: 6px 10px;">Subscriber</th>
                  <th style="padding: 6px 10px;">Plan</th>
                  <th style="padding: 6px 10px;">Due Date</th>
                  <th style="padding: 6px 10px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${upcoming.items
                  .slice(0, 6)
                  .map(
                    (item) => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 10px;">
                      <strong>${item.userName}</strong><br/>
                      <span style="font-size: 11px; color: #64748b;">${item.userEmail}</span>
                    </td>
                    <td style="padding: 7px 10px;">
                      <span style="background: #eff6ff; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">
                        ${item.planKey === "YEARLY" ? "Annual" : item.planKey === "THREE_MONTHLY" ? "Quarterly" : "Monthly"}
                      </span>
                      ${item.cancelAtCycleEnd ? '<span style="color: #b91c1c; font-size: 10px; margin-left: 4px; font-weight: 600;">(Cancelling)</span>' : ""}
                    </td>
                    <td style="padding: 7px 10px; color: #334155;">
                      ${item.renewalDueDate ? new Date(item.renewalDueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" }) : "—"}
                    </td>
                    <td style="padding: 7px 10px; text-align: right; font-weight: 600; color: #0f172a;">
                      ${formatCurrency(item.amount)}
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
            : ""
        }
      </div>
    `
      : ""

  const abandoned = report.detailedBreakdown?.abandonedCheckouts
  const abandonedRows = (abandoned?.items || [])
    .slice(0, 10)
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #fce8e6;">
        <td style="padding: 8px 10px; vertical-align: top;">
          <strong>${item.userName}</strong><br/>
          <span style="color: #666; font-size: 11px;">${item.userEmail}</span>
        </td>
        <td style="padding: 8px 10px; vertical-align: top; font-size: 12px; color: #333;">
          ${item.userPhone || '<span style="color: #999;">—</span>'}
        </td>
        <td style="padding: 8px 10px; vertical-align: top; font-size: 12px;">
          <span style="background: #fdf2f2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: 500;">
            ${item.itemLabel}
          </span>
        </td>
        <td style="padding: 8px 10px; vertical-align: top; text-align: right; font-weight: 600; color: #111;">
          ${formatCurrency(item.amount)}
        </td>
      </tr>
    `
    )
    .join("")

  const abandonedSectionHtml = abandoned && abandoned.totalCount > 0
    ? `
      <!-- Abandoned Checkouts Section -->
      <div style="background: #fffafa; border: 1px solid #fed7d7; border-radius: 8px; padding: 18px; margin: 24px 0;">
        <div style="margin-bottom: 8px;">
          <h3 style="font-size: 15px; font-weight: 700; color: #991b1b; margin: 0;">
            🛒 Checkout Abandonments at Razorpay (${abandoned.totalCount})
          </h3>
          <p style="font-size: 12px; color: #7f1d1d; margin: 4px 0 0 0; font-weight: 600;">
            Potential Value: ${formatCurrency(abandoned.totalPotentialRevenue)} &bull; Drop-off Rate: ${abandoned.abandonmentRatePct}%
          </p>
        </div>
        <p style="font-size: 12px; color: #555; margin: 0 0 12px 0;">
          These users initiated checkout but dropped off at the Razorpay gateway before completing payment. You can follow up with them directly:
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #fee2e2; text-align: left; color: #7f1d1d; font-size: 11px; text-transform: uppercase;">
              <th style="padding: 6px 10px;">Customer</th>
              <th style="padding: 6px 10px;">Phone</th>
              <th style="padding: 6px 10px;">Item Attempted</th>
              <th style="padding: 6px 10px; text-align: right;">Value</th>
            </tr>
          </thead>
          <tbody>
            ${abandonedRows}
          </tbody>
        </table>
      </div>
    `
    : ""

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 28px; background: #ffffff; color: #1a1a1a;">
      <!-- Header -->
      <div style="border-bottom: 2px solid #F5B800; padding-bottom: 16px; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: 700; color: #F5B800; letter-spacing: 1.5px; text-transform: uppercase;">
          FIRST PRINCIPLES INVESTING
        </span>
        <h1 style="font-size: 22px; font-weight: 700; color: #111; margin: 6px 0 2px 0;">
          Weekly Performance Report
        </h1>
        <p style="font-size: 13px; color: #666; margin: 0;">
          ${report.title}
        </p>
      </div>

      <p style="font-size: 14px; line-height: 1.5; color: #333; margin-bottom: 20px;">
        Good morning! Here is the weekly performance and analytics summary for First Principles Investing.
      </p>

      <!-- 4 Core Monitorables Grid -->
      <table style="width: 100%; border-collapse: separate; border-spacing: 12px; margin-bottom: 24px;">
        <tr>
          <!-- Card 1: Subscriptions -->
          <td style="width: 50%; background: #fdfaf3; border: 1px solid #f9e29f; border-radius: 8px; padding: 16px; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #8a6400; margin-bottom: 4px;">
              Subscriptions in Period
            </div>
            <div style="font-size: 24px; font-weight: 700; color: #111;">
              ${totalPaidInPeriod} total
            </div>
            <div style="margin: 6px 0;">
              <span style="background: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px; border: 1px solid #a7f3d0; margin-right: 4px;">
                ${newSubsCount} new
              </span>
              <span style="background: #eff6ff; color: #1e40af; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px; border: 1px solid #bfdbfe;">
                ${renewingSubsCount} renewed
              </span>
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">
              Revenue: <strong>${formatCurrency(report.subscriptionRevenue)}</strong><br/>
              Active Base: ${report.activeSubscriptions}
            </div>
          </td>

          <!-- Card 2: Total Visitors -->
          <td style="width: 50%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; margin-bottom: 4px;">
              Total Visitors
            </div>
            <div style="font-size: 24px; font-weight: 700; color: #111;">
              ${formatNumber(report.totalVisitors)}
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">
              Pageviews: <strong>${formatNumber(report.totalPageviews)}</strong><br/>
              ${report.wowMetrics?.visitorGrowthPct != null ? `WoW: <strong>${report.wowMetrics.visitorGrowthPct > 0 ? "+" : ""}${report.wowMetrics.visitorGrowthPct}%</strong>` : ""}
            </div>
          </td>
        </tr>
        <tr>
          <!-- Card 3: Top Visited Page -->
          <td style="width: 50%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; margin-bottom: 4px;">
              Most Visited Page
            </div>
            <div style="font-size: 15px; font-weight: 700; color: #111; word-break: break-all;">
              ${report.topPagePath}
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">
              Views: <strong>${formatNumber(report.topPageViews)}</strong>
            </div>
          </td>

          <!-- Card 4: Insights Page -->
          <td style="width: 50%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; margin-bottom: 4px;">
              Insights Section Traffic
            </div>
            <div style="font-size: 24px; font-weight: 700; color: #111;">
              ${formatNumber(report.insightsVisitors)}
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">
              Insights Pageviews: <strong>${formatNumber(report.insightsPageviews)}</strong>
            </div>
          </td>
        </tr>
      </table>

      ${renewalSectionHtml}

      ${trafficTrendHtml}

      <!-- Top 5 Visited Pages Table -->
      <h3 style="font-size: 15px; font-weight: 700; color: #111; margin: 24px 0 12px 0;">
        Top Visited Pages
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
        <thead>
          <tr style="background: #f8f9fa; text-align: left; border-bottom: 2px solid #eee;">
            <th style="padding: 8px 12px; color: #666;">#</th>
            <th style="padding: 8px 12px; color: #666;">Page Path</th>
            <th style="padding: 8px 12px; text-align: right; color: #666;">Views</th>
          </tr>
        </thead>
        <tbody>
          ${topPagesRows || '<tr><td colspan="3" style="padding: 12px; text-align: center; color: #888;">No page data recorded</td></tr>'}
        </tbody>
      </table>

      ${abandonedSectionHtml}

      <!-- CTA -->
      <div style="text-align: center; margin: 32px 0 20px 0;">
        <a href="${siteUrl}/admin/reports" style="background: #111; color: #F5B800; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; display: inline-block;">
          Open Admin Reports Dashboard &rarr;
        </a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #eee; padding-top: 16px; font-size: 11px; color: #999; text-align: center;">
        Automated executive report sent by First Principles Investing &bull; Generated every Monday morning
      </div>
    </div>
  `

  if (brevoApiKey) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "First Principles Investing", email: emailFrom },
          to: recipients.map((email) => ({ email })),
          subject,
          htmlContent: html,
        }),
      })

      if (response.ok) return true
      const errText = await response.text()
      console.warn(`[WeeklyReportEmail] Brevo API error (${response.status}):`, errText)
    } catch (err) {
      console.warn("[WeeklyReportEmail] Brevo delivery failed:", err)
    }
  }

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: recipients,
          subject,
          html,
        }),
      })

      if (response.ok) return true
      const errText = await response.text()
      console.warn(`[WeeklyReportEmail] Resend API error (${response.status}):`, errText)
    } catch (err) {
      console.warn("[WeeklyReportEmail] Resend delivery failed:", err)
    }
  }

  return false
}
