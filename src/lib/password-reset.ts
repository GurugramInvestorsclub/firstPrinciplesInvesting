import crypto from "crypto"

const RESET_PREFIX = "password-reset"
const RESET_TTL_MS = 1000 * 60 * 60 // 1 hour

function getVerificationSecret(): string {
  const secret =
    process.env.EMAIL_VERIFICATION_SECRET ?? process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV !== "production") {
      return "dev-verification-secret-must-be-at-least-32-chars"
    }
    throw new Error(
      "EMAIL_VERIFICATION_SECRET (or AUTH_SECRET/NEXTAUTH_SECRET) must be set and at least 32 characters long"
    )
  }

  return secret
}

export function hashResetToken(token: string): string {
  return crypto
    .createHmac("sha256", getVerificationSecret())
    .update(token)
    .digest("hex")
}

export function createResetTokenRecord(email: string) {
  const rawToken = crypto.randomBytes(32).toString("hex")
  const tokenHash = hashResetToken(rawToken)

  return {
    rawToken,
    tokenHash,
    identifier: `${RESET_PREFIX}:${email.toLowerCase().trim()}`,
    expires: new Date(Date.now() + RESET_TTL_MS),
  }
}

export function resetIdentifierForEmail(email: string): string {
  return `${RESET_PREFIX}:${email.toLowerCase().trim()}`
}

export async function sendPasswordResetEmail(params: {
  toEmail: string
  resetUrl: string
}): Promise<boolean> {
  const brevoApiKey = process.env.BREVO_API_KEY
  const resendApiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM || "support@firstprinciplesresearch.in"

  if (!brevoApiKey && !resendApiKey) {
    console.warn("Neither BREVO_API_KEY nor RESEND_API_KEY is configured. Cannot send password reset email.")
    return false
  }

  const subject = "Reset your password - First Principles Investing"
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F5B800;">Password Reset Request</h2>
      <p>We received a request to reset the password for your account at First Principles Investing.</p>
      <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
      <div style="margin: 30px 0;">
        <a href="${params.resetUrl}" 
           style="background-color: #F5B800; color: #1A1A1A; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
           Reset Password
        </a>
      </div>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #666; font-size: 12px;">First Principles Investing</p>
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
          sender: {
            name: "First Principles Investing",
            email: emailFrom,
          },
          to: [
            {
              email: params.toEmail,
            },
          ],
          subject,
          htmlContent,
        }),
      })

      if (response.ok) {
        return true
      }

      const error = await response.text()
      console.error(`Failed to send password reset email via Brevo (${response.status}):`, error)
    } catch (err) {
      console.error("Error sending password reset email via Brevo:", err)
    }
  }

  // Fallback to Resend if Brevo failed or is not configured
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
          to: [params.toEmail],
          subject,
          html: htmlContent,
        }),
      })

      if (response.ok) {
        return true
      }
      const error = await response.text()
      console.error("Failed to send password reset email via Resend:", error)
    } catch (err) {
      console.error("Error sending password reset email via Resend:", err)
    }
  }

  return false
}
