import { client } from "@/lib/sanity.client"
import { groq } from "next-sanity"

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
  const emailFrom = process.env.EMAIL_FROM || "support@firstprinciplesinvesting.in"

  if (!brevoApiKey) {
    console.error("BREVO_API_KEY is not configured. Email skipped.")
    return false
  }

  try {
    // 1. Fetch Event Details from Sanity
    const query = groq`*[_type in ["event", "super30Program"] && eventId == $eventId][0]{
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
    const amountDisplay = event.price ? `₹${event.price}` : (params.amountPaid ? `₹${params.amountPaid}` : null)
    const transactionId = params.paymentId || params.orderId || null

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
<body style="margin: 0; padding: 0; background-color: #0A0A0C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0A0C; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #111115; border: 1px solid #27272A; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1E1E24; text-align: left;">
              <span style="font-size: 13px; font-weight: 700; color: #FFC72C; letter-spacing: 1.5px; text-transform: uppercase;">
                FIRST PRINCIPLES INVESTING
              </span>
            </td>
          </tr>

          <!-- Confirmation Hero Section -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: left;">
              <div style="display: inline-block; padding: 6px 14px; background-color: rgba(37, 211, 102, 0.12); border: 1px solid rgba(37, 211, 102, 0.3); border-radius: 20px; color: #25D366; font-size: 13px; font-weight: 600; margin-bottom: 16px;">
                ✅ Registration Confirmed
              </div>
              <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 800; margin: 0 0 12px 0; line-height: 1.3;">
                You&apos;re Registered!
              </h1>
              <p style="color: #D4D4D8; font-size: 16px; line-height: 1.6; margin: 0;">
                Hi ${params.toName},
              </p>
              <p style="color: #A1A1AA; font-size: 15px; line-height: 1.6; margin: 8px 0 0 0;">
                Your payment has been verified successfully and your seat for <strong>${event.title}</strong> has been reserved.
              </p>
            </td>
          </tr>

          <!-- Event Details Card -->
          <tr>
            <td style="padding: 16px 32px 24px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #17171C; border: 1px solid #2A2A32; border-radius: 12px; padding: 24px;">
                <tr>
                  <td style="padding-bottom: 16px; border-bottom: 1px solid #26262E;">
                    <span style="font-size: 11px; font-weight: 700; color: #FFC72C; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 6px;">
                      EVENT DETAILS
                    </span>
                    <span style="font-size: 18px; font-weight: 700; color: #FFFFFF; display: block;">
                      ${event.title}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td style="padding-top: 16px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${
                        formattedDate
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #A1A1AA; font-size: 14px; width: 140px; font-weight: 500;">📅 Date & Time:</td>
                        <td style="padding: 6px 0; color: #FFFFFF; font-size: 14px; font-weight: 600;">${formattedDate}</td>
                      </tr>
                      `
                          : ""
                      }

                      ${
                        speakerName
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #A1A1AA; font-size: 14px; width: 140px; font-weight: 500;">👤 Speaker:</td>
                        <td style="padding: 6px 0; color: #FFFFFF; font-size: 14px; font-weight: 600;">${speakerName}</td>
                      </tr>
                      `
                          : ""
                      }

                      ${
                        event.location
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #A1A1AA; font-size: 14px; width: 140px; font-weight: 500;">📍 Platform / Venue:</td>
                        <td style="padding: 6px 0; color: #FFFFFF; font-size: 14px; font-weight: 600;">${event.location}</td>
                      </tr>
                      `
                          : ""
                      }

                      ${
                        params.eventId
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #A1A1AA; font-size: 14px; width: 140px; font-weight: 500;">🎟️ Event ID:</td>
                        <td style="padding: 6px 0; color: #E4E4E7; font-size: 14px; font-family: monospace;">${params.eventId}</td>
                      </tr>
                      `
                          : ""
                      }

                      <tr>
                        <td style="padding: 6px 0; color: #A1A1AA; font-size: 14px; width: 140px; font-weight: 500;">💳 Payment Status:</td>
                        <td style="padding: 6px 0; color: #25D366; font-size: 14px; font-weight: 700;">Verified ✅</td>
                      </tr>

                      ${
                        amountDisplay
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #A1A1AA; font-size: 14px; width: 140px; font-weight: 500;">💰 Amount Paid:</td>
                        <td style="padding: 6px 0; color: #FFFFFF; font-size: 14px; font-weight: 600;">${amountDisplay}</td>
                      </tr>
                      `
                          : ""
                      }

                      ${
                        transactionId
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #A1A1AA; font-size: 14px; width: 140px; font-weight: 500;">🧾 Transaction ID:</td>
                        <td style="padding: 6px 0; color: #E4E4E7; font-size: 13px; font-family: monospace;">${transactionId}</td>
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
                  <td style="padding-top: 20px; border-top: 1px solid #26262E; margin-top: 16px;">
                    <p style="font-size: 14px; color: #E4E4E7; margin: 0 0 12px 0; line-height: 1.5;">
                      Join our official WhatsApp group for live session access links and real-time updates:
                    </p>
                    <a href="${event.whatsappLink}" target="_blank" style="background-color: #25D366; color: #FFFFFF; padding: 12px 22px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 14px;">
                      Join WhatsApp Group
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
            <td style="padding: 8px 32px 24px 32px;">
              <h3 style="color: #FFFFFF; font-size: 16px; font-weight: 700; margin: 0 0 12px 0;">
                What happens next?
              </h3>
              <ul style="color: #A1A1AA; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">A reminder email will be sent before the event.</li>
                <li style="margin-bottom: 8px;">Meeting link will be shared before the session (or pinned in the WhatsApp group).</li>
                <li>Keep this email for future reference.</li>
              </ul>
            </td>
          </tr>

          <!-- Need Help Section -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background-color: rgba(255, 255, 255, 0.03); border-radius: 8px; padding: 16px; border: 1px solid rgba(255, 255, 255, 0.06);">
                <p style="color: #A1A1AA; font-size: 14px; margin: 0; line-height: 1.5;">
                  <strong style="color: #FFFFFF;">Questions?</strong> Simply reply to this email or contact us at <a href="mailto:support@firstprinciplesinvesting.in" style="color: #FFC72C; text-decoration: none;">support@firstprinciplesinvesting.in</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- SINGLE TASTEFUL UPSELL SECTION -->
          <tr>
            <td style="padding: 8px 32px 32px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #16161A; border: 1px solid #2E2E36; border-radius: 12px; padding: 24px;">
                <tr>
                  <td style="text-align: left;">
                    <span style="font-size: 11px; font-weight: 700; color: #FFC72C; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 8px;">
                      CONTINUE LEARNING
                    </span>
                    <h3 style="color: #FFFFFF; font-size: 18px; font-weight: 700; margin: 0 0 10px 0;">
                      Continue Learning Beyond This Event
                    </h3>
                    <p style="color: #A1A1AA; font-size: 14px; line-height: 1.6; margin: 0 0 18px 0;">
                      Get access to in-depth company research, sector reports, member-only webinars and exclusive investing insights through the First Principles Investing Subscription.
                    </p>
                    <a href="https://firstprinciplesinvesting.com/membership" target="_blank" style="background-color: #FFC72C; color: #0C0C0E; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 800; display: inline-block; font-size: 14px;">
                      Explore Membership
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #1E1E24; text-align: center; background-color: #0E0E11;">
              <p style="color: #D4D4D8; font-size: 13px; font-weight: 700; margin: 0 0 6px 0;">
                First Principles Investing
              </p>
              <p style="color: #71717A; font-size: 12px; line-height: 1.5; margin: 0;">
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
