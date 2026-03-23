'use client'

import { motion } from "framer-motion"

interface SectionDividerProps {
    text?: string
}

export function SectionDivider({ text }: SectionDividerProps) {
    if (!text) return (
        <div className="w-full flex justify-center py-16 opacity-30">
            <div className="w-px h-24 bg-gradient-to-b from-transparent via-gold to-transparent" />
        </div>
    );

    return (
        <div className="w-full py-24 overflow-hidden relative group select-none pointer-events-none">
            {/* Edge Gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0E0E11] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0E0E11] to-transparent z-10" />
            
            <div className="flex whitespace-nowrap">
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 35,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="flex shrink-0 items-center gap-16 md:gap-24"
                >
                    {[...Array(6)].map((_, i) => (
                        <span 
                            key={i} 
                            className="text-6xl md:text-9xl font-black uppercase tracking-[0.15em] text-white/[0.08] italic select-none"
                        >
                            {text}
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
