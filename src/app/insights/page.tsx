import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { postQuery, featuredPostQuery, allPostsQuery } from "@/lib/sanity.queries"
import { Post } from "@/lib/types"
import { InsightCard } from "@/components/cards/InsightCard"
import { SearchInput } from "@/components/ui/search-input"
import { InsightsAnimations } from "@/components/insights/InsightsAnimations"
import { ProcessScrollSection } from "@/components/insights/ProcessScrollSection"
import { getInsightsSubscriptionUiState, userHasInsightsAccess } from "@/lib/insights-subscription-service"
import { InsightsSubscriptionCheckout } from "@/components/insights/InsightsSubscriptionCheckout"
import { auth } from "@/auth"
import Link from "next/link"

// Set revalidate to 0 for instant updates (dynamic rendering)
export const revalidate = 0

export default async function InsightsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const { search } = await searchParams

    let gridPosts: Post[] = []
    let searchResults: Post[] = []
    const subscriptionUi = getInsightsSubscriptionUiState()
    const paywallReady =
        subscriptionUi.enabled && subscriptionUi.checkoutReady && subscriptionUi.webhookReady
    const session = await auth()
    const hasSubscriptionAccess =
        paywallReady && session?.user?.id
            ? await userHasInsightsAccess(session.user.id)
            : false

    if (search) {
        searchResults = await client.fetch<Post[]>(postQuery, { search })
        gridPosts = searchResults
    } else {
        const [explicitFeatured, allPosts] = await Promise.all([
            client.fetch<Post | null>(featuredPostQuery),
            client.fetch<Post[]>(allPostsQuery)
        ])
        gridPosts = allPosts
    }

    const premiumPosts = gridPosts.filter((p) => p.access === "subscriber")
    const publicPosts = gridPosts.filter((p) => p.access !== "subscriber")

    return (
        <div className="flex flex-col min-h-screen insights-page font-sans">
            <Navbar />

            <main className="flex-1 w-full overflow-hidden">
                <InsightsAnimations>

                    {/* SECTION 1 — HERO */}
                    <section className="container max-w-7xl mx-auto px-6 pt-32 pb-24 md:pt-48 md:pb-32 min-h-[90vh] flex flex-col justify-center">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="space-y-10">
                                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-heading font-bold tracking-tighter leading-[1.05]" style={{ color: "var(--insights-text)" }}>
                                    Research for investors who want understanding, <span style={{ color: "var(--insights-accent)" }} className="italic">not tips.</span>
                                </h1>
                                <p className="text-lg md:text-xl max-w-lg leading-relaxed" style={{ color: "var(--insights-text-muted)" }}>
                                    Deep investment memos, industry research, capital allocation analysis, and first-principles thinking.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link href="#membership" className="inline-flex items-center justify-center rounded-sm px-8 py-4 font-bold tracking-wide transition-colors duration-300" style={{ backgroundColor: "var(--insights-accent)", color: "#080810" }}>
                                        Become a Member
                                    </Link>
                                    <Link href="#free-research" className="inline-flex items-center justify-center rounded-sm border border-white/20 bg-transparent px-8 py-4 font-medium transition-colors duration-300 hover:bg-white/5" style={{ color: "var(--insights-text)" }}>
                                        Read Free Research
                                    </Link>
                                </div>
                            </div>
                            {/* Editorial Collage Mockup */}
                            <div className="relative h-[500px] w-full hidden md:block">
                                {/* Back card */}
                                <div className="absolute top-10 right-10 w-[80%] h-[70%] bg-bg-primary border border-border rounded-sm shadow-2xl overflow-hidden opacity-40">
                                    <img src="/images/annual_report.png" className="w-full h-full object-cover mix-blend-luminosity" alt="Annual Report" />
                                </div>
                                {/* Front card */}
                                <div className="absolute bottom-10 left-10 w-[75%] h-[65%] bg-bg-deep border border-gold/20 rounded-sm shadow-2xl overflow-hidden z-10">
                                    <img src="/images/valuation_model.png" className="w-full h-full object-cover mix-blend-luminosity opacity-80" alt="Valuation Model" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SEARCH BLOCK */}
                    <div className="container max-w-7xl mx-auto px-6 mb-12">
                        <div className="flex justify-end border-b border-white/10 pb-6">
                            <SearchInput className="w-full md:w-[400px] bg-transparent border-white/20" />
                        </div>
                        {search && (
                            <div className="mt-8 mb-12">
                                <h2 className="text-2xl font-heading font-bold mb-4" style={{ color: "var(--insights-text)" }}>Search Results</h2>
                                <div className="text-base" style={{ color: "var(--insights-text-muted)" }}>
                                    {postsSummary(gridPosts.length, search)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FEATURED INSIGHTS (FREE) */}
                    <section id="free-research" className="container max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
                        <div className="mb-16">
                            <span className="text-[11px] font-mono uppercase tracking-[0.2em] mb-4 block" style={{ color: "var(--insights-text-muted)" }}>Public Archive</span>
                            <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight" style={{ color: "var(--insights-text)" }}>Featured Insights</h2>
                        </div>
                        {publicPosts.length > 0 ? (
                            <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                                {publicPosts.map((post) => (
                                    <InsightCard key={post.slug.current} post={post} showSubscriberBadge={paywallReady} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center border border-white/10 rounded-sm">
                                <p className="text-lg" style={{ color: "var(--insights-text-muted)" }}>No public memos found.</p>
                            </div>
                        )}
                    </section>

                    {/* SECTION 2 — PHILOSOPHY */}
                    <section className="py-32 border-y border-white/5" style={{ backgroundColor: "var(--bg-primary)" }}>
                        <div className="container max-w-5xl mx-auto px-6 text-center">
                            <h2 className="text-4xl md:text-6xl font-heading font-bold tracking-tight leading-[1.1] mb-20" style={{ color: "var(--insights-text)" }}>
                                Most investing content optimizes for engagement.<br/>
                                <span className="italic" style={{ color: "var(--insights-accent)" }}>We optimize for understanding.</span>
                            </h2>
                            <div className="grid md:grid-cols-2 gap-x-12 gap-y-16 text-left max-w-4xl mx-auto">
                                <div className="space-y-6">
                                    <div className="text-xl font-heading line-through decoration-white/20" style={{ color: "var(--insights-text-muted)" }}>Market Noise</div>
                                    <ul className="space-y-4 font-mono text-sm uppercase tracking-wider" style={{ color: "rgba(245, 245, 244, 0.5)" }}>
                                        <li>Fast opinions</li>
                                        <li>Stock tips</li>
                                        <li>Momentum narratives</li>
                                        <li>Quarterly excitement</li>
                                    </ul>
                                </div>
                                <div className="space-y-6">
                                    <div className="text-xl font-heading" style={{ color: "var(--insights-accent)" }}>First Principles Research</div>
                                    <ul className="space-y-4 font-mono text-sm uppercase tracking-wider" style={{ color: "rgba(245, 245, 244, 0.9)" }}>
                                        <li>Deep work</li>
                                        <li>Business analysis</li>
                                        <li>Industry structure</li>
                                        <li>Long-term thinking</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 — RESEARCH PROCESS */}
                    <ProcessScrollSection />

                    {/* SECTION 4 — WHAT MEMBERS RECEIVE */}
                    <section className="py-32 border-y border-white/5" style={{ backgroundColor: "var(--bg-deep)" }}>
                        <div className="container max-w-6xl mx-auto px-6">
                            <div className="mb-24">
                                <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight" style={{ color: "var(--insights-text)" }}>What Members Receive</h2>
                            </div>
                            
                            <div className="space-y-32">
                                {/* Block 1 */}
                                <div className="grid md:grid-cols-2 gap-16 items-center">
                                    <div className="aspect-[4/3] bg-bg-primary rounded-sm overflow-hidden border border-border">
                                        <img src="/images/research_memo.png" className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-500" alt="Deep Dive Memo" />
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-3xl font-heading font-bold" style={{ color: "var(--insights-text)" }}>2 Deep-Dive Research Memos Every Month</h3>
                                        <p className="text-lg leading-relaxed" style={{ color: "var(--insights-text-muted)" }}>Comprehensive structural analysis on high-quality businesses. We dissect unit economics, capital allocation, and competitive advantages.</p>
                                    </div>
                                </div>
                                {/* Block 2 */}
                                <div className="grid md:grid-cols-2 gap-16 items-center">
                                    <div className="order-2 md:order-1 space-y-6">
                                        <h3 className="text-3xl font-heading font-bold text-text-primary">Monthly Meetup with Subscribers</h3>
                                        <p className="text-lg leading-relaxed text-text-primary/80">Live Q&A and structural breakdown of our latest research with the community.</p>
                                    </div>
                                    <div className="order-1 md:order-2 aspect-[4/3] bg-bg-primary rounded-sm overflow-hidden border border-border">
                                        <img src="/images/monthly_meetup.png" className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-500" alt="Monthly Meetup" />
                                    </div>
                                </div>

                                {/* Block 3 */}
                                <div className="grid md:grid-cols-2 gap-16 items-center">
                                    <div className="aspect-[4/3] bg-bg-primary rounded-sm overflow-hidden border border-border">
                                        <img src="/images/research_archive.png" className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-500" alt="Archive" />
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-3xl font-heading font-bold text-text-primary">Full Research Archive Access</h3>
                                        <p className="text-lg leading-relaxed text-text-primary/80">Unlock our entire history of investment frameworks, post-mortems, and sector deep-dives from day one.</p>
                                    </div>
                                </div>

                                {/* Block 4 */}
                                <div className="grid md:grid-cols-2 gap-16 items-center">
                                    <div className="order-2 md:order-1 space-y-6">
                                        <h3 className="text-3xl font-heading font-bold text-text-primary">Exclusive Webinar Discounts</h3>
                                        <p className="text-lg leading-relaxed text-text-primary/80">Receive a 50% discount on all future sector-focused webinars and masterclasses.</p>
                                    </div>
                                    <div className="order-1 md:order-2 aspect-[4/3] bg-bg-primary rounded-sm overflow-hidden border border-border">
                                        <img src="/images/webinar_discount.png" className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-500" alt="Webinar Discount" />
                                    </div>
                                </div>    
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5 — SAMPLE RESEARCH (Premium Preview) */}
                    <section className="container max-w-7xl mx-auto px-6 py-32">
                        <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4" style={{ color: "var(--insights-text)" }}>Premium Research Preview</h2>
                                <p className="text-lg max-w-2xl" style={{ color: "var(--insights-text-muted)" }}>Member-only memos covering specialized situations and fundamental deep-dives.</p>
                            </div>
                            <Link href="#membership" className="font-mono text-sm tracking-widest uppercase hover:text-white transition-colors" style={{ color: "var(--insights-accent)" }}>
                                Unlock All →
                            </Link>
                        </div>

                        {premiumPosts.length > 0 ? (
                            <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                                {premiumPosts.slice(0, 3).map((post) => (
                                    <div key={post.slug.current} className="relative group">
                                        <InsightCard post={post} showSubscriberBadge={paywallReady} />
                                        {/* Blur Mask Overlay */}
                                        {!hasSubscriptionAccess && (
                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--insights-bg)] via-[var(--insights-bg)]/80 to-transparent top-1/3 flex flex-col items-center justify-end pb-8 opacity-90 transition-opacity group-hover:opacity-100">
                                                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full mb-4">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                </div>
                                                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--insights-accent)" }}>Members Only</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center border border-white/10 rounded-sm">
                                <p className="text-lg" style={{ color: "var(--insights-text-muted)" }}>No premium memos found.</p>
                            </div>
                        )}
                    </section>

                    {/* SECTION 7 — MEMBERSHIP */}
                    <section id="membership" className="py-32 border-t border-white/5" style={{ backgroundColor: "var(--bg-primary)" }}>
                        <div className="container max-w-4xl mx-auto px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-6xl font-heading font-bold tracking-tight mb-6" style={{ color: "var(--insights-text)" }}>Join a community built around deep research.</h2>
                                <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--insights-text-muted)" }}>Start with a quarterly Insights membership for full access to the archive and new publications.</p>
                            </div>

                            <div className="max-w-2xl mx-auto p-1 bg-gradient-to-br from-white/10 to-white/0 rounded-xl">
                                <div className="p-8 md:p-12 rounded-lg" style={{ backgroundColor: "var(--insights-bg)" }}>
                                    {paywallReady ? (
                                        session?.user?.id ? (
                                            <InsightsSubscriptionCheckout
                                                callbackUrl="/insights"
                                                userName={session.user.name}
                                                userEmail={session.user.email}
                                                plans={subscriptionUi.plans}
                                            />
                                        ) : (
                                            <div className="space-y-8">
                                                <PlanPreview plans={subscriptionUi.plans} />
                                                <Link
                                                    href={`/login?callbackUrl=${encodeURIComponent("/insights")}`}
                                                    className="flex w-full items-center justify-center rounded-sm px-6 py-4 text-sm font-bold tracking-wider uppercase transition hover:bg-white"
                                                    style={{ backgroundColor: "var(--insights-accent)", color: "#080810" }}
                                                >
                                                    Log in to subscribe
                                                </Link>
                                            </div>
                                        )
                                    ) : (
                                        <div className="space-y-8 text-center">
                                            <PlanPreview plans={subscriptionUi.plans} />
                                            <p className="text-sm leading-6 text-white/60">
                                                Subscriptions will be available here once the Razorpay plan is configured.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 8 — FINAL CTA */}
                    <section className="container max-w-5xl mx-auto px-6 py-40 text-center">
                        <h2 className="text-5xl md:text-7xl font-heading font-bold tracking-tighter leading-tight mb-12" style={{ color: "var(--insights-text)" }}>
                            The best investment ideas begin with <span className="italic" style={{ color: "var(--insights-accent)" }}>understanding.</span>
                        </h2>
                        <Link href="#membership" className="inline-flex items-center justify-center rounded-sm bg-white px-10 py-5 font-bold tracking-wide transition-colors duration-300" style={{ color: "#080810" }}>
                            Become a Member
                        </Link>
                    </section>

                </InsightsAnimations>
            </main>

            <Footer />
        </div>
    )
}

function postsSummary(count: number, search: string) {
    if (count === 0) {
        return <p>No results found for <span className="font-semibold text-white">&quot;{search}&quot;</span></p>
    }
    return <p>Showing {count} result{count === 1 ? "" : "s"} for <span className="font-semibold text-white">&quot;{search}&quot;</span></p>
}

function PlanPreview({
    plans,
}: {
    plans: Array<{
        key: string
        label: string
        cadence: string
        priceLabel: string
        badge: string | null
    }>
}) {
    return (
        <div className={plans.length === 1 ? "grid gap-4" : "grid gap-4 md:grid-cols-2"}>
            {plans.map((plan) => (
                <div key={plan.key} className="relative rounded-sm border border-white/10 bg-white/[0.02] px-6 py-5 hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-semibold text-white/90">{plan.label}</div>
                        {plan.badge ? (
                            <span className="rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: "rgba(201, 168, 76, 0.2)", color: "var(--insights-accent)" }}>
                                {plan.badge}
                            </span>
                        ) : null}
                    </div>
                    <div className="mt-4 text-2xl font-bold text-white tracking-tight">{plan.priceLabel}</div>
                    <div className="mt-1 text-xs uppercase tracking-widest text-white/50">{plan.cadence}</div>
                </div>
            ))}
        </div>
    )
}
