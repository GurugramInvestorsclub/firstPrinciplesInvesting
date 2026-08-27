import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getInsightsSubscriptionUiState, userHasInsightsAccess } from "@/lib/insights-subscription-service"
import { InsightsSubscriptionCheckout } from "@/components/insights/InsightsSubscriptionCheckout"
import { getDemergerData } from "@/lib/demergers"
import { DemergerTrackerTable } from "@/components/demergers/DemergerTrackerTable"
import { Lock, Layers, LineChart } from "lucide-react"

export const revalidate = 300 // Revalidate cache every 5 minutes

export default async function DemergerTrackerPage() {
    const session = await auth()

    // Redirect to login if user is not authenticated
    if (!session?.user?.id) {
        redirect(`/login?callbackUrl=${encodeURIComponent("/demerger-tracker")}`)
    }

    const subscriptionUi = getInsightsSubscriptionUiState()
    const paywallReady =
        subscriptionUi.enabled && subscriptionUi.checkoutReady && subscriptionUi.webhookReady

    const [hasSubscriptionAccess, demergerData] = await Promise.all([
        paywallReady ? userHasInsightsAccess(session.user.id) : Promise.resolve(false),
        getDemergerData(),
    ])

    return (
        <div className="flex flex-col min-h-screen bg-bg-deep text-text-primary selection:bg-gold/20 selection:text-gold">
            <Navbar />

            <main className="flex-1 w-full pt-32 pb-24">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-12 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-gold">
                            <Layers className="w-4 h-4 text-gold" />
                            <span>Special Situations & Arbitrage</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-white">
                            Demerger Tracker
                        </h1>
                        <p className="text-white/70 max-w-3xl leading-relaxed text-sm sm:text-base">
                            Track Indian equity spin-offs, corporate restructurings, NCLT approval stages, swap ratios, and record dates to identify value unlock opportunities.
                        </p>
                    </div>

                    {/* Membership Access Lock Guard */}
                    {!hasSubscriptionAccess ? (
                        <div className="max-w-4xl mx-auto space-y-12 my-12">
                            <div className="p-8 md:p-12 rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/[0.05] via-transparent to-black/60 backdrop-blur-xl text-center space-y-6 shadow-2xl">
                                <div className="inline-flex items-center justify-center p-4 rounded-full bg-gold/10 border border-gold/30 text-gold mb-2">
                                    <Lock className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl md:text-4xl font-sans font-bold text-white tracking-tight">
                                    Members-Only Demerger Tracker
                                </h2>
                                <p className="text-white/70 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
                                    The Demerger Tracker is exclusive to First Principles Insights members. Get live real-time updates on corporate spin-offs, record dates, valuation arbitrage, and exchange filings.
                                </p>
                                <div className="max-w-md mx-auto pt-4 text-left">
                                    <InsightsSubscriptionCheckout
                                        callbackUrl="/demerger-tracker"
                                        userName={session.user.name}
                                        userEmail={session.user.email}
                                        plans={subscriptionUi.plans}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Active Member View */
                        <DemergerTrackerTable
                            initialRecords={demergerData.records}
                            lastUpdated={demergerData.lastUpdated}
                            isLive={demergerData.isLive}
                        />
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
