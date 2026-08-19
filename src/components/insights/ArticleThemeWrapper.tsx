"use client"

import React, { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

interface ArticleThemeWrapperProps {
    children: React.ReactNode
    className?: string
}

export function ArticleThemeWrapper({ children, className = "" }: ArticleThemeWrapperProps) {
    const [theme, setTheme] = useState<"dark" | "light">("dark")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem("fpi-article-theme") as "dark" | "light" | null
        if (savedTheme === "light" || savedTheme === "dark") {
            setTheme(savedTheme)
        }

        const handleThemeChange = () => {
            const currentTheme = localStorage.getItem("fpi-article-theme") as "dark" | "light" | null
            if (currentTheme) {
                setTheme(currentTheme)
            }
        }

        window.addEventListener("fpi-article-theme-change", handleThemeChange)
        return () => window.removeEventListener("fpi-article-theme-change", handleThemeChange)
    }, [])

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark"
        setTheme(nextTheme)
        localStorage.setItem("fpi-article-theme", nextTheme)
        window.dispatchEvent(new Event("fpi-article-theme-change"))
    }

    if (!mounted) {
        return <div className={`article-theme-dark ${className}`}>{children}</div>
    }

    return (
        <div className={`transition-colors duration-300 ${theme === "light" ? "article-theme-light bg-[#FAF9F6] text-[#0F172A]" : "article-theme-dark bg-bg-deep text-text-primary"} ${className} relative min-h-screen`}>
            {/* Sticky Floating Theme Toggle Button */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                    title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-xl border transition-all duration-300 cursor-pointer group ${
                        theme === "light"
                            ? "bg-white/95 border-slate-300 text-slate-900 hover:bg-slate-100 shadow-slate-400/30"
                            : "bg-[#1E1E1E]/95 border-white/10 text-neutral-200 hover:bg-[#2E2E2E] shadow-black/80"
                    }`}
                >
                    {theme === "dark" ? (
                        <>
                            <Sun className="w-4 h-4 text-gold fill-gold/20" />
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-200 group-hover:text-white">
                                Light Mode
                            </span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-4 h-4 text-amber-600 fill-amber-500/20" />
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 group-hover:text-black">
                                Dark Mode
                            </span>
                        </>
                    )}
                </button>
            </div>

            {children}
        </div>
    )
}

export function ArticleThemeToggleButton() {
    const [theme, setTheme] = useState<"dark" | "light">("dark")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem("fpi-article-theme") as "dark" | "light" | null
        if (savedTheme === "light" || savedTheme === "dark") {
            setTheme(savedTheme)
        }

        const handleThemeChange = () => {
            const currentTheme = localStorage.getItem("fpi-article-theme") as "dark" | "light" | null
            if (currentTheme) {
                setTheme(currentTheme)
            }
        }

        window.addEventListener("fpi-article-theme-change", handleThemeChange)
        return () => window.removeEventListener("fpi-article-theme-change", handleThemeChange)
    }, [])

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark"
        setTheme(nextTheme)
        localStorage.setItem("fpi-article-theme", nextTheme)
        window.dispatchEvent(new Event("fpi-article-theme-change"))
    }

    if (!mounted) return null

    return (
        <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all border cursor-pointer ${
                theme === "light"
                    ? "bg-slate-200/80 border-slate-300 text-slate-800 hover:bg-slate-300/80"
                    : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
            }`}
        >
            {theme === "dark" ? (
                <>
                    <Sun className="w-3.5 h-3.5 text-gold" />
                    <span>LIGHT MODE</span>
                </>
            ) : (
                <>
                    <Moon className="w-3.5 h-3.5 text-amber-600" />
                    <span>DARK MODE</span>
                </>
            )}
        </button>
    )
}
