"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function InsightsCancelMembershipButton() {
  const router = useRouter()
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cancelMembership = async () => {
    setError(null)
    setIsCancelling(true)

    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Unable to cancel membership")
      }

      router.refresh()
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Unable to cancel membership")
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={cancelMembership}
        disabled={isCancelling}
        className="inline-flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isCancelling ? "Requesting Cancellation..." : "Cancel Membership"}
      </button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  )
}
