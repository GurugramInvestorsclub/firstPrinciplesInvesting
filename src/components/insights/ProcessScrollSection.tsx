"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

const steps = [
    {
        id: "01",
        title: "Radical. Positive. Change.",
        desc: "Radical. Positive. Change. That’s what we’re after.\n\nOur newsletter - First Principles Deep-Dives - covers listed companies undergoing such a transformation.\n\nForget value, growth, momentum, GARP, and other industry buzzwords. We seek change. Radical. Big. Positive. Change!",
        keywords: ["First Principles", "Style Agnostic", "Deep-Dives", "Hunting Change"]
    },
    {
        id: "02",
        title: "Garware Hi-Tech Films",
        desc: "On 8th July 2023, we spotted Garware Hi-tech films at a 13X PE. EPS growth was flat, but it was the only player in the sector that was moving.\n\nThe margin profile change was supported by a new winning product (Paint Protection Films). With hard work and some good fortune, we were in the right company at the right time—blessed with a 4X return.\n\nToday it trades at 42X.",
        keywords: ["Spotted: July 2023", "4X Return", "Margin Shift", "Paint Protection"]
    },
    {
        id: "03",
        title: "Corporate Restructuring",
        desc: "Let’s take another example - John Cockerill India Ltd.\n\nWe discovered the company on 8th August 2025. It was undergoing a change so radical it would completely reshape the size, shape, and margin profile of the Indian unit.\n\nJohn Cockerill is a Belgian technology leader in the downstream steel value chain. The entire global metals/non-ferrous business was shoved into the Indian unit, giving it access to highly promising proprietary technologies.\n\nNot value, not growth, not mo-mo, not moats. Radical. Positive. Change. Is what we’re hunting for.",
        keywords: ["John Cockerill", "Restructuring", "Asset Integration", "Margin Shift"]
    },
    {
        id: "04",
        title: "Pivot & Shell Transformations",
        desc: "Another example is Megasoft (now Sigma Advanced Systems), discovered on September 5th 2025.\n\nWith an 800 crore market cap and 400 crores of other income from selling non-core assets, it was an empty shell with plans to transform into an Aerospace and Defence supplier.\n\nBy merging Sigma Advanced Systems (missile/aircraft electronics) and partnering with anti-drone players, it shifted its entire business model. The stock is up 3.5X since.",
        keywords: ["Megasoft", "Sigma Advanced Systems", "Defence Pivot", "3.5X Return"]
    },
    {
        id: "05",
        title: "Capacity Expansion & Realities",
        desc: "Another one from the CDMO space—Ami Organics (now Acutaas Chemicals), identified in March 2024.\n\nBeneath negative market sentiment, the company was commissioning a massive capex programme to expand capacity and reshape the business scale.\n\nCrucially, nearly 30% of this upcoming capacity was pre-booked by a single customer, providing demand visibility and reducing risk. The stock is up 5.4X since.\n\nWe will make mistakes, but managing execution realities is part of the game.",
        keywords: ["Ami Organics", "5.4X Return", "Pre-booked Capex", "Managing Mistakes"]
    },
    {
        id: "06",
        title: "Special Situations",
        desc: "Special Situations is the second mental model we cover—specifically demergers (like Triveni Engineering, Inox Green) and promoter changes (Restaurant Brands Asia).\n\nWhile our weekly free articles outline these situations well, in First Principles Deep-Dives we go one step further.\n\nWe recognize the 2-3 key levers that drive any investment thesis, watch them like a hawk, and assess their probabilities relative to market expectations.",
        keywords: ["Demergers", "Promoter Changes", "Key Levers", "Value Unlocking"]
    }
]

export function ProcessScrollSection() {
    const containerRef = useRef<HTMLDivElement>(null)

    // Progress line mapping for the entire section
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    })

    const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

    return (
        <section ref={containerRef} className="relative bg-background pt-32 pb-48 overflow-hidden">
            
            {/* Section Header */}
            <div className="container max-w-4xl mx-auto px-6 relative z-20 text-center mb-32">
                <h2 className="text-4xl md:text-6xl font-heading font-bold tracking-tight mb-6 text-text-primary">The Process</h2>
                <p className="text-lg md:text-xl text-text-primary/80">We don't start with companies. We start with change.</p>
            </div>

            <div className="container max-w-7xl mx-auto relative px-0">
                {/* Central Vertical Spine (Track) */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[1px] bg-white/5 md:-translate-x-1/2 z-0" />
                
                {/* Active Gold Line */}
                <motion.div 
                    className="absolute left-[calc(1.5rem-0.5px)] md:left-[calc(50%-1px)] top-0 w-[2px] bg-gold origin-top z-0"
                    style={{ scaleY, height: "100%" }}
                />
                
                {/* Glowing Node on the active line edge */}
                <motion.div 
                    className="absolute left-6 md:left-1/2 w-[10px] h-[10px] -translate-x-1/2 rounded-full bg-gold shadow-[0_0_15px_rgba(245,184,0,0.8)] z-10"
                    style={{ top: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
                />

                {/* Process Steps */}
                <div className="relative z-10 flex flex-col w-full px-6">
                    {steps.map((step, i) => (
                        <StepItem key={step.id} step={step} index={i} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function StepItem({ step, index }: { step: any, index: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const isLeft = index % 2 === 0
    
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    // Giant background number parallax
    const y = useTransform(scrollYProgress, [0, 1], [120, -120])
    
    // Cinematic fade and translate
    const opacity = useTransform(scrollYProgress, [0.15, 0.3, 0.7, 0.85], [0, 1, 1, 0])
    const yOffset = useTransform(scrollYProgress, [0.15, 0.3], [40, 0])

    const desktopAlignClass = isLeft 
        ? "md:mr-auto md:pr-8 lg:pr-12" 
        : "md:ml-auto md:pl-8 lg:pl-12"

    const watermarkAlignClass = isLeft
        ? "left-8 md:left-0 text-left"
        : "left-8 md:left-auto md:right-0 md:text-right"

    return (
        <div ref={ref} className="relative min-h-[75vh] md:min-h-[80vh] flex flex-col justify-center py-12 md:py-16 w-full">
            
            {/* Giant Background Number Watermark */}
            <motion.div 
                style={{ y }}
                className={`absolute top-1/2 -translate-y-1/2 text-[180px] md:text-[250px] lg:text-[350px] font-heading font-bold text-gold opacity-[0.02] select-none pointer-events-none tracking-tighter z-0 ${watermarkAlignClass}`}
            >
                {step.id}
            </motion.div>

            {/* Content Container (Card Wrapper) */}
            <motion.div
                style={{ opacity, y: yOffset }}
                className={`relative z-10 w-full md:w-[46%] flex flex-col justify-center pl-12 md:pl-0 ${desktopAlignClass}`}
            >
                <div className="w-full bg-white/[0.015] md:bg-white/[0.01] hover:bg-white/[0.025] backdrop-blur-md border border-white/[0.06] hover:border-gold/30 rounded-xl p-6 md:p-8 lg:p-10 transition-all duration-500 shadow-2xl relative group">
                    {/* Corner gradient glow decoration */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-gold/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                    
                    <div className="relative z-10">
                        <div className="text-gold font-mono text-sm md:text-base mb-4 tracking-widest flex items-center justify-between">
                            <span>Step {step.id}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gold/40 group-hover:bg-gold transition-colors duration-300" />
                        </div>
                        
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-text-primary mb-5 leading-tight group-hover:text-gold transition-colors duration-300">
                            {step.title}
                        </h3>
                        
                        <div className="text-sm md:text-base leading-relaxed text-text-primary/75 mb-6 space-y-4 font-sans">
                            {step.desc.split("\n\n").map((para: string, idx: number) => (
                                <p key={idx} className="font-normal text-text-primary/85">{para}</p>
                            ))}
                        </div>

                        {step.keywords && (
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                                {step.keywords.map((kw: string) => (
                                    <span key={kw} className="px-3 py-1.5 border border-white/[0.06] rounded-sm bg-white/[0.01] text-xs font-mono text-text-primary/70 tracking-wide hover:bg-white/[0.04] hover:text-text-primary transition-colors">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
