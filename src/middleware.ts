import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip the login page itself
    if (pathname === "/admin/login") {
        return NextResponse.next()
    }

    // Protect all /admin routes
    if (pathname.startsWith("/admin")) {
        const session = request.cookies.get("admin_session")

        if (!session || session.value !== "true") {
            const loginUrl = new URL("/admin/login", request.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*"],
}
