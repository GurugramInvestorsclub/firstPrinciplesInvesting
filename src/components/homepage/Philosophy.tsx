import { Brain, Layers, TrendingUp } from "lucide-react"

const philosophies = [
    {
        icon: Brain,
        title: "Think For Yourself",
        description:
            "Most investors outsource their thinking to analysts, social media, or the loudest voice in the room. We help you build your own view - grounded in logic, not noise. Come see how at our next event.",
        className: "md:col-span-1",
    },
    {
        icon: Layers,
        title: "Moats are over-rated",
        description:
            "Moats matter — but they're wildly overhyped. A wide moat won't save a bad entry price or a stretched valuation. We teach you to look past the buzzwords and focus on what actually drives returns.",
        className: "md:col-span-1",
    },
    {
        icon: TrendingUp,
        title: "Let Compounding Do the Work",
        description:
            "The Indian retail investor is often sold the idea of quick returns. We believe the real edge is patience — owning decent businesses, bought at value, held long enough for the story to play out.",
        className: "md:col-span-1",
    },
]

export function Philosophy() {
    return (
        <section className="py-24 md:py-32 bg-bg-primary relative overflow-hidden text-text-primary">
            <div className="container max-w-5xl px-4 mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-text-primary">
                        Our Philosophy.
                    </h2>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        We don't have hot tips. We have a simple framework — and we love teaching it.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {philosophies.map((item, index) => (
                        <div
                            key={index}
                            className={`group relative p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${item.className}
                                bg-bg-deep border-text-secondary/20 shadow-sm hover:border-gold/30 hover:shadow-md
                            `}
                        >
                            <div className="mb-6">
                                <div className="p-3 bg-gold/10 w-fit rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <item.icon className="h-8 w-8 text-gold" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-text-primary">{item.title}</h3>
                                <p className="text-text-secondary leading-relaxed text-lg">{item.description}</p>
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <span className="text-sm font-medium text-gold flex items-center gap-1">
                                    Learn more &rarr;
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
