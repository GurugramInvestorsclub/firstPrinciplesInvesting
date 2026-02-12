import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { singleEventQuery } from "@/lib/sanity.queries"
import { Event } from "@/lib/types"
import { RichText } from "@/components/sanity/RichText"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, MapPin, ExternalLink, Clock, CheckCircle2, User, Target, HelpCircle, ArrowRight } from "lucide-react"
import { urlForImage } from "@/lib/sanity.image"
import { SimpleAccordion } from "@/components/ui/simple-accordion"
import Image from "next/image"

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

    const isRegistrationOpen = !!event.registrationLink && new Date(event.date) > new Date()
    const eventDate = new Date(event.date)

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary">
            <Navbar />

            <main className="flex-1">
                {/* 1. Hero Section */}
                <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden border-b border-border/40">
                    <div className="absolute inset-0 bg-secondary/20 -z-10" />
                    <div className="container max-w-screen-xl px-4 sm:px-8">
                        <div className="grid lg:grid-cols-12 gap-12 items-center">
                            <div className="lg:col-span-7 flex flex-col gap-6">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {event.location}
                                    </span>
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                                    {event.title}
                                </h1>

                                {event.subHeading && (
                                    <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl">
                                        {event.subHeading}
                                    </p>
                                )}
                            </div>

                            <div className="lg:col-span-5 relative">
                                <div className="bg-card border border-border shadow-xl rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative z-10">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Reserve Your Spot</h3>
                                        <p className="text-sm text-muted-foreground">Join us for this exclusive session.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <span>
                                                {eventDate.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span>
                                                {eventDate.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        {isRegistrationOpen ? (
                                            <Button asChild size="lg" className="w-full text-base font-semibold h-12">
                                                <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                                                    Register Now <ExternalLink className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button disabled size="lg" className="w-full h-12">
                                                Registration Closed
                                            </Button>
                                        )}
                                        <p className="text-xs text-center text-muted-foreground mt-3">
                                            Limited ease of access. Secure your spot.
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 transform scale-95 translate-y-4" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Highlight Statistic Block */}
                {event.highlightStat && (
                    <section className="py-16 bg-background border-b border-border/40">
                        <div className="container max-w-4xl px-4 text-center">
                            <h2 className="text-3xl md:text-4xl md:leading-tight font-medium text-foreground">
                                {event.highlightStat}
                            </h2>
                        </div>
                    </section>
                )}

                {/* 3. Why This Event Matters (Narrative) */}
                {event.whyThisMatters && (
                    <section className="py-20 md:py-28">
                        <div className="container max-w-3xl px-4">
                            <div className="mx-auto">
                                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Why This Matters</h3>
                                <RichText value={event.whyThisMatters} />
                            </div>
                        </div>
                    </section>
                )}

                {/* 4. What You Will Learn (Grid) */}
                {event.learningPoints && event.learningPoints.length > 0 && (
                    <section className="py-20 bg-secondary/30 border-y border-border/40">
                        <div className="container max-w-screen-xl px-4 sm:px-8">
                            <div className="max-w-3xl mb-12">
                                <h2 className="text-3xl font-bold mb-4">What You Will Learn</h2>
                                <p className="text-lg text-muted-foreground">Key takeaways from this masterclass.</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {event.learningPoints.map((point, idx) => (
                                    <div key={idx} className="bg-background border border-border/50 p-6 rounded-xl hover:border-primary/30 transition-colors">
                                        <CheckCircle2 className="w-6 h-6 text-primary mb-4" />
                                        <h3 className="font-semibold text-lg mb-2">{point.title}</h3>
                                        <p className="text-muted-foreground">{point.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* 5. Who Should Attend */}
                {event.targetAudience && event.targetAudience.length > 0 && (
                    <section className="py-20">
                        <div className="container max-w-screen-xl px-4 sm:px-8">
                            <div className="max-w-3xl mb-12">
                                <h2 className="text-3xl font-bold mb-4">Who Should Attend</h2>
                                <p className="text-lg text-muted-foreground">Designed for serious investors.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {event.targetAudience.map((audience, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1">{audience.title}</h3>
                                            <p className="text-muted-foreground">{audience.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* 6. Speaker Section */}
                {event.speaker && (
                    <section className="py-20 bg-secondary/30 border-y border-border/40">
                        <div className="container max-w-screen-xl px-4 sm:px-8">
                            <div className="grid md:grid-cols-12 gap-12 items-center">
                                <div className="md:col-span-5 lg:col-span-4 order-2 md:order-1">
                                    {event.speaker.image && (
                                        <div className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-background border border-border">
                                            <Image
                                                src={urlForImage(event.speaker.image).url()}
                                                alt={event.speaker.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-7 lg:col-span-8 order-1 md:order-2">
                                    <h2 className="text-3xl font-bold mb-6">About the Speaker</h2>
                                    <h3 className="text-2xl font-semibold mb-4">{event.speaker.name}</h3>
                                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                        {event.speaker.bio}
                                    </p>
                                    {event.speaker.credentials && (
                                        <div className="flex flex-wrap gap-3">
                                            {event.speaker.credentials.map((cred, idx) => (
                                                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-background border border-border font-medium">
                                                    {cred}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* 7. Agenda (Optional) */}
                {event.agenda && event.agenda.length > 0 && (
                    <section className="py-20">
                        <div className="container max-w-3xl px-4 sm:px-8 mx-auto">
                            <h2 className="text-3xl font-bold mb-12 text-center">Event Agenda</h2>
                            <div className="relative border-l border-border/50 ml-3 space-y-8 pl-8">
                                {event.agenda.map((item, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[39px] w-5 h-5 rounded-full border-4 border-background bg-primary" />
                                        <span className="text-sm font-semibold text-primary mb-1 block">
                                            {item.time}
                                        </span>
                                        <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                                        <p className="text-muted-foreground">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* 8. FAQ */}
                {event.faq && event.faq.length > 0 && (
                    <section className="py-20 bg-secondary/20 border-t border-border/40">
                        <div className="container max-w-3xl px-4 mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                            </div>

                            <SimpleAccordion
                                items={event.faq.map(f => ({ title: f.question, content: f.answer }))}
                            />
                        </div>
                    </section>
                )}

                {/* 9. Final CTA */}
                <section className="py-24">
                    <div className="container max-w-screen-xl px-4 text-center">
                        <div className="max-w-3xl mx-auto flex flex-col items-center">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                                Ready to level up your investing?
                            </h2>
                            <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
                                Join us for this session and get clear, actionable insights.
                            </p>

                            {isRegistrationOpen ? (
                                <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full">
                                    <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                                        Secure Your Spot <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button disabled size="lg" className="h-14 px-8 text-lg rounded-full">
                                    Registration Closed
                                </Button>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
