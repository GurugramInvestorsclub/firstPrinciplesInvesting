import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, ArrowRight, Video, Users } from "lucide-react"
import { Event } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"
import { Button } from "@/components/ui/button"

interface UpcomingEventsProps {
    events: Event[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
    if (!events || events.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-bg-deep border-t border-text-secondary/10">
            <div className="container max-w-5xl px-4 mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono text-gold uppercase tracking-widest">
                            <Users className="w-3.5 h-3.5" />
                            <span>Live Sessions</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">Live Briefings</h2>
                    </div>
                </div>

                <div className="grid gap-6">
                    {events.map((event) => {
                        const eventDate = new Date(event.date);
                        const month = eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                        const day = eventDate.toLocaleDateString("en-US", { day: "2-digit" });

                        return (
                            <div key={event.slug.current} className="group relative overflow-hidden rounded-2xl border border-text-secondary/10 bg-bg-primary/20 hover:bg-bg-primary/40 transition-all duration-300 hover:border-gold/30">
                                <div className="flex flex-col md:flex-row">
                                    {/* Date Block - Distinct Agenda Style */}
                                    <div className="flex-shrink-0 flex md:flex-col items-center justify-center p-6 md:w-32 bg-bg-primary/50 border-b md:border-b-0 md:border-r border-text-secondary/10 gap-2">
                                        <span className="text-sm font-mono text-gold tracking-widest">{month}</span>
                                        <span className="text-4xl font-bold text-text-primary tracking-tighter">{day}</span>
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center space-y-4">
                                        <div className="flex items-center gap-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            <div className="flex items-center gap-1.5">
                                                <Video className="w-3.5 h-3.5 text-gold/80" />
                                                <span>Format: Virtual Briefing</span>
                                            </div>
                                            <span className="text-text-secondary/30">•</span>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-gold/80" />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-text-primary group-hover:text-gold transition-colors">
                                                <Link href={`/events/${event.slug.current}`}>
                                                    {event.title}
                                                </Link>
                                            </h3>
                                            <p className="text-text-secondary leading-relaxed max-w-2xl">
                                                {event.shortDescription}
                                            </p>
                                        </div>

                                        <div className="pt-2">
                                            <Link href={`/events/${event.slug.current}`} className="inline-flex items-center text-sm font-bold text-gold hover:underline uppercase tracking-wide gap-2">
                                                Register Now <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Optional Thumbnail (Hidden on small mobile, visible purely as texture on larger screens) */}
                                    {event.image && (
                                        <div className="hidden lg:block w-64 relative overflow-hidden border-l border-text-secondary/10">
                                            <Image
                                                src={urlForImage(event.image).width(400).height(400).fit("crop").url()}
                                                alt={event.title}
                                                fill
                                                className="object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-500"
                                            />
                                            <div className="absolute inset-0 bg-bg-deep/20 mix-blend-multiply"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="flex justify-center mt-12">
                    <Button asChild variant="outline" className="rounded-full px-8 border-text-secondary/30 text-text-primary hover:bg-gold/10 hover:border-gold hover:text-gold transition-all duration-300">
                        <Link href="/events">
                            View Calendar <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
