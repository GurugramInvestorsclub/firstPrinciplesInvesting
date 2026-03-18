import { NextRequest, NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

const { auth } = NextAuth(authConfig)
const ADMIN_SESSION_VERSION = "v1"

function safeHexEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false
    }

    let mismatch = 0
    for (let i = 0; i < a.length; i += 1) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return mismatch === 0
}

async function verifyAdminSessionToken(token: string): Promise<boolean> {
    const parts = token.split(".")
    if (parts.length !== 3) {
        return false
    }

    const [version, expiresAtRaw, providedSignature] = parts
    if (version !== ADMIN_SESSION_VERSION) {
        return false
    }

    const expiresAt = Number(expiresAtRaw)
    if (!Number.isInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
        return false
    }

    const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.NEXTAUTH_SECRET
    if (!secret || secret.length < 32) {
        return false
    }

    const payload = `${version}.${expiresAtRaw}`
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    )
    const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(payload)
    )
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")

    return safeHexEqual(expectedSignature, providedSignature)
}

export default auth(async (req) => {
    const { pathname } = req.nextUrl
    const isLoggedIn = !!req.auth

    // Protect /dashboard
    if (pathname.startsWith("/dashboard")) {
        if (!isLoggedIn) {
            const loginUrl = new URL("/login", req.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Protect /admin pages. API routes are additionally protected server-side with signed token verification.
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        const session = req.cookies.get("admin_session")
        const token = session?.value
        if (!token) {
            const loginUrl = new URL("/admin/login", req.url)
            return NextResponse.redirect(loginUrl)
        }

        const isValid = await verifyAdminSessionToken(token)
        if (!isValid) {
            const loginUrl = new URL("/admin/login", req.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/admin/:path*", "/dashboard/:path*"],
}
