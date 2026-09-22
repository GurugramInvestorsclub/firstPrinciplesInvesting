import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { client, getSanityWriteClient } from "@/lib/sanity.client"
import { singlePostQuery } from "@/lib/sanity.queries"
import { revalidatePath } from "next/cache"

export async function PATCH(
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

        const post = await client.fetch(singlePostQuery, { slug }, { cache: "no-store" })
        if (!post || !post._id) {
            return NextResponse.json({ error: `Post with slug "${slug}" not found in Sanity` }, { status: 404 })
        }

        const writeClient = getSanityWriteClient()
        if (!writeClient) {
            return NextResponse.json({
                error: "SANITY_API_WRITE_TOKEN is not configured in server environment. Please configure it or edit the post directly in Sanity Studio (/studio).",
                requiresToken: true
            }, { status: 500 })
        }

        const body = await req.json()
        const { title, excerpt, access, isFeatured, paywallHeadline, paywallCtaText } = body

        // If setting isFeatured to true, unfeature any other post
        if (isFeatured === true) {
            const otherFeaturedQuery = `*[_type == "post" && isFeatured == true && _id != $id]._id`
            const otherFeaturedIds: string[] = await writeClient.fetch(otherFeaturedQuery, { id: post._id })
            if (otherFeaturedIds && otherFeaturedIds.length > 0) {
                const tx = writeClient.transaction()
                for (const otherId of otherFeaturedIds) {
                    tx.patch(otherId, (p) => p.set({ isFeatured: false }))
                }
                await tx.commit()
            }
        }

        // Build patch payload
        const patchData: Record<string, any> = {}
        if (title !== undefined) patchData.title = String(title).trim()
        if (excerpt !== undefined) patchData.excerpt = String(excerpt).trim()
        if (access !== undefined) patchData.access = access === "subscriber" ? "subscriber" : "public"
        if (isFeatured !== undefined) patchData.isFeatured = Boolean(isFeatured)
        if (paywallHeadline !== undefined) patchData.paywallHeadline = paywallHeadline ? String(paywallHeadline).trim() : null
        if (paywallCtaText !== undefined) patchData.paywallCtaText = paywallCtaText ? String(paywallCtaText).trim() : null

        await writeClient.patch(post._id).set(patchData).commit()

        revalidatePath(`/insights/${slug}`)
        revalidatePath("/insights")
        revalidatePath("/insights/members-only")
        revalidatePath("/dashboard")

        return NextResponse.json({
            success: true,
            message: "Post updated successfully",
            updated: patchData,
        })
    } catch (err) {
        console.error("Failed to update post:", err)
        return NextResponse.json({
            error: err instanceof Error ? err.message : "Internal server error updating post"
        }, { status: 500 })
    }
}
