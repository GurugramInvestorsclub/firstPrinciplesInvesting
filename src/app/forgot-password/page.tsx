"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [notice, setNotice] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setNotice("")

        try {
            const response = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Something went wrong")
            } else {
                setNotice(data.message)
                setEmail("")
            }
        } catch {
            setError("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

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
                        Forgot Password?
                    </h1>
                    <p className="text-text-secondary">
                        Enter your email and we'll send you a link to reset your password.
                    </p>
                </div>

                <div className="bg-bg-primary/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2 px-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                            />
                        </div>

                        {error && (
                            <p className="text-destructive text-sm px-1">
                                {error}
                            </p>
                        )}
                        {notice && (
                            <p className="text-emerald-400 text-sm px-1">
                                {notice}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gold hover:bg-gold-muted text-bg-deep font-bold py-3 rounded-xl transition-all shadow-lg shadow-gold/10 disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            href="/login"
                            className="text-sm text-text-secondary hover:text-gold transition-colors inline-flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
