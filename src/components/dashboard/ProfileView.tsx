"use client"

import { useState } from "react"
import { User, ShieldCheck, Landmark, Receipt, LogOut } from "lucide-react"

interface ProfileViewProps {
    userName: string
    userEmail: string
    subscriptionStatus: string
    subscriptionEnd?: string
    onSignOut: () => void
}

export function ProfileView({ userName, userEmail, subscriptionStatus, subscriptionEnd, onSignOut }: ProfileViewProps) {
    const [name, setName] = useState(userName)
    const [email, setEmail] = useState(userEmail)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setTimeout(() => {
            setIsSaving(false)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 2000)
        }, 1000)
    }

    return (
        <div className="space-y-12 text-left max-w-4xl mx-auto">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary tracking-tight font-sans">
                    Settings & Profile
                </h1>
                <p className="text-sm text-neutral-400 font-light mt-1">
                    Manage your personal account details, billing transactions, and membership preferences.
                </p>
            </div>

            <div className="grid md:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Account Forms (7 columns) */}
                <div className="md:col-span-7 p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-6">
                    <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                        <User className="w-4 h-4 text-gold" />
                        <span>Account Parameters</span>
                    </h3>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-bg-deep border border-[#2E2E2E] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-gold/30 outline-none font-sans"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-bg-deep border border-[#2E2E2E] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-gold/30 outline-none font-sans"
                                required
                                disabled
                            />
                            <span className="text-[9px] font-mono text-neutral-600 block mt-1">
                                Email modifications are restricted. Contact analyst support to amend login IDs.
                            </span>
                        </div>

                        <div className="pt-4 flex justify-between items-center">
                            <span className="text-xs text-emerald-400 font-mono">
                                {saveSuccess && "Parameters saved successfully."}
                            </span>
                            <button
                                type="submit"
                                className="bg-gold hover:bg-[#E0A800] text-bg-deep font-extrabold px-6 py-2.5 rounded-full text-xs transition-colors cursor-pointer active:scale-[0.98]"
                            >
                                {isSaving ? "Saving..." : "Save Preferences"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Side: Membership & Billing (5 columns) */}
                <div className="md:col-span-5 space-y-6">
                    
                    {/* Membership Details */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-[#1E1E1E] space-y-4">
                        <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
                            <ShieldCheck className="w-4 h-4 text-gold" />
                            <span>Membership details</span>
                        </h3>

                        <div className="space-y-4 font-mono text-xs text-neutral-400">
                            <div>
                                <span className="text-neutral-500 block">STATUS</span>
                                <span className="text-emerald-400 font-bold uppercase">{subscriptionStatus}</span>
                            </div>
                            <div>
                                <span className="text-neutral-500 block">PLAN HORIZON</span>
                                <span className="text-text-primary font-bold">3 MONTH ACCESS</span>
                            </div>
                            {subscriptionEnd && (
                                <div>
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

        </div>
    )
}
