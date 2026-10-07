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

  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.firstprinciplesinvesting.in").replace(/\/$/, "")
  const logoUrl = `${siteUrl}/logo.png`
  const subject = "Reset your password | First Principles Investing"
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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

          <!-- Content Section -->
          <tr>
            <td style="padding: 28px 28px; text-align: left;">
              <div style="display: inline-block; padding: 4px 12px; background-color: rgba(245, 184, 0, 0.1); border: 1px solid rgba(245, 184, 0, 0.25); border-radius: 20px; color: #F5B800; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 14px;">
                ✦ SECURITY NOTIFICATION
              </div>

              <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.3; letter-spacing: -0.3px;">
                Reset Your <span style="color: #F5B800;">Password</span>
              </h1>

              <p style="color: #A0A0A0; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                We received a request to reset the password for your account. Click the button below to set a new password. This link will expire in 1 hour.
              </p>

              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${params.resetUrl}" target="_blank" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #141416; text-decoration: none; padding: 13px 32px; border-radius: 9999px; background-color: #F5B800; display: inline-block; box-shadow: 0 4px 18px rgba(245, 184, 0, 0.25); letter-spacing: 0.3px;">
                      Reset Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #72727A; font-size: 13px; line-height: 1.5; margin: 0;">
                If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px; border-top: 1px solid #262626; text-align: center; background-color: #151515;">
              <p style="color: #A0A0A0; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 4px 0;">
                FIRST PRINCIPLES INVESTING
              </p>
              <p style="color: #666666; font-size: 11px; line-height: 1.5; margin: 0;">
                Automated Transactional Security Request
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

export async function sendAdminGeneratedPasswordEmail(params: {
  toEmail: string
  name?: string | null
  temporaryPassword: string
}): Promise<boolean> {
  const brevoApiKey = process.env.BREVO_API_KEY
  const resendApiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM || "support@firstprinciplesresearch.in"
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.firstprinciplesinvesting.in").replace(/\/$/, "")
  const logoUrl = `${siteUrl}/logo.png`

  if (!brevoApiKey && !resendApiKey) {
    console.warn("Neither BREVO_API_KEY nor RESEND_API_KEY is configured. Skipped sending temporary password email.")
    return false
  }

  const subject = "Your Password Has Been Reset | First Principles Investing"
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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

          <!-- Content Section -->
          <tr>
            <td style="padding: 28px 28px; text-align: left;">
              <div style="display: inline-block; padding: 4px 12px; background-color: rgba(245, 184, 0, 0.1); border: 1px solid rgba(245, 184, 0, 0.25); border-radius: 20px; color: #F5B800; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 14px;">
                ✦ ACCOUNT CREDENTIALS
              </div>

              <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.3; letter-spacing: -0.3px;">
                Password <span style="color: #F5B800;">Notification</span>
              </h1>

              <p style="color: #A0A0A0; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello ${params.name || "there"}, your password for your account has been reset by an administrator.
              </p>

              <div style="background-color: #222222; border: 1px solid #2E2E2E; border-radius: 10px; padding: 18px; margin: 0 0 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #A0A0A0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">
                  Your Temporary Password
                </p>
                <p style="margin: 10px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 22px; font-weight: 700; color: #F5B800; letter-spacing: 2px;">
                  ${params.temporaryPassword}
                </p>
              </div>

              <p style="color: #A0A0A0; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                Please log in using your email (<strong style="color: #FFFFFF;">${params.toEmail}</strong>) and this temporary password. We recommend updating your password once logged in.
              </p>

              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${siteUrl}/login" target="_blank" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #141416; text-decoration: none; padding: 13px 32px; border-radius: 9999px; background-color: #F5B800; display: inline-block; box-shadow: 0 4px 18px rgba(245, 184, 0, 0.25); letter-spacing: 0.3px;">
                      Log In Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #72727A; font-size: 13px; line-height: 1.5; margin: 0;">
                If you have any questions, feel free to reply directly to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px; border-top: 1px solid #262626; text-align: center; background-color: #151515;">
              <p style="color: #A0A0A0; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 4px 0;">
                FIRST PRINCIPLES INVESTING
              </p>
              <p style="color: #666666; font-size: 11px; line-height: 1.5; margin: 0;">
                Automated Transactional Password Management
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
      console.error(`Failed to send admin temp password email via Brevo (${response.status}):`, error)
    } catch (err) {
      console.error("Error sending admin temp password email via Brevo:", err)
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
          to: [params.toEmail],
          subject,
          html: htmlContent,
        }),
      })

      if (response.ok) {
        return true
      }
      const error = await response.text()
      console.error("Failed to send admin temp password email via Resend:", error)
    } catch (err) {
      console.error("Error sending admin temp password email via Resend:", err)
    }
  }

  return false
}

