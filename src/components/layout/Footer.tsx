export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-background text-sm">
            <div className="container max-w-5xl px-4 md:px-8 mx-auto py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-xl font-bold tracking-tight text-foreground">First Principles</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Investing through structural thinking and business fundamentals.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Platform</h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li><a href="/insights" className="hover:text-primary transition-colors">Insights</a></li>
                            <li><a href="/events" className="hover:text-primary transition-colors">Events</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Company</h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 text-center text-muted-foreground bg-clip-text text-transparent bg-gradient-to-b from-white/40 to-white/10">
                    &copy; {new Date().getFullYear()} First Principles Investing. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
