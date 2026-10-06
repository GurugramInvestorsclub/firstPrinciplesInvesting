import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { singleLeadMagnetQuery, recentPostsQuery, upcomingEventsHomeQuery } from "@/lib/sanity.queries"
import { LeadMagnet, Post, Event } from "@/lib/types"
import { MemoCard } from "@/components/cards/MemoCard"
import { getStartOfTodayKolkata } from "@/lib/utils"
import {
  CheckCircle2,
  Mail,
  ArrowRight,
  Star,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react"


export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    email?: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const leadMagnet = await client.fetch<LeadMagnet | null>(singleLeadMagnetQuery, { slug })

  return {
    title: leadMagnet ? `Thank You - ${leadMagnet.title}` : "Thank You | First Principles Investing",
    description: "Your complimentary research report has been dispatched to your email.",
  }
}

export default async function LeadMagnetThankYouPage({ params, searchParams }: Props) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const email = resolvedSearchParams?.email ? decodeURIComponent(resolvedSearchParams.email) : null

  const startOfDay = getStartOfTodayKolkata().toISOString()

  // Fetch lead magnet, fallback posts, and upcoming events in parallel
  const [leadMagnet, fallbackPosts, upcomingEvents] = await Promise.all([
    client.fetch<LeadMagnet | null>(singleLeadMagnetQuery, { slug }),
    client.fetch<Post[]>(recentPostsQuery),
    client.fetch<Event[]>(upcomingEventsHomeQuery, { startOfDay }).catch(() => []),
  ])

  if (!leadMagnet) {
    notFound()
  }

  const samplePosts: Post[] =
    leadMagnet.sampleInsights && leadMagnet.sampleInsights.length > 0
      ? (leadMagnet.sampleInsights.filter(Boolean) as Post[])
      : (fallbackPosts || []).slice(0, 3)

  const liveWebinar = upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents[0] : null

  return (
    <div className="flex flex-col min-h-screen bg-bg-deep text-text-primary">
      <Navbar />

      <main className="flex-1 relative overflow-hidden py-16 md:py-24">
        {/* Ambient background glows */}
        <div className="absolute top-10 left-1/4 w-[700px] h-[500px] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-10 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="container max-w-5xl px-4 sm:px-6 md:px-8 mx-auto relative z-10 space-y-16">
          
          {/* 1. Confirmation & Dispatch Hero Card */}
          <div className="rounded-3xl bg-[#141418] border border-white/10 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 text-gold shadow-lg shadow-gold/10">
                <CheckCircle2 className="w-8 h-8 text-gold" />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-gold">
                  Dispatch Confirmed
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Your Report is on its Way!
                </h1>
                <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
                  Thank you for your interest in{" "}
                  <strong className="text-white font-semibold">{leadMagnet.title}</strong>.
                  We have dispatched your complimentary PDF report to{" "}
                  <span className="text-gold font-mono font-medium underline underline-offset-4">
                    {email || "your email address"}
                  </span>.
                </p>
              </div>

              {/* Delivery tips banner */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-left flex items-start gap-3.5 text-xs text-neutral-400 font-mono">
                <Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-neutral-200 font-medium block">Check your inbox in 1–2 minutes:</span>
                  <span>If you don&apos;t see it immediately, please check your Promotions or Spam folder and move it to Primary to ensure future memos reach you.</span>
                </div>
              </div>
            </div>
          </div>


          {/* 2. Paid Subscription Upsell Banner */}
          <div className="p-2 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl">
            <div className="rounded-[2.2rem] bg-[#1E1E1E] border border-[#2E2E2E] p-8 md:p-12 relative overflow-hidden grid md:grid-cols-12 gap-8 items-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

              <div className="md:col-span-8 space-y-4 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/20 bg-gold/5">
                  <Star className="w-3.5 h-3.5 text-gold fill-gold/20" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-gold">
                    Premium Membership
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                  Loved this research? <br />
                  Get institutional-grade conviction every month.
                </h2>

                <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed max-w-xl">
                  Stop outsourcing your thesis to Twitter or news channels. Full members receive 2 comprehensive research memos every month, complete valuation models, and private investor discussions.
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-400 font-mono pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    <span>2 Research Memos / Month</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    <span>Full Excel Models</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    <span>Members-Only Archive</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center">
                <Link
                  href="/insights"
                  className="group flex items-center gap-2 bg-gold hover:bg-[#E0A800] text-black font-extrabold px-6 py-3.5 rounded-full text-xs transition-all active:scale-[0.98] shadow-lg shadow-gold/15"
                >
                  <span>Explore Membership Plans</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* 3. Upcoming Live Webinar / Event Banner (if available) */}
          {liveWebinar && (
            <div className="rounded-2xl bg-gradient-to-r from-[#17171C] to-[#121216] border border-gold/30 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 text-left">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Upcoming Live Masterclass</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {liveWebinar.title}
                </h3>
                {liveWebinar.shortDescription && (
                  <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
                    {liveWebinar.shortDescription}
                  </p>
                )}
              </div>

              <Link
                href={`/events/${liveWebinar.slug.current}`}
                className="shrink-0 inline-flex items-center gap-2 bg-white/10 hover:bg-gold hover:text-black border border-white/20 hover:border-gold px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all"
              >
                <span>Reserve Your Seat</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* 4. Previous Insights Showcase (Samples) */}
          {samplePosts.length > 0 && (
            <section className="space-y-8 pt-4">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div className="space-y-2 text-left">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sample Our Work
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Previous Research Memos
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400">
                    A selection of fundamental deep dives published by our research desk.
                  </p>
                </div>

                <Link
                  href="/insights/archive"
                  className="text-xs font-mono text-gold hover:underline flex items-center gap-1.5"
                >
                  <span>Browse Full Archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {samplePosts.map((post) => (
                  <MemoCard key={post._id} post={post} />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
