import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { postQuery, allPostsQuery } from "@/lib/sanity.queries"
import { Post } from "@/lib/types"
import { InsightCard } from "@/components/cards/InsightCard"
import { SearchInput } from "@/components/ui/search-input"
import { getInsightsSubscriptionUiState, userHasInsightsAccess } from "@/lib/insights-subscription-service"
import { auth } from "@/auth"
import Link from "next/link"

export const revalidate = 0

export default async function InsightsArchivePage({
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
        : client.fetch<Post[]>(allPostsQuery, {}, { next: { revalidate: 60 } })

    const [session, gridPosts] = await Promise.all([sessionPromise, sanityPromise])

    const hasSubscriptionAccess =
        paywallReady && session?.user?.id
            ? await userHasInsightsAccess(session.user.id)
            : false

    const publicPosts = gridPosts.filter((p) => p.access !== "subscriber")

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
                            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-gold/80 block mb-3">PUBLIC ARCHIVE</span>
                            <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-white">Read our Free Insights</h1>
                        </div>
                        <div className="w-full md:w-[320px]">
                            <SearchInput className="w-full bg-transparent border-white/10" />
                        </div>
                    </div>

                    {search && (
                        <div className="mb-12">
                            <div className="text-base text-text-secondary font-sans">
                                {postsSummary(publicPosts.length, search)}
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
                            <p className="text-lg text-text-secondary font-sans">No public research memos found.</p>
                        </div>
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
