import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { eventsQuery, pastEventsQuery } from "@/lib/sanity.queries"
import { Event } from "@/lib/types"
import Link from "next/link"
import { Calendar, MapPin, ArrowRight } from "lucide-react"

export const revalidate = 60

export default async function EventsPage() {
    const upcomingEvents = await client.fetch<Event[]>(eventsQuery)
    const pastEvents = await client.fetch<Event[]>(pastEventsQuery)

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 container max-w-screen-xl px-4 sm:px-8 py-12 md:py-20">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Events.</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Join us for in-depth discussions on structural thinking and market fundamentals.
                    </p>
                </div>

                <section className="mb-20">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        Upcoming
                    </h2>

                    {upcomingEvents.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {upcomingEvents.map((event) => (
                                <EventCard key={event.slug.current} event={event} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No upcoming events scheduled at the moment.</p>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-8 text-muted-foreground">Past Events</h2>
                    {pastEvents.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-80 hover:opacity-100 transition-opacity">
                            {pastEvents.map((event) => (
                                <EventCard key={event.slug.current} event={event} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No past events found.</p>
                    )}
                </section>

            </main>
            <Footer />
        </div>
    )
}

function EventCard({ event }: { event: Event }) {
    return (
        <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md h-full">
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                </span>
            </div>

            <h3 className="text-xl font-semibold mb-2">
                <Link href={`/events/${event.slug.current}`} className="hover:underline">
                    {event.title}
                </Link>
            </h3>

            <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-3">
                {event.shortDescription}
            </p>

            <Link href={`/events/${event.slug.current}`} className="w-full rounded-lg bg-primary/5 py-2 text-center text-sm font-medium text-primary hover:bg-primary/10 transition-colors inline-block mt-auto">
                View Details
            </Link>
        </div>
    )
}
