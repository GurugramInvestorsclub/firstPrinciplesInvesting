"use client"

import { useState } from "react"
import { Sparkles, Layers, Check } from "lucide-react"

export function IndustryResearchView() {
    const [notified, setNotified] = useState(false)

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto space-y-8 py-12">
            
            {/* Minimalist illustration of interconnected hubs */}
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-gold/5 rounded-full blur-xl animate-pulse" />
                <div className="w-16 h-16 rounded-2xl border border-gold/20 bg-bg-deep flex items-center justify-center text-gold relative z-10">
                    <Layers className="w-8 h-8 text-gold" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-neutral-400">
                    +
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold/20 bg-gold/5">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    <span className="text-[10px] font-mono font-bold text-gold uppercase tracking-wider">COMING SOON</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight font-sans">
                    Industry Research Hubs
                </h1>
                
                <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-md mx-auto">
                    We're building interactive industry hubs that connect companies, industries and long-form research. Explore value chains and corporate moats in a unified mapping.
                </p>
            </div>

            {/* Action Trigger */}
            <div className="pt-4">
                <button
                    onClick={() => setNotified(true)}
                    className={`px-8 py-3 rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                        notified 
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                            : "bg-gold text-bg-deep hover:bg-[#E0A800] active:scale-[0.98]"
                    }`}
                >
                    {notified ? (
                        <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>We'll notify you</span>
                        </>
                    ) : (
                        <span>Notify Me</span>
                    )}
                </button>
            </div>

        </div>
    )
}
