import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { getCurrentInsightsMembershipForUser } from "@/lib/insights-subscription-service"
import { ResearchDesk } from "@/components/dashboard/ResearchDesk"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    const userId = session.user.id
    const insightsMembership = await getCurrentInsightsMembershipForUser(userId)

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
        />
    )
}

