"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, Variants } from "framer-motion"
import { ArrowRight, BookOpen, Clock } from "lucide-react"
import { Post } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"

// Helper to estimate reading time based on excerpt length or body content
function getReadingTime(text: string) {
    const wordsPerMinute = 200;
    const wordCount = text?.split(/\s+/).length || 0;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    // Usually a memo reading time is minimum 3-5 mins, let's ensure it looks realistic
    return Math.max(3, minutes + 2); 
}

// Map some arbitrary tags based on keywords, or fallback to generic
function getTags(post: Post) {
    const title = post.title.toLowerCase();
    const tags = [];
    
    if (title.includes('energy') || title.includes('nuclear') || title.includes('power')) {
        tags.push('ENERGY');
    } else if (title.includes('chemical') || title.includes('pharma')) {
        tags.push('CHEMICALS');
    } else if (title.includes('macro') || title.includes('economy') || title.includes('finance')) {
        tags.push('MACRO NOTE');
    } else if (title.includes('global') || title.includes('international')) {
        tags.push('GLOBAL STRATEGY');
    }
    
    return tags.slice(0, 2); // max 2 tags
}

export const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.6, ease: "easeOut" } 
    }
}

export function MemoCard({ post }: { post: Post }) {
    const dateStr = new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).toUpperCase();
    
    const readingTime = 7;
    const tags = getTags(post);

    return (
        <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } }}
            className="group relative flex flex-col h-full rounded-2xl border border-text-secondary/10 bg-bg-primary/20 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-text-secondary/30 hover:shadow-[0_8px_40px_rgba(255,255,255,0.04)]"
        >
            {/* Subtle top glare */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none z-10" />

            {/* Poster Header */}
            <div className="relative aspect-[16/9] w-full bg-[#0A0A0A] overflow-hidden flex-shrink-0 border-b border-text-secondary/10 z-0">
                {post.mainImage ? (
                    <>
                        <Image
                            src={urlForImage(post.mainImage).width(800).height(450).fit("crop").url()}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/85" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-bg-primary/60 via-bg-deep/80 to-gold/10 opacity-80" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/80" />
                    </>
                )}
                
                {/* Noise texture overlay */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

                {/* Tags overlaid on the poster image */}
                <div className="absolute top-5 left-5 right-5 flex flex-wrap gap-2 z-20">
                    {tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded bg-black/40 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs font-bold font-mono tracking-widest text-text-primary uppercase shadow-lg">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-col flex-grow p-6 sm:p-8 z-10">
                
                {/* Date + Reading Time */}
                <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-text-secondary mb-4 uppercase">
                    <span>{dateStr}</span>
                    <span className="text-text-secondary/30">•</span>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{readingTime} min read</span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-text-primary mb-3 group-hover:text-gold transition-colors duration-300">
                    <Link href={`/insights/${post.slug.current}`} className="hover:underline underline-offset-4 decoration-gold/30">
                        {post.title}
                    </Link>
                </h3>

                {/* Short Thesis / Description */}
                <p className="text-sm text-text-secondary/80 leading-relaxed line-clamp-3 mb-6 flex-grow">
                    {post.excerpt}
                </p>

                {/* Author attribution / Authority Signal */}
                <div className="flex items-center gap-3 pt-4 border-t border-text-secondary/10 mt-auto mb-6">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-text-secondary/70" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-primary">
                            Research Desk
                        </span>
                        <span className="text-[10px] text-text-secondary/70 uppercase tracking-wide">
                            First Principles Investing
                        </span>
                    </div>
                </div>

                {/* CTA Action */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                        href={`/insights/${post.slug.current}`}
                        className="flex items-center justify-between w-full p-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-[0.15em] text-text-primary hover:bg-gold hover:text-bg-deep hover:border-gold transition-all duration-300 shadow-md"
                    >
                        <span>View Thesis</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    )
}
