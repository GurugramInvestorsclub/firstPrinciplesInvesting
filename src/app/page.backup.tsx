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

                {/* Newsletter Section */}
                <section className="py-24 container max-w-screen-xl px-4 sm:px-8 flex flex-col items-center text-center">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Join the Inner Circle.</h2>
                    <p className="text-muted-foreground max-w-lg mb-8">
                        Receive our latest structural analysis and invitations to exclusive events. No noise, just signal.
                    </p>
                    <form className="flex w-full max-w-sm items-center space-x-2">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            Subscribe
                        </button>
                    </form>
                </section>
            </main>
            <Footer />
        </div>
    )
}
