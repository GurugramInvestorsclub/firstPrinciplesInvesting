import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { eventsQuery, pastEventsQuery } from "@/lib/sanity.queries"
import { Event } from "@/lib/types"
import { EventCarousel } from "@/components/events/EventCarousel"

export const revalidate = 60

export default async function EventsPage() {
    const upcomingEvents = await client.fetch<Event[]>(eventsQuery)
    const pastEvents = await client.fetch<Event[]>(pastEventsQuery)

    return (
        <div className="flex flex-col min-h-screen bg-bg-deep text-text-primary selection:bg-gold/20 selection:text-gold">
            <Navbar />
            <main className="flex-1 container max-w-5xl px-4 mx-auto py-12 md:py-20 pt-28">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold tracking-tight mb-4 text-text-primary">Events.</h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                        Join us for in-depth discussions on structural thinking and market fundamentals.
                    </p>
                </div>

                <section className="mb-20">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-text-primary">
                        <span className="w-2 h-2 rounded-full bg-gold"></span>
                        Upcoming
                    </h2>

                    {upcomingEvents.length > 0 ? (
                        <div className="mx-auto w-full overflow-hidden -mx-4 px-4 md:mx-0 md:px-0">
                            <EventCarousel events={upcomingEvents} />
                        </div>
                    ) : (
                        <p className="text-text-secondary">No upcoming events scheduled at the moment.</p>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-8 text-text-secondary">Past Events</h2>
                    {pastEvents.length > 0 ? (
                        <div className="mx-auto w-full overflow-hidden -mx-4 px-4 md:mx-0 md:px-0 opacity-80 hover:opacity-100 transition-opacity">
                            <EventCarousel events={pastEvents} isPastEvent={true} />
                        </div>
                    ) : (
                        <p className="text-text-secondary">No past events found.</p>
                    )}
                </section>

            </main>
            <Footer />
        </div>
    )
}
