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
        <div className="group flex flex-col justify-between h-full space-y-4 p-5 rounded-2xl border border-transparent hover:border-text-secondary/10 hover:bg-bg-deep/50 hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
                {post.mainImage && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-text-secondary/10 bg-secondary/20 shadow-sm">
                        <Image
                            src={urlForImage(post.mainImage).width(800).height(450).fit("crop").url()}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <div className="text-xs font-medium text-gold/80 uppercase tracking-wide">
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </div>
                    <h3 className="text-xl font-bold leading-tight group-hover:text-gold transition-colors text-text-primary">
                        <Link href={`/insights/${post.slug.current}`}>
                            {post.title}
                        </Link>
                    </h3>
                </div>

                <p className="text-text-secondary line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                </p>
            </div>
            <Link href={`/insights/${post.slug.current}`} className="inline-flex items-center text-sm font-semibold text-gold hover:underline mt-auto pt-2">
                Read Article <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
    )
}
