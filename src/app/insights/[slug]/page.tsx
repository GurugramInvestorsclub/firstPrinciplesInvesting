import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { singlePostQuery, eventsQuery } from "@/lib/sanity.queries"
import { Post, Event } from "@/lib/types"
import { AnnouncementBar } from "@/components/insights/AnnouncementBar"
import { RichText } from "@/components/sanity/RichText"
import { auth } from "@/auth"
import { getInsightsSubscriptionUiState, userHasInsightsAccess } from "@/lib/insights-subscription-service"
import { InsightsSubscriptionCheckout } from "@/components/insights/InsightsSubscriptionCheckout"
import { CommentsSection, CommentType } from "@/components/insights/CommentsSection"
import { getComments } from "@/app/actions/comments"
import { ShareButton } from "@/components/insights/ShareButton"
import { CopyProtection } from "@/components/insights/CopyProtection"
import { ArticleThemeWrapper, ArticleThemeToggleButton } from "@/components/insights/ArticleThemeWrapper"
import { extractHeadings } from "@/lib/toc"
import { TableOfContents } from "@/components/insights/TableOfContents"
import Link from "next/link"
import Image from "next/image"
import { urlForImage } from "@/lib/sanity.image"
import { notFound } from "next/navigation"
import { getStartOfTodayKolkata } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface Props {
    params: Promise<{
        slug: string
    }>
}

export default async function InsightPage({ params }: Props) {
    const { slug } = await params
    const subscriptionUi = getInsightsSubscriptionUiState()
    const paywallReady =
        subscriptionUi.enabled && subscriptionUi.checkoutReady && subscriptionUi.webhookReady

    const startOfDay = getStartOfTodayKolkata().toISOString()

    // Fetch the post contents, auth session, comments, and events in parallel
    const [post, session, commentsResult, upcomingEvents] = await Promise.all([
        client.fetch<Post | null>(singlePostQuery, { slug }, { cache: "no-store" }),
        auth(),
        getComments(slug),
        client.fetch<Event[]>(eventsQuery, { startOfDay }, { next: { revalidate: 60 } })
    ])

    const liveWebinar = upcomingEvents?.[0]

    const hasSubscriptionAccess =
        paywallReady && session?.user?.id
            ? await userHasInsightsAccess(session.user.id)
            : false

    const initialComments = (commentsResult.success ? commentsResult.comments : []) as CommentType[]

    if (!post) {
        notFound()
    }

    const isSubscriberOnly = post.access === "subscriber"
    const shouldLockContent = paywallReady && isSubscriberOnly && !hasSubscriptionAccess
    const previewBody = getPreviewBlocks(post)
    const callbackUrl = `/insights/${slug}`

    const activeBody = shouldLockContent ? previewBody : post.body
    const headings = extractHeadings(activeBody)

    return (
        <ArticleThemeWrapper className="flex flex-col min-h-screen">
            {isSubscriberOnly && <CopyProtection />}
            <Navbar />
            <main className="flex-1 blog-main-container">
                {liveWebinar && (
                    <AnnouncementBar event={liveWebinar} isSubscriber={hasSubscriptionAccess} />
                )}
                {/* Desktop Fixed Left Sidebar Table of Contents */}
                {headings.length > 1 && (
                    <aside className="hidden min-[1320px]:block fixed top-28 left-[max(1rem,calc((100vw-768px)/2-260px))] w-60 z-30 pointer-events-auto">
                        <TableOfContents headings={headings} variant="desktop" />
                    </aside>
                )}

                <article className="container max-w-3xl px-4 sm:px-8 py-12 md:py-20 mx-auto blog-article-container">
                    <header className="mb-12 text-left">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                                {post.title}
                            </h1>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                            <span>
                                Published: {post.publishedAt ? `${new Date(post.publishedAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })} at ${new Date(post.publishedAt).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                })}` : "Date not available"}
                            </span>
                            <ArticleThemeToggleButton />
                        </div>

                        {/* Disclaimer Section */}
                        <div className="my-6 p-4 md:p-5 rounded-xl border border-gold/40 bg-[radial-gradient(circle_at_top_left,rgba(245,184,0,0.1),transparent_70%),rgba(245,184,0,0.02)] backdrop-blur-sm shadow-[0_0_20px_rgba(245,184,0,0.1)] text-[10px] leading-relaxed text-text-primary font-mono">
                            {(Array.isArray(post.disclaimer) ? post.disclaimer.length > 0 : Boolean(post.disclaimer)) ? (
                                <div className="text-[10px] leading-relaxed space-y-2 [&_p]:text-[10px] [&_p]:leading-relaxed [&_strong]:text-[10px] [&_span]:text-[10px]">
                                    <RichText value={post.disclaimer} />
                                </div>
                            ) : (
                                <div className="text-[10px] text-text-primary space-y-2 leading-relaxed">
                                    <p>
                                        <strong className="font-bold text-text-primary text-[10px] mr-1">Disclaimer:</strong> This report is for educational purposes only and does not constitute investment advice. We may own securities discussed in this report and may buy or sell them without notice. Readers should assume that we are invested and may be biased.
                                    </p>
                                    <p>
                                        First Principles Research is not registered with SEBI as a Research Analyst or Investment Adviser. Please do your own research before making any investment decisions.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Mobile / Tablet Collapsible Table of Contents */}
                        {headings.length > 1 && (
                            <div className="min-[1320px]:hidden">
                                <TableOfContents headings={headings} variant="mobile" />
                            </div>
                        )}

                            {post.excerpt && (
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    {post.excerpt}
                                </p>
                            )}
                        </header>

                        {post.mainImage && (
                            <div className="aspect-video w-full rounded-2xl border-2 border-[#F5B800] shadow-[0_0_25px_rgba(245,184,0,0.3)] mb-12 relative overflow-hidden bg-[#12110F] transition-all duration-300 hover:shadow-[0_0_35px_rgba(245,184,0,0.45)]">
                                <Image
                                    src={urlForImage(post.mainImage).width(1200).height(675).url()}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        )}

                        {(shouldLockContent ? previewBody : post.body) && (
                            <div className="prose prose-lg dark:prose-invert mx-auto">
                                <RichText value={shouldLockContent ? previewBody : post.body} />
                            </div>
                        )}

                        {shouldLockContent ? (
                            <section className="mt-10 rounded-3xl border border-gold/20 bg-[radial-gradient(circle_at_top_right,rgba(245,184,0,0.12),transparent_45%),rgba(255,255,255,0.03)] p-6 md:p-8">
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/80">
                                        Subscriber Insight
                                    </p>
                                    <h2 className="text-2xl font-bold text-white">
                                        {post.paywallHeadline ?? "Unlock the full memo with an Insights membership"}
                                    </h2>
                                    <p className="text-sm leading-7 text-white/70">
                                        Read the complete analysis, future member-only notes, and the full archive with a recurring Insights membership.
                                    </p>
                                </div>

                                <div className="mt-6">
                                    {session?.user?.id ? (
                                        <InsightsSubscriptionCheckout
                                            callbackUrl={callbackUrl}
                                            userName={session.user.name}
                                            userEmail={session.user.email}
                                            plans={subscriptionUi.plans}
                                        />
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm text-white/80">
                                                Sign in to start a membership and unlock the rest of this memo.
                                            </p>
                                            <Link
                                                href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                                                className="inline-flex items-center justify-center rounded-xl bg-gold px-5 py-3 text-sm font-bold text-black transition hover:brightness-105"
                                            >
                                                {post.paywallCtaText ?? "Log In To Subscribe"}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </section>
                        ) : null}

                        {/* Bottom Disclaimer Section */}
                        <div className="my-10 p-4 md:p-5 rounded-xl border border-gold/40 bg-[radial-gradient(circle_at_top_left,rgba(245,184,0,0.1),transparent_70%),rgba(245,184,0,0.02)] backdrop-blur-sm shadow-[0_0_20px_rgba(245,184,0,0.1)] text-[10px] leading-relaxed text-text-primary font-mono">
                            {(Array.isArray(post.disclaimer) ? post.disclaimer.length > 0 : Boolean(post.disclaimer)) ? (
                                <div className="text-[10px] leading-relaxed space-y-2 [&_p]:text-[10px] [&_p]:leading-relaxed [&_strong]:text-[10px] [&_span]:text-[10px]">
                                    <RichText value={post.disclaimer} />
                                </div>
                            ) : (
                                <div className="text-[10px] text-text-primary space-y-2 leading-relaxed">
                                    <p>
                                        <strong className="font-bold text-text-primary text-[10px] mr-1">Disclaimer:</strong> This report is for educational purposes only and does not constitute investment advice. We may own securities discussed in this report and may buy or sell them without notice. Readers should assume that we are invested and may be biased.
                                    </p>
                                    <p>
                                        First Principles Research is not registered with SEBI as a Research Analyst or Investment Adviser. Please do your own research before making any investment decisions.
                                    </p>
                                </div>
                            )}
                        </div>

                        <CommentsSection 
                            postSlug={slug} 
                            initialComments={initialComments} 
                            currentUserId={session?.user?.id}
                        />
                    </article>
                <ShareButton title={post.title} text={post.excerpt || ""} />
            </main>
            <Footer />
        </ArticleThemeWrapper>
    )
}

function getPreviewBlocks(post: Post) {
    if (post.previewBody && post.previewBody.length > 0) {
        return post.previewBody
    }

    if (!post.body || post.body.length === 0) {
        return []
    }

    const previewCount = Math.max(1, Math.ceil(post.body.length * 0.1))
    return post.body.slice(0, previewCount)
}
