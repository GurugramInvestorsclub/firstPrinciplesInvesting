"use client"

import React, { useRef } from "react"
import { analytics } from "@/lib/analytics"

export function ContactForm() {
    const hasStarted = useRef(false)

    const handleFocus = () => {
        if (!hasStarted.current) {
            hasStarted.current = true
            analytics.track("contact_form_started", { form_type: "contact" })
        }
    }

    const handleSubmit = () => {
        // Track non-sensitive form submission event
        analytics.track("contact_form_submitted", { form_type: "contact" })
    }

    return (
        <form
            action="https://formsubmit.co/Support@firstprinciplesresearch.in"
            method="POST"
            className="space-y-4"
            onSubmit={handleSubmit}
        >
            {/* Honeypot to prevent spam */}
            <input type="text" name="_honey" style={{ display: 'none' }} />

            {/* Redirect after submission */}
            <input type="hidden" name="_next" value="https://firstprinciplesinvesting.com/thank-you" />

            {/* Subject line */}
            <input type="hidden" name="_subject" value="New Contact Form Submission - First Principles Investing" />

            <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium text-text-secondary">Name</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    onFocus={handleFocus}
                    className="flex h-10 w-full rounded-md border border-[#2E2E2E] bg-[#1F1F1F] px-3 py-2 text-sm text-text-primary ring-offset-bg-deep placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Your name"
                />
            </div>
            <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium text-text-secondary">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    onFocus={handleFocus}
                    className="flex h-10 w-full rounded-md border border-[#2E2E2E] bg-[#1F1F1F] px-3 py-2 text-sm text-text-primary ring-offset-bg-deep placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="you@example.com"
                />
            </div>
            <div className="grid gap-2">
                <label htmlFor="message" className="text-sm font-medium text-text-secondary">Message</label>
                <textarea
                    id="message"
                    name="message"
                    required
                    onFocus={handleFocus}
                    className="flex min-h-[120px] w-full rounded-md border border-[#2E2E2E] bg-[#1F1F1F] px-3 py-2 text-sm text-text-primary ring-offset-bg-deep placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="How can we help?"
                />
            </div>
            <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-bg-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gold text-bg-deep hover:bg-gold-muted h-10 px-4 py-2 w-full font-semibold"
            >
                Send Message
            </button>
        </form>
    )
}
