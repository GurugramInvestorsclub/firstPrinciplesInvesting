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
        <div className="flex flex-col min-h-screen bg-[#0E0E11] text-text-primary selection:bg-gold/20 selection:text-gold">
            <Navbar />

            <main className="flex-1 pt-24">
                {/* 1. Hero Section */}
                <section className="relative py-20 md:py-32 lg:py-40 overflow-hidden border-b border-white/5">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-[#0E0E11]/0 to-[#0E0E11]/0 -z-10" />
                    <div className="w-[80%] mx-auto max-w-screen-2xl">
                        <div className="flex flex-col items-center text-center gap-12">
                            <div className="w-full max-w-4xl flex flex-col items-center gap-6">
                                <div className="flex flex-wrap justify-center items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata" })}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#2E2E2E] text-text-secondary border border-[#2E2E2E]">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {event.location}
                                    </span>
                                </div>

                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1] text-white drop-shadow-2xl">
                                    {event.title}
                                </h1>

                                {event.subHeading && (
                                    <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
                                        {event.subHeading}
                                    </p>
                                )}
                            </div>

                            <div className="w-full max-w-md relative">
                                <div className="bg-[#151518] border border-white/10 shadow-2xl rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative z-10 text-left hover:border-gold/20 transition-colors duration-300">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1 text-text-primary">Reserve Your Spot</h3>
                                        <p className="text-sm text-text-secondary">Join us for this exclusive session.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm text-text-secondary">
                                            <Calendar className="w-4 h-4 text-gold" />
                                            <span>
                                                {eventDate.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', timeZone: "Asia/Kolkata" })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-text-secondary">
                                            <Clock className="w-4 h-4 text-gold" />
                                            <span>
                                                {eventDate.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', timeZone: "Asia/Kolkata" })} IST
                                            </span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                                <MapPin className="w-4 h-4 text-gold" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        {isRegistrationOpen ? (
                                            <Button asChild size="lg" className="w-full text-base font-semibold h-12 bg-gold text-bg-deep hover:bg-gold-muted border-none">
                                                <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                                                    Register Now <ExternalLink className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button disabled size="lg" className="w-full h-12 bg-[#2E2E2E] text-text-secondary">
                                                Registration Closed
                                            </Button>
                                        )}
                                        <p className="text-xs text-center text-text-secondary mt-3">
                                            Limited ease of access. Secure your spot.
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gold/5 blur-3xl -z-10 transform scale-95 translate-y-4" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Highlight Statistic Block */}
                {event.highlightStat && (
                    <section className="py-24 bg-[#111111] border-y border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gold/5 opacity-5" />
                        <div className="w-[80%] mx-auto max-w-4xl text-center relative z-10">
                            <h2 className="text-3xl md:text-5xl md:leading-tight font-medium text-white drop-shadow-lg">
                                {event.highlightStat}
                            </h2>
                        </div>
                    </section>
                )}

                {/* 3. Why This Matters (Narrative) */}
                {event.whyThisMatters && (
                    <section className="py-24 md:py-32 bg-[#0E0E11]">
                        <div className="w-[80%] mx-auto max-w-3xl text-center">
                            <div className="mx-auto">
                                <h3 className="text-sm font-bold text-gold uppercase tracking-widest mb-10 border-b border-white/10 pb-4 inline-block">Why This Matters</h3>
                                <div className="text-left mx-auto max-w-2xl text-gray-300 prose-invert prose-lg leading-loose">
                                    <RichText value={event.whyThisMatters} />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* 4. What You Will Learn (Grid) */}
                {event.learningPoints && event.learningPoints.length > 0 && (
                    <section className="py-24 bg-[#0E0E11] border-y border-white/5">
                        <div className="w-[80%] mx-auto max-w-screen-2xl">
                            <div className="max-w-3xl mx-auto mb-16 text-center">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">What You Will Learn</h2>
                                <p className="text-lg text-gray-400">Key takeaways from this masterclass.</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {event.learningPoints.map((point, idx) => (
                                    <div key={idx} className="bg-[#1A1A1A] border border-white/5 p-8 rounded-2xl hover:border-gold/30 transition-all duration-300 shadow-lg group">
                                        <CheckCircle2 className="w-8 h-8 text-gold mb-6 group-hover:scale-110 transition-transform duration-300" />
                                        <h3 className="font-semibold text-xl mb-3 text-white">{point.title}</h3>
                                        <p className="text-gray-400 leading-relaxed">{point.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* 5. Who Should Attend */}
                {event.targetAudience && event.targetAudience.length > 0 && (
                    <section className="py-24 bg-[#0E0E11]">
                        <div className="w-[80%] mx-auto max-w-screen-2xl">
                            <div className="max-w-3xl mx-auto mb-16 text-center">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Who Should Attend</h2>
                                <p className="text-lg text-gray-400">Designed for serious investors.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                                {event.targetAudience.map((audience, idx) => (
                                    <div key={idx} className="flex gap-6 items-start p-6 rounded-2xl bg-[#1A1A1A] border border-white/5 hover:border-gold/20 transition-all duration-300">
                                        <div className="shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                                                <User className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-xl mb-2 text-white">{audience.title}</h3>
                                            <p className="text-gray-400 leading-relaxed">{audience.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* 6. Speaker Section */}
                {event.speaker && (
                    <section className="py-24 bg-[#151518] border-y border-white/5">
                        <div className="w-[80%] mx-auto max-w-screen-2xl">
                            <div className="grid md:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
                                <div className="md:col-span-5 lg:col-span-4 order-2 md:order-1">
                                    {event.speaker.image && (
                                        <div className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-[#0E0E11] border border-white/10 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                            <Image
                                                src={urlForImage(event.speaker.image).width(400).height(533).url()}
                                                alt={event.speaker.name}
                                                fill
                                                className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-7 lg:col-span-8 order-1 md:order-2 text-center md:text-left">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">About the Speaker</h2>
                                    <h3 className="text-3xl font-bold mb-6 text-gold">{event.speaker.name}</h3>
                                    <p className="text-lg text-gray-300 leading-relaxed mb-8 font-light">
                                        {event.speaker.bio}
                                    </p>
                                    {event.speaker.credentials && (
                                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                            {event.speaker.credentials.map((cred, idx) => (
                                                <span key={idx} className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-[#0E0E11] border border-white/10 font-medium shadow-sm text-gray-400">
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
                    <section className="py-24 bg-[#0E0E11]">
                        <div className="w-[80%] mx-auto max-w-3xl">
                            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-white">Event Agenda</h2>
                            <div className="relative border-l border-white/10 ml-3 space-y-12 pl-10 pb-4">
                                {event.agenda.map((item, idx) => (
                                    <div key={idx} className="relative group">
                                        <div className="absolute -left-[45px] w-4 h-4 rounded-full border-2 border-[#0E0E11] bg-gold group-hover:scale-150 transition-transform duration-300 shadow-[0_0_10px_rgba(245,184,0,0.5)]" />
                                        <span className="text-sm font-bold text-gold mb-2 block tracking-wider uppercase">
                                            {item.time}
                                        </span>
                                        <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                                        <p className="text-gray-400 leading-relaxed">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* 8. FAQ */}
                {event.faq && event.faq.length > 0 && (
                    <section className="py-24 bg-[#0E0E11] border-t border-white/5">
                        <div className="w-[80%] mx-auto max-w-3xl">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text-primary">Frequently Asked Questions</h2>
                            </div>

                            <SimpleAccordion
                                items={event.faq.map(f => ({ title: f.question, content: f.answer }))}
                            />
                        </div>
                    </section>
                )}

                {/* 9. Final CTA */}
                <section className="py-32 bg-[#0E0E11]">
                    <div className="w-[80%] mx-auto text-center">
                        <div className="max-w-4xl mx-auto flex flex-col items-center">
                            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight leading-tight text-white drop-shadow-xl">
                                Ready to level up your investing?
                            </h2>
                            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl font-light">
                                Join us for this session and get clear, actionable insights.
                            </p>

                            {isRegistrationOpen ? (
                                <Button asChild size="lg" className="h-16 px-10 text-xl rounded-full shadow-lg hover:shadow-gold/20 hover:-translate-y-1 transition-all duration-300 bg-gold text-[#0E0E11] hover:bg-white border-none font-bold">
                                    <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                                        Secure Your Spot <ArrowRight className="ml-2 w-6 h-6" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button disabled size="lg" className="h-16 px-10 text-xl rounded-full bg-[#1A1A1A] text-gray-500 border border-white/5">
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
