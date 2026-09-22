import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { client, getSanityWriteClient } from "@/lib/sanity.client"
import { singlePostQuery } from "@/lib/sanity.queries"
import { revalidatePath } from "next/cache"

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        if (!(await isAdminAuthenticated())) {
            return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 })
        }

        const { slug } = await context.params
        if (!slug) {
            return NextResponse.json({ error: "Post slug is required" }, { status: 400 })
        }

        // Fetch post to get its document ID
        const post = await client.fetch(singlePostQuery, { slug }, { cache: "no-store" })
        if (!post || !post._id) {
            return NextResponse.json({ error: `Post with slug "${slug}" not found in Sanity` }, { status: 404 })
        }

        const writeClient = getSanityWriteClient()
        if (!writeClient) {
            return NextResponse.json({
                error: "SANITY_API_WRITE_TOKEN (or SANITY_API_TOKEN) is not configured in server environment. Please set this token in environment variables or approve the post directly in Sanity Studio (/studio).",
                requiresToken: true
            }, { status: 500 })
        }

        const approvedAt = new Date().toISOString()

        // Patch document in Sanity
        await writeClient
            .patch(post._id)
            .set({
                approvalStatus: "approved",
                approvedAt,
            })
            .commit()

        // Invalidate frontend caches
        revalidatePath(`/insights/${slug}`)
        revalidatePath("/insights")
        revalidatePath("/insights/members-only")
        revalidatePath("/insights/archive")
        revalidatePath("/dashboard")
        revalidatePath("/")

        return NextResponse.json({
            success: true,
            message: `"${post.title || slug}" has been approved and published live.`,
            approvedAt,
        })
    } catch (err) {
        console.error("Failed to approve post:", err)
        return NextResponse.json({
            error: err instanceof Error ? err.message : "Internal server error approving post"
        }, { status: 500 })
    }
}
