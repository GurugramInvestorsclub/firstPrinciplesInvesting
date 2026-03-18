import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { client } from "@/lib/sanity.client"
import { Calendar, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
    const session = await auth()

    if (!session || !session.user) {
        redirect("/login")
    }

    // Fetch registered events
    const payments = await prisma.payment.findMany({
        where: {
            userId: session.user.id,
            status: "SUCCESS"
        },
        select: {
            eventId: true,
            paidAt: true
        },
        orderBy: {
            paidAt: 'desc'
        }
    })

    const eventIds = payments.map(p => p.eventId)
    const registeredEvents = eventIds.length > 0
        ? await client.fetch<any[]>(
            `*[_type == "event" && eventId in $eventIds] {
                eventId,
                title,
                date,
                slug,
                shortDescription
            }`,
            { eventIds }
        )
        : []

    // Merge payment info with event details
    const events = registeredEvents.map(event => {
        const payment = payments.find(p => p.eventId === event.eventId)
        return {
            ...event,
            registrationDate: payment?.paidAt,
            isCompleted: new Date(event.date) < new Date()
        }
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <main className="min-h-screen bg-bg-deep pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12 animate-fade-in">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gold/20 shadow-2xl flex items-center justify-center bg-bg-primary/50 backdrop-blur-sm">
                        <span className="text-5xl font-bold text-gold select-none">
                            {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
                        </span>
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-bold text-text-primary mb-2">
                            {session.user.name || "Investor"}
                        </h1>
                        <p className="text-text-secondary text-lg">
                            {session.user.email}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                             <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium uppercase tracking-wider">
                                Active Member
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-200">
                    <div className="bg-bg-primary/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-gold/30 transition-all group">
                        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold" />
                            My Investments
                        </h2>
                        <p className="text-text-secondary mb-6">
                            Track your participation in upcoming events and briefings.
                        </p>
                        <Link
                            href="/events"
                            className="inline-flex items-center text-gold font-medium hover:gap-2 transition-all gap-1"
                        >
                            Explore Events <span className="text-lg">→</span>
                        </Link>
                    </div>

                    <div className="bg-bg-primary/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-gold/30 transition-all">
                        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold" />
                            Settings & Profile
                        </h2>
                        <p className="text-text-secondary mb-6">
                            Manage your personal information and subscription preferences.
                        </p>
                        <form
                            action={async () => {
                                "use server"
                                await signOut({ redirectTo: "/" })
                            }}
                        >
                            <button
                                type="submit"
                                className="text-destructive hover:text-red-400 font-medium transition-colors"
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-12 animate-fade-in-up delay-300">
                    <h2 className="text-2xl font-bold text-text-primary mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-gold" />
                        </span>
                        My Registered Events
                    </h2>

                    {events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {events.map((event) => (
                                <Link 
                                    key={event.eventId}
                                    href={`/events/${event.slug.current}`}
                                    className="bg-bg-primary/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-gold/30 transition-all group relative overflow-hidden"
                                >
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                event.isCompleted 
                                                    ? "bg-white/5 text-gray-500 border border-white/10" 
                                                    : "bg-gold/10 text-gold border border-gold/20"
                                            }`}>
                                                {event.isCompleted ? "Completed" : "Upcoming"}
                                            </span>
                                            <span className="text-xs text-text-secondary">
                                                {new Date(event.date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                })}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-gold transition-colors">
                                            {event.title}
                                        </h3>
                                        <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                                            {event.shortDescription}
                                        </p>
                                        <div className="flex items-center text-xs font-medium text-gold gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                            View Details <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,199,44,0.05),transparent_50%)]" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-bg-primary/20 border border-dashed border-white/10 rounded-3xl p-12 text-center">
                            <p className="text-text-secondary mb-6 text-lg">
                                You haven&apos;t registered for any events yet.
                            </p>
                            <Link
                                href="/events"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold/10 border border-gold/20 text-gold font-bold hover:bg-gold/20 transition-all"
                            >
                                Explore Events <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
