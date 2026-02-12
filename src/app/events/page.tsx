import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { eventsQuery, pastEventsQuery } from "@/lib/sanity.queries"
import { Event } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { urlForImage } from "@/lib/sanity.image"

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
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {upcomingEvents.map((event) => (
                                <EventCard key={event.slug.current} event={event} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-secondary">No upcoming events scheduled at the moment.</p>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-8 text-text-secondary">Past Events</h2>
                    {pastEvents.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-80 hover:opacity-100 transition-opacity">
                            {pastEvents.map((event) => (
                                <EventCard key={event.slug.current} event={event} />
                            ))}
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

function EventCard({ event }: { event: Event }) {
    return (
        <div className="flex flex-col rounded-xl border border-[#2E2E2E] bg-bg-deep p-6 shadow-sm transition-all hover:shadow-md h-full hover:border-gold/30 group">
            {event.image && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4 bg-[#2E2E2E]">
                    <Image
                        src={urlForImage(event.image).url()}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}
            <div className="mb-4 flex items-center gap-2 text-xs text-text-secondary">
                <span className="flex items-center gap-1 rounded-full bg-[#2E2E2E] px-2 py-1 border border-[#2E2E2E] group-hover:border-gold/20 transition-colors">
                    <Calendar className="h-3 w-3 text-gold" />
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" })}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-[#2E2E2E] px-2 py-1 border border-[#2E2E2E] group-hover:border-gold/20 transition-colors">
                    <MapPin className="h-3 w-3 text-gold" />
                    {event.location}
                </span>
            </div>

            <h3 className="text-xl font-semibold mb-2 text-text-primary group-hover:text-gold transition-colors">
                <Link href={`/events/${event.slug.current}`} className="">
                    {event.title}
                </Link>
            </h3>

            <p className="text-sm text-text-secondary mb-6 flex-1 line-clamp-3">
                {event.shortDescription}
            </p>

            <Link href={`/events/${event.slug.current}`} className="w-full rounded-lg bg-gold/10 py-2 text-center text-sm font-medium text-gold hover:bg-gold hover:text-bg-deep transition-all inline-block mt-auto border border-gold/20 hover:border-gold">
                View Details
            </Link>
        </div>
    )
}
