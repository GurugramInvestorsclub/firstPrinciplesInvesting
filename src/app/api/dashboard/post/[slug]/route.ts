import { NextResponse } from "next/server"
import { groq } from "next-sanity"
import { auth } from "@/auth"
import { client } from "@/lib/sanity.client"
import { userHasInsightsAccess } from "@/lib/insights-subscription-service"

const dashboardSinglePostQuery = groq`
  *[_type == "post" && slug.current == $slug && (!defined(approvalStatus) || approvalStatus != "pending")][0] {
    _id,
    access,
    body,
    previewBody,
    disclaimer,
    paywallHeadline,
    paywallCtaText,
    updates[] {
      _key,
      title,
      url,
      badge,
      date,
      description,
      post-> {
        _id,
        title,
        slug,
        publishedAt,
        access
      }
    }
  }
`

export async function GET(
    _req: Request,
    context: { params: Promise<{ slug: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await context.params
    const post = await client.fetch<any | null>(
        dashboardSinglePostQuery,
        { slug },
        { next: { revalidate: 60 } }
    )

    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const isSubscriberOnly = post.access === "subscriber"
    if (isSubscriberOnly) {
        const hasAccess = await userHasInsightsAccess(session.user.id)
        if (!hasAccess) {
            return NextResponse.json({
                _id: post._id,
                access: post.access,
                body: [],
                previewBody: post.previewBody || [],
                disclaimer: post.disclaimer,
                paywallHeadline: post.paywallHeadline,
                paywallCtaText: post.paywallCtaText,
                updates: post.updates || [],
            })
        }
    }

    return NextResponse.json(post)
}
