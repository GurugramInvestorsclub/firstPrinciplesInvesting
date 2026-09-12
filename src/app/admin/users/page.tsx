"use client";

import { useEffect, useState, useCallback } from "react";
import BrevoSyncModal from "@/components/admin/BrevoSyncModal";

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
    const [showBrevoSyncModal, setShowBrevoSyncModal] = useState(false);

    // Password Reset Modal state
    const [resetUser, setResetUser] = useState<UserData | null>(null);
    const [customPassword, setCustomPassword] = useState("");
    const [sendEmail, setSendEmail] = useState(true);
    const [resetting, setResetting] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);
    const [resetResult, setResetResult] = useState<{ temporaryPassword: string; emailSent: boolean } | null>(null);
    const [copied, setCopied] = useState(false);

    const openResetModal = (user: UserData) => {
        setResetUser(user);
        setCustomPassword("");
        setSendEmail(true);
        setResetError(null);
        setResetResult(null);
        setCopied(false);
    };

    const handleResetPassword = async () => {
        if (!resetUser) return;
        setResetting(true);
        setResetError(null);
        setResetResult(null);

        try {
            const res = await fetch(`/api/admin/users/${resetUser.id}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customPassword: customPassword.trim() || undefined,
                    sendEmail
                })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error || "Failed to reset password");

            setResetResult({
                temporaryPassword: json.temporaryPassword,
                emailSent: json.emailSent
            });
        } catch (err) {
            setResetError(err instanceof Error ? err.message : String(err));
        } finally {
            setResetting(false);
        }
    };

    const handleCopyPassword = (pwd: string) => {
        navigator.clipboard.writeText(pwd);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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

                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                        onClick={() => setShowBrevoSyncModal(true)}
                        style={{
                            padding: "10px 18px",
                            background: "rgba(0, 146, 255, 0.12)",
                            border: "1px solid rgba(0, 146, 255, 0.4)",
                            color: "#60A5FA",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 2px 8px rgba(0, 146, 255, 0.15)",
                        }}
                    >
                        🔄 Sync Brevo CRM List
                    </button>
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
                                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                                                    <button
                                                        onClick={() => openResetModal(user)}
                                                        style={{
                                                            padding: "6px 12px",
                                                            background: "rgba(245, 184, 0, 0.1)",
                                                            color: "var(--gold)",
                                                            border: "1px solid rgba(245, 184, 0, 0.25)",
                                                            borderRadius: "6px",
                                                            fontSize: "12px",
                                                            fontWeight: 600,
                                                            cursor: "pointer",
                                                            transition: "all 0.2s",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = "rgba(245, 184, 0, 0.2)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = "rgba(245, 184, 0, 0.1)";
                                                        }}
                                                    >
                                                        🔑 Reset Password
                                                    </button>
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
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reset Password Modal */}
            {resetUser && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        padding: "16px",
                    }}
                >
                    <div
                        style={{
                            background: "#161616",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: "16px",
                            padding: "28px",
                            maxWidth: "460px",
                            width: "100%",
                            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                        }}
                    >
                        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0", color: "#fff" }}>
                            Reset Password for User
                        </h2>
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", margin: "0 0 20px 0" }}>
                            Target Email: <strong style={{ color: "var(--gold)" }}>{resetUser.email}</strong>
                        </p>

                        {resetError && (
                            <div
                                style={{
                                    padding: "10px 14px",
                                    background: "rgba(239,68,68,0.1)",
                                    border: "1px solid rgba(239,68,68,0.25)",
                                    borderRadius: "8px",
                                    color: "#f87171",
                                    fontSize: "13px",
                                    marginBottom: "16px",
                                }}
                            >
                                {resetError}
                            </div>
                        )}

                        {!resetResult ? (
                            <div>
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#aaa", marginBottom: "6px" }}>
                                        Custom Temporary Password (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Leave blank to auto-generate password"
                                        value={customPassword}
                                        onChange={(e) => setCustomPassword(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            borderRadius: "8px",
                                            color: "#fff",
                                            fontSize: "14px",
                                            outline: "none",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                    <span style={{ fontSize: "11px", color: "#888", marginTop: "4px", display: "block" }}>
                                        If left blank, a random password like <code style={{ color: "var(--gold)" }}>FPI-7X9K2M!</code> will be generated.
                                    </span>
                                </div>

                                <div style={{ marginBottom: "24px" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#ccc", cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            checked={sendEmail}
                                            onChange={(e) => setSendEmail(e.target.checked)}
                                            style={{ accentColor: "var(--gold)" }}
                                        />
                                        Send temporary password email notification to user
                                    </label>
                                </div>

                                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                                    <button
                                        onClick={() => setResetUser(null)}
                                        disabled={resetting}
                                        style={{
                                            padding: "10px 18px",
                                            background: "transparent",
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            borderRadius: "8px",
                                            color: "#ccc",
                                            fontSize: "13px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={resetting}
                                        style={{
                                            padding: "10px 20px",
                                            background: "linear-gradient(135deg, var(--gold), #D49B00)",
                                            border: "none",
                                            borderRadius: "8px",
                                            color: "#111",
                                            fontWeight: 700,
                                            fontSize: "13px",
                                            cursor: "pointer",
                                            boxShadow: "0 2px 10px rgba(245, 184, 0, 0.25)",
                                        }}
                                    >
                                        {resetting ? "Resetting Password…" : "Reset Password"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div
                                    style={{
                                        padding: "14px",
                                        background: "rgba(34,197,94,0.1)",
                                        border: "1px solid rgba(34,197,94,0.25)",
                                        borderRadius: "8px",
                                        color: "#4ade80",
                                        fontSize: "13px",
                                        marginBottom: "16px",
                                        fontWeight: 600,
                                    }}
                                >
                                    ✓ Password updated successfully!
                                </div>

                                <div
                                    style={{
                                        background: "rgba(0,0,0,0.4)",
                                        border: "1px solid rgba(245, 184, 0, 0.3)",
                                        borderRadius: "10px",
                                        padding: "16px",
                                        marginBottom: "16px",
                                        textAlign: "center",
                                    }}
                                >
                                    <div style={{ fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                                        Temporary Password
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "monospace",
                                            fontSize: "20px",
                                            fontWeight: "bold",
                                            color: "var(--gold)",
                                            letterSpacing: "1px",
                                            marginBottom: "12px",
                                            wordBreak: "break-all",
                                        }}
                                    >
                                        {resetResult.temporaryPassword}
                                    </div>
                                    <button
                                        onClick={() => handleCopyPassword(resetResult.temporaryPassword)}
                                        style={{
                                            padding: "8px 16px",
                                            background: copied ? "rgba(34,197,94,0.2)" : "rgba(245,184,0,0.15)",
                                            color: copied ? "#4ade80" : "var(--gold)",
                                            border: `1px solid ${copied ? "#4ade80" : "var(--gold)"}`,
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        {copied ? "✓ Copied to Clipboard!" : "📋 Copy Temporary Password"}
                                    </button>
                                </div>

                                <p style={{ fontSize: "12px", color: "#888", marginBottom: "20px", textAlign: "center" }}>
                                    {resetResult.emailSent
                                        ? "📧 An email with this temporary password has been sent to the user."
                                        : "⚠️ Email notification was skipped or not delivered. Please share the password above with the user directly."}
                                </p>

                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <button
                                        onClick={() => setResetUser(null)}
                                        style={{
                                            padding: "10px 24px",
                                            background: "rgba(255,255,255,0.1)",
                                            border: "none",
                                            borderRadius: "8px",
                                            color: "#fff",
                                            fontWeight: 600,
                                            fontSize: "13px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <BrevoSyncModal
                isOpen={showBrevoSyncModal}
                onClose={() => setShowBrevoSyncModal(false)}
                initialTab="registered_users"
                onSyncComplete={fetchUsers}
            />
        </div>
    );
}

