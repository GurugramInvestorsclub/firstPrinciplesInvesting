import Link from "next/link"
import Image from "next/image"

export function Footer() {
    return (
        <footer className="border-t border-gold bg-bg-deep text-sm">
            <div className="container max-w-5xl px-4 md:px-8 mx-auto py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-2 space-y-4">
                        <Link href="/" className="inline-block">
                            <div className="flex items-center gap-2">
                                <div className="relative w-8 h-8">
                                    <Image
                                        src="/logo.png"
                                        alt="FPI Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-text-primary">First Principles <span className="text-gold">Investing</span></span>
                            </div>
                        </Link>
                        <p className="text-text-secondary max-w-sm">
                            Investing through structural thinking and business fundamentals.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-text-primary">Platform</h4>
                        <ul className="space-y-2 text-text-secondary">
                            <li><Link href="/insights" className="hover:text-gold transition-colors">Insights</Link></li>
                            <li><Link href="/events" className="hover:text-gold transition-colors">Events</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-text-primary">Company</h4>
                        <ul className="space-y-2 text-text-secondary">
                            <li><Link href="/about" className="hover:text-gold transition-colors">About</Link></li>
                            <li><Link href="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
                            <li><Link href="/privacy" className="hover:text-gold transition-colors">Privacy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-text-secondary/20 text-center text-text-secondary">
                    &copy; {new Date().getFullYear()} First Principles Investing. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
