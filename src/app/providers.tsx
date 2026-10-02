"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { PostHogProvider } from "@/components/analytics/PostHogProvider"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <SessionProvider>
            <PostHogProvider>
                <NextThemesProvider {...props}>{children}</NextThemesProvider>
            </PostHogProvider>
        </SessionProvider>
    )
}
