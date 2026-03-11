"use client"

import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { ArrowRight, FileText } from "lucide-react"
import { Post } from "@/lib/types"
import { MemoCard } from "@/components/cards/MemoCard"
import { Button } from "@/components/ui/button"

interface RecentInsightsProps {
    posts: Post[]
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

export function RecentInsights({ posts }: RecentInsightsProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="relative py-24 container max-w-[1400px] px-4 md:px-8 mx-auto bg-bg-deep text-text-primary border-t border-white/5 overflow-hidden">
            {/* Subtle radial glow background to enhance visual depth */}
            <div className="absolute top-10 left-1/4 w-[800px] h-[600px] bg-gold/5 rounded-full blur-[140px] pointer-events-none z-0" style={{ mixBlendMode: 'screen' }} />
            <div className="absolute top-1/2 right-10 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0" style={{ mixBlendMode: 'screen' }} />

            <div className="relative z-10 max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-8"
                >
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gold uppercase tracking-widest backdrop-blur-sm shadow-sm">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                            </span>
                            Research Desk
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-text-primary">
                            Investment <span className="text-text-secondary">Memos.</span>
                        </h2>
                    </div>

                    <div className="hidden md:block">
                        <span className="text-xs text-text-secondary/60 uppercase tracking-widest font-mono border-b border-text-secondary/20 pb-1">
                            Latest Dispatches
                        </span>
                    </div>
                </motion.div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                    className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16"
                >
                    {posts.map((post) => (
                        <MemoCard key={post.slug.current} post={post} />
                    ))}
                </motion.div>

                <div className="flex justify-center mt-4">
                    <Button asChild variant="outline" className="rounded-full px-8 py-6 border-white/10 hover:border-gold/40 hover:bg-gold/10 text-text-primary bg-white/5 backdrop-blur-md transition-all duration-300 shadow-md">
                        <Link href="/insights" className="flex items-center gap-2 text-sm font-bold tracking-wide uppercase">
                            View Research Archive <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
