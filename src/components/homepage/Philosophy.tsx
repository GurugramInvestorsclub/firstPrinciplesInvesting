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
        <section className="py-24 md:py-32 bg-bg-primary relative overflow-hidden text-text-primary border-t border-text-secondary/10">
            <div className="container max-w-5xl px-4 mx-auto relative z-10">
                <div className="text-center mb-16 md:mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-text-primary drop-shadow-sm">
                        The Framework
                    </h2>
                    <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-normal">
                        Markets are noisy. Evaluation is quiet. We allocate capital based on structural reality, not narrative.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {philosophies.map((item, index) => (
                        <div
                            key={index}
                            className={`group relative p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-start h-full ${item.className}
                                bg-bg-deep border-text-secondary/10 hover:border-gold/20 hover:shadow-[0_0_30px_rgba(245,184,0,0.05)]
                            `}
                        >
                            <div className="mb-6">
                                <div className="p-3 bg-white/5 w-fit rounded-lg mb-6 group-hover:bg-gold/10 transition-colors duration-300">
                                    <item.icon className="h-6 w-6 text-gold/80 group-hover:text-gold transition-colors" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-text-primary tracking-wide">{item.title}</h3>
                                <p className="text-text-secondary/80 leading-relaxed text-base">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Proof Layer */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm text-text-secondary/50 font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gold/60" />
                        <span>Used by 100+ Serious Investors</span>
                    </div>
                    <div className="hidden md:block w-1 h-1 rounded-full bg-text-secondary/20"></div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gold/60" />
                        <span>5+ Years of Data</span>
                    </div>
                    <div className="hidden md:block w-1 h-1 rounded-full bg-text-secondary/20"></div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gold/60" />
                        <span>Institutional Grade</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
