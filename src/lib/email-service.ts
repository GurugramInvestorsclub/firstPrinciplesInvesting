import { client } from "@/lib/sanity.client"
import { groq } from "next-sanity"

interface SendEmailParams {
  toEmail: string
  toName: string
  eventId: string
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
      whatsappLink
    }`
    const event = await client.fetch(query, { eventId: params.eventId })

    if (!event) {
      console.error(`Event metadata not found in Sanity for eventId: ${params.eventId}`)
      return false
    }

    const formattedDate = event.date ? formatEventDate(event.date) : "TBD"

    // 2. Call Brevo Transactional SMTP API (Option A: HTML in Code)
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
        subject: `Thank You for Registering: ${event.title}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #FFFFFF; background-color: #0E0E11; padding: 40px; border-radius: 12px; border: 1px solid #27272A;">
            <h2 style="color: #F5B800; font-size: 24px; margin-top: 0;">Registration Confirmed!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #E4E4E7;">Hi ${params.toName},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #E4E4E7;">Thank you for registering for <strong>${event.title}</strong>. Your payment was verified successfully.</p>
            
            <div style="background-color: #18181B; border: 1px solid #27272A; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <h3 style="color: #F5B800; margin-top: 0; font-size: 18px;">Event Details</h3>
              <p style="margin: 8px 0; font-size: 15px; color: #E4E4E7;">📅 <strong>Date & Time:</strong> ${formattedDate}</p>
            </div>

            ${
              event.whatsappLink
                ? `
              <p style="font-size: 15px; color: #E4E4E7;">Please join our official WhatsApp group for real-time updates and links leading up to the session:</p>
              <div style="margin: 24px 0;">
                <a href="${event.whatsappLink}" style="background-color: #25D366; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px;">
                  Join WhatsApp Group
                </a>
              </div>
            `
                : ""
            }

            <hr style="border: none; border-top: 1px solid #27272A; margin: 32px 0;" />
            <p style="color: #A1A1AA; font-size: 12px; margin-bottom: 0; line-height: 1.5;">First Principles Investing<br/>This is an automated transactional message regarding your purchase.</p>
          </div>
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
