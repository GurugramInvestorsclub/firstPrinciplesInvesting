import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { Post } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"

interface InsightCardProps {
    post: Post
}

export function InsightCard({ post }: InsightCardProps) {
    return (
        <div className="group flex flex-col justify-between h-full bg-bg-primary/30 rounded-lg overflow-hidden border border-text-secondary/10 hover:border-gold/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,184,0,0.05)]">
            {/* Image Section - Technical / Report Style */}
            <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-text-secondary/10 transition-all duration-500">
                {post.mainImage && (
                    <Image
                        src={urlForImage(post.mainImage).width(800).height(450).fit("crop").url()}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                )}
                {/* Overlay Texture */}
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay"></div>
            </div>

            <div className="flex flex-col flex-grow p-6 space-y-4">
                <div className="space-y-3">
                    {/* Meta Data Row */}
                    <div className="flex items-center justify-between text-xs font-mono text-text-secondary/70">
                        <span className="uppercase tracking-wider">
                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gold">
                            REF-{post.slug.current.slice(0, 4).toUpperCase()}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold leading-tight text-text-primary group-hover:text-gold transition-colors font-serif tracking-tight">
                        <Link href={`/insights/${post.slug.current}`} className="hover:underline decoration-gold/30 underline-offset-4">
                            {post.title}
                        </Link>
                    </h3>

                    <p className="text-text-secondary text-sm leading-relaxed line-clamp-3 border-l-2 border-text-secondary/10 pl-3">
                        {post.excerpt}
                    </p>
                </div>

                <div className="pt-4 mt-auto border-t border-text-secondary/10">
                    <Link href={`/insights/${post.slug.current}`} className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-text-primary group-hover:text-gold transition-colors">
                        <span>Access Note</span>
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 text-text-secondary group-hover:text-gold" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
