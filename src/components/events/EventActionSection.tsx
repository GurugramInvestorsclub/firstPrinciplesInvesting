'use client'

import { motion, AnimatePresence } from "framer-motion"
import { Event } from "@/lib/types"
import { EventRegistration } from "./EventRegistration"
import { EventRecording } from "./EventRecording"
import { isEventRegistrationOpen } from "@/lib/utils"

interface EventActionSectionProps {
    event: Event
}

export function EventActionSection({ event }: EventActionSectionProps) {
    const isRegistrationOpen = !!event.eventId && isEventRegistrationOpen(event.date)

    return (
        <div className="w-full max-w-md relative min-h-[400px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={isRegistrationOpen ? "registration" : "recording"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {isRegistrationOpen ? (
                        <EventRegistration 
                            event={event} 
                            isRegistrationOpen={isRegistrationOpen} 
                        />
                    ) : (
                        <EventRecording event={event} />
                    )}
                </motion.div>
            </AnimatePresence>
            
            {/* Shared Background Glow */}
            <div className="absolute inset-0 bg-gold/10 blur-3xl -z-10 transform scale-95 translate-y-4 group-hover:bg-gold/20 transition-colors duration-500" />
        </div>
    )
}
