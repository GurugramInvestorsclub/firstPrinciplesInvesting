"use client"

import { motion } from "framer-motion"

const IndianExpressLogo = () => (
  <div className="font-display font-bold text-xl md:text-2xl tracking-tighter uppercase whitespace-nowrap leading-none grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
    The Indian Express
  </div>
)

const MintLogo = () => (
  <div className="font-display font-semibold italic text-xl md:text-2xl lowercase whitespace-nowrap leading-none grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
    mint
  </div>
)

const FinancialExpressLogo = () => (
  <div className="font-display font-bold text-xl md:text-2xl tracking-tight uppercase whitespace-nowrap leading-none grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
    Financial Express
  </div>
)

const logos = [
  { id: "ie", component: IndianExpressLogo, name: "The Indian Express" },
  { id: "mint", component: MintLogo, name: "Mint" },
  { id: "fe", component: FinancialExpressLogo, name: "Financial Express" },
]

export function FeaturedIn() {
  return (
    <div className="space-y-12 text-center">
      <div className="space-y-2">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.4em] text-text-secondary/50">
          Featured In
        </h3>
        <p className="font-display italic text-base text-text-secondary/40">
          Trusted by leading financial publications
        </p>
      </div>

      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.15,
              delayChildren: 0.2
            }
          }
        }}
        className="flex flex-wrap items-center justify-center gap-x-12 gap-y-10 md:gap-x-24"
      >
        {logos.map((logo) => (
          <motion.div
            key={logo.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
            }}
            whileHover={{ 
              scale: 1.08, 
              y: -5,
              transition: { duration: 0.4, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.96 }}
            className="group cursor-pointer relative"
          >
            {/* Subtle Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gold/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
            <div className="relative z-10">
              <logo.component />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
