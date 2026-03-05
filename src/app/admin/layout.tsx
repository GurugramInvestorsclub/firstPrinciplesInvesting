import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin | First Principles Investing",
    description: "Admin dashboard",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#0a0a0f",
                color: "#e4e4e7",
                fontFamily:
                    'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
        >
            <header
                style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    padding: "16px 32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(10,10,15,0.95)",
                    backdropFilter: "blur(12px)",
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span
                        style={{
                            fontSize: "18px",
                            fontWeight: 600,
                            letterSpacing: "-0.02em",
                            color: "#fafafa",
                        }}
                    >
                        FPI Admin
                    </span>
                    <span
                        style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: "rgba(99,102,241,0.15)",
                            color: "#818cf8",
                            fontWeight: 500,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                        }}
                    >
                        Dashboard
                    </span>
                </div>
            </header>
            <main style={{ padding: "32px" }}>{children}</main>
        </div>
    );
}
