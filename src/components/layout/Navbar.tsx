"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)
    const [hidden, setHidden] = useState(false)
    const lastScrollY = useRef(0)

    const navLinks = [
        { href: "/insights", label: "Insights" },
        { href: "/events", label: "Events" },
        { href: "/about", label: "About" },
    ]

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

    return (
        <header
            className={cn(
                "fixed top-[10px] left-0 right-0 z-50 flex justify-center transition-all duration-500",
                hidden && "translate-y-[-80px] opacity-0"
            )}
        >
            <div
                className={cn(
                    "w-[80%] h-16 rounded-full border shadow-lg flex items-center justify-between px-6 max-w-7xl mx-auto transition-all duration-500",
                    scrolled
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
                    <span className="text-text-primary">First Principles <span className="text-gold">Investing</span></span>
                </Link>

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
            </div>
        </header>
    )
}

