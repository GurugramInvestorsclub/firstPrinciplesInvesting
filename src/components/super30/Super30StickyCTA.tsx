'use client'

import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { useState } from "react"

export function Super30StickyCTA() {
    const { scrollY } = useScroll();
    const [isVisible, setIsVisible] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        // Show after 600px of scrolling
        if (latest > 600 && !isVisible) setIsVisible(true);
        if (latest <= 600 && isVisible) setIsVisible(false);
    });

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: isVisible ? 0 : 100, opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
        >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <span className="hidden md:inline-block text-sm font-medium text-gray-200 pl-2">
                    Ready to master the meta-game?
                </span>
                <a 
                    href="#apply"
                    className="bg-gold hover:bg-gold-muted text-[#0b0b0c] font-bold text-sm px-5 py-2 rounded-full transition-colors drop-shadow-md"
                >
                    Apply Now
                </a>
            </div>
        </motion.div>
    )
}
