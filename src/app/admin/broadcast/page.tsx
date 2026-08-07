"use client"

import { useState, useEffect } from "react"
import {
  Send,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Users,
  Eye,
  FileText,
  Sparkles,
  Info,
} from "lucide-react"

interface PreviewPost {
  title: string
  excerpt: string | null
  mainImageUrl: string | null
  slug: string
  access: string | null
}

export default function AdminBroadcastPage() {
  const [postUrl, setPostUrl] = useState("")
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [customNote, setCustomNote] = useState("")
  const [testEmail, setTestEmail] = useState("support@firstprinciplesinvesting.in")

  const [activeSubscriberCount, setActiveSubscriberCount] = useState<number | null>(null)
  const [previewPost, setPreviewPost] = useState<PreviewPost | null>(null)
  const [isFetchingPreview, setIsFetchingPreview] = useState(false)

  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false)

  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info"
    message: string
    details?: string
  } | null>(null)

  // Fetch active subscriber count on mount
  useEffect(() => {
    fetchSubscriberCount()
  }, [])

  async function fetchSubscriberCount() {
    try {
      const res = await fetch("/api/admin/notifications/send-members-post-email")
      if (res.ok) {
        const data = await res.json()
        setActiveSubscriberCount(data.subscriberCount ?? 0)
      }
    } catch {
      console.warn("Failed to fetch initial subscriber count")
    }
  }

  // Auto-fetch post preview when post URL changes
  async function handleFetchPreview() {
    if (!postUrl.trim()) return

    setIsFetchingPreview(true)
    setFeedback(null)

    try {
      const res = await fetch(
        `/api/admin/notifications/send-members-post-email?url=${encodeURIComponent(postUrl.trim())}`
      )
      if (!res.ok) {
        throw new Error("Failed to fetch post details")
      }
      const data = await res.json()

      if (data.subscriberCount !== undefined) {
        setActiveSubscriberCount(data.subscriberCount)
      }

      if (data.post) {
        setPreviewPost(data.post)
        if (!title) setTitle(data.post.title || "")
        if (!excerpt) setExcerpt(data.post.excerpt || "")
        setFeedback({
          type: "success",
          message: "Post details loaded successfully from Sanity!",
        })
      } else {
        setPreviewPost(null)
        setFeedback({
          type: "info",
          message: "No matching Sanity post found for this URL/slug. You can still enter custom Title and Excerpt manually.",
        })
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Could not preview post details.",
      })
    } finally {
      setIsFetchingPreview(false)
    }
  }

  async function handleSendEmail(isTestMode: boolean) {
    if (!postUrl.trim()) {
      setFeedback({
        type: "error",
        message: "Please enter a valid Post URL or path.",
      })
      return
    }

    if (isTestMode) {
      if (!testEmail.trim()) {
        setFeedback({
          type: "error",
          message: "Please enter a valid test recipient email address.",
        })
        return
      }
      setIsSendingTest(true)
    } else {
      if (!confirm(`Are you sure you want to broadcast this email to ALL ${activeSubscriberCount ?? 0} active members?`)) {
        return
      }
      setIsSendingBroadcast(true)
    }

    setFeedback(null)

    try {
      const res = await fetch("/api/admin/notifications/send-members-post-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postUrl: postUrl.trim(),
          title: title.trim() || previewPost?.title,
          excerpt: excerpt.trim() || previewPost?.excerpt,
          customNote: customNote.trim() || undefined,
          isTestMode,
          testEmail: testEmail.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to send email")
      }

      if (isTestMode) {
        setFeedback({
          type: "success",
          message: `Test email sent successfully to ${testEmail.trim()}! Check your inbox.`,
        })
      } else {
        setFeedback({
          type: "success",
          message: `Broadcast completed! Sent to ${data.successCount} active member(s).`,
          details: data.failedCount > 0 ? `${data.failedCount} delivery failures reported.` : undefined,
        })
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "An error occurred while sending email.",
      })
    } finally {
      setIsSendingTest(false)
      setIsSendingBroadcast(false)
    }
  }

  const effectiveTitle = title.trim() || previewPost?.title || "New Members Research Memo"
  const effectiveExcerpt = excerpt.trim() || previewPost?.excerpt || ""
  const effectiveImage = previewPost?.mainImageUrl || null

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold font-semibold">
              ADMIN TOOL
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold/15 text-gold font-medium border border-gold/30">
              Email Dispatcher
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Member Post Email Broadcast
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Send an email notification for new members-only research posts to subscribers with active tenure.
          </p>
        </div>

        {/* Member Count Pill */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 shrink-0">
          <div className="p-2.5 rounded-lg bg-gold/10 text-gold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-white/50 uppercase tracking-wider font-mono">Active Members</div>
            <div className="text-xl font-bold text-white">
              {activeSubscriberCount !== null ? activeSubscriberCount : "..."}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Controls (Left) & Live Email Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Controls Column */}
        <div className="lg:col-span-7 space-y-6">

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : feedback.type === "error"
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-400"
              }`}
            >
              {feedback.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
              {feedback.type === "error" && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
              {feedback.type === "info" && <Info className="w-5 h-5 shrink-0 mt-0.5" />}
              <div className="flex-1">
                <div className="font-semibold">{feedback.message}</div>
                {feedback.details && <div className="text-xs opacity-80 mt-1">{feedback.details}</div>}
              </div>
            </div>
          )}

          {/* Card: Post URL & Meta */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold" />
                1. Target Post / URL
              </h2>
              {previewPost?.access && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gold/20 text-gold uppercase border border-gold/40">
                  Access: {previewPost.access}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-white/60">
                Post URL or Slug
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder="https://firstprinciplesinvesting.in/insights/post-slug"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-white/30"
                />
                <button
                  onClick={handleFetchPreview}
                  disabled={isFetchingPreview || !postUrl.trim()}
                  className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isFetchingPreview ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-gold" />
                  )}
                  Fetch Info
                </button>
              </div>
              <p className="text-[11px] text-white/40">
                Paste the full URL or slug. Fetch Info will auto-load the title, excerpt & image from Sanity.
              </p>
            </div>

            {/* Title & Excerpt Override Fields */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Email Title / Heading
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={previewPost?.title || "e.g. Valuation Analysis: Sector Q3 Review"}
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Summary / Excerpt (Optional)
                </label>
                <textarea
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder={previewPost?.excerpt || "Brief key takeaways or summary..."}
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Custom Editor Note (Optional)
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Note from author: Pay special attention to Section 3..."
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card: Test Feature */}
          <div className="p-6 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-amber-400 flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                2. Test Mode (Recommended First)
              </h2>
              <span className="text-[11px] font-mono text-amber-300/80">Test Email Only</span>
            </div>

            <p className="text-xs text-amber-200/70 leading-relaxed">
              Send a single test preview to your support inbox first to check how the email renders before broadcasting to everyone.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="support@firstprinciplesinvesting.in"
                className="flex-1 px-4 py-2.5 rounded-lg bg-black/60 border border-amber-500/30 text-white text-sm focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => handleSendEmail(true)}
                disabled={isSendingTest || isSendingBroadcast}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {isSendingTest ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Send className="w-4 h-4 text-black" />
                )}
                Send Test Email
              </button>
            </div>
          </div>

          {/* Card: Live Broadcast Action */}
          <div className="p-6 rounded-2xl bg-gold/[0.04] border border-gold/30 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gold flex items-center gap-2">
                <Users className="w-4 h-4 text-gold" />
                3. Live Member Broadcast
              </h2>
              <span className="text-xs text-gold/80 font-mono">
                {activeSubscriberCount ?? 0} Recipients
              </span>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              This will send the email notification to all <strong>{activeSubscriberCount ?? 0} active subscribers</strong> currently holding active membership tenure.
            </p>

            <button
              onClick={() => handleSendEmail(false)}
              disabled={isSendingBroadcast || isSendingTest || !postUrl.trim()}
              className="w-full py-3.5 px-6 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-gold/10 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSendingBroadcast ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                  Broadcasting Emails...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 text-black" />
                  Send Email Broadcast to All {activeSubscriberCount ?? 0} Active Members
                </>
              )}
            </button>
          </div>

        </div>

        {/* Live Email Preview Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-white/50">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-gold" />
              Live Email Preview
            </span>
            <span>Brevo HTML Template</span>
          </div>

          {/* Email Preview Frame */}
          <div className="rounded-2xl border border-white/15 bg-[#0A0A0C] p-4 md:p-6 text-left font-sans text-white/90 shadow-2xl space-y-6">
            
            {/* Top Container */}
            <div className="bg-[#111115] border border-white/10 rounded-xl overflow-hidden shadow-xl">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 text-left flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="First Principles Investing Logo"
                  className="w-7 h-7 object-contain rounded"
                />
                <span className="text-xs font-bold text-gold tracking-widest uppercase">
                  FIRST PRINCIPLES INVESTING
                </span>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-5">
                <div className="inline-block px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11px] font-bold tracking-wider">
                  🔒 MEMBERS-ONLY RESEARCH MEMO
                </div>

                <p className="text-sm font-semibold text-white/90">
                  Dear investor, we just released a new deep-dive !
                </p>

                <h3 className="text-xl font-bold text-white leading-snug">
                  {effectiveTitle}
                </h3>

                {effectiveImage && (
                  <div className="rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={effectiveImage}
                      alt="Cover Preview"
                      className="w-full h-auto object-cover max-h-48"
                    />
                  </div>
                )}

                {customNote.trim() && (
                  <div className="p-3 rounded-lg bg-gold/10 border border-gold/25 text-xs text-gold/90 space-y-1">
                    <span className="font-bold tracking-wider uppercase block text-[10px]">NOTE FROM EDITOR</span>
                    <p className="text-white/80 leading-relaxed">{customNote.trim()}</p>
                  </div>
                )}

                {effectiveExcerpt && (
                  <div className="p-4 rounded-lg bg-[#17171C] border-l-2 border-gold text-xs text-white/80 italic leading-relaxed">
                    &ldquo;{effectiveExcerpt}&rdquo;
                  </div>
                )}

                {/* CTA Button */}
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gold text-black font-bold text-xs">
                    Read Full Research Memo &rarr;
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-[#0E0E12] border-t border-white/10 text-[11px] text-white/40 space-y-1">
                <p>You are receiving this notification as an active subscriber of First Principles Investing.</p>
                <p className="text-white/30">First Principles Investing &bull; Members Only Research</p>
              </div>

            </div>

            <div className="text-[11px] text-white/40 text-center font-mono">
              Link Target: <span className="text-gold/70">{postUrl || "https://firstprinciplesinvesting.in/..."}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
