"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Download,
  RefreshCw,
  Search,
  FileText,
  Mail,
  Calendar,
  Users,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Filter,
  Sparkles,
  Clock,
  Layers,
} from "lucide-react"
import BrevoSyncModal from "@/components/admin/BrevoSyncModal"

interface LeadSubmission {
  id: string
  name: string
  email: string
  slug: string
  leadMagnetTitle?: string
  source: string | null
  createdAt: string
}

interface LeadsResponseStats {
  totalSubmissions: number
  uniqueEmails: number
  availableSlugs: string[]
  slugCounts?: Record<string, number>
  leadMagnetTitles?: Record<string, string>
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedSlug, setSelectedSlug] = useState("")
  const [selectedDays, setSelectedDays] = useState("") // "", "today", "7", "30"
  const [stats, setStats] = useState<LeadsResponseStats>({
    totalSubmissions: 0,
    uniqueEmails: 0,
    availableSlugs: [],
    slugCounts: {},
    leadMagnetTitles: {},
  })
  const [showBrevoModal, setShowBrevoModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set("q", search.trim())
      if (selectedSlug) params.set("slug", selectedSlug)
      if (selectedDays) params.set("days", selectedDays)

      const qs = params.toString()
      const res = await fetch(`/api/admin/leads${qs ? `?${qs}` : ""}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load lead magnet submissions")
      }

      setLeads(json.data || [])
      if (json.stats) {
        setStats(json.stats)
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch leads")
    } finally {
      setLoading(false)
    }
  }, [search, selectedSlug, selectedDays])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchLeads])

  const handleExportCsv = () => {
    const params = new URLSearchParams()
    if (selectedSlug) params.set("slug", selectedSlug)
    if (selectedDays) params.set("days", selectedDays)
    if (search.trim()) params.set("q", search.trim())

    const qs = params.toString()
    const url = `/api/admin/leads/export${qs ? `?${qs}` : ""}`

    const a = document.createElement("a")
    a.href = url
    a.download = `leads_${selectedSlug || "all"}_${selectedDays || "alltime"}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete the submission for "${email}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/leads?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete submission")
      }
      setLeads((prev) => prev.filter((lead) => lead.id !== id))
      fetchLeads()
    } catch (err: any) {
      alert(err?.message || "Error deleting submission")
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return isoString
    }
  }

  const getRelativeBadge = (isoString: string) => {
    try {
      const now = new Date().getTime()
      const submitted = new Date(isoString).getTime()
      const diffHours = (now - submitted) / (1000 * 60 * 60)

      if (diffHours < 24) {
        return { label: "Today", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" }
      } else if (diffHours < 48) {
        return { label: "Yesterday", className: "bg-sky-500/15 text-sky-400 border-sky-500/30" }
      } else if (diffHours < 24 * 7) {
        const days = Math.floor(diffHours / 24)
        return { label: `${days}d ago`, className: "bg-amber-500/15 text-amber-400 border-amber-500/30" }
      } else {
        return null
      }
    } catch {
      return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Lead Magnet Submissions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              Live Leads
            </span>
          </div>
          <p className="text-sm text-white/50 mt-1">
            Contacts collected via downloadable PDF research memos, including exact report origin and timestamp.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={fetchLeads}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
            title="Refresh Leads"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-gold" : ""}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowBrevoModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white text-xs font-semibold transition shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Sync to Brevo CRM
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={leads.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold shadow-lg shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Leads CSV ({leads.length})
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-white/50 uppercase tracking-wider">
              Total Leads Captured
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">
            {stats.totalSubmissions}
          </div>
          <div className="text-xs text-white/40 mt-1">
            Total report download submissions in database
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-white/50 uppercase tracking-wider">
              Unique Email Leads
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-400">
            {stats.uniqueEmails}
          </div>
          <div className="text-xs text-white/40 mt-1">
            Unique prospective investor emails
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-white/50 uppercase tracking-wider">
              Lead Magnet Reports
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">
            {stats.availableSlugs.length}
          </div>
          <div className="text-xs text-white/40 mt-1">
            Active reports collecting subscribers
          </div>
        </div>
      </div>

      {/* Filter by Specific Lead Magnet (Interactive Chips) */}
      {stats.availableSlugs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-white/60">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Filter by Research Memo / Lead Magnet:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedSlug("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                selectedSlug === ""
                  ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                  : "bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              <span>All Reports</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedSlug === "" ? "bg-black/20 text-black" : "bg-white/10 text-white/60"}`}>
                {stats.totalSubmissions}
              </span>
            </button>

            {stats.availableSlugs.map((slug) => {
              const count = stats.slugCounts?.[slug] ?? 0
              const friendlyTitle = stats.leadMagnetTitles?.[slug] || slug
              const isSelected = selectedSlug === slug

              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setSelectedSlug(isSelected ? "" : slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? "bg-amber-400/15 text-amber-300 border-amber-400/40 shadow-sm"
                      : "bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.07] border-white/10"
                  }`}
                  title={`Slug: ${slug}`}
                >
                  <span className="truncate max-w-[280px]">{friendlyTitle}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected ? "bg-amber-400 text-black" : "bg-white/10 text-white/70"
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter by Date & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        {/* Date Filter Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-xl p-1">
            <span className="px-2 text-xs text-white/40 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Date:</span>
            </span>
            {[
              { id: "", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "7", label: "Last 7D" },
              { id: "30", label: "Last 30D" },
            ].map((period) => (
              <button
                key={period.id}
                type="button"
                onClick={() => setSelectedDays(period.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedDays === period.id
                    ? "bg-amber-400 text-black font-semibold shadow-xs"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {(search || selectedSlug || selectedDays) && (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setSelectedSlug("")
                setSelectedDays("")
              }}
              className="text-xs text-amber-400 hover:underline px-2 whitespace-nowrap cursor-pointer shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Leads Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-white/60 text-xs font-mono uppercase tracking-wider">
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Lead Magnet / Research Report</th>
                <th className="py-3.5 px-4">Requested On (IST)</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {loading && leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-white/40">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                    Loading lead submissions...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-white/40">
                    <Mail className="w-8 h-8 mx-auto text-white/20 mb-2" />
                    No submissions found matching your filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const relBadge = getRelativeBadge(lead.createdAt)
                  const displayTitle = lead.leadMagnetTitle || lead.slug

                  return (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {lead.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 font-mono text-xs text-white/60">
                          <span>{lead.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(lead.email)}
                            className="p-1 rounded text-white/30 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            title="Copy email"
                          >
                            {copiedEmail === lead.email ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Lead Magnet Title & Slug */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-medium text-white/90 text-sm">
                          {displayTitle}
                        </div>
                        <div className="mt-1">
                          <Link
                            href={`/resources/${encodeURIComponent(lead.slug)}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:border-amber-500/40 transition group"
                            title={`Open landing page for ${lead.slug}`}
                          >
                            <span>/resources/{lead.slug}</span>
                            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                          </Link>
                        </div>
                      </td>

                      {/* Requested On Date (IST) + Relative Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-white/90">
                            {formatDate(lead.createdAt)}
                          </span>
                          {relBadge && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${relBadge.className}`}>
                              {relBadge.label}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-white/40 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Indian Standard Time</span>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4 text-xs text-white/50">
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/5">
                          {lead.source || "website"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(lead.id, lead.email)}
                          disabled={deletingId === lead.id}
                          className="p-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-50"
                          title="Delete submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Brevo Sync Modal */}
      <BrevoSyncModal
        isOpen={showBrevoModal}
        onClose={() => setShowBrevoModal(false)}
        initialTab="leads"
        onSyncComplete={fetchLeads}
      />
    </div>
  )
}
