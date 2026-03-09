"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const json = await res.json();

            if (!json.success) {
                setError(json.message || "Invalid password");
                return;
            }

            // Force a full page reload to clear router cache and ensure middleware re-evaluates auth cookie
            window.location.href = "/admin/registrations";
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg-deep)",
                fontFamily:
                    'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
        >
            <form
                onSubmit={handleSubmit}
                style={{
                    width: "100%",
                    maxWidth: "380px",
                    padding: "40px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(107,107,107,0.2)",
                    borderRadius: "16px",
                    backdropFilter: "blur(12px)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h1
                        style={{
                            fontSize: "22px",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.03em",
                            margin: 0,
                        }}
                    >
                        Admin Login
                    </h1>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "var(--text-secondary)",
                            marginTop: "8px",
                        }}
                    >
                        Enter your password to continue
                    </p>
                </div>

                {error && (
                    <div
                        style={{
                            padding: "12px 16px",
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            borderRadius: "8px",
                            color: "#f87171",
                            fontSize: "13px",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        {error}
                    </div>
                )}

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(107,107,107,0.2)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                        outline: "none",
                        transition: "border-color 0.2s",
                        marginBottom: "16px",
                        boxSizing: "border-box",
                    }}
                    onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                        "var(--gold)")
                    }
                    onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                        "rgba(107,107,107,0.2)")
                    }
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: loading
                            ? "var(--gold-muted)"
                            : "linear-gradient(135deg, var(--gold), var(--gold-muted))",
                        color: "#1A1A1A",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        boxShadow: "0 2px 8px rgba(245,184,0,0.25)",
                    }}
                >
                    {loading ? "Logging in…" : "Login"}
                </button>
            </form>
        </div>
    );
}
