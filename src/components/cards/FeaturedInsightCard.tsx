import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Post } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"
import { cn } from "@/lib/utils"

interface FeaturedInsightCardProps {
    post: Post
    className?: string
}

export function FeaturedInsightCard({ post, className }: FeaturedInsightCardProps) {
    return (
        <div className={cn("group grid md:grid-cols-12 gap-6 items-center p-6 rounded-2xl border border-text-secondary/10 bg-bg-deep shadow-sm hover:shadow-md transition-all duration-300", className)}>

            {/* Image (Left, 7 columns) */}
            <div className="md:col-span-7 relative aspect-video w-full overflow-hidden rounded-xl bg-secondary/20 shadow-inner">
                {post.mainImage && (
                    <Image
                        src={urlForImage(post.mainImage).width(1200).height(675).fit("crop").url()}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                    />
                )}
            </div>

            {/* Content (Right, 5 columns) */}
            <div className="md:col-span-5 flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-xs font-medium tracking-wider uppercase text-bg-deep bg-gold rounded-full">
                        Featured Insight
                    </span>
                    <span className="text-xs text-text-secondary font-medium">
                        {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                </div>

                <h2 className="text-3xl md:text-3xl font-bold tracking-tight text-text-primary group-hover:text-gold transition-colors leading-tight">
                    <Link href={`/insights/${post.slug.current}`}>
                        {post.title}
                    </Link>
                </h2>

                <p className="text-text-secondary text-base leading-relaxed line-clamp-3 md:line-clamp-4">
                    {post.excerpt}
                </p>

                <div className="pt-2">
                    <Link
                        href={`/insights/${post.slug.current}`}
                        className="inline-flex items-center text-sm font-bold text-gold hover:text-gold-muted hover:underline transition-colors"
                    >
                        Read Full Analysis <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
