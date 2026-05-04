"use client"

import { motion } from "framer-motion"

import Image from "next/image"

const IndianExpressLogo = () => (
  <div className="relative h-6 md:h-8 w-40 md:w-56 transition-all duration-300 brightness-0 invert">
    <Image src="/logos/ie.svg" alt="The Indian Express" fill className="object-contain" />
  </div>
)

const MintLogo = () => (
  <div className="relative h-8 md:h-10 w-28 md:w-36 transition-all duration-300 brightness-0 invert">
    <Image src="/logos/mint.svg" alt="Mint" fill className="object-contain" />
  </div>
)

const FinancialExpressLogo = () => (
  <div className="relative h-6 md:h-8 w-48 md:w-64 transition-all duration-300 brightness-0 invert">
    <Image src="/logos/fe.svg" alt="Financial Express" fill className="object-contain" />
  </div>
)

const logos = [
  { id: "ie-1", component: IndianExpressLogo },
  { id: "mint-1", component: MintLogo },
  { id: "fe-1", component: FinancialExpressLogo },
  { id: "ie-2", component: IndianExpressLogo },
  { id: "mint-2", component: MintLogo },
  { id: "fe-2", component: FinancialExpressLogo },
  { id: "ie-3", component: IndianExpressLogo },
  { id: "mint-3", component: MintLogo },
  { id: "fe-3", component: FinancialExpressLogo },
]

export function LogoMarquee() {
  const speed = 40 // Control speed via this value

  return (
    <section className="py-12 md:py-16 bg-transparent overflow-hidden relative group">
      {/* Edge Gradients for Fading Effect */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#0E0E11] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#0E0E11] to-transparent z-10 pointer-events-none" />

      <div className="flex items-center mb-8 justify-center">
        <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-text-secondary/70">
          Trusted By Industry Leaders
        </span>
      </div>

      <div className="relative flex overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap items-center gap-12 md:gap-24"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: speed,
              ease: "linear",
            },
          }}
          style={{ width: "fit-content" }}
        >
          {/* Duplicated list for seamless loop */}
          {[...logos, ...logos].map((logo, idx) => (
            <div
              key={`${logo.id}-${idx}`}
              className="flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-500 hover:scale-105 cursor-default group/logo px-4"
            >
              <div className="text-white group-hover/logo:text-gold transition-colors duration-300">
                <logo.component />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
