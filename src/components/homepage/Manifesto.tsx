const paragraphs = [
    {
        intro: "Tactics expire. Frameworks endure.",
        text: "We teach investors to see businesses as systems : to understand competitive moats, capital allocation logic, and the incentive structures that drive long-term outcomes."
    },
    {
        intro: "",
        text: "This is not about hot stock tips or quarterly earnings reactions. It is about building the analytical infrastructure to make decisions you can hold for years."
    },
    {
        intro: "",
        text: "Clarity in investing begins with clarity in thinking."
    }
]

export function Manifesto() {
    // Split the headline into individually wrapped words
    const headlineText = "We focus on foundations."
    const headlineWords = headlineText.split(" ")

    return (
        <section
            className="relative py-28 md:py-40 bg-bg-deep overflow-hidden border-t border-white/5"
        >
            {/* Subtle grain */}
            <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: "repeat" }}
                aria-hidden="true"
            />

            <div className="container max-w-4xl px-6 md:px-12 mx-auto relative z-10">
                {/* Muted lead-in */}
                <p className="text-sm md:text-base text-gray-400 tracking-wide mb-6 uppercase font-medium"
                    style={{ letterSpacing: "0.08em" }}
                >
                    Most investing education focuses on tactics.
                </p>

                {/* Large serif headline */}
                <div className="mb-12 md:mb-16">
                    <h2
                        className="text-3xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        {headlineWords.map((word, i) => (
                            <span
                                key={i}
                                className={`word inline-block mr-[0.3em] ${word === "foundations." ? "text-gold font-bold" : "text-white"
                                    }`}
                            >
                                {word}
                            </span>
                        ))}
                    </h2>
                </div>

                {/* Sharp paragraphs */}
                <div className="space-y-8 max-w-prose">
                    {paragraphs.map((p, i) => (
                        <p
                            key={i}
                            className="manifesto-para text-base md:text-lg text-gray-300 leading-[1.7]"
                        >
                            {p.intro && (
                                <span className="block text-xl font-medium text-white mb-2">
                                    {p.intro}
                                </span>
                            )}
                            {p.text}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    )
}
