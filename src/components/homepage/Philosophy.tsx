import { Brain, Layers, TrendingUp } from "lucide-react"

const philosophies = [
    {
        icon: Brain,
        title: "Independent Thinking",
        description:
            "We reject consensus for the sake of consensus. True value is found in divergent, correct views derived from first principles analysis.",
        className: "md:col-span-2",
    },
    {
        icon: Layers,
        title: "Structural Moats",
        description:
            "We look for durable competitive advantages. Businesses that are structurally interconnected with their customers' success.",
        className: "md:col-span-1",
    },
    {
        icon: TrendingUp,
        title: "Long-Term Compounding",
        description:
            "The most powerful force in investing. We focus on businesses effectively deploying capital at high rates of return over decades.",
        className: "md:col-span-3",
    },
]

export function Philosophy() {
    return (
        <section className="py-24 md:py-32 bg-background relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="container max-w-5xl px-4 mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                        Our Philosophy.
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        We don't chase trends. We adhere to a rigid framework of quality and durability.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {philosophies.map((item, index) => (
                        <div
                            key={index}
                            className={`group relative p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.15)] flex flex-col justify-between ${item.className}`}
                        >
                            <div className="mb-6">
                                <div className="p-3 bg-primary/10 w-fit rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <item.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-foreground">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-lg">{item.description}</p>
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <span className="text-sm font-medium text-primary">Learn more &rarr;</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
