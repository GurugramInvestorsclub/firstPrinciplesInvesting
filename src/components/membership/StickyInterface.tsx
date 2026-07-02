"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Star } from "lucide-react"

export function StickyInterface() {
    const [scrollProgress, setScrollProgress] = useState(0)
    const [showSticky, setShowSticky] = useState(false)

    useEffect(() => {
        function handleScroll() {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight
            if (totalScroll > 0) {
                setScrollProgress((window.scrollY / totalScroll) * 100)
            }

            // Show sticky CTA past 450px scroll (past the fold)
            if (window.scrollY > 450) {
                setShowSticky(true)
            } else {
                setShowSticky(false)
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleCTAClick = () => {
        const pricingEl = document.getElementById("pricing")
        pricingEl?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <>
            {/* Top Reading Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-0.5 bg-neutral-800 z-[60] pointer-events-none">
                <div 
                    className="h-full bg-gold transition-all duration-75"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            {/* Mobile Bottom Sticky Bar (Visible only on < md screen sizes) */}
            <div 
                className={`fixed bottom-0 left-0 right-0 z-40 bg-bg-deep/95 backdrop-blur-xl border-t border-[#2E2E2E] px-6 py-4 flex items-center justify-between transition-transform duration-500 md:hidden ${
                    showSticky ? "translate-y-0" : "translate-y-full"
                }`}
            >
                <div className="flex flex-col text-left">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest leading-none mb-1">MEMBERSHIP</span>
                    <span className="text-sm font-bold text-text-primary">₹2,100 / 3 Months</span>
                </div>
                <button
                    onClick={handleCTAClick}
                    className="bg-gold text-bg-deep font-extrabold px-5 py-2.5 rounded-full text-xs hover:bg-[#E0A800] transition-colors flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
                >
                    <span>Join Now</span>
                    <ArrowRight className="w-3.5 h-3.5 text-bg-deep" />
                </button>
            </div>

            {/* Desktop Floating Side Widget (Visible on >= md screen sizes in lower corner) */}
            <div 
                className={`fixed bottom-8 right-8 z-40 p-1 rounded-3xl bg-[#2E2E2E]/80 border border-white/10 backdrop-blur-md shadow-2xl transition-all duration-500 hidden md:flex items-center gap-4 ${
                    showSticky ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
                }`}
            >
                <div className="pl-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-gold shrink-0 fill-gold/20" />
                    <div className="flex flex-col text-left">
                        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider leading-none">JOIN MEMBERSHIP</span>
                        <span className="text-xs font-bold text-text-primary">₹2,100 / 3 Months</span>
                    </div>
                </div>
                <button
                    onClick={handleCTAClick}
                    className="bg-gold text-bg-deep font-bold px-5 py-2.5 rounded-[1.25rem] text-xs hover:bg-[#E0A800] transition-colors flex items-center gap-1 active:scale-[0.98] cursor-pointer"
                >
                    <span>Become a Member</span>
                    <ArrowRight className="w-3 h-3 text-bg-deep" />
                </button>
            </div>
        </>
    )
}
