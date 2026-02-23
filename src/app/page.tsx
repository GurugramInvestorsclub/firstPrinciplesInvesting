import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CinematicHero } from "@/components/homepage/CinematicHero"
import { Manifesto } from "@/components/homepage/Manifesto"
import { Method } from "@/components/homepage/Method"
import { ProofStats } from "@/components/homepage/ProofStats"
import { RecentInsights } from "@/components/homepage/RecentInsights"
import { UpcomingEvents } from "@/components/homepage/UpcomingEvents"
import { Testimonials } from "@/components/homepage/Testimonials"
import { client } from "@/lib/sanity.client"
import { recentPostsQuery, upcomingEventsHomeQuery, testimonialsQuery } from "@/lib/sanity.queries"
import { Testimonial } from "@/lib/types"

export const revalidate = 60 // revalidate every minute

export default async function Home() {
  const posts = await client.fetch(recentPostsQuery)
  const events = await client.fetch(upcomingEventsHomeQuery)
  const testimonials = await client.fetch<Testimonial[]>(testimonialsQuery)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <CinematicHero />
        <Manifesto />
        <Method />
        <ProofStats />
        <Testimonials testimonials={testimonials} />
        <UpcomingEvents events={events} />
        <RecentInsights posts={posts} />
      </main>
      <Footer />
    </div>
  )
}

