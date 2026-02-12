import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Post } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"

interface RecentInsightsProps {
    posts: Post[]
}

export function RecentInsights({ posts }: RecentInsightsProps) {
    return (
        <section className="py-24 container max-w-5xl px-4 mx-auto bg-bg-deep text-text-primary">
            <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-text-primary">Recent Insights</h2>
                <Link href="/insights" className="text-sm font-medium hover:text-gold hover:underline hidden sm:block text-text-secondary transition-colors">
                    View all insights
                </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {posts.map((post) => (
                    <div key={post.slug.current} className="group flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-4">
                            {post.mainImage && (
                                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-text-secondary/10">
                                    <Image
                                        src={urlForImage(post.mainImage).url()}
                                        alt={post.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            )}
                            <div className="text-xs text-gold">
                                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>
                            <h3 className="text-xl font-semibold leading-tight group-hover:text-gold transition-colors text-text-primary">
                                <Link href={`/insights/${post.slug.current}`}>
                                    {post.title}
                                </Link>
                            </h3>
                            <p className="text-text-secondary line-clamp-3 text-sm">
                                {post.excerpt}
                            </p>
                        </div>
                        <Link href={`/insights/${post.slug.current}`} className="inline-flex items-center text-sm font-medium text-gold hover:underline mt-auto pt-4">
                            Read Article <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </div>
                ))}
            </div>
            <div className="mt-8 sm:hidden">
                <Link href="/insights" className="text-sm font-medium hover:text-gold hover:underline text-text-secondary">
                    View all insights
                </Link>
            </div>
        </section>
    )
}
