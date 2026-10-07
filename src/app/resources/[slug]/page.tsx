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
import { CheckCircle2, FileText, Download, Sparkles, ShieldAlert } from "lucide-react"

function isDisclaimerText(text?: string | null): boolean {
  if (!text) return false
  const lower = text.trim().toLowerCase()
  return (
    lower.startsWith("disclaimer") ||
    lower.startsWith("disclosure") ||
    lower.includes("not a recommendation") ||
    lower.includes("sebi registered")
  )
}

function cleanDisclaimer(text: string): string {
  return text.replace(/^(disclaimer|disclosure)\s*[:\-]\s*/i, "").trim()
}

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
  const isSubtitleDisclaimer = isDisclaimerText(subtitle)
  const disclaimerText = leadMagnet.disclaimer || (isSubtitleDisclaimer ? subtitle : null)
  const displaySubtitle = isSubtitleDisclaimer ? null : subtitle
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
          {/* Hero Header: Title & Subtitle occupying full width */}
          <div className="space-y-4 mb-8 md:mb-12 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>{badgeText}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              {headline}
            </h1>

            {displaySubtitle && (
              <p className="text-base sm:text-lg md:text-xl text-neutral-200 font-light leading-relaxed max-w-4xl">
                {displaySubtitle}
              </p>
            )}

            {disclaimerText && (
              <div className="inline-flex items-start sm:items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gold/40 bg-[radial-gradient(ellipse_at_top_left,rgba(245,184,0,0.12),transparent_70%),rgba(20,20,24,0.7)] backdrop-blur-md shadow-[0_0_20px_rgba(245,184,0,0.1)] max-w-4xl">
                <ShieldAlert className="w-4 h-4 text-gold shrink-0 mt-0.5 sm:mt-0" />
                <p className="text-xs sm:text-sm text-neutral-100 font-medium leading-relaxed">
                  <strong className="text-gold font-bold mr-1.5 font-mono uppercase tracking-wider text-[11px]">
                    Disclaimer:
                  </strong>
                  <span>{cleanDisclaimer(disclaimerText)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Symmetrical Two-Column Section: Left Mockup & Right Form with matching bottom alignment */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* Left Column: Cover Mockup / Teaser (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              {leadMagnet.mainImage ? (
                <div className="relative w-full h-full min-h-[380px] lg:min-h-0 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#141418] flex flex-col justify-between group">
                  <Image
                    src={urlForImage(leadMagnet.mainImage).width(1200).url()}
                    alt={leadMagnet.title}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0E]/90 via-[#0B0B0E]/20 to-transparent pointer-events-none" />
                  
                  {/* Top space filler */}
                  <div className="relative z-10 p-6 pointer-events-none" />

                  {/* Bottom badges */}
                  <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between text-xs font-mono text-neutral-300">
                    <span className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-neutral-200 shadow-lg">
                      <FileText className="w-3.5 h-3.5 text-gold" />
                      PDF Research Memo
                    </span>
                    <span className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-gold font-semibold shadow-lg">
                      Free Download
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full min-h-[380px] lg:min-h-0 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#141418] p-6 sm:p-8 md:p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {leadMagnet.title}
                    </h3>
                    <p className="text-sm text-neutral-400 font-light leading-relaxed">
                      Exclusive deep-dive institutional research memo prepared by First Principles Research.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-neutral-400">
                    <span className="flex items-center gap-1.5 text-gold">
                      <Sparkles className="w-3.5 h-3.5" />
                      Verified Analysis
                    </span>
                    <span>PDF Format</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: High-Converting Lead Capture Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <LeadMagnetForm slug={slug} ctaText={ctaButtonText} />
            </div>

          </div>

          {/* Compliance & Independence Note */}
          <div className="mt-6 flex items-center justify-center sm:justify-start gap-2 text-xs text-neutral-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
            <span>Prepared by First Principles Research. For educational purposes only. Zero sponsored content.</span>
          </div>

          {/* Key Takeaways Checklist (if present) */}
          {takeaways.length > 0 && (
            <div className="mt-12 md:mt-16 p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                <Download className="w-3.5 h-3.5" />
                What You&apos;ll Discover Inside This Report
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {takeaways.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-[#141418]/60 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-300 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
