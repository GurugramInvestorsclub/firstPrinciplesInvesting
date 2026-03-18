"use client";

import { useEffect, useState, useCallback } from "react";

interface UserData {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: string;
    loginMethod: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [emailSearch, setEmailSearch] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (emailSearch.trim()) params.set("email", emailSearch.trim());

            const qs = params.toString();
            const res = await fetch(`/api/admin/users${qs ? `?${qs}` : ""}`);
            const json = await res.json();

            if (!json.success) throw new Error(json.error || "Failed to load");

            setUsers(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, [emailSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleDelete = async (id: string, email: string | null) => {
        if (!window.confirm(`Are you sure you want to delete user ${email || id}? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "DELETE",
            });
            const json = await res.json();

            if (!json.success) throw new Error(json.error || "Failed to delete");

            // Refresh the list
            fetchUsers();
        } catch (err) {
            alert(err instanceof Error ? err.message : String(err));
        } finally {
            setDeletingId(null);
        }
    };

    const handleExport = () => {
        const a = document.createElement("a");
        a.href = "/api/admin/users/export";
        a.download = "users.csv";
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
                            color: "var(--text-primary)",
                            margin: 0,
                        }}
                    >
                        Registered Users
                    </h1>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "var(--text-secondary)",
                            marginTop: "4px",
                        }}
                    >
                        {loading
                            ? "Loading…"
                            : `${users.length} user${users.length !== 1 ? "s" : ""} joined via Auth.js`}
                    </p>
                </div>

                 <button
                    onClick={handleExport}
                    style={{
                        padding: "10px 20px",
                        background: "linear-gradient(135deg, var(--gold), var(--gold-muted))",
                        color: "#1A1A1A",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        letterSpacing: "0.02em",
                        transition: "all 0.2s",
                        boxShadow: "0 2px 8px rgba(245,184,0,0.25)",
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
                        border: "1px solid rgba(107,107,107,0.2)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                        minWidth: "300px",
                        outline: "none",
                        transition: "border-color 0.2s",
                    }}
                    onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "var(--gold)")
                    }
                    onBlur={(e) =>
                        (e.currentTarget.style.borderColor = "rgba(107,107,107,0.2)")
                    }
                />
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
                    border: "1px solid rgba(107,107,107,0.2)",
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
                                    borderBottom: "1px solid rgba(107,107,107,0.2)",
                                    background: "rgba(255,255,255,0.03)",
                                }}
                            >
                                {[
                                    "Name",
                                    "Email",
                                    "Login Method",
                                    "Date Joined",
                                    "Actions",
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
                                            color: "var(--text-secondary)",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        style={{
                                            textAlign: "center",
                                            padding: "48px 16px",
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: "inline-block",
                                                animation: "pulse 1.5s ease-in-out infinite",
                                            }}
                                        >
                                            Loading users…
                                        </span>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        style={{
                                            textAlign: "center",
                                            padding: "48px 16px",
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    return (
                                        <tr
                                            key={user.id}
                                            style={{
                                                borderBottom:
                                                    "1px solid rgba(107,107,107,0.1)",
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
                                                    color: "var(--text-primary)",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    {user.image && (
                                                        <img src={user.image} alt="" style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
                                                    )}
                                                    {user.name || "N/A"}
                                                </div>
                                            </td>
                                            <td
                                                style={{
                                                    padding: "14px 16px",
                                                    color: "var(--text-secondary)",
                                                }}
                                            >
                                                {user.email}
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
                                                        background: user.loginMethod === "Google" ? "rgba(66, 133, 244, 0.15)" : "rgba(245, 184, 0, 0.1)",
                                                        color: user.loginMethod === "Google" ? "#4285F4" : "var(--gold)",
                                                        fontSize: "12px",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {user.loginMethod}
                                                </span>
                                            </td>
                                            <td
                                                style={{
                                                    padding: "14px 16px",
                                                    color: "var(--text-secondary)",
                                                    fontSize: "13px",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td
                                                style={{
                                                    padding: "14px 16px",
                                                    textAlign: "right",
                                                }}
                                            >
                                                <button
                                                    onClick={() => handleDelete(user.id, user.email)}
                                                    disabled={deletingId === user.id}
                                                    style={{
                                                        padding: "6px 12px",
                                                        background: "rgba(239, 68, 68, 0.1)",
                                                        color: "#EF4444",
                                                        border: "1px solid rgba(239, 68, 68, 0.2)",
                                                        borderRadius: "6px",
                                                        fontSize: "12px",
                                                        fontWeight: 600,
                                                        cursor: "pointer",
                                                        transition: "all 0.2s",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                                                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                                                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
                                                    }}
                                                >
                                                    {deletingId === user.id ? "Deleting..." : "Delete"}
                                                </button>
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
