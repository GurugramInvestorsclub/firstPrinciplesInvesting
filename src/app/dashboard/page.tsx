import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { groq } from "next-sanity"
import { client } from "@/lib/sanity.client"
import { prisma } from "@/lib/prisma"
import { eventsQuery, pastEventsQuery, recordingsQuery, notesQuery } from "@/lib/sanity.queries"
import { getCurrentInsightsMembershipForUser } from "@/lib/insights-subscription-service"
import { ResearchDesk } from "@/components/dashboard/ResearchDesk"
import { getArticleRatingsMap } from "@/app/actions/ratings"
import { getStartOfTodayKolkata } from "@/lib/utils"

const dashboardPostsQuery = groq`
  *[_type == "post" && (!defined(approvalStatus) || approvalStatus != "pending")] | order(publishedAt desc) {
    _id,
    title,
    slug,
    isFeatured,
    excerpt,
    access,
    mainImage,
    publishedAt,
    body,
    disclaimer,
    updates[] {
      _key,
      title,
      url,
      badge,
      date,
      description,
      post-> {
        _id,
        title,
        slug,
        publishedAt,
        access
      }
    }
  }
`

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    const userId = session.user.id
    const startOfDay = getStartOfTodayKolkata().toISOString()
    
    // Fetch user membership status, Sanity contents, and user profile phone in parallel
    const [insightsMembership, sanityPosts, upcomingEvents, pastEvents, recordings, notes, ratingsMap, dbUser] = await Promise.all([
        getCurrentInsightsMembershipForUser(userId),
        client.fetch<any[]>(dashboardPostsQuery, {}, { cache: "no-store" }),
        client.fetch<any[]>(eventsQuery, { startOfDay }, { next: { revalidate: 60 } }),
        client.fetch<any[]>(pastEventsQuery, { startOfDay }, { next: { revalidate: 60 } }),
        client.fetch<any[]>(recordingsQuery, { search: null }, { next: { revalidate: 60 } }),
        client.fetch<any[]>(notesQuery, { search: null }, { next: { revalidate: 60 } }),
        getArticleRatingsMap(),
        prisma.user.findUnique({
            where: { id: userId },
            select: { phone: true },
        }),
    ])

    const subscriptionStatus = insightsMembership?.statusLabel || "Inactive"
    const isPendingRenewal = insightsMembership?.status === "PENDING"
    const graceEndFormatted = insightsMembership?.graceEndAt
        ? new Date(insightsMembership.graceEndAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })
        : undefined
    const renewalUrl = insightsMembership?.renewalUrl || undefined

    const subscriptionEnd = insightsMembership?.currentEndAt 
        ? new Date(insightsMembership.currentEndAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        }) 
        : undefined

    async function handleSignOut() {
        "use server"
        await signOut({ redirectTo: "/" })
    }

    return (
        <ResearchDesk
            userName={session.user.name || "Investor"}
            userEmail={session.user.email || ""}
            userPhone={dbUser?.phone || undefined}
            subscriptionStatus={subscriptionStatus}
            subscriptionEnd={subscriptionEnd}
            cancelAtCycleEnd={insightsMembership?.cancelAtCycleEnd || false}
            onSignOut={handleSignOut}
            initialPosts={sanityPosts}
            initialUpcomingEvents={upcomingEvents}
            initialPastEvents={pastEvents}
            initialRecordings={recordings}
            initialNotes={notes}
            hasSubscriptionAccess={insightsMembership?.hasAccess || false}
            ratingStatsMap={ratingsMap}
            isPendingRenewal={isPendingRenewal}
            graceEndFormatted={graceEndFormatted}
            renewalUrl={renewalUrl}
        />
    )
}





