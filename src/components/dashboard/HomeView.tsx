"use client"

import { useState, useEffect } from "react"
import { Clock, ArrowRight, Star } from "lucide-react"
import Image from "next/image"
import { urlForImage } from "@/lib/sanity.image"

interface HomeViewProps {
    userName: string
    onNavigate: (tab: string, arg?: string) => void
    posts: any[]
    upcomingEvents: any[]
}

function calculateReadingTime(body: any[] | undefined): string {
    if (!body || !Array.isArray(body)) return "15 min read"
    let text = ""
    body.forEach((block: any) => {
        if (block._type === "block" && block.children) {
            block.children.forEach((child: any) => {
                if (child.text) {
                    text += " " + child.text
                }
            })
        }
    })
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length
    if (wordCount === 0) return "15 min read"
    const min = Math.ceil(wordCount / 220)
    return `${min} min read`
}

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        })
    } catch (e) {
        return dateStr
    }
}

export function HomeView({ userName, onNavigate, posts, upcomingEvents }: HomeViewProps) {
    const [lastRead, setLastRead] = useState<{ title: string; slug: string; progress: number; readTime: string } | null>(null)

    // Load actual reading progress from localStorage if available
    useEffect(() => {
        const savedProgress = localStorage.getItem("fpi-reader-progress")
        if (savedProgress) {
            try {
                const parsed = JSON.parse(savedProgress)
                const report = posts.find(r => r.slug?.current === parsed.slug)
                if (report) {
                    setLastRead({
                        title: report.title,
                        slug: report.slug?.current,
                        progress: Math.round(parsed.percent),
                        readTime: calculateReadingTime(report.body)
                    })
                }
            } catch (e) {
                console.error(e)
            }
        }
    }, [posts])

    // Filter premium (subscriber) and free (public) articles
    const premiumArticles = posts.filter(r => r.access === "subscriber").slice(0, 3)
    const freeArticles = posts.filter(r => r.access !== "subscriber").slice(0, 3)

    // Latest premium article to show as fallback for continue reading
    const latestPremium = posts.find(r => r.access === "subscriber") || posts[0]

    return (
        <div className="space-y-16 text-left max-w-4xl mx-auto py-4">
            
            {/* 1. Hero Greetings */}
            <div className="space-y-2 pb-6 border-b border-white/5">
                <h1 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight font-sans">
                    Welcome back, {userName}.
                </h1>
                <p className="text-sm text-neutral-400 font-light max-w-lg">
                    Continue building your investing knowledge. Review the latest structural deep dives below.
                </p>
            </div>

            {/* 2. Continue Reading or Latest Article Banner */}
            <div className="space-y-4">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">
                    {lastRead ? "CONTINUE READING" : "LATEST PREMIUM MEMO"}
                </span>

                {lastRead ? (
                    <div 
                        onClick={() => onNavigate("members-only", lastRead.slug)}
                        className="p-6 md:p-8 rounded-2xl border border-white/5 bg-[#1E1E1E] hover:border-gold/30 hover:bg-[#2E2E2E]/40 transition-all duration-300 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                        <div className="space-y-3 max-w-xl">
                            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{lastRead.readTime}</span>
                                <span className="w-1 h-1 rounded-full bg-neutral-700" />
                                <span>{lastRead.progress}% completed</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight leading-snug">
                                {lastRead.title}
                            </h2>
                        </div>
                        <button
                            className="shrink-0 bg-gold text-bg-deep font-bold px-6 py-3 rounded-full text-xs flex items-center gap-2 transition-transform cursor-pointer"
                        >
                            <span>Resume</span>
                            <ArrowRight className="w-3.5 h-3.5 text-bg-deep" />
                        </button>
                    </div>
                ) : (
                    latestPremium && (
                        <div 
                            onClick={() => onNavigate("members-only", latestPremium.slug?.current)}
                            className="p-6 md:p-8 rounded-2xl border border-white/5 bg-[#1E1E1E] hover:border-gold/30 hover:bg-[#2E2E2E]/40 transition-all duration-300 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                        >
                            <div className="space-y-3 max-w-xl">
                                <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{calculateReadingTime(latestPremium.body)}</span>
                                    <span className="w-1 h-1 rounded-full bg-neutral-700" />
                                    <span className="text-gold uppercase font-bold text-[9px] tracking-wider bg-gold/10 px-2 py-0.5 rounded">PREMIUM</span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight leading-snug">
                                    {latestPremium.title}
                                </h2>
                                <p className="text-xs text-neutral-400 font-light leading-relaxed line-clamp-2">
                                    {latestPremium.excerpt}
                                </p>
                            </div>
                            <button
                                className="shrink-0 bg-gold text-bg-deep font-bold px-6 py-3 rounded-full text-xs flex items-center gap-2 transition-transform cursor-pointer"
                            >
                                <span>Read Article</span>
                                <ArrowRight className="w-3.5 h-3.5 text-bg-deep" />
                            </button>
                        </div>
                    )
                )}
            </div>

            {/* 3. Members Only Research */}
            <div className="space-y-6">
                <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
                    <h2 className="text-lg font-bold text-text-primary font-mono uppercase tracking-wider">
                        Members Only Research
                    </h2>
                    <button
                        onClick={() => onNavigate("members-only")}
                        className="text-xs text-gold hover:underline font-mono cursor-pointer"
                    >
                        View All
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {premiumArticles.map((report) => (
                        <div 
                            key={report._id || report.id}
                            onClick={() => onNavigate("members-only", report.slug?.current)}
                            className="flex flex-col border border-white/5 hover:border-gold/25 bg-[#1E1E1E] rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-300 cursor-pointer group"
                        >
                            {/* Cover image if available */}
                            {report.mainImage && (
                                <div className="relative aspect-[16/9] w-full overflow-hidden">
                                    <Image
                                        src={urlForImage(report.mainImage).width(400).height(225).fit("crop").url()}
                                        alt={report.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                </div>
                            )}

                            {/* Card Details */}
                            <div className="p-6 flex flex-col justify-between flex-grow min-h-[220px]">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 uppercase">
                                        <span>{formatDate(report.publishedAt)}</span>
                                        <span className="text-gold bg-gold/10 px-2 py-0.5 rounded font-bold">PREMIUM</span>
                                    </div>
                                    <h3 className="text-base font-bold text-text-primary group-hover:text-gold transition-colors leading-snug line-clamp-2">
                                        {report.title}
                                    </h3>
                                    <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                                        {report.excerpt}
                                    </p>
                                </div>

                                <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-neutral-500">
                                    <span>{calculateReadingTime(report.body)}</span>
                                    <span className="text-gold">Read Article ↗</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Upcoming Case Study Card */}
                    <div 
                        onClick={() => onNavigate("members-only")}
                        className="flex flex-col border border-white/5 hover:border-gold/15 bg-[#1E1E1E]/50 rounded-2xl overflow-hidden relative group opacity-90 hover:opacity-100 transition-all duration-300 cursor-pointer select-none"
                    >
                        {/* Card Cover image */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden">
                            <Image
                                src="/images/fluid_transmission.png"
                                alt="Upcoming Case Study: Fluid Power & Transmission Systems"
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-80" />
                        </div>

                        <div className="p-6 flex flex-col justify-between flex-grow min-h-[220px]">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 uppercase">
                                    <span>COMING SOON</span>
                                    <span className="text-gold/80 bg-gold/5 border border-gold/10 px-2 py-0.5 rounded font-mono font-bold tracking-wider text-[9px]">PREMIUM</span>
                                </div>
                                <h3 className="text-base font-bold text-neutral-300 leading-snug line-clamp-2">
                                    Case Study: Fluid Power & Industrial Transmission Systems
                                </h3>
                                <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                                    An in-depth analysis of the engineering moats, high switching costs, and capital allocation strategies of market-leading monopolies in mechanical power transmission.
                                </p>
                            </div>

                            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-neutral-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-neutral-500" />
                                    <span>Upcoming Deep Dive</span>
                                </div>
                                <span className="text-neutral-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                                    Research In Progress
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Free Research */}
            <div className="space-y-6">
                <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
                    <h2 className="text-lg font-bold text-text-primary font-mono uppercase tracking-wider">
                        Free Research Notes
                    </h2>
                    <button
                        onClick={() => onNavigate("free-research")}
                        className="text-xs text-gold hover:underline font-mono cursor-pointer"
                    >
                        View All
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {freeArticles.map((report) => (
                        <div 
                            key={report._id || report.id}
                            onClick={() => onNavigate("free-research", report.slug?.current)}
                            className="flex flex-col border border-white/5 hover:border-gold/25 bg-[#1E1E1E] rounded-2xl overflow-hidden hover:bg-white/5 transition-all duration-300 cursor-pointer group"
                        >
                            {/* Cover image if available */}
                            {report.mainImage && (
                                <div className="relative aspect-[16/9] w-full overflow-hidden">
                                    <Image
                                        src={urlForImage(report.mainImage).width(400).height(225).fit("crop").url()}
                                        alt={report.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                </div>
                            )}

                            {/* Card Details */}
                            <div className="p-6 flex flex-col justify-between flex-grow min-h-[220px]">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 uppercase">
                                        <span>{formatDate(report.publishedAt)}</span>
                                        <span className="text-neutral-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-bold">FREE</span>
                                    </div>
                                    <h3 className="text-base font-bold text-text-primary group-hover:text-gold transition-colors leading-snug line-clamp-2">
                                        {report.title}
                                    </h3>
                                    <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                                        {report.excerpt}
                                    </p>
                                </div>

                                <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-neutral-500">
                                    <span>{calculateReadingTime(report.body)}</span>
                                    <span className="text-gold">Read Article ↗</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Upcoming Events */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-text-primary border-b border-white/5 pb-3 font-mono uppercase tracking-wider">
                    Upcoming Webinars & Meetups
                </h2>

                {upcomingEvents.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {upcomingEvents.slice(0, 2).map((event) => (
                            <div 
                                key={event.eventId || event.id}
                                className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] flex flex-col justify-between min-h-[200px]"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 uppercase">
                                        <span>{event.location || "WEBINAR"}</span>
                                        <span>{formatDate(event.date)}</span>
                                    </div>
                                    <h3 className="text-base font-bold text-text-primary leading-snug">{event.title}</h3>
                                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                                        {event.shortDescription}
                                    </p>
                                </div>
                                <div className="pt-2 border-t border-white/5 flex justify-end">
                                    <button
                                        onClick={() => onNavigate("events")}
                                        className="bg-gold text-bg-deep font-bold px-5 py-2.5 rounded-full text-xs active:scale-[0.98] transition-transform cursor-pointer"
                                    >
                                        Register Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-xs text-neutral-500">
                        No upcoming events.
                    </div>
                )}
            </div>

        </div>
    )
}
