import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { singleSuper30Query, allSuper30ProgramsQuery } from "@/lib/sanity.queries"
import { Super30Program } from "@/lib/types"
import { notFound } from "next/navigation"
import { Super30NewDesign } from "@/components/super30/Super30NewDesign"

export const revalidate = 60

export async function generateMetadata() {
    let program = await client.fetch<Super30Program>(
        singleSuper30Query,
        { slug: "super-30-batch-4" },
        { next: { revalidate: 60 } }
    )

    if (!program) {
        const programs = await client.fetch<Super30Program[]>(
            allSuper30ProgramsQuery,
            {},
            { next: { revalidate: 60 } }
        )
        program = programs?.[0] || null
    }

    if (!program) {
        return {
            title: "Super 30 Program",
        }
    }

    return {
        title: `${program.title} | Super 30 Program`,
        description: program.shortDescription || program.tagline,
    }
}

export default async function Super30V1Page() {
    let program = await client.fetch<Super30Program>(
        singleSuper30Query,
        { slug: "super-30-batch-4" },
        { next: { revalidate: 60 } }
    )

    if (!program) {
        const programs = await client.fetch<Super30Program[]>(
            allSuper30ProgramsQuery,
            {},
            { next: { revalidate: 60 } }
        )
        if (programs && programs.length > 0) {
            program = await client.fetch<Super30Program>(
                singleSuper30Query,
                { slug: programs[0].slug.current },
                { next: { revalidate: 60 } }
            )
        }
    }

    if (!program) {
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
