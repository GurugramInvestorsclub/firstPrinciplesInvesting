import crypto from "crypto"
import { cookies } from "next/headers"

const COOKIE_NAME = "admin_session"
const SESSION_VERSION = "v1"
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24

function safeCompare(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a, "utf8")
    const bBuffer = Buffer.from(b, "utf8")

    if (aBuffer.length !== bBuffer.length) {
        return false
    }

    return crypto.timingSafeEqual(aBuffer, bBuffer)
}

function getSessionSecret(): string {
    const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.NEXTAUTH_SECRET
    if (!secret || secret.length < 32) {
        throw new Error(
            "ADMIN_SESSION_SECRET (or NEXTAUTH_SECRET) must be set and at least 32 characters long"
        )
    }

    return secret
}

export function getAdminSessionMaxAgeSeconds(): number {
    const configured = process.env.ADMIN_SESSION_TTL_SECONDS
    if (!configured) {
        return DEFAULT_SESSION_TTL_SECONDS
    }

    const parsed = Number(configured)
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return DEFAULT_SESSION_TTL_SECONDS
    }

    return parsed
}

function signSessionPayload(payload: string): string {
    return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex")
}

export function createAdminSessionToken(nowMs = Date.now()): string {
    const expiresAt = Math.floor(nowMs / 1000) + getAdminSessionMaxAgeSeconds()
    const payload = `${SESSION_VERSION}.${expiresAt}`
    const signature = signSessionPayload(payload)
    return `${payload}.${signature}`
}

export function verifyAdminSessionToken(token: string): boolean {
    try {
        const parts = token.split(".")
        if (parts.length !== 3) {
            return false
        }

        const [version, expiresAtRaw, providedSignature] = parts
        if (version !== SESSION_VERSION) {
            return false
        }

        const expiresAt = Number(expiresAtRaw)
        if (!Number.isInteger(expiresAt)) {
            return false
        }

        if (expiresAt <= Math.floor(Date.now() / 1000)) {
            return false
        }

        const payload = `${version}.${expiresAtRaw}`
        const expectedSignature = signSessionPayload(payload)
        return safeCompare(expectedSignature, providedSignature)
    } catch {
        return false
    }
}

export async function isAdminAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) {
        return false
    }

    return verifyAdminSessionToken(token)
}

export function verifyPassword(password: string): boolean {
    const expectedPassword = process.env.ADMIN_PASSWORD
    if (!expectedPassword) {
        return false
    }

    return safeCompare(password, expectedPassword)
}

export { COOKIE_NAME }
