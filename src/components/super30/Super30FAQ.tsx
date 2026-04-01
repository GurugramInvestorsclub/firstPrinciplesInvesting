'use client'

import { motion } from "framer-motion"
import { SimpleAccordion } from "@/components/ui/simple-accordion"

interface FAQItem {
    question: string
    answer: string
}

export function Super30FAQ({ faq }: { faq?: FAQItem[] }) {
    if (!faq || faq.length === 0) return null

    return (
        <section id="faq" className="py-24 bg-[#0E0E11] relative z-10 border-t border-white/5">
            <div className="w-[80%] mx-auto max-w-3xl">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Frequently Asked <span className="text-gold">Questions</span></h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    <SimpleAccordion
                        items={faq.map(f => ({ title: f.question, content: f.answer }))}
                    />
                </motion.div>
            </div>
        </section>
    )
}
