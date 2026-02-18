import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Image from "next/image"

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-bg-deep text-text-primary selection:bg-gold/20 selection:text-gold">
            <Navbar />
            <main className="flex-1">
                {/* Founder Section - Integrated & Authoritative */}
                <section className="pt-40 pb-20 bg-bg-surface/20">
                    <div className="px-4 container max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-start">
                            {/* Image Side */}
                            <div className="order-2 md:order-1 relative group">
                                <div className="rounded-xl overflow-hidden border border-border/40 bg-bg-deep shadow-2xl">
                                    <Image
                                        src="/founder.png"
                                        alt="The Founder - First Principles Investing"
                                        width={600}
                                        height={800}
                                        className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-90 group-hover:opacity-100"
                                    />
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="order-1 md:order-2 space-y-8 pt-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-text-primary mb-2">The Founder's Journey</h2>
                                    <p className="text-gold font-medium uppercase tracking-wider text-sm">From Engineering to Equity</p>
                                </div>

                                <div className="prose prose-invert prose-lg text-text-secondary leading-relaxed">
                                    <p>
                                        In 2014, at 22, I bought my first stock Cairn India while managing an educational loan from my Aerospace Engineering degree in the UK.
                                    </p>
                                    <p>
                                        My real education began under a mentor with 20+ years of experience. Together, we built one of India's largest financial literacy programs, training over <span className="text-text-primary font-semibold">500,000+ investors</span>, including personnel from the BSF and state police forces.
                                    </p>
                                    <p>
                                        By October 2021, at 29, I achieved <span className="text-text-primary font-semibold">financial independence</span> through disciplined SIPs and strategic structural betting.
                                    </p>
                                </div>

                                <div className="pt-8 border-t border-border/20">
                                    <ul className="space-y-4 text-sm text-text-secondary/80">
                                        <li className="flex items-center gap-3">
                                            <div className="h-px w-4 bg-gold"></div>
                                            Contributor to <span className="text-text-primary">The Indian Express</span> and <span className="text-text-primary">Mint</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="h-px w-4 bg-gold"></div>
                                            Early member of a <span className="text-text-primary">50-year-old family office</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Closing Mission */}
                <section className="py-24 px-4 container max-w-3xl mx-auto text-center">
                    <p className="text-2xl font-serif italic text-text-primary leading-relaxed opacity-90">
                        "I've walked this path myself now I help others do the same."
                    </p>
                </section>

            </main>
            <Footer />
        </div>
    )
}
