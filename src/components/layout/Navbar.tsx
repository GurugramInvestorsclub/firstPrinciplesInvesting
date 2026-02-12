import Link from "next/link"
import Image from "next/image"
import { ModeToggle } from "@/components/ui/mode-toggle"

export function Navbar() {
    return (
        <header className="fixed top-2.5 left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-5xl z-50 rounded-full border border-border/40 bg-background/60 backdrop-blur-xl shadow-sm supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-6 w-full">
                <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px]">FP</span>
                    <span>First Principles Investing</span>
                </Link>

                <nav className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/insights" className="hover:text-primary transition-colors">Insights</Link>
                        <Link href="/events" className="hover:text-primary transition-colors">Events</Link>
                        <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <ModeToggle />
                    </div>
                </nav>
            </div>
        </header>
    )
}
