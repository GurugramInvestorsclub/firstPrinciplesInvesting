import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { singleSuper30Query } from "@/lib/sanity.queries"
import { Super30Program } from "@/lib/types"
import { notFound } from "next/navigation"

import { AmbientLighting } from "@/components/events/AmbientLighting"
import { ScrollProgress } from "@/components/events/ScrollProgress"
import { StickyNav } from "@/components/events/StickyNav"

import { Super30Hero } from "@/components/super30/Super30Hero"
import { Super30ProblemSection } from "@/components/super30/Super30ProblemSection"
import { Super30PhilosophySection } from "@/components/super30/Super30PhilosophySection"
import { Super30Deliverables } from "@/components/super30/Super30Deliverables"
import { Super30Outcomes } from "@/components/super30/Super30Outcomes"
import { Super30Audience } from "@/components/super30/Super30Audience"
import { Super30Testimonials } from "@/components/super30/Super30Testimonials"
import { Super30Pricing } from "@/components/super30/Super30Pricing"
import { Super30FAQ } from "@/components/super30/Super30FAQ"
import { Super30FinalCTA } from "@/components/super30/Super30FinalCTA"
import { Super30Cursor } from "@/components/super30/Super30Cursor"
import { Super30Trust } from "@/components/super30/Super30Trust"
import { Super30StickyCTA } from "@/components/super30/Super30StickyCTA"

import { Super30NewDesign } from "@/components/super30/Super30NewDesign"

export const revalidate = 60

interface Props {
    params: {
        slug: string
    }
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params
    const program = await client.fetch<Super30Program>(singleSuper30Query, { slug })

    if (!program) {
        return {
            title: "Program Not Found",
        }
    }

    return {
        title: `${program.title} | Super 30 Program`,
        description: program.shortDescription || program.tagline,
    }
}

export default async function Super30Page({ params }: Props) {
    const { slug } = await params
    const program = await client.fetch<Super30Program>(singleSuper30Query, { slug })

    if (!program || program.isActive === false) {
        notFound()
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#0E0E11] text-text-primary selection:bg-gold/20 selection:text-gold relative z-0 super30-page">
            <div className="noise-bg" />
            <Navbar />

            <main className="flex-1">
                <Super30NewDesign program={program} />
            </main>

            <Footer />
        </div>
    )
}
