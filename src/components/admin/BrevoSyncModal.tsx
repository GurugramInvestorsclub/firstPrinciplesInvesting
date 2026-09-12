"use client"

import { useState, useEffect } from "react"
import { RefreshCw, CheckCircle2, AlertCircle, Users, ExternalLink, X, ChevronDown } from "lucide-react"

interface BrevoListSummary {
  id: number
  name: string
  uniqueSubscribers: number
  totalSubscribers: number
}

interface BrevoSyncStatus {
  configuredListId: number
  configuredListName: string
  subscribersInBrevoList: number | null
  activeSubscribersInDb: number
  availableLists: BrevoListSummary[]
}

interface BrevoSyncResult {
  success: boolean
  listId: number
  totalEligibleInDb: number
  previouslyInBrevo: number
  addedCount: number
  removedCount: number
  retainedCount: number
  addedEmails: string[]
  removedEmails: string[]
  errors: string[]
}

interface BrevoSyncModalProps {
  isOpen: boolean
  onClose: () => void
  onSyncComplete?: () => void
}

export default function BrevoSyncModal({ isOpen, onClose, onSyncComplete }: BrevoSyncModalProps) {
  const [loading, setLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [status, setStatus] = useState<BrevoSyncStatus | null>(null)
  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  const [syncResult, setSyncResult] = useState<BrevoSyncResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchStatus()
      setSyncResult(null)
      setErrorMessage(null)
    }
  }, [isOpen])

  async function fetchStatus() {
    setLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetch("/api/admin/brevo/sync")
      const json = await res.json()
      if (res.ok && json.success) {
        setStatus(json.data)
        setSelectedListId(json.data.configuredListId)
      } else {
        setErrorMessage(json.error || "Failed to fetch Brevo sync status")
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Network error fetching Brevo status")
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    if (!selectedListId) return
    setIsSyncing(true)
    setErrorMessage(null)
    setSyncResult(null)

    try {
      const res = await fetch("/api/admin/brevo/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: selectedListId }),
      })
      const json = await res.json()

      if (res.ok && json.success) {
        setSyncResult(json.data)
        fetchStatus()
        if (onSyncComplete) {
          onSyncComplete()
        }
      } else {
        setErrorMessage(json.error || "Brevo sync failed. Check API key and list permissions.")
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Network error while syncing with Brevo")
    } finally {
      setIsSyncing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-6 sm:p-8 bg-[#111116] border border-white/10 rounded-2xl shadow-2xl space-y-6 text-white overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0092FF]/10 text-[#0092FF] border border-[#0092FF]/20">
              <RefreshCw className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Sync Brevo Active Members List</h2>
              <p className="text-xs text-white/50 mt-0.5">
                Automatically add active tenure members and remove expired accounts in Brevo CRM.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-white/50 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-gold" />
            <span className="text-sm">Connecting to Brevo API...</span>
          </div>
        )}

        {/* Error State */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold">Error</div>
              <div className="text-xs mt-0.5 opacity-90">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Main Body */}
        {!loading && status && (
          <div className="space-y-6">
            
            {/* Counts Comparison Card */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs text-white/50 font-mono uppercase tracking-wider mb-1">
                  Active in Database
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {status.activeSubscribersInDb}
                </div>
                <div className="text-[11px] text-white/40 mt-1">
                  Includes active &amp; cancelled with valid tenure
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs text-white/50 font-mono uppercase tracking-wider mb-1">
                  Current in Brevo List
                </div>
                <div className="text-2xl font-bold text-white">
                  {status.subscribersInBrevoList !== null ? status.subscribersInBrevoList : "—"}
                </div>
                <div className="text-[11px] text-white/40 mt-1">
                  List: #{status.configuredListId} ({status.configuredListName})
                </div>
              </div>
            </div>

            {/* List Selection */}
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 font-mono">
                Target Brevo CRM List
              </label>
              <div className="relative">
                <select
                  value={selectedListId ?? status.configuredListId}
                  onChange={(e) => setSelectedListId(parseInt(e.target.value, 10))}
                  className="w-full appearance-none bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold pr-10"
                >
                  {status.availableLists.map((l) => (
                    <option key={l.id} value={l.id} className="bg-[#18181F] text-white">
                      List #{l.id}: {l.name} ({l.uniqueSubscribers} contacts)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-white/40 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              <p className="text-[11px] text-white/40 mt-1.5">
                Default configured in environment is List #{status.configuredListId}.
              </p>
            </div>

            {/* Sync Result Banner */}
            {syncResult && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  Sync Complete!
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-emerald-500/20">
                  <div>
                    <span className="text-white/60 block">Added:</span>
                    <strong className="text-emerald-400 text-sm">+{syncResult.addedCount}</strong>
                  </div>
                  <div>
                    <span className="text-white/60 block">Removed:</span>
                    <strong className="text-rose-400 text-sm">-{syncResult.removedCount}</strong>
                  </div>
                  <div>
                    <span className="text-white/60 block">Retained:</span>
                    <strong className="text-white text-sm">{syncResult.retainedCount}</strong>
                  </div>
                </div>
                {syncResult.errors.length > 0 && (
                  <div className="text-[11px] text-rose-300 pt-2 border-t border-emerald-500/20">
                    ⚠️ {syncResult.errors.length} non-critical warnings reported. Check server logs for details.
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-xs font-semibold transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold shadow-lg shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing with Brevo..." : "Sync Active Members to Brevo Now"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
