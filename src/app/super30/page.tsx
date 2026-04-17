import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { client } from "@/lib/sanity.client"
import { allSuper30ProgramsQuery } from "@/lib/sanity.queries"
import { Super30Program } from "@/lib/types"
import Link from "next/link"
import { ArrowRight, Users, Calendar } from "lucide-react"
import { urlForImage } from "@/lib/sanity.image"

export const revalidate = 60

export default async function Super30IndexPage() {
    const programs = await client.fetch<Super30Program[]>(allSuper30ProgramsQuery)

    return (
        <div className="flex flex-col min-h-screen bg-[#0E0E11] text-text-primary selection:bg-gold/20 selection:text-gold super30-page">
            <Navbar />

            <main className="flex-1 pt-32 pb-24 md:pt-40 md:pb-32 relative z-10 w-[80%] mx-auto max-w-6xl">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/5 via-[#0b0b0c]/0 to-[#0b0b0c]/0 -z-10 pointer-events-none" />

                <div className="mb-16 md:mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-semibold mb-6">
                        <Users className="w-4 h-4" />
                        Premium Cohorts
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                        Deep Focus. <span className="text-gold">Lasting Transformation.</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl font-light leading-relaxed">
                        Intensive cohort-based programs designed for serious investors ready to master specific disciplines.
                    </p>
                </div>

                {programs.length === 0 ? (
                    <div className="py-20 text-center border border-white/10 rounded-3xl bg-white/5">
                        <h3 className="text-2xl font-medium text-white mb-2">No active cohorts right now</h3>
                        <p className="text-gray-400">Join our newsletter to be notified when the next batch opens.</p>
                    </div>
                ) : (
                    <div className="grid gap-8 relative z-10">
                        {programs.map((program) => {
                            const deadlineDate = program.applicationDeadline ? new Date(program.applicationDeadline) : null
                            
                            return (
                                <Link 
                                    href={`/super30/${program.slug.current}`} 
                                    key={program._id}
                                    className="block group"
                                >
                                    <div className="p-8 md:p-10 rounded-3xl bg-[#131315] hover:bg-[#18181b] border border-[#2E2E2E] hover:border-gold/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-gold/5 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-gold/10 transition-colors duration-500 rounded-full pointer-events-none" />

                                        <div className="flex flex-col md:flex-row gap-8 justify-between relative z-10">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap gap-3 mb-6">
                                                    {program.batchName && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/10">
                                                            {program.batchName}
                                                        </span>
                                                    )}
                                                    {program.isSoldOut ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                            Sold Out
                                                        </span>
                                                    ) : program.seatsAvailable ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            12 seats left
                                                        </span>
                                                    ) : null}
                                                    {deadlineDate && !program.isSoldOut && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-gray-400 bg-white/5 border border-white/5">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            Apply by {deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                        </span>
                                                    )}
                                                </div>

                                                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white group-hover:text-gold transition-colors duration-300 tracking-tight">
                                                    {program.title}
                                                </h2>
                                                
                                                {program.tagline && (
                                                    <p className="text-xl text-gray-300 font-medium mb-4">
                                                        {program.tagline}
                                                    </p>
                                                )}

                                                {program.shortDescription && (
                                                    <p className="text-lg text-text-secondary leading-relaxed font-light line-clamp-2 max-w-3xl">
                                                        {program.shortDescription}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="shrink-0 flex items-center md:items-end justify-between md:flex-col mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-white/10">
                                                <div>
                                                    {program.price ? (
                                                        <div className="text-2xl font-bold text-white mb-2 md:text-right">
                                                            {new Intl.NumberFormat("en-IN", {
                                                                style: "currency",
                                                                currency: "INR",
                                                            }).format(program.price)}
                                                        </div>
                                                    ) : null}
                                                </div>
                                                <div className="inline-flex items-center justify-center p-3 rounded-full bg-gold/10 text-gold group-hover:bg-gold group-hover:text-[#0b0b0c] transition-all duration-300">
                                                    <ArrowRight className="w-6 h-6 transform group-hover:-rotate-45 transition-transform duration-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
