import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { singleEventQuery } from "@/lib/sanity.queries"
import { Event } from "@/lib/types"
import { notFound } from "next/navigation"

import { AmbientLighting } from "@/components/events/AmbientLighting"
import { ScrollProgress } from "@/components/events/ScrollProgress"
import { StickyNav } from "@/components/events/StickyNav"
import { SectionDivider } from "@/components/events/SectionDivider"

import { EventHero } from "@/components/events/EventHero"
import { EventHighlights } from "@/components/events/EventHighlights"
import { EventNarrative } from "@/components/events/EventNarrative"
import { EventLearning } from "@/components/events/EventLearning"
import { EventAudience } from "@/components/events/EventAudience"
import { EventSpeaker } from "@/components/events/EventSpeaker"
import { EventAgenda } from "@/components/events/EventAgenda"
import { EventFAQ } from "@/components/events/EventFAQ"
import { EventCTA } from "@/components/events/EventCTA"

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

    const navItems = [
        { label: "Overview", id: "overview" },
        ...(event.highlightStat ? [{ label: "Highlights", id: "highlights" }] : []),
        ...(event.agenda?.length ? [{ label: "Agenda", id: "agenda" }] : []),
        ...(event.targetAudience?.length ? [{ label: "Audience", id: "audience" }] : []),
        ...(event.faq?.length ? [{ label: "FAQ", id: "faq" }] : []),
        { label: "Register", id: "register" },
    ]

    return (
        <div className="flex flex-col min-h-screen bg-[#0E0E11] text-text-primary selection:bg-gold/20 selection:text-gold relative z-0">
            <AmbientLighting />
            <ScrollProgress />
            <StickyNav items={navItems} />
            <Navbar />

            <main className="flex-1">
                <EventHero event={event} />
                <EventHighlights event={event} />
                <EventNarrative event={event} />
                <EventLearning event={event} />
                <SectionDivider />
                <EventAudience event={event} />
                <EventSpeaker event={event} />
                <EventAgenda event={event} />
                <EventFAQ event={event} />
                <EventCTA event={event} />
            </main>

            <Footer />
        </div>
    )
}
