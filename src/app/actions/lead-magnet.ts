"use server"

import { prisma } from "@/lib/prisma"
import { client } from "@/lib/sanity.client"
import { singleLeadMagnetQuery } from "@/lib/sanity.queries"
import { addLeadToBrevoList } from "@/lib/brevo-crm-service"
import { sendLeadMagnetDeliveryEmail } from "@/lib/email-service"
import { LeadMagnet } from "@/lib/types"

export interface LeadMagnetSubmitParams {
  slug: string
  name: string
  email: string
}

export interface LeadMagnetSubmitResult {
  success: boolean
  error?: string
  redirectUrl?: string
}

export async function submitLeadMagnet(params: LeadMagnetSubmitParams): Promise<LeadMagnetSubmitResult> {
  const slug = params.slug?.trim()
  const name = params.name?.trim()
  const email = params.email?.trim().toLowerCase()

  if (!slug) {
    return { success: false, error: "Resource identifier is missing." }
  }

  if (!name || name.length < 2) {
    return { success: false, error: "Please enter your full name." }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return { success: false, error: "Please enter a valid email address." }
  }

  try {
    // 1. Fetch Lead Magnet metadata & PDF details from Sanity
    const leadMagnet = await client.fetch<LeadMagnet | null>(singleLeadMagnetQuery, { slug })

    if (!leadMagnet) {
      return { success: false, error: "The requested resource could not be found." }
    }

    // 2. Persist lead to database (upsert to prevent duplicate conflicts)
    try {
      await prisma.leadMagnetSubmission.upsert({
        where: {
          email_slug: {
            email,
            slug,
          },
        },
        update: {
          name,
        },
        create: {
          name,
          email,
          slug,
          source: "website",
        },
      })
    } catch (dbError) {
      console.error("Failed to store lead magnet submission in DB:", dbError)
      // Continue so the user still receives their requested PDF even if DB logging encounters an issue
    }

    // 3. Sync contact with Brevo CRM (Hot Leads list)
    try {
      await addLeadToBrevoList({
        email,
        name,
      })
    } catch (crmError) {
      console.warn("Brevo contact sync error (non-fatal):", crmError)
    }

    // 4. Send PDF via Brevo Transactional Email
    const pdfUrl = leadMagnet.pdfFile?.asset?.url
    if (pdfUrl) {
      try {
        const resolvedDisclaimer = leadMagnet.disclaimer || (
          leadMagnet.heroSubtitle && (
            leadMagnet.heroSubtitle.toLowerCase().includes("not a recommendation") ||
            leadMagnet.heroSubtitle.toLowerCase().includes("sebi registered") ||
            leadMagnet.heroSubtitle.toLowerCase().startsWith("disclaimer") ||
            leadMagnet.heroSubtitle.toLowerCase().startsWith("disclosure")
          ) ? leadMagnet.heroSubtitle : null
        )

        await sendLeadMagnetDeliveryEmail({
          toEmail: email,
          toName: name,
          reportTitle: leadMagnet.title,
          pdfUrl,
          customSubject: leadMagnet.emailSubject,
          customPreviewText: leadMagnet.emailPreviewText,
          disclaimer: resolvedDisclaimer,
        })
      } catch (emailError) {
        console.error("Failed to send lead magnet email via Brevo:", emailError)
      }
    } else {
      console.warn(`Lead magnet "${slug}" has no PDF attached in Sanity yet.`)
    }

    // 5. Return success and thank-you redirect destination
    return {
      success: true,
      redirectUrl: `/resources/${encodeURIComponent(slug)}/thank-you?email=${encodeURIComponent(email)}`,
    }
  } catch (error: any) {
    console.error("Unexpected error submitting lead magnet:", error)
    return {
      success: false,
      error: "Something went wrong while processing your request. Please try again.",
    }
  }
}
