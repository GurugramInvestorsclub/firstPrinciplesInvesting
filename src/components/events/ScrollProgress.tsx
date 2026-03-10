'use client'

import { motion, useScroll } from "framer-motion"

export function ScrollProgress() {
    const { scrollYProgress } = useScroll()

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FFC72C] to-[#C89B3C] z-50 origin-left"
            style={{ scaleX: scrollYProgress }}
        />
    )
}
