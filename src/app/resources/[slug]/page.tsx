import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { singleLeadMagnetQuery } from "@/lib/sanity.queries"
import { LeadMagnet } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"
import { LeadMagnetForm } from "@/components/resources/LeadMagnetForm"
import { CheckCircle2, FileText, Download, Sparkles } from "lucide-react"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const leadMagnet = await client.fetch<LeadMagnet | null>(singleLeadMagnetQuery, { slug })

  if (!leadMagnet) {
    return {
      title: "Complimentary Research Report | First Principles Investing",
    }
  }

  const title = `${leadMagnet.title} | Free Research Report`
  const description =
    leadMagnet.heroSubtitle ||
    "Download our free institutional research report from First Principles Investing."

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: leadMagnet.mainImage ? [urlForImage(leadMagnet.mainImage).width(1200).height(630).url()] : [],
    },
  }
}

export default async function LeadMagnetLandingPage({ params }: Props) {
  const { slug } = await params
  const leadMagnet = await client.fetch<LeadMagnet | null>(singleLeadMagnetQuery, { slug })

  if (!leadMagnet) {
    notFound()
  }

  const badgeText = leadMagnet.badge || "Free Special Research Report"
  const headline = leadMagnet.heroHeadline || leadMagnet.title
  const subtitle = leadMagnet.heroSubtitle
  const takeaways = leadMagnet.keyTakeaways || []
  const ctaButtonText = leadMagnet.formCtaText || "Get Free PDF Report"

  return (
    <div className="flex flex-col min-h-screen bg-bg-deep text-text-primary">
      <Navbar />

      <main className="flex-1 relative overflow-hidden py-16 md:py-24">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-white/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="container max-w-6xl px-4 sm:px-6 md:px-8 mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* Left Column: Value Proposition & Teaser (7 cols) */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>{badgeText}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                  {headline}
                </h1>

                {subtitle && (
                  <p className="text-base sm:text-lg text-neutral-300 font-light leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Cover Mockup / Image (if present) */}
              {leadMagnet.mainImage && (
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#141418]">
                  <Image
                    src={urlForImage(leadMagnet.mainImage).width(1200).height(675).url()}
                    alt={leadMagnet.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0E]/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-neutral-300">
                    <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                      <FileText className="w-3.5 h-3.5 text-gold" />
                      PDF Research Memo
                    </span>
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-gold">
                      Free Download
                    </span>
                  </div>
                </div>
              )}

              {/* Key Takeaways Checklist */}
              {takeaways.length > 0 && (
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" />
                    What You&apos;ll Discover Inside This Report
                  </h2>
                  <ul className="space-y-3">
                    {takeaways.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-neutral-300 leading-snug">
                        <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Compliance & Independence Note */}
              <p className="text-[11px] text-neutral-500 font-mono leading-relaxed">
                Prepared by First Principles Research. For educational purposes only. Zero sponsored content.
              </p>
            </div>

            {/* Right Column: High-Converting Lead Capture Card (5 cols) */}
            <div className="lg:col-span-5 w-full">
              <div className="sticky top-28">
                <LeadMagnetForm slug={slug} ctaText={ctaButtonText} />
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
