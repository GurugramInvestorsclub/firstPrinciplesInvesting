import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin } from "lucide-react"
import { Event } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"

interface UpcomingEventsProps {
    events: Event[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
    if (!events || events.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-bg-primary">
            <div className="container max-w-5xl px-4 mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-text-primary">Upcoming Events</h2>
                    <Link href="/events" className="text-sm font-medium hover:text-gold hover:underline hidden sm:block text-text-secondary transition-colors">
                        View all events
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {events.map((event) => (
                        <div key={event.slug.current} className="flex flex-col rounded-xl border border-text-secondary/20 bg-bg-deep p-6 shadow-sm transition-all hover:shadow-md hover:border-gold/30 h-full">
                            {event.image && (
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4">
                                    <Image
                                        src={urlForImage(event.image).url()}
                                        alt={event.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="mb-4 flex items-center gap-2 text-xs text-text-secondary">
                                <span className="flex items-center gap-1 rounded-full bg-bg-primary border border-text-secondary/10 px-2 py-1">
                                    <Calendar className="h-3 w-3 text-gold" />
                                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                                <span className="flex items-center gap-1 rounded-full bg-bg-primary border border-text-secondary/10 px-2 py-1">
                                    <MapPin className="h-3 w-3 text-gold" />
                                    {event.location}
                                </span>
                            </div>

                            <h3 className="text-xl font-semibold mb-2 text-text-primary">
                                <Link href={`/events/${event.slug.current}`} className="hover:text-gold hover:underline transition-colors">
                                    {event.title}
                                </Link>
                            </h3>

                            <p className="text-sm text-text-secondary mb-6 flex-1">
                                {event.shortDescription}
                            </p>

                            <Link href={`/events/${event.slug.current}`} className="w-full rounded-lg bg-gold py-2 text-center text-sm font-medium text-bg-deep hover:bg-gold-muted transition-colors">
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
                <div className="mt-8 sm:hidden">
                    <Link href="/events" className="text-sm font-medium hover:text-gold hover:underline text-text-secondary">
                        View all events
                    </Link>
                </div>
            </div>
        </section>
    )
}
