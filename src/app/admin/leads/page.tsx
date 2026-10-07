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
} from "lucide-react"
import BrevoSyncModal from "@/components/admin/BrevoSyncModal"

interface LeadSubmission {
  id: string
  name: string
  email: string
  slug: string
  source: string | null
  createdAt: string
}

interface LeadsResponseStats {
  totalSubmissions: number
  uniqueEmails: number
  availableSlugs: string[]
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedSlug, setSelectedSlug] = useState("")
  const [stats, setStats] = useState<LeadsResponseStats>({
    totalSubmissions: 0,
    uniqueEmails: 0,
    availableSlugs: [],
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
  }, [search, selectedSlug])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchLeads])

  const handleExportCsv = () => {
    const params = new URLSearchParams()
    if (selectedSlug) params.set("slug", selectedSlug)
    if (search.trim()) params.set("q", search.trim())

    const qs = params.toString()
    const url = `/api/admin/leads/export${qs ? `?${qs}` : ""}`

    const a = document.createElement("a")
    a.href = url
    a.download = `leads_${selectedSlug || "all"}.csv`
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
            Contacts collected via downloadable PDF research memos and institutional reports.
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
            Sync to Brevo
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={leads.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold shadow-lg shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Leads CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-white/50 uppercase tracking-wider">
              Total Downloads
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">
            {stats.totalSubmissions}
          </div>
          <div className="text-xs text-white/40 mt-1">
            Total report request submissions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-white/50 uppercase tracking-wider">
              Unique Leads
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-400">
            {stats.uniqueEmails}
          </div>
          <div className="text-xs text-white/40 mt-1">
            Unique verified email addresses
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-white/50 uppercase tracking-wider">
              Active Resources
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">
            {stats.availableSlugs.length}
          </div>
          <div className="text-xs text-white/40 mt-1">
            Distinct lead magnets receiving leads
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-white/40 shrink-0" />
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none cursor-pointer w-full"
            >
              <option value="" className="bg-[#18181F] text-white">
                All Lead Magnets ({stats.availableSlugs.length})
              </option>
              {stats.availableSlugs.map((slug) => (
                <option key={slug} value={slug} className="bg-[#18181F] text-white">
                  {slug}
                </option>
              ))}
            </select>
          </div>

          {(search || selectedSlug) && (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setSelectedSlug("")
              }}
              className="text-xs text-amber-400 hover:underline px-2 whitespace-nowrap cursor-pointer"
            >
              Reset
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
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Resource Slug</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Requested On (IST)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {loading && leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-white/40">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                    Loading lead magnet submissions...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-white/40">
                    <Mail className="w-8 h-8 mx-auto text-white/20 mb-2" />
                    No submissions found matching your filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4 font-medium text-white">
                      {lead.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-300">
                      <div className="flex items-center gap-2">
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
                    <td className="py-3 px-4">
                      <Link
                        href={`/resources/${encodeURIComponent(lead.slug)}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:border-amber-500/40 transition group"
                      >
                        <span className="font-mono">{lead.slug}</span>
                        <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs text-white/50">
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/5">
                        {lead.source || "website"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-white/60 font-mono whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
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
                ))
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
