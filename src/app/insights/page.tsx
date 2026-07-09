import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { postQuery, featuredPostQuery, allPostsQuery } from "@/lib/sanity.queries"
import { Post } from "@/lib/types"
import { InsightCard } from "@/components/cards/InsightCard"
import { SearchInput } from "@/components/ui/search-input"
import { InsightsAnimations } from "@/components/insights/InsightsAnimations"
import { getInsightsSubscriptionUiState, userHasInsightsAccess } from "@/lib/insights-subscription-service"
import { InsightsSubscriptionCheckout } from "@/components/insights/InsightsSubscriptionCheckout"
import { auth } from "@/auth"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Play, Volume2, Users, Flame, BookOpen, FileCheck2, Award, Calendar, BarChart2 } from "lucide-react"
import { LogoMarquee } from "@/components/events/LogoMarquee"
import { StickyFooterCheckout } from "@/components/insights/StickyFooterCheckout"
import { BonusMarquee } from "@/components/insights/BonusMarquee"

// Set revalidate to 0 for instant updates (dynamic rendering)
export const revalidate = 0

export default async function InsightsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const { search } = await searchParams

    const subscriptionUi = getInsightsSubscriptionUiState()
    const paywallReady =
        subscriptionUi.enabled && subscriptionUi.checkoutReady && subscriptionUi.webhookReady

    // Run auth check and Sanity content fetching in parallel
    const sessionPromise = auth()
    const sanityPromise = search
        ? client.fetch<Post[]>(postQuery, { search }, { next: { revalidate: 60 } })
        : Promise.all([
            client.fetch<Post | null>(featuredPostQuery, {}, { next: { revalidate: 60 } }),
            client.fetch<Post[]>(allPostsQuery, {}, { next: { revalidate: 60 } })
          ])

    const [session, sanityResult] = await Promise.all([sessionPromise, sanityPromise])

    const hasSubscriptionAccess =
        paywallReady && session?.user?.id
            ? await userHasInsightsAccess(session.user.id)
            : false

    const gridPosts = search
        ? (sanityResult as Post[])
        : (sanityResult as [Post | null, Post[]])[1]

    const publicPosts = gridPosts.filter((p) => p.access !== "subscriber")

    return (
        <div className="flex flex-col min-h-screen insights-page font-sans bg-bg-deep text-text-primary selection:bg-gold/20 selection:text-gold">
            <Navbar />

            <main className="flex-1 w-full overflow-hidden">
                <InsightsAnimations>

                    {/* SECTION 1 — HERO */}
                    <section className="container max-w-7xl mx-auto px-6 pt-24 pb-16 md:pt-36 md:pb-20 min-h-[90vh] flex flex-col justify-center bg-[radial-gradient(circle_at_right_50%_top_50%,rgba(245,184,0,0.04),transparent_60%)]">
                        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                            {/* Left Text Block */}
                            <div className="lg:col-span-7 space-y-6 text-left">
                                {/* Inflection Badge */}
                                <div>
                                    <span className="text-white text-sm md:text-[15px] font-semibold uppercase tracking-wider font-sans">
                                        Deep-Dives on businesses at Inflection points
                                    </span>
                                </div>

                                {/* Primary Headline */}
                                <h1 className="text-[clamp(1.75rem,3.8vw,2.75rem)] font-sans font-semibold tracking-[-0.02em] leading-[1.15] text-text-primary">
                                    Read two deep-dives a month, on businesses undergoing <span className="font-display italic text-gold font-normal">big positive change.</span>
                                </h1>

                                {/* Bonus section */}
                                <BonusMarquee />

                                {/* CTA Area */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 pt-2">
                                    <Link 
                                        href="#membership" 
                                        className="inline-flex items-center justify-center rounded-[10px] bg-gold text-[#16161C] px-7 py-3.5 font-semibold tracking-wide hover:brightness-[1.06] motion-safe:hover:-translate-y-[1px] transition-[transform,filter] duration-150 ease-out text-center shadow-lg shadow-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]"
                                    >
                                        Subscribe for ₹23/day
                                    </Link>
                                    <span className="flex items-center gap-2 text-xs md:text-sm text-white/60 font-medium">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                                        50+ members have joined in the last month
                                    </span>
                                </div>
                            </div>

                            {/* Right Video Mockup */}
                            <div className="lg:col-span-5 relative w-full aspect-video md:aspect-[4/3] lg:aspect-square flex items-center justify-center p-1">
                                {/* Glow behind card */}
                                <div className="absolute inset-0 bg-gold/5 rounded-full blur-[80px] w-[80%] h-[80%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />
                                
                                <div className="w-full h-full bg-[#16161C] border border-white/8 rounded-[16px] overflow-hidden relative flex flex-col justify-between group z-10 motion-safe:hover:-translate-y-[2px] transition-transform duration-200 ease-out">
                                    {/* Video Placeholder Header */}
                                    <div className="p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10 flex justify-between items-center text-[10px] font-mono text-white/50 tracking-wider">
                                        <span>EXPLAINER VIDEO</span>
                                        <span>0:51</span>
                                    </div>

                                    {/* Thumbnail background/art */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_60%)]" />
                                        <div className="relative w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-white/20 transition-all duration-300 shadow-xl cursor-pointer z-10">
                                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                                        </div>
                                    </div>

                                    {/* Video Title Card Overlay */}
                                    <div className="p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent absolute bottom-0 left-0 right-0 space-y-2">
                                        <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-white/50 block">First Principles Investing</span>
                                        <h4 className="text-sm font-semibold text-white font-sans">Cutting through financial noise to compound wealth</h4>
                                        <div className="flex items-center gap-3 pt-2 text-[9px] font-mono text-white/40">
                                            <div className="flex-1 h-[2px] bg-white/20 rounded-full overflow-hidden">
                                                <div className="w-1/3 h-full bg-white/80 rounded-full" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Volume2 className="w-3.5 h-3.5 text-white/40" />
                                                <span>0:17 / 0:51</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Featured On sliding logos */}
                        <div className="mt-12 border-t border-white/5 pt-4">
                            <LogoMarquee />
                        </div>
                    </section>

                    {/* SECTION 2 — WHAT YOU GET AS A SUBSCRIBER */}
                    <section className="py-24 border-t border-white/5 bg-[#0A0A0F]">
                        <div className="container max-w-7xl mx-auto px-6">
                            <div className="mb-16 text-center md:text-left">
                                <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-gold/80 block mb-3">MEMBERSHIP DETAILS</span>
                                <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight text-white">What you get as a Subscriber</h2>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Card 1 */}
                                <div className="bg-[#1A1A1A]/40 backdrop-blur-xl border border-white/5 hover:border-gold/20 p-8 rounded-xl shadow-xl transition-all duration-300 group hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                                        <BookOpen className="w-5 h-5 text-gold" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">2 Deep-Dives per month</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">Research depth you won’t find anywhere else.</p>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-[#1A1A1A]/40 backdrop-blur-xl border border-white/5 hover:border-gold/20 p-8 rounded-xl shadow-xl transition-all duration-300 group hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                                        <BarChart2 className="w-5 h-5 text-gold" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">2 Wealth creation Investing frameworks</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">Radical positive change & Special situations</p>
                                </div>

                                {/* Card 3 */}
                                <div className="bg-[#1A1A1A]/40 backdrop-blur-xl border border-white/5 hover:border-gold/20 p-8 rounded-xl shadow-xl transition-all duration-300 group hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                                        <Calendar className="w-5 h-5 text-gold" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">50% off on our Monthly Sectoral Webinars</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">Access our upcoming webinars at 50% discount</p>
                                </div>

                                {/* Card 4 */}
                                <div className="bg-[#1A1A1A]/40 backdrop-blur-xl border border-white/5 hover:border-gold/20 p-8 rounded-xl shadow-xl transition-all duration-300 group hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                                        <Users className="w-5 h-5 text-gold" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">Monthly community Meetups</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">Discuss ideas, connect & clear your doubts</p>
                                </div>

                                {/* Card 5 */}
                                <div className="bg-[#1A1A1A]/40 backdrop-blur-xl border border-white/5 hover:border-gold/20 p-8 rounded-xl shadow-xl transition-all duration-300 group hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                                        <FileCheck2 className="w-5 h-5 text-gold" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">Review the Valuation Model behind each deep-dive</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">Stress Test assumptions behind the investment thesis</p>
                                </div>

                                {/* Card 6 */}
                                <div className="bg-[#1A1A1A]/40 backdrop-blur-xl border border-white/5 hover:border-gold/20 p-8 rounded-xl shadow-xl transition-all duration-300 group hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                                        <Award className="w-5 h-5 text-gold" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">Discover Event - Driven special situations</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">De-mergers & Promoter change</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 — READ OUR FREE INSIGHTS */}
                    <section id="free-research" className="container max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
                        <div className="mb-16 text-center md:text-left">
                            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-gold/80 block mb-3">PUBLIC ARCHIVE</span>
                            <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight text-white">Read our Free Insights</h2>
                        </div>

                        {publicPosts.length > 0 ? (
                            <div className="space-y-16">
                                <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                                    {publicPosts.slice(0, 3).map((post) => (
                                        <InsightCard key={post.slug.current} post={post} showSubscriberBadge={paywallReady} hasSubscriptionAccess={hasSubscriptionAccess} />
                                    ))}
                                </div>
                                <div className="flex justify-center">
                                    <Link href="/insights/archive" className="inline-flex items-center justify-center rounded-[10px] border border-white/10 hover:border-gold/30 bg-[#16161C]/50 hover:bg-[#1A1A22] text-white hover:text-gold px-8 py-4 font-semibold tracking-wide transition-all duration-300 shadow-md">
                                        Explore Full Archive &rarr;
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="py-24 text-center border border-white/10 rounded-xl bg-white/[0.01]">
                                <p className="text-lg text-text-secondary">No public research memos found.</p>
                            </div>
                        )}
                    </section>

                    {/* SECTION 4 — YOU SHOULD SUBSCRIBE NOW, IF: */}
                    <section className="py-32 border-y border-white/5 bg-[#07070C]">
                        <div className="container max-w-7xl mx-auto px-6">
                            <div className="text-center mb-20">
                                <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-gold/80 block mb-3">TARGET AUDIENCE</span>
                                <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight text-white">You should subscribe NOW, if:</h2>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Card 1 */}
                                <div className="bg-[#16161D]/50 border border-white/5 p-8 rounded-xl flex gap-4 items-start hover:border-gold/20 transition-all duration-300">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mt-1">
                                        <span className="text-gold font-bold font-sans text-sm">1</span>
                                    </span>
                                    <h4 className="font-bold text-white text-base tracking-wide leading-snug">YOU MANAGE YOUR PORTFOLIO YOURSELF</h4>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-[#16161D]/50 border border-white/5 p-8 rounded-xl flex gap-4 items-start hover:border-gold/20 transition-all duration-300">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mt-1">
                                        <span className="text-gold font-bold font-sans text-sm">2</span>
                                    </span>
                                    <h4 className="font-bold text-white text-base tracking-wide leading-snug">YOU&apos;RE A DOMAIN EXPERT WITH A PASSION FOR INVESTING</h4>
                                </div>

                                {/* Card 3 */}
                                <div className="bg-[#16161D]/50 border border-white/5 p-8 rounded-xl flex gap-4 items-start hover:border-gold/20 transition-all duration-300">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mt-1">
                                        <span className="text-gold font-bold font-sans text-sm">3</span>
                                    </span>
                                    <h4 className="font-bold text-white text-base tracking-wide leading-snug">HNI, ANALYST, FUND MANAGER</h4>
                                </div>

                                {/* Card 4 */}
                                <div className="bg-[#16161D]/50 border border-white/5 p-8 rounded-xl flex gap-4 items-start hover:border-gold/20 transition-all duration-300">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mt-1">
                                        <span className="text-gold font-bold font-sans text-sm">4</span>
                                    </span>
                                    <h4 className="font-bold text-white text-base tracking-wide leading-snug">BUDDING ANALYST LOOKING TO UPSKILL</h4>
                                </div>

                                {/* Card 5 */}
                                <div className="bg-[#16161D]/50 border border-white/5 p-8 rounded-xl flex gap-4 items-start hover:border-gold/20 transition-all duration-300">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mt-1">
                                        <span className="text-gold font-bold font-sans text-sm">5</span>
                                    </span>
                                    <h4 className="font-bold text-white text-base tracking-wide leading-snug">FULL-TIME INVESTOR</h4>
                                </div>

                                {/* Card 6 */}
                                <div className="bg-[#16161D]/50 border border-white/5 p-8 rounded-xl flex gap-4 items-start hover:border-gold/20 transition-all duration-300">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mt-1">
                                        <span className="text-gold font-bold font-sans text-sm">6</span>
                                    </span>
                                    <h4 className="font-bold text-white text-base tracking-wide leading-snug">YOU LIKE TO THINK THROUGH YOUR INVESTMENTS</h4>
                                </div>
                            </div>

                            {/* Editorial quotes and trigger blocks */}
                            <div className="mt-32 max-w-4xl mx-auto text-center space-y-16">
                                {/* Quote 2 */}
                                <blockquote className="p-8 border border-white/5 bg-[#16161D]/20 rounded-2xl relative">
                                    <div className="absolute top-0 left-10 transform -translate-y-1/2 text-gold font-serif text-5xl">“</div>
                                    <p className="text-2xl md:text-3xl font-heading font-semibold text-text-primary leading-snug">
                                        Anyone who is tired of information overload looking for reliable source of high quality research on relatively undiscovered stocks
                                    </p>
                                    <div className="absolute bottom-0 right-10 transform translate-y-1/3 text-gold font-serif text-5xl">”</div>
                                </blockquote>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5 — MEET RAHUL RAO, CFA */}
                    <section className="py-32 bg-bg-deep relative">
                        <div className="container max-w-6xl mx-auto px-6">
                            <div className="grid md:grid-cols-12 gap-16 items-center">
                                {/* Profile Headshot */}
                                <div className="md:col-span-5 flex justify-center">
                                    <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden border border-white/10 bg-[#16161C] shadow-2xl group flex flex-col justify-end">
                                        <Image
                                            src="/founder.png"
                                            alt="Rahul Rao, CFA"
                                            fill
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-90 group-hover:opacity-100"
                                            sizes="(max-width: 768px) 288px, 320px"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6 z-10 text-center">
                                            <h4 className="font-sans font-bold text-white text-lg">Rahul Rao, CFA</h4>
                                            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gold/80 block mt-1">Head of Fundamental Research</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Bio Text */}
                                <div className="md:col-span-7 space-y-6">
                                    <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-gold/80 block">OUR TEAM</span>
                                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight">Meet Rahul Rao, CFA</h2>
                                    <div className="prose prose-invert prose-lg text-text-secondary leading-relaxed space-y-6">
                                        <p>
                                            Rahul Rao is a CFA charterholder with over a decade of experience in corporate valuation, equity research, and macroeconomic analysis. Specializing in first-principles research, he focuses on discovering high-quality businesses undergoing structural inflection points and compounding capital over long horizons.
                                        </p>
                                        <p>
                                            Previously, he managed portfolios at leading family offices and financial institutions, helping investors cut through market noise to build high-conviction equity portfolios.
                                        </p>
                                    </div>
                                    <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 border-t border-white/5">
                                        <div className="text-left font-mono text-[10px] text-text-secondary">
                                            <span className="text-gold font-bold">Research focus:</span>
                                            <p className="uppercase tracking-wider mt-1 text-white/95">First Principles Deep-Dives</p>
                                        </div>
                                        <Link 
                                            href="#membership" 
                                            className="inline-flex items-center justify-center rounded-sm bg-gold text-bg-deep px-6 py-3 font-bold tracking-wide transition-all duration-300 hover:bg-gold-muted hover:scale-[1.02] text-center"
                                        >
                                            Subscribe now for just ₹23 per day
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sticky Footer Conversion Bar */}
                    <StickyFooterCheckout
                        paywallReady={paywallReady}
                        hasSubscriptionAccess={hasSubscriptionAccess}
                        session={session}
                        plans={subscriptionUi.plans}
                    />

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
