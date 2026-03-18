'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Event } from "@/lib/types"
import { EventCheckoutCard } from "./EventCheckoutCard"

export function EventCTA({ event }: { event: Event }) {
    const isRegistrationOpen = new Date(event.date) > new Date()

    return (
        <section id="register" className="py-32 bg-[#0E0E11] relative z-10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,199,44,0.05),transparent_70%)] pointer-events-none" />
            <div className="w-[80%] mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto flex flex-col items-center"
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight leading-tight text-white drop-shadow-xl">
                        Ready to level up your investing?
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl font-light">
                        Secure your seat with backend-verified pricing and signed payment capture.
                    </p>

                    <div className="w-full max-w-2xl">
                        {isRegistrationOpen ? (
                            <EventCheckoutCard event={event} />
                        ) : (
                            <Button disabled size="lg" className="relative z-10 h-16 px-10 text-xl rounded-full bg-white/5 text-gray-500 border border-white/10 font-medium">
                                Registration Closed
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
