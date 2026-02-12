import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
    return (
        <section className="relative w-full py-32 md:py-48 lg:py-60 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
            {/* Deep Grid Background */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

            {/* Radial Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[100px] rounded-full opacity-50 pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full opacity-30 pointer-events-none -z-10"></div>

            <div className="space-y-10 max-w-5xl mx-auto z-10">
                {/* Pill Badge */}
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary backdrop-blur-md shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] hover:bg-primary/10 transition-colors cursor-default">
                    <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
                    <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent font-semibold">
                        Intelligent Compounding
                    </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent leading-[1.1] drop-shadow-sm">
                    Unleash the power of <br className="hidden md:block" />
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Structural Thinking</span>
                </h1>

                {/* Subtext */}
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                    Strip away noise. Think clearly. Compound intelligently. <br className="hidden md:inline" />
                    The first principles platform for the modern investor.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                    <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg font-semibold shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)] transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground border-none">
                        <Link href="/insights">
                            Start Reading <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg font-medium border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all hover:border-white/20 text-white">
                        <Link href="/events">
                            Upcoming Events
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
