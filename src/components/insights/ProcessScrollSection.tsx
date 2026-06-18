"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

const steps = [
    {
        id: "01",
        title: "Radical. Positive. Change.",
        desc: "Radical. Positive. Change. That’s what we’re after.\n\nOur newsletter - First Principles Deep-Dives will cover listed companies undergoing such a change.\n\nForget Value, forget growth, forget momentum, forget GARP and every other buzz-word used to define a ‘style’.\n\nWe seek change. Radical. Big. Positive. Change!",
        keywords: ["First Principles", "Style Agnostic", "Deep-Dives", "Hunting Change"]
    },
    {
        id: "02",
        title: "Garware Hi-Tech Films",
        desc: "On 8th July 2023, We “spotted” Garware Hi-tech films.\n\n13X PE. EPS growth over 1 year was flat. But it was the only one out of the Poly-films lot that was “moving”.\n\nMr. Ashish Kacholia was selling. We were buying and in this instance we were blessed with a 4X !!\n\nThe margin profile change was supported by a new winning product (Paint protection films) and by God’s grace and some hard work - We were in the right company at the right time.\n\nToday it trades at 42X.",
        keywords: ["Spotted: July 2023", "4X Return", "Margin Shift", "Paint Protection"]
    },
    {
        id: "03",
        title: "Corporate Restructuring",
        desc: "Let’s take another example - John Cockerill India Ltd.\n\nWe discovered the company on 8th August 2025. This company is undergoing a change so radical it will/is change/ing the shape, size, margin profile of the entire Indian unit.\n\nI really loved this one. A restructuring like no other.\n\nJohn Cockerill is a belgian technology leader in the downstream steel value chain. It builds cold rolling mills, zinc coating lines for steel mills amongst other equipment.\n\nThe ENTIRE GLOBAL METALS/NON-FERROUS business has been shoved into the Indian business, with access to technologies that are seen EXTREMELY promising.\n\nNot value, not growth, not mo-mo, not moats.\n\nRADICAL. POSITIVE. CHANGE. IS WHAT WE’RE HUNTING FOR.\n\nHere’s another one - MEGASOFT (now SIGMA ADVANCED SYSTEMS)\n\nI discovered this one on September 5th 2025 ~ 800 crore of Market capitalisation with Rs 400 crores of other income from selling non-core assets. It was essentially an empty shell with plans to transform it into an Aerospace / Defence supplier.\n\nBy merging sigma advanced systems - electronic equipment for missiles and Aircrafts - along with a partnership with a leading Anti-drone players the company’s was shifting its entire business model.\n\nOn a per share basis, the stock is up 3.5X since.",
        keywords: ["John Cockerill", "Megasoft", "Restructuring", "3.5X Return"]
    },
    {
        id: "04",
        title: "Capacity Expansion & Realities",
        desc: "Another one from CDMO space– Ami Oraganics (now Acutaas Chemicals).\n\nWe identified the company in March 2024. By the second half of the year, markets were falling and sentiment had turned decisively negative. Yet beneath the surface, Acutaas was undergoing a meaningful transformation, commissioning a large capex programme that would significantly expand capacity and reshape the scale of the business.\n\nWhat made the opportunity particularly interesting was that nearly 30% of the upcoming capacity had already been booked by a single customer before the plant became operational, providing early visibility on demand and reducing execution risk.\n\nOn a per share basis, the stock is up 5.4X since.\n\nI don’t want to give you the impression that there won’t be mistakes. There have been, there will be.\n\nHitting the ball out of the park comes with its own set of challenges.",
        keywords: ["Ami Organics", "5.4X Return", "Pre-booked Capex", "Managing Mistakes"]
    },
    {
        id: "05",
        title: "Special Situations",
        desc: "Radical. Positive. Change is the first mental model First Principles Deep-Dives will cover in our bi-monthly deep-dives. The second mental model we cover : Special Situations.\n\nSpecifically - Demergers such as Triveni Engineering (ongoing), Inox Green (ongoing) and promoter change (Restaurants Brands Asia).\n\nWhile we’re very proud of our ‘Special Situations Alert’ series that releases weekly on The Financial Express, we’re limited by the length & the platform itself in some ways.\n\nThese weekly (free) articles are outline the special situation exceptionally well and no one in the country is doing what we do, however, in first principles Deep Dives we go one step further.\n\nWe believe there are only 2-3 key key levers that drive any investment theses. Recognising them, watching them like a hawk, and having a better idea on their probabilities vs the market is what the game is about.\n\nEveryone knows Triveni is demerging its Power Tranmission business. How sure are you there is value and When it will unlock?\n\nSpecial Situations is the second mental model First Principles Deep-Dives cover.",
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
                
                <div className="text-lg md:text-xl leading-relaxed text-text-primary/80 mb-10 space-y-6">
                    {step.desc.split("\n\n").map((para: string, idx: number) => (
                        <p key={idx}>{para}</p>
                    ))}
                </div>

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
