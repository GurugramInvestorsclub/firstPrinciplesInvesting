import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { singleEventQuery } from "@/lib/sanity.queries"
import { Event } from "@/lib/types"
import { RichText } from "@/components/sanity/RichText"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, MapPin, ExternalLink } from "lucide-react"

export const revalidate = 60

interface Props {
    params: {
        slug: string
    }
}

export default async function EventPage({ params }: Props) {
    const { slug } = await params
    const event = await client.fetch<Event>(singleEventQuery, { slug })

    if (!event) {
        notFound()
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
                <div className="bg-secondary/30 py-12 md:py-20 border-b border-border/50">
                    <div className="container max-w-screen-xl px-4 sm:px-8 flex flex-col md:flex-row gap-12 items-start">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                                <span className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-full border border-border/50">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(event.date).toLocaleDateString("en-US", { weekday: 'long', year: "numeric", month: "long", day: "numeric", hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-full border border-border/50">
                                    <MapPin className="h-4 w-4" />
                                    {event.location}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                                {event.title}
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                                {event.shortDescription}
                            </p>
                        </div>
                        <div className="w-full md:w-auto flex flex-col gap-4 min-w-[300px] bg-background p-6 rounded-xl border border-border shadow-sm">
                            <div className="font-semibold text-lg">Event Registration</div>
                            <div className="text-sm text-muted-foreground mb-2">Secure your spot for this event.</div>
                            {event.registrationLink ? (
                                <Button asChild size="lg" className="w-full">
                                    <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                                        Register Now <ExternalLink className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button disabled size="lg" className="w-full">
                                    Registration Closed
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <article className="container max-w-3xl px-4 sm:px-8 py-12 md:py-20 mx-auto">
                    <div className="prose prose-lg dark:prose-invert mx-auto">
                        <h2 className="text-2xl font-bold mb-6">Event Details</h2>
                        {event.longDescription && <RichText value={event.longDescription} />}
                    </div>
                </article>
            </main>
            <Footer />
        </div>
    )
}
