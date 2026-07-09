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
                                {/* Inflection & Stock Discovery Badges */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-2 bg-white/[0.02] border border-white/12 text-white/70 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider font-space-grotesk">
                                        <Flame className="w-3.5 h-3.5 text-white/50" />
                                        #1 Deep-Dives on businesses at Inflection points
                                    </span>
                                    <span className="inline-flex items-center gap-2 bg-white/[0.02] border border-white/12 text-white/70 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider font-space-grotesk">
                                        <Award className="w-3.5 h-3.5 text-white/50" />
                                        #2 Discover winning stocks. Early.
                                    </span>
                                </div>

                                {/* Primary Headline */}
                                <h1 className="text-[clamp(2.5rem,5.5vw,4.25rem)] font-space-grotesk font-semibold tracking-[-0.02em] leading-[1.08] text-text-primary">
                                    Read two deep-dives a month, on businesses undergoing <span className="font-instrument-serif italic text-gold text-[1.05em] font-normal">big positive change</span>, and companies undergoing <span className="font-instrument-serif italic text-gold text-[1.05em] font-normal">radical positive change.</span>
                                </h1>

                                {/* Bonus section */}
                                <div className="space-y-3 pt-1">
                                    <p className="font-space-grotesk text-[0.75rem] font-semibold text-white/70 uppercase tracking-[0.12em]">Exclusive Subscriber Bonuses</p>
                                    <ul className="grid sm:grid-cols-2 gap-3 text-sm text-white/70 font-space-grotesk font-medium">
                                        <li className="flex items-center gap-3">
                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-white/70" />
                                            </span>
                                            <span>50% off on our Sectoral workshops</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-white/70" />
                                            </span>
                                            <span>Monthly Meetups</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* CTA Area */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 pt-2">
                                    <Link 
                                        href="#membership" 
                                        className="inline-flex items-center justify-center rounded-[10px] bg-gold text-[#16161C] px-7 py-3.5 font-semibold tracking-wide hover:brightness-[1.06] motion-safe:hover:-translate-y-[1px] transition-[transform,filter] duration-150 ease-out text-center shadow-lg shadow-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]"
                                    >
                                        Subscribe for ₹27/day
                                    </Link>
                                    <div className="flex flex-col justify-center text-xs text-white/70 font-space-grotesk font-medium">
                                        <div className="flex items-center gap-2 text-white/70">
                                            <Users className="w-3.5 h-3.5 text-white/50" />
                                            <span className="font-bold">Social Proof</span>
                                        </div>
                                        <span className="text-white/60">More than 50 people signed up in the last 1 month</span>
                                    </div>
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
                                        <span className="text-[10px] font-space-grotesk uppercase tracking-[0.25em] text-white/50 block">First Principles Investing</span>
                                        <h4 className="text-sm font-semibold text-white font-space-grotesk">Cutting through financial noise to compound wealth</h4>
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

                        {/* Featured On logos */}
                        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 select-none">
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary/70">Featured On</span>
                            <div className="flex flex-wrap items-center gap-10 md:gap-16 opacity-40 hover:opacity-70 transition-opacity duration-500">
                                <div className="relative h-6 w-36">
                                    <Image src="/logos/mint.svg" alt="Mint" fill className="object-contain brightness-0 invert" />
                                </div>
                                <div className="relative h-5 w-48">
                                    <Image src="/logos/ie.svg" alt="The Indian Express" fill className="object-contain brightness-0 invert" />
                                </div>
                                <div className="relative h-6 w-48">
                                    <Image src="/logos/fe.svg" alt="Financial Express" fill className="object-contain brightness-0 invert" />
                                </div>
                            </div>
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
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-gold/80 block mb-3">PUBLIC ARCHIVE</span>
                                <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight text-white">Read our Free Insights</h2>
                            </div>
                            <div className="w-full md:w-[320px]">
                                <SearchInput className="w-full bg-transparent border-white/10" />
                            </div>
                        </div>

                        {search && (
                            <div className="mb-12">
                                <div className="text-base text-text-secondary">
                                    {postsSummary(gridPosts.length, search)}
                                </div>
                            </div>
                        )}

                        {publicPosts.length > 0 ? (
                            <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                                {publicPosts.map((post) => (
                                    <InsightCard key={post.slug.current} post={post} showSubscriberBadge={paywallReady} hasSubscriptionAccess={hasSubscriptionAccess} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center border border-white/10 rounded-xl bg-white/[0.01]">
                                <p className="text-lg text-text-secondary">No public research memos found.</p>
                            </div>
                        )}
                    </section>

                    {/* SECTION 4 — WHO SHOULD ATTEND */}
                    <section className="py-32 border-y border-white/5 bg-[#07070C]">
                        <div className="container max-w-7xl mx-auto px-6">
                            <div className="text-center mb-20">
                                <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-gold/80 block mb-3">TARGET AUDIENCE</span>
                                <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight text-white">Who should Attend</h2>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Card 1 */}
                                <div className="bg-[#16161D]/50 border border-white/5 p-6 rounded-xl flex gap-4 items-start">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    </span>
                                    <div>
                                        <h4 className="font-bold text-white text-base mb-1">Young Professionals (25–35)</h4>
                                        <p className="text-sm text-text-secondary leading-relaxed">Learn how to grow your salary into wealth and avoid costly money mistakes.</p>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-[#16161D]/50 border border-white/5 p-6 rounded-xl flex gap-4 items-start">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    </span>
                                    <div>
                                        <h4 className="font-bold text-white text-base mb-1">Mid-Career Individuals (35–45)</h4>
                                        <p className="text-sm text-text-secondary leading-relaxed">Build and protect wealth, plan for your family&apos;s future, and accelerate financial freedom.</p>
                                    </div>
                                </div>

                                {/* Card 3 */}
                                <div className="bg-[#16161D]/50 border border-white/5 p-6 rounded-xl flex gap-4 items-start">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    </span>
                                    <div>
                                        <h4 className="font-bold text-white text-base mb-1">Business Owners & Entrepreneurs</h4>
                                        <p className="text-sm text-text-secondary leading-relaxed">Invest surplus wisely and learn frameworks to maximize returns.</p>
                                    </div>
                                </div>

                                {/* Card 4 */}
                                <div className="bg-[#16161D]/50 border border-white/5 p-6 rounded-xl flex gap-4 items-start">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    </span>
                                    <div>
                                        <h4 className="font-bold text-white text-base mb-1">NRIs</h4>
                                        <p className="text-sm text-text-secondary leading-relaxed">Discover how to invest in India with confidence and achieve higher returns.</p>
                                    </div>
                                </div>

                                {/* Card 5 */}
                                <div className="bg-[#16161D]/50 border border-white/5 p-6 rounded-xl flex gap-4 items-start">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    </span>
                                    <div>
                                        <h4 className="font-bold text-white text-base mb-1">Homemakers</h4>
                                        <p className="text-sm text-text-secondary leading-relaxed">Gain financial independence and confidence to manage money smartly.</p>
                                    </div>
                                </div>

                                {/* Card 6 */}
                                <div className="bg-[#16161D]/50 border border-white/5 p-6 rounded-xl flex gap-4 items-start">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    </span>
                                    <div>
                                        <h4 className="font-bold text-white text-base mb-1">Retirees & Pre-Retirees</h4>
                                        <p className="text-sm text-text-secondary leading-relaxed">Learn how to manage your retirement corpus and plan a stress-free, secure life.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Editorial quotes and trigger blocks */}
                            <div className="mt-32 max-w-4xl mx-auto text-center space-y-16">
                                {/* Quote 1 */}
                                <blockquote className="p-8 border border-white/5 bg-[#16161D]/20 rounded-2xl relative">
                                    <div className="absolute top-0 left-10 transform -translate-y-1/2 text-gold font-serif text-5xl">“</div>
                                    <p className="text-2xl md:text-3xl font-heading font-semibold text-text-primary leading-snug">
                                        Anyone with an active income but no clear plan to grow, protect, or multiply it
                                    </p>
                                    <div className="absolute bottom-0 right-10 transform translate-y-1/3 text-gold font-serif text-5xl">”</div>
                                </blockquote>

                                {/* Trigger List */}
                                <div className="text-left bg-[#16161D]/30 border border-white/5 p-8 md:p-12 rounded-3xl space-y-8">
                                    <h3 className="text-2xl font-bold text-white tracking-tight border-b border-white/5 pb-4">
                                        You should subscribe NOW, if:
                                    </h3>
                                    <ol className="grid md:grid-cols-2 gap-x-12 gap-y-4 font-mono text-xs uppercase tracking-wider text-text-primary/90">
                                        <li className="flex items-center gap-4">
                                            <span className="text-gold font-bold font-sans text-sm">1.</span>
                                            <span>You manage your portfolio yourself</span>
                                        </li>
                                        <li className="flex items-center gap-4">
                                            <span className="text-gold font-bold font-sans text-sm">2.</span>
                                            <span>You’re a domain expert with a passion for Investing</span>
                                        </li>
                                        <li className="flex items-center gap-4">
                                            <span className="text-gold font-bold font-sans text-sm">3.</span>
                                            <span>HNI, Analyst, Fund manager</span>
                                        </li>
                                        <li className="flex items-center gap-4">
                                            <span className="text-gold font-bold font-sans text-sm">4.</span>
                                            <span>Budding Analyst looking to upskill</span>
                                        </li>
                                        <li className="flex items-center gap-4">
                                            <span className="text-gold font-bold font-sans text-sm">5.</span>
                                            <span>Full-time Investor</span>
                                        </li>
                                        <li className="flex items-center gap-4">
                                            <span className="text-gold font-bold font-sans text-sm">6.</span>
                                            <span>You like to think through your Investments</span>
                                        </li>
                                    </ol>
                                </div>

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
                                {/* Profile Headshot Placeholder / Art */}
                                <div className="md:col-span-5 flex justify-center">
                                    <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden border border-white/10 bg-[#16161C] p-4 shadow-2xl group flex flex-col justify-between items-center text-center">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,184,0,0.1),transparent_70%)]" />
                                        
                                        {/* Stylized vector representation of a professional profile */}
                                        <div className="w-32 h-32 rounded-full border-2 border-gold bg-bg-deep flex items-center justify-center text-gold/30 mt-6 relative shadow-lg">
                                            <Users className="w-16 h-16 text-gold" />
                                        </div>

                                        <div className="relative z-10 pb-4">
                                            <h4 className="font-heading font-bold text-white text-lg">Rahul Rao, CFA</h4>
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
                                            Subscribe now for just ₹27 per day
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 6 — MEMBERSHIP CHECKOUT */}
                    <section id="membership" className="py-32 border-t border-white/5" style={{ backgroundColor: "var(--bg-primary)" }}>
                        <div className="container max-w-4xl mx-auto px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-6xl font-heading font-bold tracking-tight mb-6" style={{ color: "var(--insights-text)" }}>Join a community built around deep research.</h2>
                                <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--insights-text-muted)" }}>Start with a quarterly Insights membership for full access to the archive and new publications.</p>
                            </div>

                            <div className="max-w-2xl mx-auto p-1 bg-gradient-to-br from-white/10 to-white/0 rounded-xl">
                                <div className="p-8 md:p-12 rounded-lg" style={{ backgroundColor: "var(--insights-bg)" }}>
                                    {paywallReady ? (
                                        hasSubscriptionAccess ? (
                                            <div className="space-y-8">
                                                <div className="text-center py-4 border-b border-white/5">
                                                    <div className="inline-flex items-center justify-center p-3 rounded-full mb-3" style={{ backgroundColor: "rgba(201, 168, 76, 0.08)", border: "1px solid var(--insights-accent)", color: "var(--insights-accent)" }}>
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white font-heading">Active Insights Membership</h3>
                                                    <p className="text-white/70 max-w-md mx-auto leading-relaxed text-xs">
                                                        Thank you for supporting First Principles Investing. You have full access to all subscriber-only memos and the complete research archive.
                                                    </p>
                                                </div>
                                                <InsightsSubscriptionCheckout
                                                    callbackUrl="/insights"
                                                    userName={session?.user?.name}
                                                    userEmail={session?.user?.email}
                                                    plans={subscriptionUi.plans}
                                                />
                                            </div>
                                        ) : session?.user?.id ? (
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
