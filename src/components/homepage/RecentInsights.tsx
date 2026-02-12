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
        <section className="py-24 container max-w-5xl px-4 mx-auto">
            <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Recent Insights</h2>
                <Link href="/insights" className="text-sm font-medium hover:underline hidden sm:block">
                    View all insights
                </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {posts.map((post) => (
                    <div key={post.slug.current} className="group flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-4">
                            {post.mainImage && (
                                <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                                    <Image
                                        src={urlForImage(post.mainImage).url()}
                                        alt={post.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>
                            <h3 className="text-xl font-semibold leading-tight group-hover:text-primary/80 transition-colors">
                                <Link href={`/insights/${post.slug.current}`}>
                                    {post.title}
                                </Link>
                            </h3>
                            <p className="text-muted-foreground line-clamp-3">
                                {post.excerpt}
                            </p>
                        </div>
                        <Link href={`/insights/${post.slug.current}`} className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-auto pt-4">
                            Read Article <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </div>
                ))}
            </div>
            <div className="mt-8 sm:hidden">
                <Link href="/insights" className="text-sm font-medium hover:underline">
                    View all insights
                </Link>
            </div>
        </section>
    )
}
