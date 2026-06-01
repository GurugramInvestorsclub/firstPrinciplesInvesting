"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

const steps = [
    {
        id: "01",
        title: "Identify Disruptions",
        desc: "Regulatory changes, technological shifts, supply shortages, policy decisions, geopolitical events, and industry transitions.",
        keywords: ["Technology", "Policy", "Geopolitics", "Supply Chains"]
    },
    {
        id: "02",
        title: "Map the Consequences",
        desc: "Understand which industries, supply chains, and business models are affected by the disruption.",
        keywords: ["Industries", "Supply Chains", "Business Models"]
    },
    {
        id: "03",
        title: "Find the Bottlenecks",
        desc: "Identify where constraints emerge—capacity shortages, critical inputs, manufacturing gaps, infrastructure limitations, or regulatory barriers.",
        keywords: ["Capacity", "Inputs", "Infrastructure", "Regulation"]
    },
    {
        id: "04",
        title: "Discover the Beneficiaries",
        desc: "Find companies positioned to solve these bottlenecks through technology, scale, expertise, or market leadership.",
        keywords: ["Technology", "Scale", "Expertise", "Leadership"]
    },
    {
        id: "05",
        title: "Validate Through Research",
        desc: "Validate every thesis through annual reports, concalls, industry studies, financial models, management quality assessments, and primary research.",
        keywords: ["Annual Reports", "Concalls", "Models", "Research"]
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
    const y = useTransform(scrollYProgress, [0, 1], [150, -150])
    
    // Cinematic fade and translate
    const opacity = useTransform(scrollYProgress, [0.2, 0.4, 0.6, 0.8], [0, 1, 1, 0.5])
    const yOffset = useTransform(scrollYProgress, [0.2, 0.4], [50, 0])

    const desktopAlignClass = isLeft 
        ? "md:mr-auto md:pr-16 lg:pr-24" 
        : "md:ml-auto md:pl-16 lg:pl-24"

    const watermarkAlignClass = isLeft
        ? "left-8 md:left-0 text-left"
        : "left-8 md:left-auto md:right-0 md:text-right"

    return (
        <div ref={ref} className="relative min-h-[90vh] flex flex-col justify-center py-20 w-full">
            
            {/* Giant Background Number Watermark */}
            <motion.div 
                style={{ y }}
                className={`absolute top-1/2 -translate-y-1/2 text-[180px] md:text-[250px] lg:text-[350px] font-heading font-bold text-gold opacity-[0.03] select-none pointer-events-none tracking-tighter z-0 ${watermarkAlignClass}`}
            >
                {step.id}
            </motion.div>

            {/* Content Container */}
            <motion.div
                style={{ opacity, y: yOffset }}
                className={`relative z-10 w-full md:w-[45%] flex flex-col items-start text-left pl-12 md:pl-0 ${desktopAlignClass}`}
            >
                <div className="text-gold font-mono text-xl md:text-2xl mb-8 tracking-widest">{step.id}</div>
                <h3 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-6 leading-tight">{step.title}</h3>
                
                <p className="text-lg md:text-xl leading-relaxed text-text-primary/80 mb-10">
                    {step.desc}
                </p>

                {step.keywords && (
                    <div className="flex flex-wrap gap-3">
                        {step.keywords.map((kw: string) => (
                            <span key={kw} className="px-5 py-2.5 border border-border/30 rounded-sm bg-bg-primary/20 text-sm font-medium text-text-primary tracking-wide">
                                {kw}
                            </span>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    )
}
