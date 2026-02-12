"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navbar() {
    const pathname = usePathname()

    const navLinks = [
        { href: "/insights", label: "Insights" },
        { href: "/events", label: "Events" },
        { href: "/about", label: "About" },
    ]

    return (
        <header className="fixed top-[10px] left-0 right-0 z-50 flex justify-center">
            <div className="w-[80%] h-16 rounded-full border border-[#2E2E2E] bg-bg-deep/80 backdrop-blur-md shadow-lg flex items-center justify-between px-6 max-w-7xl mx-auto">
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
