import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/homepage/Hero"
import { Philosophy } from "@/components/homepage/Philosophy"
import { RecentInsights } from "@/components/homepage/RecentInsights"
import { UpcomingEvents } from "@/components/homepage/UpcomingEvents"
import { client } from "@/lib/sanity.client"
import { recentPostsQuery, eventsQuery } from "@/lib/sanity.queries"

export const revalidate = 60 // revalidate every minute

export default async function Home() {
  const posts = await client.fetch(recentPostsQuery)
  const events = await client.fetch(eventsQuery)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Philosophy />
        <RecentInsights posts={posts} />
        <UpcomingEvents events={events} />


      </main>
      <Footer />
    </div>
  )
}
