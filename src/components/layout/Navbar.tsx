"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

export function Navbar() {
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)
    const [hidden, setHidden] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const lastScrollY = useRef(0)

    const navLinks = [
        { href: "/insights", label: "Insights" },
        { href: "/events", label: "Events" },
        { href: "/about", label: "About" },
    ]

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    useEffect(() => {
        function handleScroll() {
            const currentY = window.scrollY
            const isScrolled = currentY > 50

            setScrolled(isScrolled)

            // Hide when scrolling down past hero, show when scrolling up
            if (currentY > 400) {
                setHidden(currentY > lastScrollY.current)
            } else {
                setHidden(false)
            }

            lastScrollY.current = currentY
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => { document.body.style.overflow = "" }
    }, [mobileOpen])

    return (
        <header
            className={cn(
                "fixed top-[10px] left-0 right-0 z-50 flex flex-col items-center transition-all duration-500",
                hidden && !mobileOpen && "translate-y-[-80px] opacity-0"
            )}
        >
            {/* Main navbar bar */}
            <div
                className={cn(
                    "w-[92%] md:w-[80%] h-14 md:h-16 rounded-full border shadow-lg flex items-center justify-between px-4 md:px-6 max-w-7xl mx-auto transition-all duration-500",
                    scrolled || mobileOpen
                        ? "border-[#2E2E2E] bg-bg-deep/90 backdrop-blur-xl"
                        : "border-white/10 bg-transparent backdrop-blur-sm"
                )}
            >
                <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2">
                    <div className="relative w-10 h-10">
                        <Image
                            src="/logo.png"
                            alt="First Principles Investing Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="text-text-primary hidden sm:inline">First Principles <span className="text-gold">Investing</span></span>
                    <span className="text-text-primary sm:hidden">FP <span className="text-gold">Investing</span></span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-gold",
                                pathname?.startsWith(link.href) ? "text-gold" : "text-text-secondary"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Mobile burger button */}
                <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-text-primary hover:bg-white/10 transition-colors"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile menu panel */}
            <div
                className={cn(
                    "md:hidden w-[92%] max-w-7xl mx-auto overflow-hidden transition-all duration-300 ease-in-out",
                    mobileOpen ? "max-h-[300px] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
                )}
            >
                <nav className="rounded-2xl border border-[#2E2E2E] bg-bg-deep/95 backdrop-blur-xl shadow-2xl py-4 px-6 flex flex-col gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                "text-base font-medium py-3 px-4 rounded-xl transition-all duration-200",
                                pathname?.startsWith(link.href)
                                    ? "text-gold bg-gold/10"
                                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Backdrop overlay when mobile menu is open */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 top-0 bg-black/50 backdrop-blur-sm -z-10"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </header>
    )
}
