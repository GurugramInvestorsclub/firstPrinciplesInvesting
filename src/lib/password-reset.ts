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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600;1,700&family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600;1,700&family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    }
    .font-serif, h1, h2, h3, h4 {
      font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif !important;
    }
    .font-mono {
      font-family: 'JetBrains Mono', 'SF Mono', Consolas, Monaco, monospace !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #121215; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F0EDE8; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121215; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #18181D; border: 1px solid #282832; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.5);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #26262E; text-align: left;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <img src="${logoUrl}" alt="First Principles Investing Logo" width="32" height="32" style="width: 32px; height: 32px; display: block; border-radius: 6px; object-fit: contain;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <span class="font-mono" style="font-family: 'JetBrains Mono', 'SF Mono', Consolas, Monaco, monospace; font-size: 12px; font-weight: 700; color: #F5B800; letter-spacing: 2px; text-transform: uppercase;">
                      FIRST PRINCIPLES INVESTING
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; text-align: left;">
              <div class="font-mono" style="display: inline-block; padding: 5px 14px; background-color: rgba(245, 184, 0, 0.08); border: 1px solid rgba(245, 184, 0, 0.28); border-radius: 9999px; color: #F5B800; font-family: 'JetBrains Mono', 'SF Mono', Consolas, Monaco, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 18px;">
                ✦ SECURITY NOTIFICATION
              </div>

              <h1 class="font-serif" style="font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; color: #F0EDE8; font-size: 32px; font-weight: 600; margin: 0 0 14px 0; line-height: 1.25; letter-spacing: -0.01em;">
                Reset Your <span style="color: #F5B800; font-style: italic;">Password</span>
              </h1>

              <p style="color: #9E9EA4; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                We received a request to reset the password for your account. Click the button below to set a new password. This link will expire in 1 hour.
              </p>

              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${params.resetUrl}" target="_blank" style="font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; font-size: 14px; font-weight: 700; color: #141416; text-decoration: none; padding: 14px 34px; border-radius: 9999px; background-color: #F5B800; display: inline-block; box-shadow: 0 4px 18px rgba(245, 184, 0, 0.25); letter-spacing: 0.3px;">
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
            <td style="padding: 24px 32px; border-top: 1px solid #26262E; text-align: center; background-color: #121215;">
              <p class="font-mono" style="font-family: 'JetBrains Mono', 'SF Mono', Consolas, Monaco, monospace; color: #F0EDE8; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 6px 0;">
                FIRST PRINCIPLES INVESTING
              </p>
              <p style="color: #72727A; font-size: 11px; line-height: 1.6; margin: 0;">
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600;1,700&family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600;1,700&family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    }
    .font-serif, h1, h2, h3, h4 {
      font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif !important;
    }
    .font-mono {
      font-family: 'JetBrains Mono', 'SF Mono', Consolas, Monaco, monospace !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #121215; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F0EDE8; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121215; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #18181D; border: 1px solid #282832; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.5);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #26262E; text-align: left;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <img src="${logoUrl}" alt="First Principles Investing Logo" width="32" height="32" style="width: 32px; height: 32px; display: block; border-radius: 6px; object-fit: contain;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <span class="font-mono" style="font-family: 'JetBrains Mono', 'SF Mono', Consolas, Monaco, monospace; font-size: 12px; font-weight: 700; color: #F5B800; letter-spacing: 2px; text-transform: uppercase;">
                      FIRST PRINCIPLES INVESTING
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; text-align: left;">
              <div class="font-mono" style="display: inline-block; padding: 5px 14px; background-color: rgba(245, 184, 0, 0.08); border: 1px solid rgba(245, 184, 0, 0.28); border-radius: 9999px; color: #F5B800; font-family: 'JetBrains Mono', 'SF Mono', Consolas, Monaco, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 18px;">
                ✦ ACCOUNT CREDENTIALS
              </div>

              <h1 class="font-serif" style="font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; color: #F0EDE8; font-size: 32px; font-weight: 600; margin: 0 0 14px 0; line-height: 1.25; letter-spacing: -0.01em;">
                Password <span style="color: #F5B800; font-style: italic;">Notification</span>
              </h1>

              <p style="color: #9E9EA4; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello ${params.name || "there"}, your password for your account has been reset by an administrator.
              </p>

              <div style="background-color: #202026; border: 1px solid #2B2B34; border-radius: 12px; padding: 20px; margin: 0 0 24px 0; text-align: center;">
                <p class="font-mono" style="margin: 0; font-size: 11px; color: #9E9EA4; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; font-family: 'JetBrains Mono', 'SF Mono', Consolas, Monaco, monospace;">
                  Your Temporary Password
                </p>
                <p class="font-mono" style="margin: 10px 0 0 0; font-family: 'JetBrains Mono', 'SF Mono', Consolas, Monaco, monospace; font-size: 22px; font-weight: 700; color: #F5B800; letter-spacing: 2px;">
                  ${params.temporaryPassword}
                </p>
              </div>

              <p style="color: #9E9EA4; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                Please log in using your email (<strong style="color: #F0EDE8;">${params.toEmail}</strong>) and this temporary password. We recommend updating your password once logged in.
              </p>

              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${siteUrl}/login" target="_blank" style="font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; font-size: 14px; font-weight: 700; color: #141416; text-decoration: none; padding: 14px 34px; border-radius: 9999px; background-color: #F5B800; display: inline-block; box-shadow: 0 4px 18px rgba(245, 184, 0, 0.25); letter-spacing: 0.3px;">
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
            <td style="padding: 24px 32px; border-top: 1px solid #26262E; text-align: center; background-color: #121215;">
              <p class="font-mono" style="font-family: 'JetBrains Mono', 'SF Mono', Consolas, Monaco, monospace; color: #F0EDE8; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 6px 0;">
                FIRST PRINCIPLES INVESTING
              </p>
              <p style="color: #72727A; font-size: 11px; line-height: 1.6; margin: 0;">
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

