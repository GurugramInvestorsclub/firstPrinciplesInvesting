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
        <section className="py-24 bg-secondary/30">
            <div className="container max-w-screen-xl px-4 sm:px-8">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-bold tracking-tight">Upcoming Events</h2>
                    <Link href="/events" className="text-sm font-medium hover:underline hidden sm:block">
                        View all events
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {events.map((event) => (
                        <div key={event.slug.current} className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md h-full">
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
                            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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

                            <p className="text-sm text-muted-foreground mb-6 flex-1">
                                {event.shortDescription}
                            </p>

                            <Link href={`/events/${event.slug.current}`} className="w-full rounded-lg bg-primary/5 py-2 text-center text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
                <div className="mt-8 sm:hidden">
                    <Link href="/events" className="text-sm font-medium hover:underline">
                        View all events
                    </Link>
                </div>
            </div>
        </section>
    )
}
