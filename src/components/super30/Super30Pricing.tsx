'use client'

import { motion } from "framer-motion"
import { EventCheckoutCard } from "@/components/events/EventCheckoutCard"
import { Super30Program } from "@/lib/types"

export function Super30Pricing({ program }: { program: Super30Program }) {
    if (!program.eventId || !program.price) return null

    // Bridge the Super30 data to look like an Event object for the CheckoutCard component.
    // This allows us to reuse the entire Razorpay + Prisma infrastructure untouched.
    const pseudoEvent: any = {
        title: program.title,
        slug: program.slug,
        eventId: program.eventId,
        price: program.price,
        // We ensure "eventIsOpen" check in EventCheckoutCard works
        date: program.applicationDeadline || new Date(Date.now() + 86400000 * 365).toISOString(),
        startTime: program.applicationDeadline,
    }

    if (program.isSoldOut) {
        pseudoEvent.date = new Date(Date.now() - 86400000).toISOString() // Force closed
    }

    return (
        <section id="apply" className="py-24 bg-[#0E0E11] relative z-10">
            <div className="w-[80%] mx-auto max-w-4xl">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                        Secure your <span className="text-gold">seat</span>
                    </h2>
                    <p className="text-xl text-gray-400">
                        {program.seatsAvailable ? `Only ${program.seatsAvailable} seats remaining for ${program.batchName || 'this cohort'}.` : 'Applications are closing soon.'}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 via-gold/5 to-transparent rounded-[2rem] blur-lg pointer-events-none" />
                        <EventCheckoutCard event={pseudoEvent} />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
