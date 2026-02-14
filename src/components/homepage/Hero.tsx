import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
    return (
        <section className="relative w-full py-24 md:py-32 lg:py-48 flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-bg-deep">
            {/* Subtle Grid & Noise Background */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#2E2E2E_1px,transparent_1px),linear-gradient(to_bottom,#2E2E2E_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.07]"></div>
            <div className="absolute inset-0 -z-10 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>

            {/* Soft Glow Gradient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <div className="space-y-8 max-w-5xl mx-auto z-10 relative">
                {/* Pill Badge */}
                <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 cursor-default
                    bg-bg-primary/50 backdrop-blur-sm border border-text-secondary/20 text-gold shadow-sm hover:border-gold/40 hover:shadow-[0_0_15px_rgba(245,184,0,0.1)] animate-fade-in opacity-0">
                    <Sparkles className="w-3.5 h-3.5 mr-2 text-gold animate-pulse" />
                    <span className="font-semibold tracking-wider uppercase text-[10px] md:text-xs">
                        Intelligent Compounding
                    </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-text-primary leading-[1.05] drop-shadow-sm animate-fade-in-up delay-100 opacity-0">
                    Invest with Conviction. <br className="hidden md:block" />
                    <span className="text-gold inline-block">Built on First Principles.</span>
                </h1>

                {/* Subtext */}
                <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-normal animate-fade-in-up delay-200 opacity-0 relative">
                    Master the art of business analysis. Eliminate noise. Make decisions based on fundamental truths, not market sentiment.
                </p>

                {/* Credibility Micro-Line */}
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs md:text-sm text-text-secondary/60 animate-fade-in-up delay-300 opacity-0">
                    <span>Deep research notes</span>
                    <span className="w-1 h-1 rounded-full bg-gold/40"></span>
                    <span>Structured workshops</span>
                    <span className="w-1 h-1 rounded-full bg-gold/40"></span>
                    <span>Framework-driven</span>
                </div>

                {/* CTAs */}
                <div className="flex flex-col items-center gap-3 pt-6 animate-fade-in-up delay-300 opacity-0">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
                        <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg font-semibold bg-gold hover:bg-gold text-bg-deep border-none transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(245,184,0,0.3)] shadow-[0_0_15px_rgba(245,184,0,0.1)] group">
                            <Link href="/events">
                                Signup for our next Event
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg font-medium border-text-secondary/30 text-text-primary bg-transparent hover:bg-white/5 hover:border-text-secondary/60 transition-all duration-300">
                            <Link href="/insights">
                                Read Our Insights
                            </Link>
                        </Button>
                    </div>
                    {/* Microcopy */}
                    <p className="text-[10px] uppercase tracking-widest text-text-secondary/50 font-medium">
                        Limited Seats • Structured Session
                    </p>
                </div>
            </div>
        </section>
    )
}
