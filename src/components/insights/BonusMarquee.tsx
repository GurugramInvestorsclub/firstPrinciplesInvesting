"use client"

import { motion } from "framer-motion"
import { Gift, Zap } from "lucide-react"

export function BonusMarquee() {
  const items = [
    "50% off on our Sectoral workshops",
    "Monthly Meetups",
  ]

  // Create a repeated track for smooth infinite loop
  const repeatedItems = [...items, ...items, ...items, ...items]

  return (
    <div className="space-y-3 pt-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Gift className="w-4 h-4 text-gold animate-bounce-short" />
        <p className="font-sans text-[0.75rem] font-bold text-gold uppercase tracking-[0.15em]">
          Exclusive Subscriber Bonuses
        </p>
      </div>

      {/* Marquee Track Container */}
      <div className="relative w-full overflow-hidden rounded-[10px] border border-gold/15 bg-gold/[0.03] backdrop-blur-sm py-3 px-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        {/* Edge Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0C0C0E]/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0C0C0E]/90 to-transparent z-10 pointer-events-none" />

        <div className="flex overflow-hidden">
          <motion.div
            className="flex items-center gap-12 whitespace-nowrap text-sm font-sans font-semibold text-white tracking-wide"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 16,
                ease: "linear",
              },
            }}
          >
            {repeatedItems.map((text, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-gold flex-shrink-0 fill-gold/10" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
