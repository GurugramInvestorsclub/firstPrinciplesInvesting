import crypto from "crypto"

const SIGNUP_PREFIX = "signup"
const SIGNUP_TTL_MS = 1000 * 60 * 60 * 24

interface SignupVerificationPayload {
  email: string
  name: string | null
  passwordHash: string
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
  const resendApiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM

  if (!resendApiKey || !emailFrom) {
    return false
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [params.toEmail],
      subject: "Verify your email - First Principles Investing",
      html: `
        <p>Click the link below to verify your email and activate your account:</p>
        <p><a href="${params.verificationUrl}">${params.verificationUrl}</a></p>
        <p>This link expires in 24 hours.</p>
      `,
    }),
  })

  return response.ok
}
