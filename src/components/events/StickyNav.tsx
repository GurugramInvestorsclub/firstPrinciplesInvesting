'use client'

import { motion } from "framer-motion"

interface StickyNavProps {
    items: { label: string; id: string }[]
}

export function StickyNav({ items }: StickyNavProps) {
    if (!items || items.length === 0) return null;

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        // Offset for sticky headers if any, else normal scroll
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" })
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-1 p-2 bg-[#0E0E11]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl"
        >
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors whitespace-nowrap"
                >
                    {item.label}
                </button>
            ))}
        </motion.div>
    )
}
