import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { singleSuper30Query, testimonialsQuery } from "@/lib/sanity.queries"
import { Super30Program, Testimonial } from "@/lib/types"
import { notFound } from "next/navigation"
import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google"

import { Super30Landing } from "@/components/super30/landing/Super30Landing"

const cormorant = Cormorant_Garamond({
    weight: ["400", "500", "600", "700"],
    style: ["normal", "italic"],
    subsets: ["latin"],
    variable: "--font-s30-serif",
    display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
    variable: "--font-s30-mono",
    display: "swap",
})

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

export default async function Super30Page({ params }: Props) {
    const { slug } = await params
    const program = await client.fetch<Super30Program>(singleSuper30Query, { slug }, { next: { revalidate: 60 } })

    if (!program || program.isActive === false) {
        notFound()
    }

    // Same reviews as the homepage community section.
    const siteTestimonials = await client
        .fetch<Testimonial[]>(testimonialsQuery, {}, { next: { revalidate: 60 } })
        .catch(() => [])

    return (
        <div
            className={`${cormorant.variable} ${jetbrainsMono.variable} flex flex-col min-h-screen bg-[#12110F] text-[#F4F1EA] selection:bg-[#23C077]/20 selection:text-[#23C077] relative z-0 super30-page`}
        >
            <Navbar />

            <main className="flex-1">
                <Super30Landing program={program} siteTestimonials={siteTestimonials} />
            </main>

            <Footer />
        </div>
    )
}
