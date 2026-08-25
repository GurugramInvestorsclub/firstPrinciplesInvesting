import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { singleSuper30Query } from "@/lib/sanity.queries"
import { Super30Program } from "@/lib/types"
import { notFound } from "next/navigation"
import { Super30NewDesign } from "@/components/super30/Super30NewDesign"

export const revalidate = 60

export async function generateStaticParams() {
    const slugs = await client.fetch<string[]>(
        `*[_type == "super30Program" && defined(slug.current)].slug.current`
    )
    return slugs.map((slug) => ({ slug }))
}

interface Props {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params
    const program = await client.fetch<Super30Program>(singleSuper30Query, { slug }, { next: { revalidate: 60 } })

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

export default async function Super30V1SlugPage({ params }: Props) {
    const { slug } = await params
    const program = await client.fetch<Super30Program>(singleSuper30Query, { slug }, { next: { revalidate: 60 } })

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
