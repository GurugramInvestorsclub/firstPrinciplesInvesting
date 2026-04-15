"use client"

import { Suspense, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"

function ResetPasswordContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!token) {
            setError("Missing or invalid token.")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const response = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Something went wrong")
            } else {
                setSuccess(true)
                setTimeout(() => {
                    router.push("/login")
                }, 3000)
            }
        } catch {
            setError("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="text-center p-8 bg-bg-primary/40 backdrop-blur-xl border border-white/10 rounded-3xl">
                <p className="text-destructive mb-6">Invalid or missing reset token.</p>
                <Link href="/login" className="text-gold hover:underline">Return to Login</Link>
            </div>
        )
    }

    if (success) {
        return (
            <div className="text-center p-8 bg-bg-primary/40 backdrop-blur-xl border border-white/10 rounded-3xl">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Password Reset Successful</h2>
                <p className="text-text-secondary mb-6">Your password has been updated. Redirecting to login...</p>
                <Link href="/login" className="text-gold hover:underline font-medium">Go to Login now</Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="password" title="password" className="block text-sm font-medium text-text-secondary mb-2 px-1">
                    New Password
                </label>
                <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                />
            </div>

            <div>
                <label htmlFor="confirmPassword" title="confirm-password" className="block text-sm font-medium text-text-secondary mb-2 px-1">
                    Confirm New Password
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                />
            </div>

            {error && (
                <p className="text-destructive text-sm px-1">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold hover:bg-gold-muted text-bg-deep font-bold py-3 rounded-xl transition-all shadow-lg shadow-gold/10 disabled:opacity-50"
            >
                {loading ? "Updating..." : "Reset Password"}
            </button>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen bg-bg-deep flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10" />

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <Link href="/">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                fill
                                className="object-contain"
                            />
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
                        Set New Password
                    </h1>
                    <p className="text-text-secondary">
                        Almost there! Enter your new password below.
                    </p>
                </div>

                <div className="bg-bg-primary/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                    <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                        <ResetPasswordContent />
                    </Suspense>
                </div>
            </div>
        </main>
    )
}
