import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { groq } from "next-sanity"
import { client } from "@/lib/sanity.client"
import { eventsQuery, pastEventsQuery } from "@/lib/sanity.queries"
import { getCurrentInsightsMembershipForUser } from "@/lib/insights-subscription-service"
import { ResearchDesk } from "@/components/dashboard/ResearchDesk"

const dashboardPostsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    isFeatured,
    excerpt,
    access,
    mainImage,
    publishedAt,
    body,
    disclaimer
  }
`

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    const userId = session.user.id
    
    // Fetch user membership status and Sanity contents in parallel
    const [insightsMembership, sanityPosts, upcomingEvents, pastEvents] = await Promise.all([
        getCurrentInsightsMembershipForUser(userId),
        client.fetch<any[]>(dashboardPostsQuery, {}, { next: { revalidate: 60 } }),
        client.fetch<any[]>(eventsQuery, {}, { next: { revalidate: 60 } }),
        client.fetch<any[]>(pastEventsQuery, {}, { next: { revalidate: 60 } })
    ])

    const subscriptionStatus = insightsMembership?.statusLabel || "Inactive"
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
            subscriptionStatus={subscriptionStatus}
            subscriptionEnd={subscriptionEnd}
            onSignOut={handleSignOut}
            initialPosts={sanityPosts}
            initialUpcomingEvents={upcomingEvents}
            initialPastEvents={pastEvents}
        />
    )
}


