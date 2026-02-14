import { Brain, Layers, TrendingUp, CheckCircle2 } from "lucide-react"

const philosophies = [
    {
        icon: Brain,
        title: "Independent Analysis",
        description:
            "Consensus is priced in. Outperformance requires a divergent view that happens to be right. We build conviction from raw data up, avoiding the echo chamber of market sentiment.",
        className: "md:col-span-1",
    },
    {
        icon: Layers,
        title: "Valuation Discipline",
        description:
            "A great business at a bad price is a bad investment. We demand a margin of safety that protects against the unknown, focusing on free cash flow yield over narrative.",
        className: "md:col-span-1",
    },
    {
        icon: TrendingUp,
        title: "Long-Term Horizon",
        description:
            "Time is the arbitrage. While the market chases quarterly beats, we position for multi-year structural compounding, allowing the business fundamentals to do the heavy lifting.",
        className: "md:col-span-1",
    },
]

export function Philosophy() {
    return (
        <section className="py-24 md:py-32 bg-bg-deep relative overflow-hidden text-text-primary border-t border-white/5">
            <div className="container max-w-6xl px-4 mx-auto relative z-10">
                {/* Header Area - Increased Spacing & Clarity */}
                <div className="text-center mb-20 md:mb-28">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-text-primary">
                        The Framework
                    </h2>
                    <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed font-light">
                        Markets are noisy. Evaluation is quiet. <br className="hidden md:block" />
                        We allocate capital based on <span className="text-gold font-medium">structural reality</span>, not narrative.
                    </p>
                </div>

                {/* Cards Grid - Reduced Density, Increased Rhythm */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {philosophies.map((item, index) => (
                        <div
                            key={index}
                            className={`group relative p-10 rounded-3xl border transition-all duration-500 flex flex-col justify-start h-full ${item.className}
                                bg-white/[0.02] border-white/5 hover:border-gold/20 hover:bg-white/[0.04]
                            `}
                        >
                            <div className="mb-8">
                                <div className="p-4 bg-white/5 w-fit rounded-xl mb-8 group-hover:bg-gold/10 transition-colors duration-500 border border-white/5 group-hover:border-gold/20">
                                    <item.icon className="h-6 w-6 text-gold/90 group-hover:text-gold transition-colors" />
                                </div>

                                <h3 className="text-2xl font-bold mb-4 text-text-primary tracking-tight">
                                    {item.title}
                                </h3>

                                <p className="text-neutral-300 leading-loose text-lg font-light opacity-90 group-hover:opacity-100 transition-opacity">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Proof Layer - Improved Visibility & Spacing */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-sm text-neutral-400 font-medium uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-gold" />
                        <span>Used by 100+ Serious Investors</span>
                    </div>
                    <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/10"></div>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-gold" />
                        <span>5+ Years of Data</span>
                    </div>
                    <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/10"></div>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-gold" />
                        <span>Institutional Grade</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
