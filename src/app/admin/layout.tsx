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
                background: "var(--bg-deep)",
                color: "var(--text-primary)",
                fontFamily:
                    'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
        >
            <header
                style={{
                    borderBottom: "1px solid rgba(107, 107, 107, 0.2)",
                    padding: "16px 32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(26, 26, 26, 0.95)",
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
                            color: "var(--text-primary)",
                        }}
                    >
                        FPI Admin
                    </span>
                    <span
                        style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: "rgba(245, 184, 0, 0.15)",
                            color: "var(--gold)",
                            fontWeight: 600,
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
