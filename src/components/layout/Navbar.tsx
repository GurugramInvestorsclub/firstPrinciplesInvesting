import Link from "next/link"
import { ModeToggle } from "@/components/ui/mode-toggle"

export function Navbar() {
    return (
        <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-5xl mx-auto">
                <Link href="/" className="font-bold text-xl tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white text-xs">FP</span>
                    <span>First Principles Investing</span>
                </Link>

                <nav className="flex items-center gap-6 md:gap-8">
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <Link href="/insights" className="hover:text-primary transition-colors">Insights</Link>
                        <Link href="/events" className="hover:text-primary transition-colors">Events</Link>
                        <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <ModeToggle />
                    </div>
                </nav>
            </div>
        </header>
    )
}
