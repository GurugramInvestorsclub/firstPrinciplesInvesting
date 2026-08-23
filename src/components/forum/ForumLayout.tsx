import React, { ReactNode } from "react"

interface ForumLayoutProps {
  children: ReactNode
}

export function ForumLayout({ children }: ForumLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d0d", // Dark charcoal, clean near-black
        color: "#e5e5e5",
        fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: "40px 20px 80px",
      }}
    >
      <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
        {children}
      </div>
    </div>
  )
}
