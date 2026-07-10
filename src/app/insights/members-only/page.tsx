import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { Post } from "@/lib/types"
import { InsightCard } from "@/components/cards/InsightCard"
import { SearchInput } from "@/components/ui/search-input"
import { getInsightsSubscriptionUiState, userHasInsightsAccess } from "@/lib/insights-subscription-service"
import { InsightsSubscriptionCheckout } from "@/components/insights/InsightsSubscriptionCheckout"
import { auth } from "@/auth"
import Link from "next/link"
import { groq } from "next-sanity"
import { redirect } from "next/navigation"
import { Lock, FileKey } from "lucide-react"

export const revalidate = 0

const subscriberPostsQuery = groq`
  *[_type == "post" && access == "subscriber" && (!defined($search) || title match $search + "*" || excerpt match $search + "*")] | order(publishedAt desc) {
    title,
    slug,
    isFeatured,
    excerpt,
    access,
    mainImage,
    publishedAt
  }
`

export default async function MembersOnlyArchivePage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const { search } = await searchParams
    const session = await auth()

    // Redirect to login if the user is not authenticated
    if (!session?.user?.id) {
        redirect(`/login?callbackUrl=${encodeURIComponent("/insights/members-only")}`)
    }

    const subscriptionUi = getInsightsSubscriptionUiState()
    const paywallReady =
        subscriptionUi.enabled && subscriptionUi.checkoutReady && subscriptionUi.webhookReady

    const [hasSubscriptionAccess, premiumPosts] = await Promise.all([
        paywallReady ? userHasInsightsAccess(session.user.id) : Promise.resolve(false),
        client.fetch<Post[]>(subscriberPostsQuery, { search: search || null }, { next: { revalidate: 60 } })
    ])

    return (
        <div className="flex flex-col min-h-screen bg-bg-deep text-text-primary selection:bg-gold/20 selection:text-gold">
            <Navbar />

            <main className="flex-1 w-full overflow-hidden pt-32 pb-24">
                <div className="container max-w-7xl mx-auto px-6">
                    {/* Back to insights link */}
                    <div className="mb-12">
                        <Link href="/insights" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-text-secondary hover:text-gold transition-colors">
                            &larr; Back to Insights
                        </Link>
                    </div>

                    {/* Header with Search */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-8 border-b border-white/5">
                        <div>
                            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-gold/80 block mb-3">MEMBERS PORTAL</span>
                            <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-white">Premium Research Notes</h1>
                        </div>
                        {hasSubscriptionAccess && (
                            <div className="w-full md:w-[320px]">
                                <SearchInput className="w-full bg-transparent border-white/10" />
                            </div>
                        )}
                    </div>

                    {/* Paywall locked state: Display active subscription form if they do not have access */}
                    {!hasSubscriptionAccess ? (
                        <div className="max-w-4xl mx-auto mb-20 space-y-12">
                            <div className="p-8 md:p-12 rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/[0.03] to-transparent text-center space-y-6">
                                <div className="inline-flex items-center justify-center p-4 rounded-full bg-gold/10 border border-gold/25 text-gold mb-2">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl md:text-4xl font-sans font-bold text-white tracking-tight">Access Locked</h2>
                                <p className="text-white/70 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
                                    This portal houses our high-conviction fundamental equity research deep-dives and valuation models. Unlock full access by starting a quarterly membership below.
                                </p>
                                <div className="max-w-md mx-auto pt-6 text-left">
                                    <InsightsSubscriptionCheckout
                                        callbackUrl="/insights/members-only"
                                        userName={session.user.name}
                                        userEmail={session.user.email}
                                        plans={subscriptionUi.plans}
                                    />
                                </div>
                            </div>

                            {/* Locked articles preview */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                                    <FileKey className="w-4 h-4 text-white/40" />
                                    <h3 className="text-sm font-mono uppercase tracking-wider text-white/50">Exclusive Research Archive Preview</h3>
                                </div>
                                {premiumPosts.length > 0 ? (
                                    <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3 opacity-40 pointer-events-none select-none">
                                        {premiumPosts.map((post) => (
                                            <div key={post.slug.current} className="blur-[1px]">
                                                <InsightCard post={post} showSubscriberBadge={paywallReady} hasSubscriptionAccess={false} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-white/40 text-center py-12">No premium posts configured in Sanity.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Active subscription state: Display full grid
                        <>
                            {search && (
                                <div className="mb-12">
                                    <div className="text-base text-text-secondary font-sans">
                                        {postsSummary(premiumPosts.length, search)}
                                    </div>
                                </div>
                            )}

                            {premiumPosts.length > 0 ? (
                                <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                                    {premiumPosts.map((post) => (
                                        <InsightCard key={post.slug.current} post={post} showSubscriberBadge={paywallReady} hasSubscriptionAccess={true} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 text-center border border-white/10 rounded-xl bg-white/[0.01]">
                                    <p className="text-lg text-text-secondary font-sans">No premium research memos found.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
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
