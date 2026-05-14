import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { postQuery, featuredPostQuery, allPostsQuery } from "@/lib/sanity.queries"
import { Post } from "@/lib/types"
import { InsightCard } from "@/components/cards/InsightCard"
import { FeaturedInsightCard } from "@/components/cards/FeaturedInsightCard"
import { SearchInput } from "@/components/ui/search-input"
import { InsightsAnimations } from "@/components/insights/InsightsAnimations"
import { getInsightsSubscriptionUiState } from "@/lib/insights-subscription-service"
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

    let featuredPost: Post | null = null
    let gridPosts: Post[] = []
    let searchResults: Post[] = []
    const subscriptionUi = getInsightsSubscriptionUiState()
    const paywallReady =
        subscriptionUi.enabled && subscriptionUi.checkoutReady && subscriptionUi.webhookReady
    const session = await auth()

    if (search) {
        searchResults = await client.fetch<Post[]>(postQuery, { search })
        gridPosts = searchResults
    } else {
        const [explicitFeatured, allPosts] = await Promise.all([
            client.fetch<Post | null>(featuredPostQuery),
            client.fetch<Post[]>(allPostsQuery)
        ])

        if (explicitFeatured) {
            featuredPost = explicitFeatured
        } else if (allPosts.length > 0) {
            featuredPost = allPosts[0]
        }

        if (featuredPost) {
            gridPosts = allPosts.filter(p => p.slug.current !== featuredPost?.slug.current)
        } else {
            gridPosts = allPosts
        }
    }

    const premiumPosts = gridPosts.filter((p) => p.access === "subscriber")
    const publicPosts = gridPosts.filter((p) => p.access !== "subscriber")

    return (
        <div className="flex flex-col min-h-screen insights-page">
            <Navbar />

            <main className="flex-1 container max-w-6xl px-4 mx-auto pt-24 md:pt-32 pb-16 md:pb-24">
                <InsightsAnimations>

                    {/* ─── HEADER STRIP ─── */}
                    <div data-gsap="header" className="mb-16 md:mb-20">
                        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8">
                            <div className="space-y-3">
                                <span
                                    className="block text-xs font-mono-code uppercase tracking-[0.2em] font-medium"
                                    style={{ color: "var(--insights-accent, #C9A84C)" }}
                                >
                                    Research Desk
                                </span>
                                <h1
                                    className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight leading-[1.1]"
                                    style={{ color: "var(--insights-text, #F5F5F4)" }}
                                >
                                    Investment Memos
                                </h1>
                            </div>

                            <span
                                className="hidden md:block text-xs uppercase tracking-[0.2em] font-medium"
                                style={{ color: "var(--insights-text-muted, #9CA3AF)", opacity: 0.6 }}
                            >
                                Latest Dispatches
                            </span>
                        </div>

                        {/* Divider */}
                        <div
                            className="w-full h-px"
                            style={{ backgroundColor: "rgba(156, 163, 175, 0.1)" }}
                        />

                        {/* Search — below divider */}
                        <div className="flex justify-end mt-6">
                            <SearchInput className="w-full md:w-[400px]" />
                        </div>
                    </div>

                    {/* ─── SEARCH RESULTS HEADER ─── */}
                    {!search && (
                        <section
                            data-gsap="featured"
                            className="mb-20 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(201,168,76,0.12),rgba(18,18,26,0.96)_38%,rgba(8,8,16,1))] p-6 md:p-8"
                        >
                            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                                <div className="space-y-5">
                                    <span className="text-xs font-mono-code font-semibold uppercase tracking-[0.2em] text-gold">
                                        Premium Research
                                    </span>
                                    <h2 className="max-w-xl text-3xl font-heading font-extrabold leading-tight tracking-tight text-white md:text-4xl">
                                        Unlock member-only investment memos without waiting for public drops.
                                    </h2>
                                    <p className="max-w-xl text-sm leading-7 text-white/65 md:text-base">
                                        Start with a quarterly Insights membership for access to subscriber memos, full research archives, and new premium notes as they are published.
                                    </p>
                                    <div className="grid gap-3 text-sm text-white/75 sm:grid-cols-3">
                                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                            <div className="font-semibold text-white">Full memos</div>
                                            <div className="mt-1 text-xs leading-5 text-white/50">Complete thesis, risks, and valuation notes.</div>
                                        </div>
                                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                            <div className="font-semibold text-white">Recurring access</div>
                                            <div className="mt-1 text-xs leading-5 text-white/50">Razorpay-managed billing and renewals.</div>
                                        </div>
                                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                            <div className="font-semibold text-white">Cancel anytime</div>
                                            <div className="mt-1 text-xs leading-5 text-white/50">Access continues until the paid cycle ends.</div>
                                        </div>
                                    </div>
                                </div>

                                {paywallReady ? (
                                    session?.user?.id ? (
                                        <InsightsSubscriptionCheckout
                                            callbackUrl="/insights"
                                            userName={session.user.name}
                                            userEmail={session.user.email}
                                            plans={subscriptionUi.plans}
                                        />
                                    ) : (
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
                                            <PlanPreview plans={subscriptionUi.plans} />
                                            <Link
                                                href={`/login?callbackUrl=${encodeURIComponent("/insights")}`}
                                                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gold px-4 py-3 text-sm font-bold text-black transition hover:brightness-105"
                                            >
                                                Log in to subscribe
                                            </Link>
                                        </div>
                                    )
                                ) : (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
                                        <PlanPreview plans={subscriptionUi.plans} />
                                        <p className="mt-4 text-sm leading-6 text-white/60">
                                            Subscriptions will be available here once the Razorpay quarterly plan ID and webhook settings are configured.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {search && (
                        <div className="mb-12">
                            <h2
                                className="text-2xl font-heading font-bold mb-4"
                                style={{ color: "var(--insights-text, #F5F5F4)" }}
                            >
                                Search Results
                            </h2>
                            <div
                                className="text-base"
                                style={{ color: "var(--insights-text-muted, #9CA3AF)" }}
                            >
                                {postsSummary(gridPosts.length, search)}
                            </div>
                        </div>
                    )}

                    {/* ─── FEATURED MEMO ─── */}
                    {featuredPost && (
                        <div className="mb-20">
                            <FeaturedInsightCard post={featuredPost} showSubscriberBadge={paywallReady} />
                        </div>
                    )}

                    {/* ─── MEMBER-ONLY MEMOS ─── */}
                    <div data-gsap="grid" className="mb-20">
                        <h2
                            className="text-2xl font-heading font-bold mb-8"
                            style={{ color: "var(--insights-text, #F5F5F4)" }}
                        >
                            Member-Only Memos
                        </h2>
                        {premiumPosts.length > 0 ? (
                            <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                                {premiumPosts.map((post) => (
                                    <InsightCard key={post.slug.current} post={post} showSubscriberBadge={paywallReady} />
                                ))}
                            </div>
                        ) : (
                            <div
                                className="py-16 text-center rounded-2xl"
                                style={{
                                    color: "var(--insights-text-muted, #9CA3AF)",
                                    borderWidth: "1px",
                                    borderStyle: "dashed",
                                    borderColor: "rgba(156, 163, 175, 0.15)",
                                    backgroundColor: "rgba(18, 18, 26, 0.5)",
                                }}
                            >
                                <p className="text-lg font-medium mb-1">No member-only memos found</p>
                                <p className="text-sm opacity-70">Check back later for premium content.</p>
                            </div>
                        )}
                    </div>

                    {/* ─── PUBLIC MEMOS ─── */}
                    <div className="mb-20">
                        <h2
                            className="text-2xl font-heading font-bold mb-8"
                            style={{ color: "var(--insights-text, #F5F5F4)" }}
                        >
                            Free for All
                        </h2>
                        {publicPosts.length > 0 ? (
                            <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                                {publicPosts.map((post) => (
                                    <InsightCard key={post.slug.current} post={post} showSubscriberBadge={paywallReady} />
                                ))}
                            </div>
                        ) : (
                            <div
                                className="py-16 text-center rounded-2xl"
                                style={{
                                    color: "var(--insights-text-muted, #9CA3AF)",
                                    borderWidth: "1px",
                                    borderStyle: "dashed",
                                    borderColor: "rgba(156, 163, 175, 0.15)",
                                    backgroundColor: "rgba(18, 18, 26, 0.5)",
                                }}
                            >
                                <p className="text-lg font-medium mb-1">No public memos found</p>
                                <p className="text-sm opacity-70">Try adjusting your search criteria.</p>
                            </div>
                        )}
                    </div>

                </InsightsAnimations>
            </main>

            <Footer />
        </div>
    )
}

function postsSummary(count: number, search: string) {
    if (count === 0) {
        return <p>No results found for <span className="font-semibold" style={{ color: "var(--insights-text, #F5F5F4)" }}>&quot;{search}&quot;</span></p>
    }
    return <p>Showing {count} result{count === 1 ? "" : "s"} for <span className="font-semibold" style={{ color: "var(--insights-text, #F5F5F4)" }}>&quot;{search}&quot;</span></p>
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
        <div className={plans.length === 1 ? "grid gap-2" : "grid gap-2 md:grid-cols-3"}>
            {plans.map((plan) => (
                <div key={plan.key} className="min-h-[116px] rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-white">{plan.label}</div>
                        {plan.badge ? (
                            <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
                                {plan.badge}
                            </span>
                        ) : null}
                    </div>
                    <div className="mt-3 text-lg font-bold text-white">{plan.priceLabel}</div>
                    <div className="mt-1 text-xs leading-5 text-white/55">{plan.cadence}</div>
                </div>
            ))}
        </div>
    )
}
