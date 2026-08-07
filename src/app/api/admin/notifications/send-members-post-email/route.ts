import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { client } from "@/lib/sanity.client"
import { singlePostQuery } from "@/lib/sanity.queries"
import { urlForImage } from "@/lib/sanity.image"
import { getEligibleSubscribersWithActiveTenure } from "@/lib/insights-subscription-service"
import { sendMembersOnlyPostEmailNotification } from "@/lib/email-service"

function extractSlugFromUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim()
  try {
    const parsed = new URL(trimmed)
    const pathSegments = parsed.pathname.split("/").filter(Boolean)
    return pathSegments[pathSegments.length - 1] || trimmed
  } catch {
    const cleanPath = trimmed.replace(/^https?:\/\/[^/]+/, "").split("?")[0]
    const pathSegments = cleanPath.split("/").filter(Boolean)
    return pathSegments[pathSegments.length - 1] || trimmed
  }
}

export async function GET(request: Request) {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const rawUrl = searchParams.get("url")
    const subscribers = await getEligibleSubscribersWithActiveTenure()

    let post = null
    if (rawUrl) {
      const slug = extractSlugFromUrl(rawUrl)
      const sanityPost = await client.fetch(singlePostQuery, { slug })
      if (sanityPost) {
        let mainImageUrl: string | null = null
        if (sanityPost.mainImage) {
          try {
            mainImageUrl = urlForImage(sanityPost.mainImage).width(1200).url()
          } catch {
            mainImageUrl = null
          }
        }

        post = {
          title: sanityPost.title,
          excerpt: sanityPost.excerpt || null,
          mainImageUrl,
          slug: sanityPost.slug?.current || slug,
          access: sanityPost.access || null,
        }
      }
    }

    return NextResponse.json({
      subscriberCount: subscribers.length,
      post,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch post preview data" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      postUrl,
      title: customTitle,
      excerpt: customExcerpt,
      customNote,
      isTestMode = false,
      testEmail = "support@firstprinciplesinvesting.in",
    } = body

    if (!postUrl || typeof postUrl !== "string") {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", message: "postUrl is required" },
        { status: 400 }
      )
    }

    // Standardize destination URL
    let fullPostUrl = postUrl.trim()
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://firstprinciplesinvesting.in"
    if (!fullPostUrl.startsWith("http://") && !fullPostUrl.startsWith("https://")) {
      fullPostUrl = `${siteUrl.replace(/\/$/, "")}/${fullPostUrl.replace(/^\//, "")}`
    }

    // Extract slug and attempt Sanity lookup if title is not manually provided
    let finalTitle = customTitle?.trim() || ""
    let finalExcerpt = customExcerpt?.trim() || null
    let mainImageUrl: string | null = null

    const slug = extractSlugFromUrl(postUrl)
    if (slug) {
      try {
        const sanityPost = await client.fetch(singlePostQuery, { slug })
        if (sanityPost) {
          if (!finalTitle) {
            finalTitle = sanityPost.title
          }
          if (!finalExcerpt && sanityPost.excerpt) {
            finalExcerpt = sanityPost.excerpt
          }
          if (sanityPost.mainImage) {
            try {
              mainImageUrl = urlForImage(sanityPost.mainImage).width(1200).url()
            } catch {
              mainImageUrl = null
            }
          }
        }
      } catch (sanityErr) {
        console.warn("Sanity lookup skipped or failed:", sanityErr)
      }
    }

    if (!finalTitle) {
      finalTitle = "New Members Research Memo"
    }

    // Determine target recipient list
    let recipients: Array<{ email: string; name?: string | null }> = []

    if (isTestMode) {
      const recipientEmail = (testEmail || "support@firstprinciplesinvesting.in").trim()
      recipients = [{ email: recipientEmail, name: "Admin Test" }]
    } else {
      const activeSubscribers = await getEligibleSubscribersWithActiveTenure()
      recipients = activeSubscribers.map((sub) => ({
        email: sub.email,
        name: sub.name,
      }))
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "NO_RECIPIENTS", message: "No active member subscribers found to email" },
        { status: 400 }
      )
    }

    const result = await sendMembersOnlyPostEmailNotification({
      postUrl: fullPostUrl,
      title: finalTitle,
      excerpt: finalExcerpt,
      mainImageUrl,
      recipients,
      isTest: isTestMode,
      customNote: customNote?.trim() || null,
    })

    return NextResponse.json({
      success: true,
      isTestMode,
      recipientCount: recipients.length,
      successCount: result.successCount,
      failedCount: result.failedCount,
      errors: result.errors,
    })
  } catch (error: any) {
    console.error("Error sending post email broadcast:", error)
    return NextResponse.json(
      { error: "SERVER_ERROR", message: error?.message || "Failed to send email broadcast" },
      { status: 500 }
    )
  }
}
