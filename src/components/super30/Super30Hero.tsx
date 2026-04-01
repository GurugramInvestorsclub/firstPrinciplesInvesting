'use client'

import { motion, useScroll, useTransform } from "framer-motion"
import { Calendar, Users } from "lucide-react"
import { Super30Program } from "@/lib/types"
import { useRef } from "react"

interface Super30HeroProps {
    program: Super30Program
}

const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
}

export function Super30Hero({ program }: Super30HeroProps) {
    const deadlineDate = program.applicationDeadline ? new Date(program.applicationDeadline) : null
    const containerRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] })
    
    // Smooth, subtle 30% parallax on Y axis
    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
    const opacityFade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

    const headline = program.headline || program.title || ""
    const words = headline.split(" ")

    const wordVariants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
        visible: (i: number) => ({
            opacity: 1, 
            y: 0, 
            filter: 'blur(0px)',
            transition: { delay: i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
        })
    }

    return (
        <section 
            id="overview" 
            ref={containerRef}
            className="relative pt-32 pb-20 md:pt-40 md:pb-32 lg:pt-48 lg:pb-40 overflow-hidden min-h-[90vh] flex items-center"
        >
            {/* Background Layer: Cinematic Video or default gradient */}
            {program.heroVideo ? (
                <>
                    {getYoutubeVideoId(program.heroVideo) ? (
                        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-[#0E0E11]">
                            <iframe 
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] opacity-40 mix-blend-screen"
                                src={`https://www.youtube-nocookie.com/embed/${getYoutubeVideoId(program.heroVideo)}?autoplay=1&mute=1&loop=1&playlist=${getYoutubeVideoId(program.heroVideo)}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                                allow="autoplay; encrypted-media; picture-in-picture"
                                title="Background Video"
                            />
                        </div>
                    ) : (
                        <video 
                            className="absolute inset-0 w-full h-full object-cover -z-10 opacity-40 mix-blend-screen pointer-events-none"
                            autoPlay 
                            muted 
                            loop 
                            playsInline
                            src={program.heroVideo}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E11] via-[#0E0E11]/80 to-transparent -z-10" />
                </>
            ) : (
                <>
                    {/* Slow Animated Background Elements for default mode */}
                    <motion.div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5 border-dashed opacity-30 -z-10 pointer-events-none"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-gold/5 opacity-20 -z-10 pointer-events-none"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-[#0E0E11]/0 to-[#0E0E11]/0 -z-10" />
                </>
            )}
            
            <motion.div 
                className="w-[80%] mx-auto max-w-screen-2xl relative z-10"
                style={{ y: yParallax, opacity: opacityFade }}
            >
                <div className="flex flex-col items-center text-center gap-16 lg:gap-24">
                    <div className="w-full max-w-6xl flex flex-col items-center gap-8">
                        
                        {/* Tags & Social Proof */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="flex flex-wrap justify-center items-center gap-3"
                        >
                            {program.socialProofBadge && (
                                <span className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-gray-200 border border-white/10 backdrop-blur-md">
                                    {program.socialProofBadge.avatars && program.socialProofBadge.avatars.length > 0 && (
                                        <div className="flex -space-x-2">
                                            {/* We render circles since we don't have the image builder easily injected here, or we wait for Sanity implementation */}
                                            <div className="w-5 h-5 rounded-full bg-gold/50 border border-[#0E0E11]" />
                                            <div className="w-5 h-5 rounded-full bg-gold/70 border border-[#0E0E11]" />
                                            <div className="w-5 h-5 rounded-full bg-gold border border-[#0E0E11]" />
                                        </div>
                                    )}
                                    {program.socialProofBadge.text}
                                </span>
                            )}
                            
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20 backdrop-blur-sm">
                                <Users className="w-3.5 h-3.5" />
                                {program.batchName || 'Premium Cohort'}
                            </span>
                            
                            {program.seatsAvailable !== undefined && program.seatsAvailable > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10 backdrop-blur-sm">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    Only {program.seatsAvailable} seats remaining
                                </span>
                            )}
                            
                            {deadlineDate && (
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10 backdrop-blur-sm">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Apply by {deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                            )}
                        </motion.div>

                        {/* Word-by-Word Reveal Headline */}
                        <div className="text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tighter leading-[1.05] text-white drop-shadow-2xl flex flex-wrap justify-center gap-x-4">
                            {words.map((word, i) => (
                                <motion.span
                                    key={i}
                                    custom={i}
                                    variants={wordVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="inline-block"
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </div>

                        {/* Fade In Subheadline */}
                        {program.subheadline && (
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.6 }}
                                className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl mx-auto"
                            >
                                {program.subheadline}
                            </motion.p>
                        )}
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="pt-8"
                        >
                           <a 
                                href="#apply"
                                className="inline-flex items-center justify-center px-10 py-5 rounded-full text-lg font-bold bg-gold text-[#0b0b0c] hover:bg-gold-muted transition-all duration-300 shadow-[0_0_30px_rgba(245,184,0,0.3)] hover:shadow-[0_0_40px_rgba(245,184,0,0.5)] hover:-translate-y-1"
                           >
                               {program.ctaText || "Apply Now"}
                           </a>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
