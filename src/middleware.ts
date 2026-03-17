import { NextRequest, NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const { pathname } = req.nextUrl
    const isLoggedIn = !!req.auth

    // Protect /dashboard
    if (pathname.startsWith("/dashboard")) {
        if (!isLoggedIn) {
            const loginUrl = new URL("/login", req.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Protect all /admin routes (Existing Logic)
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        const session = req.cookies.get("admin_session")

        if (!session || session.value !== "true") {
            const loginUrl = new URL("/admin/login", req.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/admin/:path*", "/dashboard/:path*"],
}
