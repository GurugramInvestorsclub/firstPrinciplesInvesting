"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, HelpCircle } from "lucide-react"

export function FAQSection() {
    const faqs = [
        {
            q: "What is your refund and cancellation policy?",
            a: "We offer a 14-day no-questions-asked refund policy. If you subscribe and feel the research does not meet your standard, email us within 14 days and we will refund your ₹2,100 in full. No forms, no hoops."
        },
        {
            q: "How frequently are research reports delivered?",
            a: "We publish two premium deep dives every month—delivered on the first and third Saturday mornings. This schedule gives our team sufficient time to perform scuttlebutt audits and build proper models rather than rushing out daily reports."
        },
        {
            q: "Will I get immediate access to all historical reports?",
            a: "Yes. The moment your subscription is active, our entire research vault (containing 50+ past sector and company deep-dives) is fully unlocked inside your member dashboard."
        },
        {
            q: "Can I download the financial models?",
            a: "Absolutely. Every company memo is accompanied by the corresponding Excel/Google Sheets model. The sheets are fully unlocked so you can inspect formulas, adjust assumptions, and run your own scenarios."
        },
        {
            q: "How does the monthly member meetup work?",
            a: "On the last Sunday of every month, we host a live member webinar/case study. We discuss a new sector in detail, stress-test current portfolio holdings, and answer Q&As directly. Recordings are uploaded to the archive."
        },
        {
            q: "Does membership renew automatically?",
            a: "No. We do not charge your card automatically. When your 3-month membership is nearing its end, we will send an email reminder with a link to renew manually. We believe you should only pay when you make an active choice."
        }
    ]

    const [openIdx, setOpenIdx] = useState<number | null>(null)

    return (
        <section className="py-24 md:py-32 bg-[#1E1E1E] border-b border-[#2E2E2E] overflow-hidden">
            <div className="container max-w-4xl px-6 mx-auto relative z-10">
                
                {/* Header */}
                <div className="text-center mb-16 md:mb-20">
                    <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                        FAQ
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mt-4 leading-tight">
                        Addressing Objections.
                    </h2>
                    <p className="text-neutral-400 mt-4 text-sm font-light max-w-xl mx-auto">
                        Here are direct answers to our most common reader questions. If you have another query, reach out to our team directly.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIdx === idx
                        return (
                            <div 
                                key={idx}
                                className="border border-[#2E2E2E] rounded-2xl bg-bg-deep/50 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                                    className="w-full text-left p-6 flex justify-between items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors duration-300"
                                >
                                    <div className="flex items-center gap-3 text-text-primary font-bold text-sm md:text-base tracking-tight">
                                        <HelpCircle className="w-4 h-4 text-gold shrink-0" />
                                        <span>{faq.q}</span>
                                    </div>
                                    <div className="shrink-0 text-neutral-500">
                                        {isOpen ? <Minus className="w-4 h-4 text-gold" /> : <Plus className="w-4 h-4" />}
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <div className="p-6 pt-0 border-t border-[#2E2E2E]/60 text-xs md:text-sm text-neutral-400 font-light leading-relaxed">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </div>

            </div>
        </section>
    )
}
