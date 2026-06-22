import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Post } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"

interface InsightCardProps {
    post: Post
    showSubscriberBadge?: boolean
    hasSubscriptionAccess?: boolean
}

export function InsightCard({ post, showSubscriberBadge, hasSubscriptionAccess }: InsightCardProps) {
    return (
        <div
            data-gsap="grid-card"
            className="insight-card group flex h-full flex-col justify-between overflow-hidden rounded-xl transition-all duration-[250ms] ease-in-out"
        >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
                {post.mainImage && (
                    <Image
                        src={urlForImage(post.mainImage).width(800).height(450).fit("crop").url()}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                    />
                )}
            </div>

            <div className="flex flex-grow flex-col space-y-4 p-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="insight-date block text-xs font-mono-code uppercase tracking-wider">
                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                        {showSubscriberBadge && post.access === "subscriber" ? (
                            <span className="rounded-full border border-gold/25 bg-gold/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                                Members
                            </span>
                        ) : null}
                    </div>

                    <h3 className="insight-title text-xl font-heading font-bold leading-tight tracking-tight transition-colors duration-[250ms]">
                        <Link
                            href={`/insights/${post.slug.current}`}
                            className="insight-title-link hover:underline underline-offset-4"
                        >
                            {post.title}
                        </Link>
                    </h3>

                    <p className="insight-excerpt text-sm leading-relaxed line-clamp-3">
                        {post.excerpt}
                    </p>
                </div>

                <div className="insight-cta-divider mt-auto pt-4">
                    <Link
                        href={`/insights/${post.slug.current}`}
                        className="insight-cta flex items-center justify-between text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-[250ms]"
                    >
                        <span>
                            {showSubscriberBadge && post.access === "subscriber"
                                ? (hasSubscriptionAccess ? "Read Now" : "Open Teaser")
                                : "Access Note"}
                        </span>
                        <ArrowRight className="insight-arrow h-3.5 w-3.5 transition-transform duration-[250ms]" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
