import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { postQuery, featuredPostQuery, allPostsQuery } from "@/lib/sanity.queries"
import { Post } from "@/lib/types"
import { InsightCard } from "@/components/cards/InsightCard"
import { FeaturedInsightCard } from "@/components/cards/FeaturedInsightCard"
import { SearchInput } from "@/components/ui/search-input"
import { InsightsAnimations } from "@/components/insights/InsightsAnimations"

// Set revalidate to 0 for instant updates (dynamic rendering)
export const revalidate = 0

export default async function InsightsPage({
    searchParams,
}: {
    searchParams: { search?: string }
}) {
    // Await searchParams to suppress Next.js sync access warning
    const { search } = await Promise.resolve(searchParams)

    let featuredPost: Post | null = null
    let gridPosts: Post[] = []
    let searchResults: Post[] = []

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

    // Debug logging
    console.log("Featured Post:", featuredPost?.title)
    console.log("Grid Posts Count:", gridPosts.length)

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
                            <FeaturedInsightCard post={featuredPost} />
                        </div>
                    )}

                    {/* ─── MEMO GRID ─── */}
                    {gridPosts.length > 0 ? (
                        <div data-gsap="grid" className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                            {gridPosts.map((post) => (
                                <InsightCard key={post.slug.current} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div
                            className="py-24 text-center rounded-2xl"
                            style={{
                                color: "var(--insights-text-muted, #9CA3AF)",
                                borderWidth: "1px",
                                borderStyle: "dashed",
                                borderColor: "rgba(156, 163, 175, 0.15)",
                                backgroundColor: "rgba(18, 18, 26, 0.5)",
                            }}
                        >
                            <p className="text-xl font-medium mb-2">No insights found</p>
                            <p className="text-sm opacity-70">Try adjusting your search criteria.</p>
                        </div>
                    )}

                </InsightsAnimations>
            </main>

            <Footer />
        </div>
    )
}

function postsSummary(count: number, search: string) {
    if (count === 0) {
        return <p>No results found for <span className="font-semibold" style={{ color: "var(--insights-text, #F5F5F4)" }}>"{search}"</span></p>
    }
    return <p>Showing {count} result{count === 1 ? "" : "s"} for <span className="font-semibold" style={{ color: "var(--insights-text, #F5F5F4)" }}>"{search}"</span></p>
}
