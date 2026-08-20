"use client"

import Link from "next/link"
import { ArrowRight, Users, Calendar, Star } from "lucide-react"
import { Super30Program } from "@/lib/types"

interface ActiveSuper30SectionProps {
    program?: Super30Program
}

export function ActiveSuper30Section({ program }: ActiveSuper30SectionProps) {
    if (!program) return null

    const deadlineDate = program.applicationDeadline ? new Date(program.applicationDeadline) : null
    const isClosed = deadlineDate ? deadlineDate.getTime() < Date.now() : false
    const isOpen = !program.isSoldOut && !isClosed

    return (
        <section className="py-20 md:py-28 bg-bg-deep border-t border-[#2E2E2E] relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />

            <div className="container max-w-5xl px-6 mx-auto relative z-10">
                {/* Double Bezel Container matching MembershipPromoSection */}
                <div className="p-2 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl">
                    <div className="rounded-[2.2rem] bg-[#131315] border border-[#2E2E2E] p-8 md:p-12 relative overflow-hidden grid md:grid-cols-12 gap-8 items-center">
                        
                        {/* Decorative background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-3xl -translate-y-1/2 translate-x-1/3 rounded-full pointer-events-none" />

                        {/* Left Content Column */}
                        <div className="md:col-span-8 space-y-6 text-left">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold/30 bg-gold/10">
                                    <Users className="w-3.5 h-3.5 text-gold" />
                                    <span className="text-xs font-mono font-bold text-gold tracking-wider uppercase">
                                        {program.batchName || "Super 30 Cohort"}
                                    </span>
                                </div>
                                {isOpen ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Registrations Open
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                                        Registration Closed
                                    </span>
                                )}
                            </div>

                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                                {program.title}
                            </h2>

                            {program.tagline && (
                                <p className="text-lg md:text-xl text-gold font-semibold tracking-tight">
                                    {program.tagline}
                                </p>
                            )}

                            {program.shortDescription && (
                                <p className="text-sm md:text-base text-gray-300 font-light leading-relaxed max-w-xl">
                                    {program.shortDescription}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-x-4 gap-y-3 text-xs text-gray-400 font-medium">
                                {deadlineDate && (
                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                        <Calendar className="w-3.5 h-3.5 text-gold" />
                                        <span>Apply by {deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-gold text-gold" />
                                        ))}
                                    </div>
                                    <span className="text-white font-bold">4.9</span>
                                    <span className="text-gray-400 font-normal">({program.investorsEducated || "50+ Investors Educated"})</span>
                                </div>
                            </div>
                        </div>

                        {/* Right CTA Column */}
                        <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center gap-4">
                            <Link
                                href={`/super30/${program.slug.current}`}
                                className="group relative inline-flex items-center justify-center gap-3 bg-gold hover:bg-gold-muted text-[#0b0b0c] font-bold px-8 py-4 rounded-full text-sm transition-all duration-300 shadow-lg shadow-gold/10 hover:shadow-gold/20 hover:-translate-y-0.5 w-full md:w-auto text-center"
                            >
                                <span>{program.ctaText || "Apply Now"}</span>
                                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>

                            <Link
                                href="/super30"
                                className="text-xs text-gray-400 hover:text-gold transition-colors font-medium underline-offset-4 hover:underline"
                            >
                                View all Super 30 cohorts →
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}
