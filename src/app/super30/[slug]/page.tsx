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

    // If program doesn't exist or is set to inactive, 404
    if (!program || program.isActive === false) {
        notFound()
    }

    const navItems = [
        { label: "Overview", id: "overview" },
        ...(program.painPoints?.length ? [{ label: "The Problem", id: "problem" }] : []),
        ...(program.philosophyDescription ? [{ label: "Philosophy", id: "philosophy" }] : []),
        ...(program.deliverables?.length ? [{ label: "What You Get", id: "deliverables" }] : []),
        ...(program.outcomes?.length ? [{ label: "Transformation", id: "outcomes" }] : []),
        ...(program.whoItsFor?.length || program.whoItsNotFor?.length ? [{ label: "Audience", id: "audience" }] : []),
        ...(program.testimonials?.length ? [{ label: "Testimonials", id: "proof" }] : []),
        { label: "Apply Now", id: "apply" },
        ...(program.faq?.length ? [{ label: "FAQ", id: "faq" }] : []),
    ]

    return (
        <div className="flex flex-col min-h-screen bg-[#0E0E11] text-text-primary selection:bg-gold/20 selection:text-gold relative z-0 super30-page">
            <AmbientLighting />
            <ScrollProgress />
            <StickyNav items={navItems} />
            <Navbar />

            <main className="flex-1">
                <Super30Hero program={program} />
                <Super30ProblemSection painPoints={program.painPoints} />
                <Super30PhilosophySection heading={program.philosophyHeading} description={program.philosophyDescription} />
                <Super30Deliverables deliverables={program.deliverables} />
                <Super30Outcomes outcomes={program.outcomes} />
                <Super30Audience whoItsFor={program.whoItsFor} whoItsNotFor={program.whoItsNotFor} />
                <Super30Testimonials testimonials={program.testimonials} />
                <Super30Pricing program={program} />
                <Super30FAQ faq={program.faq} />
                <Super30FinalCTA heading="Ready to master the meta-game of investing?" ctaText={program.ctaText} />
            </main>

            <Footer />
        </div>
    )
}
