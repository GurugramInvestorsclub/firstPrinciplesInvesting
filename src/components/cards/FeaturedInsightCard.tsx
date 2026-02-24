import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Post } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"

interface FeaturedInsightCardProps {
    post: Post
    className?: string
}

export function FeaturedInsightCard({ post, className }: FeaturedInsightCardProps) {
    return (
        <div
            data-gsap="featured"
            className={`featured-card group grid md:grid-cols-12 gap-0 items-stretch rounded-2xl overflow-hidden transition-all duration-[250ms] ease-in-out ${className || ""}`}
        >
            {/* Image — Left, 7 columns */}
            <div className="md:col-span-7 relative aspect-video md:aspect-auto w-full overflow-hidden">
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

            {/* Content — Right, 5 columns */}
            <div className="md:col-span-5 flex flex-col justify-center p-8 md:p-10 space-y-5">
                {/* Date — Mono, above title */}
                <span className="insight-date text-xs font-mono-code uppercase tracking-wider">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </span>

                {/* Title */}
                <h2 className="insight-title text-2xl md:text-3xl font-heading font-bold tracking-tight leading-tight transition-colors duration-[250ms]">
                    <Link href={`/insights/${post.slug.current}`}>
                        {post.title}
                    </Link>
                </h2>

                {/* Excerpt */}
                <p className="insight-excerpt text-base leading-relaxed line-clamp-3 md:line-clamp-4">
                    {post.excerpt}
                </p>

                {/* CTA — Divider + Access Note */}
                <div className="insight-cta-divider pt-5">
                    <Link
                        href={`/insights/${post.slug.current}`}
                        className="featured-cta inline-flex items-center text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-[250ms]"
                    >
                        <span>Access Note</span>
                        <ArrowRight className="insight-arrow ml-2 h-4 w-4 transition-transform duration-[250ms]" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
