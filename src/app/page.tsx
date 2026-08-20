import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CinematicHero } from "@/components/homepage/CinematicHero"
import { Manifesto } from "@/components/homepage/Manifesto"
import { Method } from "@/components/homepage/Method"
import { ProofStats } from "@/components/homepage/ProofStats"
import { RecentInsights } from "@/components/homepage/RecentInsights"
import { UpcomingEvents } from "@/components/homepage/UpcomingEvents"
import { Testimonials } from "@/components/homepage/Testimonials"
import { LogoMarquee } from "@/components/events/LogoMarquee"
import { MembershipPromoSection } from "@/components/homepage/MembershipPromoSection"
import { ActiveSuper30Section } from "@/components/homepage/ActiveSuper30Section"
import { client } from "@/lib/sanity.client"
import { recentPostsQuery, upcomingEventsHomeQuery, testimonialsQuery, allSuper30ProgramsQuery } from "@/lib/sanity.queries"
import { Testimonial, Super30Program } from "@/lib/types"
import { getStartOfTodayKolkata } from "@/lib/utils"

export const revalidate = 60 // revalidate every minute

export default async function Home() {
  const startOfDay = getStartOfTodayKolkata().toISOString()
  const posts = await client.fetch(recentPostsQuery, {}, { next: { revalidate: 60 } })
  const events = await client.fetch(upcomingEventsHomeQuery, { startOfDay }, { next: { revalidate: 60 } })
  const testimonials = await client.fetch<Testimonial[]>(testimonialsQuery, {}, { next: { revalidate: 60 } })
  const super30Programs = await client.fetch<Super30Program[]>(allSuper30ProgramsQuery, {}, { next: { revalidate: 60 } }).catch(() => [])

  const activeSuper30 = super30Programs && super30Programs.length > 0 ? super30Programs[0] : undefined

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <CinematicHero />
        <LogoMarquee />
        <Manifesto />
        <Method />
        <ProofStats />
        <ActiveSuper30Section program={activeSuper30} />
        <MembershipPromoSection />
        <Testimonials testimonials={testimonials} />
        <UpcomingEvents events={events} />
        <RecentInsights posts={posts} />
      </main>
      <Footer />
    </div>
  )
}

