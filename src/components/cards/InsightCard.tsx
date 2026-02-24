import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Post } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"

interface InsightCardProps {
    post: Post
}

export function InsightCard({ post }: InsightCardProps) {
    return (
        <div
            data-gsap="grid-card"
            className="insight-card group flex flex-col justify-between h-full rounded-xl overflow-hidden transition-all duration-[250ms] ease-in-out"
        >
            {/* Image Section */}
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

            <div className="flex flex-col flex-grow p-6 space-y-4">
                <div className="space-y-3">
                    {/* Date — Mono */}
                    <span className="insight-date block text-xs font-mono-code uppercase tracking-wider">
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </span>

                    {/* Title */}
                    <h3 className="insight-title text-xl font-heading font-bold leading-tight tracking-tight transition-colors duration-[250ms]">
                        <Link
                            href={`/insights/${post.slug.current}`}
                            className="insight-title-link hover:underline underline-offset-4"
                        >
                            {post.title}
                        </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="insight-excerpt text-sm leading-relaxed line-clamp-3">
                        {post.excerpt}
                    </p>
                </div>

                {/* CTA — Divider + Access Note */}
                <div className="insight-cta-divider pt-4 mt-auto">
                    <Link
                        href={`/insights/${post.slug.current}`}
                        className="insight-cta flex items-center justify-between text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-[250ms]"
                    >
                        <span>Access Note</span>
                        <ArrowRight className="insight-arrow h-3.5 w-3.5 transition-transform duration-[250ms]" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
