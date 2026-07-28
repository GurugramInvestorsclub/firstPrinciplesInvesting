"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { SubscriptionCarousel } from "@/components/thank-you/SubscriptionCarousel"
import { EventCarousel } from "@/components/events/EventCarousel"
import { client } from "@/lib/sanity.client"
import { pastEventsQuery } from "@/lib/sanity.queries"
import { getStartOfTodayKolkata } from "@/lib/utils"
import { Event } from "@/lib/types"
import { 
    ArrowRight, 
    CheckCircle2, 
    Calendar, 
    BookOpen, 
    ExternalLink, 
    Home, 
    Zap, 
    TrendingUp,
    Video,
    Sparkles
} from "lucide-react"

interface QueryParams {
    email: string | null
    source: string | null
    type: string | null
    eventTitle: string | null
    eventDateRaw: string | null
    whatsappLink: string | null
}

function ThankYouContent() {
    const [params, setParams] = useState<QueryParams | null>(null)
    const [pastEvents, setPastEvents] = useState<Event[]>([])
    const [isLoadingEvents, setIsLoadingEvents] = useState(true)

    useEffect(() => {
        const search = new URLSearchParams(window.location.search)
        setParams({
            email: search.get("email"),
            source: search.get("source"),
            type: search.get("type"),
            eventTitle: search.get("eventTitle"),
            eventDateRaw: search.get("eventDate"),
            whatsappLink: search.get("whatsappLink"),
        })

        // Fetch past events dynamically for the past webinars carousel
        const fetchPastEvents = async () => {
            try {
                const startOfDay = getStartOfTodayKolkata().toISOString()
                const events = await client.fetch<Event[]>(pastEventsQuery, { startOfDay })
                setPastEvents(events || [])
            } catch (err) {
                console.error("Error fetching past events for thank you page:", err)
            } finally {
                setIsLoadingEvents(false)
            }
        }

        fetchPastEvents()
    }, [])

    const email = params?.email ?? null
    const source = params?.source ?? null
    const type = params?.type ?? null
    const eventTitle = params?.eventTitle ?? null
    const eventDateRaw = params?.eventDateRaw ?? null
    const whatsappLink = params?.whatsappLink ?? null

    const formattedDate = eventDateRaw ? new Date(eventDateRaw).toLocaleDateString("en-IN", {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: "Asia/Kolkata"
    }) + " IST" : null

    useEffect(() => {
        if (!params) return

        // Fire tracking event: thank_you_view
        console.log("Tracking event: thank_you_view", { source, type, hasEmail: !!email })
        if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "thank_you_view", {
                source: source || "direct",
                type: type || "general",
                has_email: !!email
            })
        }

        // GSAP Micro-interactions
        const initGSAP = async () => {
            const gsap = (await import("gsap")).default
            gsap.to(".primary-btn-glow", {
                opacity: 0.4,
                scale: 1.1,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            })
        }
        initGSAP()
    }, [params, source, type, email])

    const trackClick = (label: string) => {
        console.log(`Tracking click: ${label}`)
        if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", label)
        }
    }

    return (
        <main className="flex-1 flex flex-col items-center justify-center py-16 md:py-24 pt-36 px-4 max-w-6xl mx-auto w-full">
            <div className="w-full text-center space-y-12 animate-fade-in">
                
                {/* SECTION 1: Registration Confirmation */}
                <div className="space-y-6 max-w-3xl mx-auto">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/10 text-gold mb-2 mx-auto">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 
                        className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        {type === 'event' ? "Registration Confirmed! 🎉" : "You're all set 👍"}
                    </h1>
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {type === 'event' ? (
                            <>
                                <div className="space-y-2">
                                    <p className="text-xl md:text-2xl text-text-secondary font-medium leading-tight">
                                        Thank you for registering for the webinar:
                                    </p>
                                    <p className="text-2xl md:text-4xl text-gold font-extrabold tracking-tight">
                                        {eventTitle}
                                    </p>
                                </div>
                                {formattedDate && (
                                    <div className="flex items-center justify-center gap-2 text-text-secondary bg-white/5 py-3 px-6 rounded-2xl border border-white/10 w-fit mx-auto mt-4">
                                        <Calendar className="w-5 h-5 text-gold" />
                                        <span className="font-semibold">{formattedDate}</span>
                                    </div>
                                )}
                                <div className="mt-8 p-6 bg-gold/5 border border-gold/20 rounded-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gold/50" />
                                    <p className="text-lg text-text-primary font-medium">
                                        🚀 The webinar link will be mailed to you <span className="text-gold font-bold">30 minutes before</span> the start of the session.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-xl md:text-2xl text-text-secondary font-medium">
                                    Your response has been recorded.
                                </p>
                                <p className="text-lg text-text-secondary/70">
                                    We&apos;ll keep you posted with what&apos;s next.
                                </p>
                            </>
                        )}
                    </div>
                </div>
                
                {/* SECTION 1.5: WhatsApp Community (Conditional) */}
                {whatsappLink && (
                    <div className="max-w-2xl mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-colors duration-500" />
                        
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-2xl font-bold text-[#25D366] flex items-center justify-center gap-2 text-center">
                                <Zap className="w-6 h-6 fill-emerald-500/20" /> Join our WhatsApp group for {eventTitle || (type === "super30" ? "this program" : "this event")}
                            </h3>
                        </div>
                        
                        <Button
                            asChild
                            size="lg"
                            className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-8 h-14 text-lg font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-[1.02] transition-all duration-300"
                        >
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                Join the WhatsApp Group
                                <ExternalLink className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </a>
                        </Button>
                    </div>
                )}

                {/* SECTION 2: PRIMARY UP-SELL - Subscription & Membership Carousel */}
                <div className="w-full pt-4">
                    <SubscriptionCarousel />
                </div>

                {/* SECTION 3: SECONDARY UP-SELL - Explore Our Past Webinars Carousel */}
                <div className="w-full py-12 space-y-8 border-t border-white/10 text-left">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-text-secondary uppercase tracking-widest">
                                <Video className="w-3.5 h-3.5 text-gold" />
                                <span>On-Demand Library</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                                Explore Our <span className="text-gold">Past Webinars</span>
                            </h2>
                            <p className="text-text-secondary text-base max-w-xl font-light">
                                Missed our previous masterclasses? Stream full recordings and institutional breakdowns from past sessions.
                            </p>
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            className="rounded-full px-6 border-white/20 hover:border-gold/50 hover:bg-gold/5 text-text-primary shrink-0 w-fit"
                            onClick={() => trackClick("past_events_view_all")}
                        >
                            <Link href="/events" className="flex items-center gap-2">
                                Browse All Past Events
                                <ArrowRight className="w-4 h-4 text-gold" />
                            </Link>
                        </Button>
                    </div>

                    {/* Past Events Carousel */}
                    {isLoadingEvents ? (
                        <div className="py-16 text-center text-text-secondary">
                            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <span>Loading past webinar recordings...</span>
                        </div>
                    ) : pastEvents && pastEvents.length > 0 ? (
                        <div className="w-full overflow-hidden">
                            <EventCarousel events={pastEvents} isPastEvent={true} />
                        </div>
                    ) : (
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4">
                            <p className="text-text-secondary text-base">
                                Check out our full events catalog to see past webinar recordings and upcoming live masterclasses.
                            </p>
                            <Button asChild variant="outline" className="rounded-full border-gold/30 text-gold hover:bg-gold/10">
                                <Link href="/events">Visit Events Center</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* SECTION 4: Value Reinforcement Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/10 text-left max-w-4xl mx-auto">
                    {[
                        {
                            title: "Practical Investing Insights",
                            description: "No jargon. Only actionable ideas.",
                            icon: BookOpen
                        },
                        {
                            title: "No Noise. Only What Matters",
                            description: "We filter the signal from the noise.",
                            icon: Zap
                        },
                        {
                            title: "Built for Long-Term Investors",
                            description: "Designed for compounding, not speculation.",
                            icon: TrendingUp
                        }
                    ].map((item, i) => {
                        const Icon = item.icon
                        return (
                            <div key={i} className="space-y-4 group">
                                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-base font-bold text-text-primary tracking-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* SECTION 5: Exit & Navigation Options */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-text-secondary border-t border-white/5">
                    <Link href="/" className="flex items-center gap-2 hover:text-text-primary transition-colors">
                        <Home className="w-4 h-4" /> Back to Home
                    </Link>
                    <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
                    <Link href="/insights" className="flex items-center gap-2 hover:text-text-primary transition-colors">
                        <BookOpen className="w-4 h-4 text-gold" /> Explore Insights & Articles
                    </Link>
                    <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
                    <Link href="/membership" className="flex items-center gap-2 hover:text-text-primary transition-colors">
                        <Sparkles className="w-4 h-4 text-gold" /> Membership Details
                    </Link>
                </div>

            </div>
        </main>
    )
}

export default function ThankYouPage() {
    return (
        <div className="flex flex-col min-h-screen bg-bg-deep text-text-primary selection:bg-gold/20 selection:text-gold">
            <Navbar />
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center text-gold">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
            }>
                <ThankYouContent />
            </Suspense>
            <Footer />
        </div>
    )
}
