import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { singlePostQuery } from "@/lib/sanity.queries"
import { Post } from "@/lib/types"
import { RichText } from "@/components/sanity/RichText"
import { notFound } from "next/navigation"

export const revalidate = 60

interface Props {
    params: {
        slug: string
    }
}

export default async function InsightPage({ params }: Props) {
    const { slug } = await params
    const post = await client.fetch<Post>(singlePostQuery, { slug })

    if (!post) {
        notFound()
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
                <article className="container max-w-3xl px-4 sm:px-8 py-12 md:py-20 mx-auto">
                    <header className="mb-12 text-center">
                        <div className="text-sm text-muted-foreground mb-4">
                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                            {post.title}
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            {post.excerpt}
                        </p>
                    </header>

                    <div className="aspect-video w-full bg-secondary/20 rounded-2xl mb-12 relative overflow-hidden">
                        {/* Main Image */}
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            Main Image
                        </div>
                    </div>

                    <div className="prose prose-lg dark:prose-invert mx-auto">
                        <RichText value={post.body} />
                    </div>
                </article>
            </main>
            <Footer />
        </div>
    )
}
