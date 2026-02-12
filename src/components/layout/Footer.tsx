import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background text-sm">
            <div className="container max-w-5xl px-4 md:px-8 mx-auto py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-xl font-bold tracking-tight text-foreground">First Principles Investing</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Investing through structural thinking and business fundamentals.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Platform</h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li><Link href="/insights" className="hover:text-primary transition-colors">Insights</Link></li>
                            <li><Link href="/events" className="hover:text-primary transition-colors">Events</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Company</h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border/40 text-center text-muted-foreground">
                    &copy; {new Date().getFullYear()} First Principles Investing. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
