import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"
import { Post } from "@/lib/types"
import { InsightCard } from "@/components/cards/InsightCard"
import { Button } from "@/components/ui/button"

interface RecentInsightsProps {
    posts: Post[]
}

export function RecentInsights({ posts }: RecentInsightsProps) {
    return (
        <section className="py-24 container max-w-5xl px-4 mx-auto bg-bg-deep text-text-primary border-t border-text-secondary/10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-widest">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Research Desk</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">Investment Memos</h2>
                </div>

                <div className="hidden md:block">
                    <span className="text-xs text-text-secondary/60 uppercase tracking-widest font-medium">Latest Dispatches</span>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3 mb-12">
                {posts.map((post) => (
                    <InsightCard key={post.slug.current} post={post} />
                ))}
            </div>

            <div className="flex justify-center">
                <Button asChild variant="outline" className="rounded-full px-8 border-text-secondary/30 text-text-primary hover:bg-gold/10 hover:border-gold hover:text-gold transition-all duration-300">
                    <Link href="/insights">
                        View Archive <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </section>
    )
}
