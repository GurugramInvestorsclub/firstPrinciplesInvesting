import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Post } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"

interface FeaturedInsightCardProps {
    post: Post
    className?: string
    showSubscriberBadge?: boolean
}

export function FeaturedInsightCard({ post, className, showSubscriberBadge }: FeaturedInsightCardProps) {
    return (
        <div
            data-gsap="featured"
            className={`featured-card group grid items-stretch gap-0 overflow-hidden rounded-2xl transition-all duration-[250ms] ease-in-out md:grid-cols-12 ${className || ""}`}
        >
            <div className="relative aspect-video w-full overflow-hidden md:col-span-7 md:aspect-auto">
                {post.mainImage && (
                    <Image
                        src={urlForImage(post.mainImage).width(1200).height(675).fit("crop").url()}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        priority
                    />
                )}
            </div>

            <div className="flex flex-col justify-center space-y-5 p-8 md:col-span-5 md:p-10">
                <div className="flex items-center justify-between gap-3">
                    <span className="insight-date text-xs font-mono-code uppercase tracking-wider">
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                    {showSubscriberBadge && post.access === "subscriber" ? (
                        <span className="rounded-full border border-gold/25 bg-gold/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                            Members
                        </span>
                    ) : null}
                </div>

                <h2 className="insight-title text-2xl font-heading font-bold leading-tight tracking-tight transition-colors duration-[250ms] md:text-3xl">
                    <Link href={`/insights/${post.slug.current}`}>
                        {post.title}
                    </Link>
                </h2>

                <p className="insight-excerpt text-base leading-relaxed line-clamp-3 md:line-clamp-4">
                    {post.excerpt}
                </p>

                <div className="insight-cta-divider pt-5">
                    <Link
                        href={`/insights/${post.slug.current}`}
                        className="featured-cta inline-flex items-center text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-[250ms]"
                    >
                        <span>{showSubscriberBadge && post.access === "subscriber" ? "Open Teaser" : "Access Note"}</span>
                        <ArrowRight className="insight-arrow ml-2 h-4 w-4 transition-transform duration-[250ms]" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
