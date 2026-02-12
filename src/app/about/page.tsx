import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-bg-deep text-text-primary selection:bg-gold/20 selection:text-gold">
            <Navbar />
            <main className="flex-1 py-32 px-4 container max-w-3xl mx-auto pt-40">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-text-primary">
                    About First Principles.
                </h1>

                <div className="prose prose-invert prose-lg text-text-secondary leading-relaxed">
                    <p>
                        Welcome to First Principles Investing. We are a platform dedicated to the art of long-term capital compounding through structural analysis and independent thinking.
                    </p>
                    <p>
                        In a world of noise, we seek signal. We do not chase trends, momentum, or the consensus. Instead, we deconstruct businesses to their fundamental truths—their unit economics, their competitive advantages, and the durability of their growth.
                    </p>
                    <p>
                        Our mission is to provide high-quality, in-depth research that respects your intelligence. We write for the serious investor who understands that true wealth is built over decades, not days.
                    </p>

                    <h2 className="text-text-primary mt-12 mb-6 text-2xl font-semibold">Our Values</h2>
                    <ul className="list-disc pl-6 space-y-2 marker:text-gold">
                        <li><strong className="text-text-primary">Intellectual Honesty:</strong> We admit what we don't know.</li>
                        <li><strong className="text-text-primary">Long-Term Orientation:</strong> We think in decades.</li>
                        <li><strong className="text-text-primary">Structural Analysis:</strong> We look for moats, not hype.</li>
                    </ul>
                </div>
            </main>
            <Footer />
        </div>
    )
}
