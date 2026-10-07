import crypto from "crypto"

const SIGNUP_PREFIX = "signup"
const SIGNUP_TTL_MS = 1000 * 60 * 60 * 24

interface SignupVerificationPayload {
  email: string
  name: string | null
  passwordHash: string
  phone?: string | null
}

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

export function hashSignupVerificationToken(token: string): string {
  return crypto
    .createHmac("sha256", getVerificationSecret())
    .update(token)
    .digest("hex")
}

function encodePayload(payload: SignupVerificationPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")
}

export function createSignupVerificationRecord(payload: SignupVerificationPayload) {
  const rawToken = crypto.randomBytes(32).toString("hex")
  const tokenHash = hashSignupVerificationToken(rawToken)
  const payloadEncoded = encodePayload(payload)

  return {
    rawToken,
    tokenHash,
    identifier: `${SIGNUP_PREFIX}:${payload.email}:${payloadEncoded}`,
    expires: new Date(Date.now() + SIGNUP_TTL_MS),
  }
}

export function signupIdentifierPrefixForEmail(email: string): string {
  return `${SIGNUP_PREFIX}:${email}:`
}

export function parseSignupVerificationIdentifier(identifier: string): SignupVerificationPayload | null {
  if (!identifier.startsWith(`${SIGNUP_PREFIX}:`)) {
    return null
  }

  const firstSeparator = identifier.indexOf(":", SIGNUP_PREFIX.length + 1)
  if (firstSeparator === -1) {
    return null
  }

  const email = identifier.slice(SIGNUP_PREFIX.length + 1, firstSeparator).trim().toLowerCase()
  const encodedPayload = identifier.slice(firstSeparator + 1)

  if (!email || !encodedPayload) {
    return null
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Partial<SignupVerificationPayload>

    if (typeof parsed.email !== "string" || parsed.email.trim().toLowerCase() !== email) {
      return null
    }

    if (parsed.name !== null && parsed.name !== undefined && typeof parsed.name !== "string") {
      return null
    }

    if (typeof parsed.passwordHash !== "string" || parsed.passwordHash.length < 20) {
      return null
    }

    return {
      email,
      name: parsed.name?.trim() ? parsed.name.trim() : null,
      passwordHash: parsed.passwordHash,
    }
  } catch {
    return null
  }
}

export async function sendSignupVerificationEmail(params: {
  toEmail: string
  verificationUrl: string
}): Promise<boolean> {
  const brevoApiKey = process.env.BREVO_API_KEY
  const resendApiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM || "support@firstprinciplesresearch.in"

  if (!brevoApiKey && !resendApiKey) {
    return false
  }

  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.firstprinciplesinvesting.in").replace(/\/$/, "")
  const logoUrl = `${siteUrl}/logo.png`
  const subject = "Verify your email | First Principles Investing"
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
                ✦ ACCOUNT VERIFICATION
              </div>

              <h1 class="font-serif" style="font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; color: #F0EDE8; font-size: 32px; font-weight: 600; margin: 0 0 14px 0; line-height: 1.25; letter-spacing: -0.01em;">
                Verify Your <span style="color: #F5B800; font-style: italic;">Email Address</span>
              </h1>

              <p style="color: #9E9EA4; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Click the button below to complete your registration and activate your account. This verification link expires in 24 hours.
              </p>

              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${params.verificationUrl}" target="_blank" style="font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; font-size: 14px; font-weight: 700; color: #141416; text-decoration: none; padding: 14px 34px; border-radius: 9999px; background-color: #F5B800; display: inline-block; box-shadow: 0 4px 18px rgba(245, 184, 0, 0.25); letter-spacing: 0.3px;">
                      Verify Email Address &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #72727A; font-size: 13px; line-height: 1.5; margin: 0;">
                If you did not sign up for First Principles Investing, you can safely ignore this email.
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
                Automated Transactional Account Verification
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
    } catch (err) {
      console.error("Error sending verification email via Brevo:", err)
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
    } catch (err) {
      console.error("Error sending verification email via Resend:", err)
    }
  }

  return false
}
