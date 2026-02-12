import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
    return (
        <section className="relative w-full py-32 md:py-48 lg:py-60 flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-bg-deep">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#2E2E2E_1px,transparent_1px),linear-gradient(to_bottom,#2E2E2E_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>

            <div className="space-y-10 max-w-5xl mx-auto z-10">
                {/* Pill Badge */}
                <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 cursor-default
                    bg-bg-primary border border-text-secondary/30 text-gold shadow-sm hover:border-gold/50">
                    <Sparkles className="w-4 h-4 mr-2 text-gold" />
                    <span className="font-semibold tracking-wide uppercase text-xs">
                        Intelligent Compounding
                    </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-primary leading-[1.1] drop-shadow-sm">
                    Learn How to invest from <br className="hidden md:block" />
                    <span className="text-gold">First Principles</span>
                </h1>

                {/* Subtext */}
                <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed font-normal">
                    Join a growing community of independent thinkers learning to analyse businesses from the ground up. No hot tips. No noise. Just clear, structured thinking !
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                    <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg font-semibold bg-gold hover:bg-gold-muted text-bg-deep border-none transition-all duration-300">
                        <Link href="/events">
                            Signup for our next Event <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg font-medium border-gold text-gold bg-transparent hover:bg-gold/10 transition-all">
                        <Link href="/insights">
                            Read Our Insights
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
