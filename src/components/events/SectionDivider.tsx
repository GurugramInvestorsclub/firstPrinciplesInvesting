'use client'

import { motion } from "framer-motion"

export function SectionDivider() {
    return (
        <div className="w-full flex justify-center py-16 opacity-50 overflow-hidden">
            <motion.svg
                width="2"
                height="80"
                viewBox="0 0 2 80"
                fill="none"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                <motion.line
                    x1="1"
                    y1="0"
                    x2="1"
                    y2="80"
                    stroke="url(#paint0_linear)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    variants={{
                        hidden: { pathLength: 0, opacity: 0 },
                        visible: {
                            pathLength: 1,
                            opacity: 1,
                            transition: { duration: 1.5, ease: "easeInOut" }
                        }
                    }}
                />
                <defs>
                    <linearGradient id="paint0_linear" x1="1" y1="0" x2="1" y2="80" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFC72C" stopOpacity="0" />
                        <stop offset="0.5" stopColor="#FFC72C" />
                        <stop offset="1" stopColor="#FFC72C" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </motion.svg>
        </div>
    )
}
