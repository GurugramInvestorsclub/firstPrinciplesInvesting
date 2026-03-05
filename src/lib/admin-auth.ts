import { cookies } from "next/headers"

const COOKIE_NAME = "admin_session"

export async function isAdminAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies()
    return cookieStore.get(COOKIE_NAME)?.value === "true"
}

export function verifyPassword(password: string): boolean {
    return password === process.env.ADMIN_PASSWORD
}

export { COOKIE_NAME }
