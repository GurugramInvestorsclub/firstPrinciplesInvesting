'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Event } from "@/lib/types"
import { EventRegistration } from "./EventRegistration"
import { EventRecording } from "./EventRecording"

interface EventActionSectionProps {
    event: Event
}

type EventStatus = "upcoming" | "live" | "completed"

export function EventActionSection({ event }: EventActionSectionProps) {
    const [status, setStatus] = useState<EventStatus>("upcoming")

    useEffect(() => {
        const updateStatus = () => {
            const now = new Date()
            const startTime = new Date(event.startTime || event.date)
            
            // Default endTime to 2 hours after startTime if not provided
            const endTime = event.endTime 
                ? new Date(event.endTime) 
                : new Date(startTime.getTime() + 2 * 60 * 60 * 1000)

            if (now < startTime) {
                setStatus("upcoming")
            } else if (now >= startTime && now <= endTime) {
                setStatus("live")
            } else {
                setStatus("completed")
            }
        }

        updateStatus()
        const interval = setInterval(updateStatus, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [event.startTime, event.date, event.endTime])

    const isRegistrationOpen = !!event.eventId && (status === "upcoming" || status === "live")

    return (
        <div className="w-full max-w-md relative min-h-[400px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={status === "completed" ? "recording" : "registration"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {status === "completed" ? (
                        <EventRecording event={event} />
                    ) : (
                        <EventRegistration 
                            event={event} 
                            isRegistrationOpen={isRegistrationOpen} 
                        />
                    )}
                </motion.div>
            </AnimatePresence>
            
            {/* Shared Background Glow */}
            <div className="absolute inset-0 bg-gold/10 blur-3xl -z-10 transform scale-95 translate-y-4 group-hover:bg-gold/20 transition-colors duration-500" />
        </div>
    )
}
