import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Post } from "@/lib/types"
import { InsightCard } from "@/components/cards/InsightCard"

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
                    <InsightCard key={post.slug.current} post={post} />
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
