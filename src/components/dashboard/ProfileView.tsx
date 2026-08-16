"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Receipt, LogOut, AlertTriangle, Loader2, X, Clock } from "lucide-react"

interface ProfileViewProps {
    userName: string
    userEmail: string
    subscriptionStatus: string
    subscriptionEnd?: string
    cancelAtCycleEnd?: boolean
    hasSubscriptionAccess?: boolean
    onSignOut: () => void
}

export function ProfileView({ 
    subscriptionStatus, 
    subscriptionEnd, 
    cancelAtCycleEnd = false,
    hasSubscriptionAccess = false,
    onSignOut 
}: ProfileViewProps) {
    const router = useRouter()
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)
    const [cancelError, setCancelError] = useState<string | null>(null)
    const [isCancelled, setIsCancelled] = useState(cancelAtCycleEnd)
    const [statusLabel, setStatusLabel] = useState(subscriptionStatus)

    useEffect(() => {
        setIsCancelled(cancelAtCycleEnd)
        setStatusLabel(subscriptionStatus)
    }, [cancelAtCycleEnd, subscriptionStatus])

    const handleCancelSubscription = async () => {
        setIsCancelling(true)
        setCancelError(null)

        try {
            const response = await fetch("/api/subscriptions/cancel", {
                method: "POST",
            })
            const payload = await response.json()

            if (!response.ok || !payload.success) {
                throw new Error(payload.message || "Failed to cancel subscription. Please try again or contact support.")
            }

            setIsCancelled(true)
            setStatusLabel("Cancels At Period End")
            setShowCancelModal(false)
            router.refresh()
        } catch (err) {
            setCancelError(err instanceof Error ? err.message : "An unexpected error occurred.")
        } finally {
            setIsCancelling(false)
        }
    }

    const isCancellable = (hasSubscriptionAccess || statusLabel.toLowerCase() === "active") && !isCancelled && statusLabel.toLowerCase() !== "cancelled" && statusLabel.toLowerCase() !== "inactive"

    return (
        <div className="space-y-8 text-left max-w-2xl mx-auto py-4">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary tracking-tight font-sans">
                    Settings & Profile
                </h1>
                <p className="text-sm text-neutral-400 font-light mt-1">
                    Manage your billing transactions, active subscription memberships, and session preferences.
                </p>
            </div>

            {/* Profile Content List */}
            <div className="space-y-6">
                
                {/* Membership Details */}
                <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4">
                    <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center justify-between border-b border-[#2E2E2E] pb-3">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-gold" />
                            <span>Membership details</span>
                        </div>
                    </h3>

                    <div className="grid grid-cols-2 gap-4 font-mono text-xs text-neutral-400">
                        <div>
                            <span className="text-neutral-500 block">STATUS</span>
                            <span className={`font-bold uppercase ${isCancelled ? "text-amber-400" : statusLabel.toLowerCase() === "active" ? "text-emerald-400" : "text-neutral-300"}`}>
                                {statusLabel}
                            </span>
                        </div>
                        <div>
                            <span className="text-neutral-500 block">PLAN HORIZON</span>
                            <span className="text-text-primary font-bold">MEMBERSHIP ACCESS</span>
                        </div>
                        {subscriptionEnd && (
                            <div className="col-span-2 mt-2">
                                <span className="text-neutral-500 block">
                                    {isCancelled ? "ACCESS END DATE" : "EXPIRY DATE"}
                                </span>
                                <span className="text-text-primary font-bold">{subscriptionEnd}</span>
                            </div>
                        )}
                    </div>

                    {/* Cancellation Scheduled Alert Banner */}
                    {isCancelled && (
                        <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-200 text-xs space-y-1">
                            <div className="flex items-center gap-2 font-bold font-mono">
                                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>Cancellation Scheduled</span>
                            </div>
                            <p className="text-neutral-300 text-[11px] leading-relaxed">
                                Your subscription will not renew. You will retain full membership access until {subscriptionEnd || "the end of your current cycle"}.
                            </p>
                        </div>
                    )}

                    {/* Cancel Subscription Action Button */}
                    {isCancellable && (
                        <div className="pt-3 border-t border-[#2E2E2E]">
                            <button
                                type="button"
                                onClick={() => {
                                    setCancelError(null)
                                    setShowCancelModal(true)
                                }}
                                className="w-full sm:w-auto px-4 py-2.5 bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-950/40 text-rose-300 rounded-xl font-mono text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                            >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                <span>Cancel Subscription</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Billing Invoice Logs */}
                <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4">
                    <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                        <Receipt className="w-4 h-4 text-gold" />
                        <span>Billing History</span>
                    </h3>

                    <div className="space-y-2.5 font-mono text-[10px]">
                        <div className="p-2.5 bg-bg-deep border border-[#2E2E2E] rounded-xl flex justify-between items-center text-neutral-400">
                            <div className="space-y-1">
                                <div className="text-text-primary font-bold">₹2,100 MEMB #74</div>
                                <div>PAID: SUCCESS</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sign Out Action Button */}
                <button
                    onClick={onSignOut}
                    className="w-full py-3 bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 rounded-2xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Terminate Session (Sign Out)</span>
                </button>

            </div>

            {/* Cancel Confirmation Popup Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1E1E1E] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-left">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => !isCancelling && setShowCancelModal(false)}
                            disabled={isCancelling}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 shrink-0">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="space-y-1 pr-6">
                                <h3 className="text-lg font-bold text-text-primary font-sans">
                                    Cancel Subscription?
                                </h3>
                                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                                    Are you sure you want to cancel your Insights subscription?
                                </p>
                            </div>
                        </div>

                        {/* Impact Details Box */}
                        <div className="p-4 rounded-xl border border-white/5 bg-bg-deep space-y-2.5 font-mono text-xs text-neutral-300">
                            <div className="flex items-start gap-2">
                                <span className="text-gold font-bold">✓</span>
                                <p className="text-[11px] leading-relaxed">
                                    You will retain full membership access until <strong className="text-white">{subscriptionEnd || "the end of your current billing period"}</strong>.
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-gold font-bold">✓</span>
                                <p className="text-[11px] leading-relaxed">
                                    No further automatic renewals or charges will be processed.
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-gold font-bold">✓</span>
                                <p className="text-[11px] leading-relaxed">
                                    You can re-activate your subscription anytime in the future.
                                </p>
                            </div>
                        </div>

                        {/* Error Message if any */}
                        {cancelError && (
                            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs font-mono">
                                {cancelError}
                            </div>
                        )}

                        {/* Modal Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(false)}
                                disabled={isCancelling}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-neutral-200 font-mono text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                            >
                                Keep Subscription
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelSubscription}
                                disabled={isCancelling}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-rose-500/40 bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCancelling ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Cancelling...</span>
                                    </>
                                ) : (
                                    <span>Confirm Cancellation</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
