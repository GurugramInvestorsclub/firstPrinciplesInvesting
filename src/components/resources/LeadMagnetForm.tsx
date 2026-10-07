"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitLeadMagnet } from "@/app/actions/lead-magnet"
import { Mail, User, ArrowRight, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react"

interface LeadMagnetFormProps {
  slug: string
  ctaText?: string
}

export function LeadMagnetForm({ slug, ctaText = "Get Free PDF Report" }: LeadMagnetFormProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name.")
      return
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await submitLeadMagnet({
        slug,
        name: name.trim(),
        email: email.trim().toLowerCase(),
      })

      if (!res.success) {
        setError(res.error || "Unable to process your request. Please try again.")
        setIsSubmitting(false)
        return
      }

      if (res.redirectUrl) {
        router.push(res.redirectUrl)
      } else {
        router.push(`/resources/${encodeURIComponent(slug)}/thank-you?email=${encodeURIComponent(email)}`)
      }
    } catch (err: any) {
      console.error("Submission failed:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full h-full rounded-2xl md:rounded-3xl bg-[#141418] border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col justify-between">
      {/* Decorative background ambient glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        <div className="space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[11px] font-mono font-bold tracking-widest uppercase">
            Instant PDF Delivery
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Get your FREE pdf copy
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm leading-snug">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="lead-name" className="block text-xs font-mono font-medium text-neutral-300">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="lead-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 bg-[#0D0D10] border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/60 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="lead-email" className="block text-xs font-mono font-medium text-neutral-300">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="lead-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 bg-[#0D0D10] border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/60 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full group mt-2 flex items-center justify-center gap-2 bg-gold hover:bg-[#E0A800] text-black font-extrabold px-6 py-3.5 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(245,184,0,0.2)] hover:shadow-[0_0_30px_rgba(245,184,0,0.35)] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing & Dispatching PDF...</span>
              </>
            ) : (
              <>
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
        </div>

        <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span>Zero Spam · Pure Research</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
            <span>Instant PDF via Email</span>
          </div>
        </div>
      </div>
    </div>
  )
}
