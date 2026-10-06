import Link from "next/link"
import Image from "next/image"
import { ArrowRight, FileText, CheckCircle2, Download } from "lucide-react"
import { LeadMagnet } from "@/lib/types"
import { urlForImage } from "@/lib/sanity.image"

interface LeadMagnetCardProps {
  leadMagnet: LeadMagnet
}

export function LeadMagnetCard({ leadMagnet }: LeadMagnetCardProps) {
  const badgeText = leadMagnet.badge || "Free Special Report"
  const slug = leadMagnet.slug?.current || ""
  const ctaText = leadMagnet.formCtaText || "Get Free PDF Memo"

  return (
    <Link
      href={`/resources/${slug}`}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-[#141418] border border-white/10 hover:border-gold/40 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(245,184,0,0.15)] hover:-translate-y-1"
    >
      <div className="space-y-4">
        {/* Cover image / thumbnail */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-950">
          {leadMagnet.mainImage ? (
            <Image
              src={urlForImage(leadMagnet.mainImage).width(800).height(450).fit("crop").url()}
              alt={leadMagnet.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1E1E24] to-[#121216]">
              <FileText className="w-12 h-12 text-gold/40" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-transparent to-transparent pointer-events-none" />

          {/* Badge overlays */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-gold/40 text-gold text-[10px] font-mono font-bold uppercase tracking-wider shadow-md">
              <Download className="w-3 h-3 text-gold" />
              <span>{badgeText}</span>
            </span>
          </div>

          <div className="absolute bottom-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-neutral-300 text-[10px] font-mono">
              PDF Document
            </span>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 pt-1 space-y-3 text-left">
          <h3 className="text-xl font-bold text-white tracking-tight leading-snug group-hover:text-gold transition-colors">
            {leadMagnet.title}
          </h3>

          {leadMagnet.heroSubtitle && (
            <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed line-clamp-2">
              {leadMagnet.heroSubtitle}
            </p>
          )}

          {/* Key Takeaways snippet if available */}
          {leadMagnet.keyTakeaways && leadMagnet.keyTakeaways.length > 0 && (
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              {leadMagnet.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] text-neutral-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{takeaway}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card footer CTA */}
      <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-white/5 text-xs font-mono font-bold text-gold group-hover:text-gold-light transition-colors">
        <span>{ctaText}</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
