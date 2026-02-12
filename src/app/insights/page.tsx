import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { postQuery } from "@/lib/sanity.queries"
import { Post } from "@/lib/types"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export const revalidate = 60

export default async function InsightsPage() {
    const posts = await client.fetch<Post[]>(postQuery)
    const featuredPost = posts[0]
    const otherPosts = posts.slice(1)

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 container max-w-screen-xl px-4 sm:px-8 py-12 md:py-20">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Inside the Machine.</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Deep dives into business models, structural advantages, and the art of compounding.
                    </p>
                </div>

                {featuredPost && (
                    <div className="group relative rounded-2xl border border-border bg-card overflow-hidden grid md:grid-cols-2 gap-8 hover:shadow-lg transition-all mb-16">
                        <div className="aspect-video md:aspect-auto bg-secondary/20 relative min-h-[300px]">
                            {/* Image would go here */}
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                Feature Image
                            </div>
                        </div>
                        <div className="p-8 flex flex-col justify-center">
                            <div className="text-sm text-primary mb-2 font-medium">Featured Insight</div>
                            <h2 className="text-3xl font-bold mb-4 group-hover:text-primary/80 transition-colors">
                                <Link href={`/insights/${featuredPost.slug.current}`}>
                                    {featuredPost.title}
                                </Link>
                            </h2>
                            <p className="text-muted-foreground text-lg mb-6 line-clamp-3">
                                {featuredPost.excerpt}
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-sm text-muted-foreground">
                                    {new Date(featuredPost.publishedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                                <Link href={`/insights/${featuredPost.slug.current}`} className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                                    Read Article <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
                    {otherPosts.map((post) => (
                        <div key={post.slug.current} className="group flex flex-col h-full">
                            <div className="aspect-video bg-secondary/10 rounded-xl mb-4 relative overflow-hidden">
                                {/* Image placeholder */}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                                {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary/80 transition-colors">
                                <Link href={`/insights/${post.slug.current}`}>
                                    {post.title}
                                </Link>
                            </h3>
                            <p className="text-muted-foreground line-clamp-3 mb-4 flex-1">
                                {post.excerpt}
                            </p>
                            <Link href={`/insights/${post.slug.current}`} className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-auto">
                                Read Article <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </div>
                    ))}
                </div>

            </main>
            <Footer />
        </div>
    )
}
