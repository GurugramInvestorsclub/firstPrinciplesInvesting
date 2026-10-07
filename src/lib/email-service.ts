import { client } from "@/lib/sanity.client"
import { groq } from "next-sanity"
import { prisma } from "@/lib/prisma"

interface SendEmailParams {
  toEmail: string
  toName: string
  eventId: string
  paymentId?: string
  orderId?: string
  amountPaid?: number | string
}

/**
 * Formats ISO date from Sanity to a clean readable string (e.g., "Monday, July 27, 2026, 7:00 PM IST")
 */
function formatEventDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return (
      date.toLocaleString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }) + " IST"
    )
  } catch (error) {
    return dateString
  }
}

/**
 * Fetches event metadata from Sanity CMS and triggers a transactional email via Brevo
 */
export async function triggerRegistrationEmail(params: SendEmailParams): Promise<boolean> {
  const brevoApiKey = process.env.BREVO_API_KEY
  const emailFrom = process.env.EMAIL_FROM || "support@firstprinciplesresearch.in"
  const siteUrl = process.env.NEXTAUTH_URL || "https://www.firstprinciplesinvesting.in"
  const moveToPrimaryImageUrl = `${siteUrl.replace(/\/$/, "")}/images/move-to-primary.jpg`

  if (!brevoApiKey) {
    console.error("BREVO_API_KEY is not configured. Email skipped.")
    return false
  }

  try {
    // 1. Fetch Event Details from Sanity
    const query = groq`*[_type in ["event", "super30Program"] && (eventId == $eventId || slug.current == $eventId)][0]{
      title,
      date,
      location,
      price,
      speaker,
      whatsappLink
    }`
    const event = await client.fetch(query, { eventId: params.eventId })

    if (!event) {
      console.error(`Event metadata not found in Sanity for eventId: ${params.eventId}`)
      return false
    }

    const formattedDate = event.date ? formatEventDate(event.date) : null
    const speakerName = typeof event.speaker === "string" ? event.speaker : event.speaker?.name ?? null

    // Determine actual amount paid (Priority: passed amountPaid -> DB Payment record -> Sanity event.price fallback)
    let resolvedAmountPaid: number | string | null =
      params.amountPaid !== undefined && params.amountPaid !== null ? params.amountPaid : null

    if (resolvedAmountPaid === null) {
      try {
        const paymentConditions = []
        if (params.orderId) {
          paymentConditions.push({ razorpayOrderId: params.orderId })
        }
        if (params.paymentId) {
          paymentConditions.push({ razorpayPaymentId: params.paymentId })
        }
        if (params.toEmail && params.eventId) {
          paymentConditions.push({
            user: { email: params.toEmail },
            eventId: params.eventId,
            status: "SUCCESS" as const,
          })
        }

        if (paymentConditions.length > 0) {
          const payment = await prisma.payment.findFirst({
            where: { OR: paymentConditions },
            orderBy: { createdAt: "desc" },
            select: { amount: true },
          })

          if (payment && typeof payment.amount === "number") {
            resolvedAmountPaid = payment.amount / 100
          }
        }
      } catch (dbError) {
        console.error("Failed to lookup payment amount for registration email:", dbError)
      }
    }

    if (resolvedAmountPaid === null && event.price != null) {
      resolvedAmountPaid = event.price
    }

    const amountDisplay = resolvedAmountPaid != null ? `₹${resolvedAmountPaid}` : null
    const transactionId = params.paymentId || params.orderId || null
    const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.firstprinciplesinvesting.in").replace(/\/$/, "")
    const logoUrl = `${siteUrl}/logo.png`

    // 2. Call Brevo Transactional SMTP API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "First Principles Investing",
          email: emailFrom,
        },
        to: [
          {
            email: params.toEmail,
            name: params.toName,
          },
        ],
        subject: `Registration Confirmed: ${event.title}`,
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121212; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.45);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 20px 28px; border-bottom: 1px solid #262626; text-align: left;">
              <table border="0" cellspacing="0" cellpadding="0" style="display: inline-table; vertical-align: middle;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px; line-height: 1;">
                    <img src="${logoUrl}" alt="First Principles Investing Logo" width="28" height="28" style="width: 28px; height: 28px; display: block; border-radius: 6px; object-fit: contain;" />
                  </td>
                  <td style="vertical-align: middle; white-space: nowrap; line-height: 1;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.2px; white-space: nowrap;">
                      First Principles <span style="color: #F5B800;">Investing</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Confirmation Hero Section -->
          <tr>
            <td style="padding: 28px 28px 16px 28px; text-align: left;">
              <div style="display: inline-block; padding: 4px 12px; background-color: rgba(37, 211, 102, 0.1); border: 1px solid rgba(37, 211, 102, 0.3); border-radius: 20px; color: #25D366; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 14px;">
                ✅ REGISTRATION CONFIRMED
              </div>
              <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0 0 10px 0; line-height: 1.3; letter-spacing: -0.3px;">
                You&apos;re <span style="color: #F5B800;">Registered!</span>
              </h1>
              <p style="color: #FFFFFF; font-size: 14px; line-height: 1.6; margin: 0;">
                Hi ${params.toName},
              </p>
              <p style="color: #A0A0A0; font-size: 14px; line-height: 1.6; margin: 8px 0 0 0;">
                Your payment has been verified successfully and your seat for <strong>${event.title}</strong> has been reserved.
              </p>
            </td>
          </tr>

          <!-- Event Details Card -->
          <tr>
            <td style="padding: 12px 28px 20px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #222222; border: 1px solid #2E2E2E; border-radius: 10px; padding: 20px;">
                <tr>
                  <td style="padding-bottom: 14px; border-bottom: 1px solid #2C2C2C;">
                    <span style="font-size: 11px; font-weight: 700; color: #F5B800; letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 4px;">
                      EVENT DETAILS
                    </span>
                    <span style="font-size: 17px; font-weight: 700; color: #FFFFFF; display: block;">
                      ${event.title}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td style="padding-top: 14px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${
                        formattedDate
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #A0A0A0; font-size: 13px; width: 140px; font-weight: 500;">📅 Date & Time:</td>
                        <td style="padding: 6px 0; color: #FFFFFF; font-size: 13px; font-weight: 600;">${formattedDate}</td>
                      </tr>
                      `
                          : ""
                      }

                      ${
                        speakerName
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #A0A0A0; font-size: 13px; width: 140px; font-weight: 500;">👤 Speaker:</td>
                        <td style="padding: 6px 0; color: #FFFFFF; font-size: 13px; font-weight: 600;">${speakerName}</td>
                      </tr>
                      `
                          : ""
                      }

                      ${
                        event.location
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #A0A0A0; font-size: 13px; width: 140px; font-weight: 500;">📍 Platform / Venue:</td>
                        <td style="padding: 6px 0; color: #FFFFFF; font-size: 13px; font-weight: 600;">${event.location}</td>
                      </tr>
                      `
                          : ""
                      }

                      ${
                        params.eventId
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #A0A0A0; font-size: 13px; width: 140px; font-weight: 500;">🎟️ Event ID:</td>
                        <td style="padding: 6px 0; color: #E0E0E0; font-size: 13px;">${params.eventId}</td>
                      </tr>
                      `
                          : ""
                      }

                      <tr>
                        <td style="padding: 6px 0; color: #A0A0A0; font-size: 13px; width: 140px; font-weight: 500;">💳 Payment Status:</td>
                        <td style="padding: 6px 0; color: #25D366; font-size: 13px; font-weight: 700;">Verified ✅</td>
                      </tr>

                      ${
                        amountDisplay
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #A0A0A0; font-size: 13px; width: 140px; font-weight: 500;">💰 Amount Paid:</td>
                        <td style="padding: 6px 0; color: #FFFFFF; font-size: 13px; font-weight: 600;">${amountDisplay}</td>
                      </tr>
                      `
                          : ""
                      }

                      ${
                        transactionId
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #A0A0A0; font-size: 13px; width: 140px; font-weight: 500;">🧾 Transaction ID:</td>
                        <td style="padding: 6px 0; color: #E0E0E0; font-size: 13px;">${transactionId}</td>
                      </tr>
                      `
                          : ""
                      }
                    </table>
                  </td>
                </tr>

                ${
                  event.whatsappLink
                    ? `
                <tr>
                  <td style="padding-top: 18px; border-top: 1px solid #2C2C2C; margin-top: 14px;">
                    <p style="font-size: 13px; color: #E0E0E0; margin: 0 0 12px 0; line-height: 1.5;">
                      Join our official WhatsApp group for live session access links and real-time updates:
                    </p>
                    <a href="${event.whatsappLink}" target="_blank" style="background-color: #25D366; color: #0C0C0E; padding: 10px 22px; text-decoration: none; border-radius: 20px; font-weight: 700; display: inline-block; font-size: 13px;">
                      Join WhatsApp Group &rarr;
                    </a>
                  </td>
                </tr>
                `
                    : ""
                }

              </table>
            </td>
          </tr>

          <!-- What Happens Next Section -->
          <tr>
            <td style="padding: 4px 28px 20px 28px;">
              <h3 style="color: #FFFFFF; font-size: 16px; font-weight: 700; margin: 0 0 10px 0;">
                What happens next?
              </h3>
              <ul style="color: #A0A0A0; font-size: 13px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 6px;">A reminder email will be sent before the event.</li>
                <li style="margin-bottom: 6px;">Meeting link will be shared before the session (or pinned in the WhatsApp group).</li>
                <li>Keep this email for future reference.</li>
              </ul>
            </td>
          </tr>

          <!-- Move to Primary Inbox Callout -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #202020; border: 1px solid #2C2C2C; border-radius: 10px; padding: 18px;">
                <tr>
                  <td style="text-align: left;">
                    <h4 style="color: #FFFFFF; font-size: 14px; font-weight: 700; margin: 0 0 8px 0;">
                      📬 Never miss important session links
                    </h4>
                    <p style="color: #A0A0A0; font-size: 13px; line-height: 1.5; margin: 0 0 12px 0;">
                      Don&apos;t forget to move this email to your <strong>Primary</strong> tab (as shown below) so future event links and session updates aren&apos;t buried in Promotions.
                    </p>
                    <div style="text-align: center; border-radius: 8px; overflow: hidden; border: 1px solid #2C2C2C; background-color: #121212; line-height: 0;">
                      <img 
                        src="${moveToPrimaryImageUrl}" 
                        alt="Move email from Promotions to Primary in Gmail" 
                        width="536" 
                        style="width: 100%; max-width: 100%; height: auto; display: block; border-radius: 6px;" 
                      />
                    </div>
                    <p style="color: #777777; font-size: 11px; margin: 8px 0 0 0; line-height: 1.4;">
                      <em>On mobile: Tap the <strong>&vellip;</strong> (three dots) in the top right &rarr; select <strong>&quot;Move to Primary&quot;</strong>.</em>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Need Help Section -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <div style="background-color: rgba(255, 255, 255, 0.02); border-radius: 8px; padding: 14px; border: 1px solid #2A2A2A;">
                <p style="color: #A0A0A0; font-size: 13px; margin: 0; line-height: 1.5;">
                  <strong style="color: #FFFFFF;">Questions?</strong> Simply reply to this email or contact us at <a href="mailto:support@firstprinciplesresearch.in" style="color: #F5B800; text-decoration: none;">support@firstprinciplesresearch.in</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- SINGLE TASTEFUL UPSELL SECTION -->
          <tr>
            <td style="padding: 4px 28px 28px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1E1E1E; border: 1px solid rgba(245, 184, 0, 0.3); border-radius: 10px; padding: 20px;">
                <tr>
                  <td style="text-align: left;">
                    <span style="font-size: 11px; font-weight: 700; color: #F5B800; letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 6px;">
                      CONTINUE LEARNING
                    </span>
                    <h3 style="color: #FFFFFF; font-size: 17px; font-weight: 700; margin: 0 0 8px 0;">
                      Continue Learning Beyond This Event
                    </h3>
                    <p style="color: #A0A0A0; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
                      Get access to in-depth company research, sector reports, member-only webinars and exclusive investing insights through the First Principles Investing Subscription.
                    </p>
                    <a href="https://firstprinciplesinvesting.com/membership" target="_blank" style="background-color: #F5B800; color: #121212; padding: 10px 24px; text-decoration: none; border-radius: 20px; font-weight: 700; display: inline-block; font-size: 13px;">
                      Explore Membership &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px; border-top: 1px solid #242424; text-align: center; background-color: #161616;">
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="display: inline-table; margin: 0 auto 6px auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px; line-height: 1;">
                    <img src="${logoUrl}" alt="Logo" width="18" height="18" style="width: 18px; height: 18px; display: block; border-radius: 4px; object-fit: contain;" />
                  </td>
                  <td style="vertical-align: middle; white-space: nowrap; line-height: 1;">
                    <span style="font-size: 12px; font-weight: 600; color: #FFFFFF; white-space: nowrap;">
                      First Principles <span style="color: #F5B800;">Investing</span>
                    </span>
                  </td>
                </tr>
              </table>
              <p style="color: #666666; font-size: 11px; line-height: 1.5; margin: 0;">
                Thank you for being part of our community.<br/>
                This is an automated transactional email regarding your registration.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Brevo SMTP API failed: ${response.status} - ${errorText}`)
      return false
    }

    return true
  } catch (error) {
    console.error("Error executing triggerRegistrationEmail:", error)
    return false
  }
}

export interface SendManualGrantConfirmationEmailParams {
  toEmail: string
  toName?: string | null
  planLabel: string
  currentStartAt: Date
  currentEndAt: Date
  paymentMethod: string
  utrNumber?: string | null
  amountPaid?: number | null
  isResend?: boolean
  isRenewal?: boolean
}

/**
 * Sends a confirmation email to a user when their Insights membership is manually granted, renewed, or resent by an admin.
 * Supports Brevo SMTP API and Resend API.
 */
export async function sendManualGrantConfirmationEmail(
  params: SendManualGrantConfirmationEmailParams
): Promise<boolean> {
  const brevoApiKey = process.env.BREVO_API_KEY
  const resendApiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM || "support@firstprinciplesresearch.in"
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.firstprinciplesinvesting.in").replace(/\/$/, "")
  const logoUrl = `${siteUrl}/logo.png`
  const moveToPrimaryImageUrl = `${siteUrl}/images/move-to-primary.jpg`

  if (!brevoApiKey && !resendApiKey) {
    console.error("Neither BREVO_API_KEY nor RESEND_API_KEY is configured. Subscription email skipped.")
    return false
  }

  const formattedStartDate = params.currentStartAt.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  })

  const formattedEndDate = params.currentEndAt.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  })

  const cleanUtr = params.utrNumber && !params.utrNumber.startsWith("MANUAL_")
    ? params.utrNumber.startsWith("NEFT_") ? params.utrNumber.replace("NEFT_", "") : params.utrNumber
    : null

  const isRazorpayMethod = params.paymentMethod?.toUpperCase().includes("RAZORPAY")
  const displayPaymentMethod = isRazorpayMethod
    ? "Razorpay (Online Payment)"
    : (params.paymentMethod?.trim().toUpperCase() || "NEFT")

  const subject = params.isRenewal
    ? `Insights Membership Renewed — Access Extended!`
    : params.isResend
      ? `Insights Membership Details & Access Confirmation`
      : `Welcome to Insights Membership — Access Granted!`

  const subHeader = params.isRenewal
    ? `Your Insights membership has been renewed successfully.`
    : params.isResend
      ? `Here are your current Insights membership access details.`
      : `Your access to premium research memos and archives is now active.`

  const introText = params.isRenewal
    ? `We have processed your subscription renewal payment (${displayPaymentMethod}${cleanUtr ? ` — Ref: ${cleanUtr}` : ""}) and extended your Insights membership. Below are your updated access details:`
    : params.isResend
      ? `Below are your verified Insights membership and access details:`
      : `We have verified your payment (${displayPaymentMethod}${cleanUtr ? ` — Ref: ${cleanUtr}` : ""}) and activated your Insights membership. Below are your access details:`

  const heroHeading = params.isRenewal
    ? `Insights Membership Renewed`
    : `Insights Membership Details`

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heroHeading}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121212; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.45);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 20px 28px; border-bottom: 1px solid #262626; text-align: left;">
              <table border="0" cellspacing="0" cellpadding="0" style="display: inline-table; vertical-align: middle;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px; line-height: 1;">
                    <img src="${logoUrl}" alt="First Principles Investing Logo" width="28" height="28" style="width: 28px; height: 28px; display: block; border-radius: 6px; object-fit: contain;" />
                  </td>
                  <td style="vertical-align: middle; white-space: nowrap; line-height: 1;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.2px; white-space: nowrap;">
                      First Principles <span style="color: #F5B800;">Investing</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding: 28px 28px 16px 28px; text-align: left;">
              <div style="display: inline-block; padding: 4px 12px; background-color: rgba(245, 184, 0, 0.1); border: 1px solid rgba(245, 184, 0, 0.25); border-radius: 20px; color: #F5B800; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 14px;">
                ✦ INSIGHTS MEMBERSHIP
              </div>
              <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0 0 10px 0; letter-spacing: -0.3px; line-height: 1.3;">
                ${heroHeading} <span style="color: #F5B800;">✨</span>
              </h1>
              <p style="color: #A0A0A0; font-size: 14px; margin: 0; line-height: 1.6;">
                ${subHeader}
              </p>
            </td>
          </tr>

          <!-- Details Table -->
          <tr>
            <td style="padding: 12px 28px 28px 28px;">
              <p style="color: #FFFFFF; font-size: 14px; line-height: 1.6; margin: 0 0 14px 0;">
                Hello <strong>${params.toName || params.toEmail}</strong>,
              </p>
              <p style="color: #A0A0A0; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                ${introText}
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #222222; border-radius: 10px; border: 1px solid #2E2E2E; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #2C2C2C; color: #A0A0A0; font-size: 13px;">Membership Plan</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #2C2C2C; color: #FFFFFF; font-weight: 600; font-size: 13px; text-align: right;">${params.planLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #2C2C2C; color: #A0A0A0; font-size: 13px;">Access Start Date</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #2C2C2C; color: #FFFFFF; font-weight: 600; font-size: 13px; text-align: right;">${formattedStartDate}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; ${displayPaymentMethod || cleanUtr || params.amountPaid ? 'border-bottom: 1px solid #2C2C2C;' : ''} color: #A0A0A0; font-size: 13px;">Valid Until</td>
                  <td style="padding: 12px 16px; ${displayPaymentMethod || cleanUtr || params.amountPaid ? 'border-bottom: 1px solid #2C2C2C;' : ''} color: #F5B800; font-weight: 700; font-size: 13px; text-align: right;">${formattedEndDate}</td>
                </tr>
                ${displayPaymentMethod ? `
                <tr>
                  <td style="padding: 12px 16px; ${cleanUtr || params.amountPaid ? 'border-bottom: 1px solid #2C2C2C;' : ''} color: #A0A0A0; font-size: 13px;">Payment Method</td>
                  <td style="padding: 12px 16px; ${cleanUtr || params.amountPaid ? 'border-bottom: 1px solid #2C2C2C;' : ''} color: #FFFFFF; font-weight: 600; font-size: 13px; text-align: right;">${displayPaymentMethod}</td>
                </tr>` : ''}
                ${cleanUtr ? `
                <tr>
                  <td style="padding: 12px 16px; ${params.amountPaid ? 'border-bottom: 1px solid #2C2C2C;' : ''} color: #A0A0A0; font-size: 13px;">Transaction UTR / Ref</td>
                  <td style="padding: 12px 16px; ${params.amountPaid ? 'border-bottom: 1px solid #2C2C2C;' : ''} color: #E0E0E0; font-size: 13px; text-align: right;">${cleanUtr}</td>
                </tr>` : ''}
                ${params.amountPaid ? `
                <tr>
                  <td style="padding: 12px 16px; color: #A0A0A0; font-size: 13px;">Amount Received</td>
                  <td style="padding: 12px 16px; color: #FFFFFF; font-weight: 600; font-size: 13px; text-align: right;">₹${params.amountPaid}</td>
                </tr>` : ''}
              </table>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${siteUrl}/insights/members-only" target="_blank" style="background-color: #F5B800; color: #121212; padding: 12px 28px; text-decoration: none; border-radius: 20px; font-weight: 700; display: inline-block; font-size: 14px;">
                  Explore Premium Insights &rarr;
                </a>
              </div>

              <!-- Move to Primary Inbox Callout -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #202020; border: 1px solid #2C2C2C; border-radius: 10px; padding: 18px; margin-bottom: 20px;">
                <tr>
                  <td style="text-align: left;">
                    <h4 style="color: #FFFFFF; font-size: 14px; font-weight: 700; margin: 0 0 8px 0;">
                      📬 Never miss important research &amp; member updates
                    </h4>
                    <p style="color: #A0A0A0; font-size: 13px; line-height: 1.5; margin: 0 0 12px 0;">
                      Don&apos;t forget to move this email to your <strong>Primary</strong> tab (as shown below) so future research memos and subscriber alerts aren&apos;t buried in Promotions.
                    </p>
                    <div style="text-align: center; border-radius: 8px; overflow: hidden; border: 1px solid #2C2C2C; background-color: #121212; line-height: 0;">
                      <img 
                        src="${moveToPrimaryImageUrl}" 
                        alt="Move email from Promotions to Primary in Gmail" 
                        width="536" 
                        style="width: 100%; max-width: 100%; height: auto; display: block; border-radius: 6px;" 
                      />
                    </div>
                    <p style="color: #777777; font-size: 11px; margin: 8px 0 0 0; line-height: 1.4;">
                      <em>On mobile: Tap the <strong>&vellip;</strong> (three dots) in the top right &rarr; select <strong>&quot;Move to Primary&quot;</strong>.</em>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #777777; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                If you have questions, reply directly to this email or write to <a href="mailto:support@firstprinciplesresearch.in" style="color: #F5B800; text-decoration: none;">support@firstprinciplesresearch.in</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px; border-top: 1px solid #242424; text-align: center; background-color: #161616;">
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="display: inline-table; margin: 0 auto 6px auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px; line-height: 1;">
                    <img src="${logoUrl}" alt="Logo" width="18" height="18" style="width: 18px; height: 18px; display: block; border-radius: 4px; object-fit: contain;" />
                  </td>
                  <td style="vertical-align: middle; white-space: nowrap; line-height: 1;">
                    <span style="font-size: 12px; font-weight: 600; color: #FFFFFF; white-space: nowrap;">
                      First Principles <span style="color: #F5B800;">Investing</span>
                    </span>
                  </td>
                </tr>
              </table>
              <p style="color: #666666; font-size: 11px; line-height: 1.5; margin: 0;">
                Automated Transactional Membership Confirmation
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    if (brevoApiKey) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "First Principles Investing",
            email: emailFrom,
          },
          to: [
            {
              email: params.toEmail,
              name: params.toName || params.toEmail,
            },
          ],
          subject,
          htmlContent,
        }),
      })

      if (response.ok) {
        return true
      }
      console.error(`Brevo email failed: ${response.status} ${await response.text()}`)
    }

    if (resendApiKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [params.toEmail],
          subject,
          html: htmlContent,
        }),
      })

      if (response.ok) {
        return true
      }
      console.error(`Resend email failed: ${response.status} ${await response.text()}`)
    }

    return false
  } catch (err) {
    console.error("Failed to send manual grant confirmation email:", err)
    return false
  }
}

export interface SendMembersPostEmailParams {
  postUrl: string
  title: string
  subject?: string | null
  excerpt?: string | null
  mainImageUrl?: string | null
  recipients: Array<{ email: string; name?: string | null }>
  isTest?: boolean
  customNote?: string | null
}

export interface SendMembersPostEmailResult {
  successCount: number
  failedCount: number
  errors: string[]
}

/**
 * Sends a members-only research memo email broadcast or test email to subscribers
 */
export async function sendMembersOnlyPostEmailNotification(
  params: SendMembersPostEmailParams
): Promise<SendMembersPostEmailResult> {
  const brevoApiKey = process.env.BREVO_API_KEY
  const resendApiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM || "support@firstprinciplesresearch.in"

  if (!brevoApiKey && !resendApiKey) {
    console.error("Neither BREVO_API_KEY nor RESEND_API_KEY is configured.")
    return {
      successCount: 0,
      failedCount: params.recipients.length,
      errors: ["Email service credentials not configured"],
    }
  }

  const defaultSubject = `New Members Research Memo: ${params.title}`
  const rawSubject = params.subject?.trim() || defaultSubject
  const subject = params.isTest ? `[TEST PREVIEW] ${rawSubject}` : rawSubject

  const badgeText = params.isTest
    ? "🧪 TEST PREVIEW — MEMBERS-ONLY RESEARCH"
    : "🔒 MEMBERS-ONLY RESEARCH MEMO"

  const excerptHtml = params.excerpt
    ? `<div style="padding: 16px 20px; background-color: #202026; border-left: 3px solid #F5B800; border-radius: 8px; margin-bottom: 24px;">
        <p style="color: #F0EDE8; font-size: 15px; line-height: 1.6; margin: 0; font-style: italic; font-family: 'Cormorant Garamond', Georgia, serif;">
          &ldquo;${params.excerpt.trim()}&rdquo;
        </p>
      </div>`
    : ""

  const customNoteHtml = params.customNote
    ? `<div style="padding: 16px 20px; background-color: rgba(245, 184, 0, 0.08); border: 1px solid rgba(245, 184, 0, 0.28); border-radius: 10px; margin-bottom: 24px;">
        <span class="font-mono" style="font-family: 'JetBrains Mono', 'SF Mono', Consolas, Monaco, monospace; font-size: 11px; font-weight: 700; color: #F5B800; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 6px;">NOTE FROM EDITOR</span>
        <p style="color: #F0EDE8; font-size: 14px; line-height: 1.5; margin: 0;">
          ${params.customNote.trim()}
        </p>
      </div>`
    : ""

  const imageHtml = params.mainImageUrl
    ? `<div style="margin-bottom: 24px; text-align: center; overflow: hidden; border-radius: 14px;">
        <img src="${params.mainImageUrl}" alt="${params.title}" width="536" style="width: 100%; max-width: 100%; height: auto; border-radius: 14px; border: 1px solid #2B2B34; display: block; margin: 0 auto; filter: blur(14px); -webkit-filter: blur(14px); transform: scale(1.08);" />
      </div>`
    : ""

  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://firstprinciplesinvesting.in").replace(/\/$/, "")
  const logoUrl = `${siteUrl}/logo.png`

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121212; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.45);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 20px 28px; border-bottom: 1px solid #262626; text-align: left;">
              <table border="0" cellspacing="0" cellpadding="0" style="display: inline-table; vertical-align: middle;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px; line-height: 1;">
                    <img src="${logoUrl}" alt="First Principles Investing Logo" width="28" height="28" style="width: 28px; height: 28px; display: block; border-radius: 6px; object-fit: contain;" />
                  </td>
                  <td style="vertical-align: middle; white-space: nowrap; line-height: 1;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.2px; white-space: nowrap;">
                      First Principles <span style="color: #F5B800;">Investing</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Content Section -->
          <tr>
            <td style="padding: 28px 28px 20px 28px; text-align: left;">
              <div style="display: inline-block; padding: 4px 12px; background-color: rgba(245, 184, 0, 0.1); border: 1px solid rgba(245, 184, 0, 0.25); border-radius: 20px; color: #F5B800; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 16px;">
                ${badgeText}
              </div>
              
              <p style="color: #A0A0A0; font-size: 14px; font-weight: 500; line-height: 1.5; margin: 0 0 12px 0;">
                Dear investor, we just released a new deep-dive!
              </p>

              <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.35; letter-spacing: -0.3px;">
                ${params.title}
              </h1>

              ${imageHtml}
              ${customNoteHtml}
              ${excerptHtml}

              <!-- CTA Button -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 8px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="${params.postUrl}" target="_blank" style="font-size: 14px; font-weight: 700; color: #121212; text-decoration: none; padding: 12px 28px; border-radius: 20px; background-color: #F5B800; display: inline-block; letter-spacing: 0.2px;">
                      Read Full Research Memo &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td style="padding: 20px 28px; background-color: #161616; border-top: 1px solid #242424; text-align: left;">
              <p style="color: #666666; font-size: 12px; line-height: 1.5; margin: 0 0 6px 0;">
                You are receiving this notification as an active subscriber of First Principles Investing.
              </p>
              <table border="0" cellspacing="0" cellpadding="0" style="display: inline-table;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 6px; line-height: 1;">
                    <img src="${logoUrl}" alt="Logo" width="16" height="16" style="width: 16px; height: 16px; display: block; border-radius: 4px; object-fit: contain;" />
                  </td>
                  <td style="vertical-align: middle; white-space: nowrap; line-height: 1;">
                    <span style="font-size: 11px; font-weight: 600; color: #FFFFFF; white-space: nowrap;">
                      First Principles <span style="color: #F5B800;">Investing</span> &bull; Members Only Research
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  let successCount = 0
  let failedCount = 0
  const errors: string[] = []

  // Chunk recipients in batches of 10
  const chunkSize = 10
  for (let i = 0; i < params.recipients.length; i += chunkSize) {
    const chunk = params.recipients.slice(i, i + chunkSize)
    const promises = chunk.map(async (recipient) => {
      try {
        if (brevoApiKey) {
          const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              accept: "application/json",
              "api-key": brevoApiKey,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              sender: {
                name: "First Principles Investing",
                email: emailFrom,
              },
              to: [
                {
                  email: recipient.email,
                  name: recipient.name || recipient.email,
                },
              ],
              subject,
              htmlContent,
            }),
          })

          if (response.ok) {
            return true
          }
          const errText = await response.text()
          errors.push(`Brevo error for ${recipient.email}: ${response.status} ${errText}`)
        } else if (resendApiKey) {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: emailFrom,
              to: [recipient.email],
              subject,
              html: htmlContent,
            }),
          })

          if (response.ok) {
            return true
          }
          const errText = await response.text()
          errors.push(`Resend error for ${recipient.email}: ${response.status} ${errText}`)
        }
        return false
      } catch (err: any) {
        errors.push(`Failed for ${recipient.email}: ${err?.message || String(err)}`)
        return false
      }
    })

    const results = await Promise.all(promises)
    for (const res of results) {
      if (res) {
        successCount++
      } else {
        failedCount++
      }
    }
  }

  return {
    successCount,
    failedCount,
    errors,
  }
}

export interface SendLeadMagnetDeliveryEmailParams {
  toEmail: string
  toName: string
  reportTitle: string
  pdfUrl: string
  customSubject?: string
  customPreviewText?: string
  disclaimer?: string | null
}

/**
 * Sends the downloadable PDF Lead Magnet report to a user via Brevo transactional email
 * and includes a high-converting membership upsell.
 */
export async function sendLeadMagnetDeliveryEmail(params: SendLeadMagnetDeliveryEmailParams): Promise<boolean> {
  const brevoApiKey = process.env.BREVO_API_KEY
  const emailFrom = process.env.EMAIL_FROM || "support@firstprinciplesresearch.in"
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.firstprinciplesinvesting.in").replace(/\/$/, "")
  const logoUrl = `${siteUrl}/logo.png`
  const membershipUrl = `${siteUrl}/insights`
  const moveToPrimaryImageUrl = `${siteUrl}/images/move-to-primary.jpg`

  if (!brevoApiKey) {
    console.error("BREVO_API_KEY is not configured. Lead magnet delivery email skipped.")
    return false
  }

  const subject = params.customSubject?.trim() || `Your Free Report: ${params.reportTitle} | First Principles Investing`
  const sanitizedFilename = `${params.reportTitle.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_") || "Report"}.pdf`

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121212; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.45);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 20px 28px; border-bottom: 1px solid #262626; text-align: left;">
              <table border="0" cellspacing="0" cellpadding="0" style="display: inline-table; vertical-align: middle;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px; line-height: 1;">
                    <img src="${logoUrl}" alt="First Principles Investing Logo" width="28" height="28" style="width: 28px; height: 28px; display: block; border-radius: 6px; object-fit: contain;" />
                  </td>
                  <td style="vertical-align: middle; white-space: nowrap; line-height: 1;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.2px; white-space: nowrap;">
                      First Principles <span style="color: #F5B800;">Investing</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding: 28px 28px 12px 28px; text-align: left;">
              <p style="color: #FFFFFF; font-size: 15px; font-weight: 500; line-height: 1.6; margin: 0 0 6px 0;">
                Hi ${params.toName || "there"},
              </p>
              <p style="color: #A0A0A0; font-size: 14px; line-height: 1.6; margin: 0;">
                ${params.customPreviewText ? params.customPreviewText : "Here is your free report"}
              </p>
            </td>
          </tr>

          <!-- Download Action Card -->
          <tr>
            <td style="padding: 12px 28px 24px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #222222; border: 1px solid #2E2E2E; border-radius: 10px; padding: 22px; text-align: center;">
                <tr>
                  <td>
                    <h2 style="color: #FFFFFF; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.4; letter-spacing: -0.2px;">
                      ${params.reportTitle}
                    </h2>
                    <a href="${params.pdfUrl}" target="_blank" style="background-color: #F5B800; color: #121212; padding: 12px 28px; text-decoration: none; border-radius: 20px; font-weight: 700; display: inline-block; font-size: 14px; letter-spacing: 0.2px;">
                      Download PDF Report &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Move to Primary Inbox Callout -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #202020; border: 1px solid #2C2C2C; border-radius: 10px; padding: 18px;">
                <tr>
                  <td style="text-align: left;">
                    <h4 style="color: #FFFFFF; font-size: 14px; font-weight: 700; margin: 0 0 8px 0;">
                      📬 Never miss important research &amp; member updates
                    </h4>
                    <p style="color: #A0A0A0; font-size: 13px; line-height: 1.5; margin: 0 0 12px 0;">
                      Don&apos;t forget to move this email to your <strong>Primary</strong> tab (as shown below) so future research memos and subscriber alerts aren&apos;t buried in Promotions.
                    </p>
                    <div style="text-align: center; border-radius: 8px; overflow: hidden; border: 1px solid #2C2C2C; background-color: #121212; line-height: 0;">
                      <img 
                        src="${moveToPrimaryImageUrl}" 
                        alt="Move email from Promotions to Primary in Gmail" 
                        width="536" 
                        style="width: 100%; max-width: 100%; height: auto; display: block; border-radius: 6px;" 
                      />
                    </div>
                    <p style="color: #777777; font-size: 11px; margin: 8px 0 0 0; line-height: 1.4;">
                      <em>On mobile: Tap the <strong>&vellip;</strong> (three dots) in the top right &rarr; select <strong>&quot;Move to Primary&quot;</strong>.</em>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Membership Upsell Section -->
          <tr>
            <td style="padding: 4px 28px ${params.disclaimer ? '20px' : '28px'} 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1E1E1E; border: 1px solid rgba(245, 184, 0, 0.3); border-radius: 10px; padding: 20px;">
                <tr>
                  <td style="text-align: left;">
                    <span style="font-size: 11px; font-weight: 700; color: #F5B800; letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 6px;">
                      GO BEYOND THE CONSENSUS
                    </span>
                    <h3 style="color: #FFFFFF; font-size: 17px; font-weight: 700; margin: 0 0 8px 0;">
                      Subscribe to Our Deep Dives
                    </h3>
                    <p style="color: #A0A0A0; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
                      Our research members get 2 deep-dive investment memos every month, private community discussions and a monthly meetup.
                    </p>
                    <a href="${membershipUrl}" target="_blank" style="background-color: transparent; border: 1px solid #F5B800; color: #F5B800; padding: 9px 20px; text-decoration: none; border-radius: 20px; font-weight: 600; display: inline-block; font-size: 13px;">
                      Explore Full Membership &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${params.disclaimer ? `
          <!-- Report Disclaimer Section -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1A1A20; border: 1px solid rgba(245, 184, 0, 0.25); border-radius: 10px; padding: 14px 18px;">
                <tr>
                  <td style="text-align: left;">
                    <p style="color: #CCCCCC; font-size: 12px; line-height: 1.55; margin: 0;">
                      <strong style="color: #F5B800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; margin-right: 6px;">Disclaimer:</strong>
                      ${params.disclaimer.replace(/^(disclaimer|disclosure)\s*[:\-]\s*/i, "").trim()}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>` : ""}

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 28px 20px 28px; border-top: 1px solid #242424; text-align: center; background-color: #161616;">
              <p style="color: #888888; font-size: 12px; line-height: 1.5; margin: 0 0 16px 0; text-align: center;">
                If you have questions, reply directly to this email or write to <a href="mailto:support@firstprinciplesresearch.in" style="color: #F5B800; text-decoration: none;">support@firstprinciplesresearch.in</a>.
              </p>
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="display: inline-table; margin: 0 auto 6px auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px; line-height: 1;">
                    <img src="${logoUrl}" alt="Logo" width="18" height="18" style="width: 18px; height: 18px; display: block; border-radius: 4px; object-fit: contain;" />
                  </td>
                  <td style="vertical-align: middle; white-space: nowrap; line-height: 1;">
                    <span style="font-size: 12px; font-weight: 600; color: #FFFFFF; white-space: nowrap;">
                      First Principles <span style="color: #F5B800;">Investing</span>
                    </span>
                  </td>
                </tr>
              </table>
              <p style="color: #666666; font-size: 11px; line-height: 1.5; margin: 0;">
                For educational purposes only. You received this email because you requested a research report on our website.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const payload: any = {
      sender: {
        name: "First Principles Investing",
        email: emailFrom,
      },
      to: [
        {
          email: params.toEmail,
          name: params.toName,
        },
      ],
      subject,
      htmlContent: emailHtml,
    }

    // Attach PDF directly if URL is provided
    if (params.pdfUrl) {
      payload.attachment = [
        {
          url: params.pdfUrl,
          name: sanitizedFilename,
        },
      ]
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Brevo SMTP API failed for Lead Magnet (${response.status}): ${errorText}`)
      // Try fallback without attachment if Brevo rejected due to attachment size/policy
      if (payload.attachment) {
        delete payload.attachment
        const retryRes = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": brevoApiKey,
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(payload),
        })
        return retryRes.ok
      }
      return false
    }

    return true
  } catch (error) {
    console.error("Error executing sendLeadMagnetDeliveryEmail:", error)
    return false
  }
}



