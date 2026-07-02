"use client"

import { ShieldCheck, Receipt, LogOut } from "lucide-react"

interface ProfileViewProps {
    userName: string
    userEmail: string
    subscriptionStatus: string
    subscriptionEnd?: string
    onSignOut: () => void
}

export function ProfileView({ subscriptionStatus, subscriptionEnd, onSignOut }: ProfileViewProps) {
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
                    <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                        <ShieldCheck className="w-4 h-4 text-gold" />
                        <span>Membership details</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-4 font-mono text-xs text-neutral-400">
                        <div>
                            <span className="text-neutral-500 block">STATUS</span>
                            <span className="text-emerald-400 font-bold uppercase">{subscriptionStatus}</span>
                        </div>
                        <div>
                            <span className="text-neutral-500 block">PLAN HORIZON</span>
                            <span className="text-text-primary font-bold">3 MONTH ACCESS</span>
                        </div>
                        {subscriptionEnd && (
                            <div className="col-span-2 mt-2">
                                <span className="text-neutral-500 block">EXPIRY DATE</span>
                                <span className="text-text-primary font-bold">{subscriptionEnd}</span>
                            </div>
                        )}
                    </div>
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
                            <button 
                                onClick={() => alert("Invoice PDF download initiated.")}
                                className="text-gold hover:underline cursor-pointer"
                            >
                                Invoice PDF ↗
                            </button>
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

        </div>
    )
}
