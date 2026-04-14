'use client'

import { motion } from "framer-motion"
import { EventCheckoutCard } from "@/components/events/EventCheckoutCard"
import { Super30Program } from "@/lib/types"
import { useEffect, useState } from "react"
import { Clock, CheckCircle2, X } from "lucide-react"

export function Super30Pricing({ program }: { program: Super30Program }) {
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null)

    useEffect(() => {
        if (!program.saleEndsAt) return;
        const target = new Date(program.saleEndsAt).getTime();
        
        const tick = () => {
            const now = new Date().getTime();
            const difference = target - now;
            if (difference <= 0) {
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 })
                return;
            }
            setTimeLeft({
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((difference % (1000 * 60)) / 1000)
            })
        }
        
        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [program.saleEndsAt])

    if (!program.eventId || !program.price) return null

    // Bridge the Super30 data to look like an Event object for the CheckoutCard component.
    const pseudoEvent: any = {
        title: program.title,
        slug: program.slug,
        eventId: program.eventId,
        price: program.price,
        date: program.applicationDeadline || new Date(Date.now() + 86400000 * 365).toISOString(),
        startTime: program.applicationDeadline,
        whatsappLink: program.whatsappLink,
    }

    if (program.isSoldOut) {
        pseudoEvent.date = new Date(Date.now() - 86400000).toISOString() // Force closed
    }

    return (
        <section id="apply" className="py-32 bg-[#0E0E11] relative z-10 overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="w-[80%] mx-auto max-w-6xl relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16 md:mb-24"
                >
                    <h2 className="text-5xl md:text-8xl font-black mb-10 text-white tracking-tighter drop-shadow-2xl">
                        Secure your <span className="text-gold">seat</span>
                    </h2>
                    <p className="text-2xl md:text-3xl text-gray-400 font-light max-w-4xl mx-auto">
                        {program.seatsAvailable ? `Only ${program.seatsAvailable} seats remaining for ${program.batchName || 'this cohort'}.` : 'Applications are closing soon.'}
                    </p>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-16 lg:gap-8 items-start justify-center">
                    
                    {/* Comparison Column (Optional) */}
                    {program.comparisonTable && program.comparisonTable.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="w-full lg:w-[55%] flex flex-col gap-6"
                        >
                            <h3 className="text-2xl font-bold text-white mb-4">The Meta-Game Difference</h3>
                            <div className="border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-sm overflow-hidden text-sm md:text-base">
                                <div className="grid grid-cols-12 bg-white/5 p-4 border-b border-white/10 text-gray-400 font-semibold uppercase tracking-wider text-xs">
                                    <div className="col-span-5">Feature</div>
                                    <div className="col-span-3 text-center">Without</div>
                                    <div className="col-span-4 text-center text-gold">With Super30</div>
                                </div>
                                {program.comparisonTable.map((row, i) => (
                                    <div key={i} className="grid grid-cols-12 p-4 border-b border-white/5 last:border-0 items-center hover:bg-white/5 transition-colors">
                                        <div className="col-span-5 text-gray-300 font-medium pr-4">{row.feature}</div>
                                        <div className="col-span-3 text-center text-gray-500 font-light flex flex-col items-center gap-2">
                                            <X className="w-4 h-4 text-red-500/50" />
                                            {row.withoutSuper30}
                                        </div>
                                        <div className="col-span-4 text-center text-white font-medium flex flex-col items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-gold" />
                                            {row.withSuper30}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Checkout Card Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className={`w-full ${program.comparisonTable && program.comparisonTable.length > 0 ? 'lg:w-[60%]' : 'max-w-5xl mx-auto'}`}
                    >
                        <div className="relative group">
                            {/* Animated Glowing Ring for Premium Feel */}
                            <div className="absolute -inset-2 bg-gradient-to-br from-gold/30 via-gold/10 to-transparent rounded-[3rem] blur-2xl opacity-70 group-hover:opacity-100 group-hover:blur-3xl transition-all duration-700 pointer-events-none" />
                            <div className="absolute inset-0 rounded-[3rem] border border-gold/30 pointer-events-none z-20" />
                            
                            {/* Native Event Checkout Bridge */}
                            <div className="relative z-10 drop-shadow-2xl">
                                <EventCheckoutCard event={pseudoEvent} />
                            </div>

                            {/* Urgency Counter */}
                            {timeLeft && (
                                <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 bg-[#1A1A1A] border border-gold/20 rounded-full px-6 py-2.5 flex items-center gap-3 z-30 shadow-xl whitespace-nowrap">
                                    <Clock className="w-4 h-4 text-gold animate-pulse" />
                                    <div className="text-sm font-medium text-gray-300">
                                        Price increases in: <span className="text-white ml-1 font-bold">{timeLeft.d}d {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
