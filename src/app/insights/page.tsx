import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { postQuery, featuredPostQuery, allPostsQuery } from "@/lib/sanity.queries"
import { Post } from "@/lib/types"
import { InsightCard } from "@/components/cards/InsightCard"
import { FeaturedInsightCard } from "@/components/cards/FeaturedInsightCard"
import { SearchInput } from "@/components/ui/search-input"

// Set revalidate to 0 for instant updates (dynamic rendering)
export const revalidate = 0

export default async function InsightsPage({
    searchParams,
}: {
    searchParams: { search?: string }
}) {
    // Await searchParams to suppress Next.js sync access warning (pending proper fix in future Next.js versions)
    const { search } = await Promise.resolve(searchParams)

    // Cleaner Architecture:
    // 1. Fetch explicit featured post (most recently updated wins).
    // 2. Fetch ALL posts.
    // 3. Client-side filter to ensure no duplicates and robust fallback.

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
            // Fallback: Use latest post if no explicit featured exist
            featuredPost = allPosts[0]
        }

        // Filter out the featured post from the grid to avoid duplication
        if (featuredPost) {
            gridPosts = allPosts.filter(p => p._id !== featuredPost?._id)
            // Note: If using slug as key, filter by slug or _id. Post type has _id.
            // Ensure Post type includes _id in next step if not present.
            // Using slug for visual filtering if _id missing in current type def, 
            // but strongly prefer _id.
            gridPosts = allPosts.filter(p => p.slug.current !== featuredPost?.slug.current)
        } else {
            gridPosts = allPosts
        }
    }

    // Debug logging
    console.log("Featured Post:", featuredPost?.title)
    console.log("Grid Posts Count:", gridPosts.length)

    return (
        <div className="flex flex-col min-h-screen bg-bg-deep">
            <Navbar />

            <main className="flex-1 container max-w-6xl px-4 mx-auto py-16 md:py-24 text-text-primary">

                {/* HERO SECTION */}
                <div className="mb-16 md:mb-24 flex flex-col items-start gap-8 border-b border-text-secondary/10 pb-12">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-text-primary leading-[1.1]">
                            Inside the <span className="text-gold">Machine.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-text-secondary leading-relaxed font-light">
                            Deep dives into business models, structural advantages, and the art of compounding. Uncovering signal from noise.
                        </p>
                    </div>

                    <div className="w-full flex justify-end mt-4">
                        <SearchInput className="w-full md:w-[400px]" />
                    </div>
                </div>

                {/* SEARCH RESULTS HEADER */}
                {search && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">Search Results</h2>
                        <div className="text-base text-text-secondary">
                            {postsSummary(gridPosts.length, search)}
                        </div>
                    </div>
                )}

                {/* FEATURED SECTION (Only show when NOT searching) */}
                {featuredPost && (
                    <div className="mb-20 animate-fade-in-up">
                        <FeaturedInsightCard post={featuredPost} />
                    </div>
                )}

                {/* MAIN GRID */}
                {gridPosts.length > 0 ? (
                    <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                        {gridPosts.map((post) => (
                            <InsightCard key={post.slug.current} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center text-text-secondary border border-dashed border-text-secondary/20 rounded-2xl bg-bg-deep/50">
                        <p className="text-xl font-medium mb-2">No insights found</p>
                        <p className="text-sm opacity-70">Try adjusting your search criteria.</p>
                    </div>
                )}

            </main>
            <Footer />
        </div>
    )
}

function postsSummary(count: number, search: string) {
    if (count === 0) {
        return <p>No results found for <span className="text-text-primary font-semibold">"{search}"</span></p>
    }
    return <p>Showing {count} result{count === 1 ? "" : "s"} for <span className="text-text-primary font-semibold">"{search}"</span></p>
}
