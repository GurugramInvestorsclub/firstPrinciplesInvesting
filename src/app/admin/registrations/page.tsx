"use client";

import { useEffect, useState, useCallback } from "react";

interface Registration {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    seminarSlug: string;
    paymentStatus: string;
    createdAt: string;
}

export default function AdminRegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [emailSearch, setEmailSearch] = useState("");
    const [seminarFilter, setSeminarFilter] = useState("");
    const [seminars, setSeminars] = useState<string[]>([]);

    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (seminarFilter) params.set("seminar", seminarFilter);
            if (emailSearch.trim()) params.set("email", emailSearch.trim());

            const qs = params.toString();
            const res = await fetch(`/api/admin/registrations${qs ? `?${qs}` : ""}`);
            const json = await res.json();

            if (!json.success) throw new Error(json.error || "Failed to load");

            setRegistrations(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, [seminarFilter, emailSearch]);

    // Initial load: fetch all registrations to extract seminar slugs
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/admin/registrations");
                const json = await res.json();
                if (json.success) {
                    const slugs = [
                        ...new Set(
                            json.data.map((r: Registration) => r.seminarSlug)
                        ),
                    ] as string[];
                    setSeminars(slugs.sort());
                }
            } catch {
                // ignore — we'll still be able to show the table
            }
        })();
    }, []);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    const handleExport = () => {
        const a = document.createElement("a");
        a.href = "/api/admin/export-emails";
        a.download = "registrations.csv";
        a.click();
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const statusColor = (status: string) => {
        switch (status) {
            case "paid":
                return { bg: "rgba(34,197,94,0.12)", color: "#4ade80" };
            case "pending":
                return { bg: "rgba(250,204,21,0.12)", color: "#facc15" };
            case "failed":
                return { bg: "rgba(239,68,68,0.12)", color: "#f87171" };
            default:
                return { bg: "rgba(161,161,170,0.1)", color: "#a1a1aa" };
        }
    };

    return (
        <div>
            {/* Page header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "28px",
                    flexWrap: "wrap",
                    gap: "16px",
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: "24px",
                            fontWeight: 700,
                            letterSpacing: "-0.03em",
                            color: "#fafafa",
                            margin: 0,
                        }}
                    >
                        Registrations
                    </h1>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "#71717a",
                            marginTop: "4px",
                        }}
                    >
                        {loading
                            ? "Loading…"
                            : `${registrations.length} registration${registrations.length !== 1 ? "s" : ""}`}
                    </p>
                </div>

                <button
                    onClick={handleExport}
                    style={{
                        padding: "10px 20px",
                        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        letterSpacing: "0.02em",
                        transition: "all 0.2s",
                        boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-1px)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                    }
                >
                    ↓ Export CSV
                </button>
            </div>

            {/* Filters */}
            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                }}
            >
                <input
                    type="text"
                    placeholder="Search by email…"
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                    style={{
                        padding: "10px 16px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        color: "#e4e4e7",
                        fontSize: "14px",
                        minWidth: "260px",
                        outline: "none",
                        transition: "border-color 0.2s",
                    }}
                    onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)")
                    }
                    onBlur={(e) =>
                        (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
                    }
                />

                <select
                    value={seminarFilter}
                    onChange={(e) => setSeminarFilter(e.target.value)}
                    style={{
                        padding: "10px 16px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        color: "#e4e4e7",
                        fontSize: "14px",
                        cursor: "pointer",
                        outline: "none",
                        minWidth: "200px",
                    }}
                >
                    <option value="">All seminars</option>
                    {seminars.map((slug) => (
                        <option key={slug} value={slug}>
                            {slug}
                        </option>
                    ))}
                </select>
            </div>

            {/* Error */}
            {error && (
                <div
                    style={{
                        padding: "14px 20px",
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: "8px",
                        color: "#f87171",
                        marginBottom: "20px",
                        fontSize: "14px",
                    }}
                >
                    {error}
                </div>
            )}

            {/* Table */}
            <div
                style={{
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.02)",
                }}
            >
                <div style={{ overflowX: "auto" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "14px",
                        }}
                    >
                        <thead>
                            <tr
                                style={{
                                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                                    background: "rgba(255,255,255,0.03)",
                                }}
                            >
                                {[
                                    "Name",
                                    "Email",
                                    "Phone",
                                    "Seminar",
                                    "Status",
                                    "Date",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            textAlign: "left",
                                            padding: "12px 16px",
                                            fontWeight: 600,
                                            fontSize: "11px",
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                            color: "#71717a",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        style={{
                                            textAlign: "center",
                                            padding: "48px 16px",
                                            color: "#71717a",
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: "inline-block",
                                                animation: "pulse 1.5s ease-in-out infinite",
                                            }}
                                        >
                                            Loading registrations…
                                        </span>
                                    </td>
                                </tr>
                            ) : registrations.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        style={{
                                            textAlign: "center",
                                            padding: "48px 16px",
                                            color: "#52525b",
                                        }}
                                    >
                                        No registrations found
                                    </td>
                                </tr>
                            ) : (
                                registrations.map((reg) => {
                                    const sc = statusColor(reg.paymentStatus);
                                    return (
                                        <tr
                                            key={reg.id}
                                            style={{
                                                borderBottom:
                                                    "1px solid rgba(255,255,255,0.04)",
                                                transition: "background 0.15s",
                                            }}
                                            onMouseEnter={(e) =>
                                            (e.currentTarget.style.background =
                                                "rgba(255,255,255,0.03)")
                                            }
                                            onMouseLeave={(e) =>
                                            (e.currentTarget.style.background =
                                                "transparent")
                                            }
                                        >
                                            <td
                                                style={{
                                                    padding: "14px 16px",
                                                    fontWeight: 500,
                                                    color: "#fafafa",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {reg.name}
                                            </td>
                                            <td
                                                style={{
                                                    padding: "14px 16px",
                                                    color: "#a1a1aa",
                                                }}
                                            >
                                                {reg.email}
                                            </td>
                                            <td
                                                style={{
                                                    padding: "14px 16px",
                                                    color: "#a1a1aa",
                                                    fontFamily:
                                                        "var(--font-geist-mono), monospace",
                                                    fontSize: "13px",
                                                }}
                                            >
                                                {reg.phone || "—"}
                                            </td>
                                            <td
                                                style={{
                                                    padding: "14px 16px",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        padding: "3px 10px",
                                                        borderRadius: "4px",
                                                        background:
                                                            "rgba(99,102,241,0.1)",
                                                        color: "#a5b4fc",
                                                        fontSize: "12px",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {reg.seminarSlug}
                                                </span>
                                            </td>
                                            <td
                                                style={{
                                                    padding: "14px 16px",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        padding: "3px 10px",
                                                        borderRadius: "4px",
                                                        background: sc.bg,
                                                        color: sc.color,
                                                        fontSize: "12px",
                                                        fontWeight: 600,
                                                        textTransform:
                                                            "capitalize",
                                                    }}
                                                >
                                                    {reg.paymentStatus}
                                                </span>
                                            </td>
                                            <td
                                                style={{
                                                    padding: "14px 16px",
                                                    color: "#71717a",
                                                    fontSize: "13px",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {formatDate(reg.createdAt)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
