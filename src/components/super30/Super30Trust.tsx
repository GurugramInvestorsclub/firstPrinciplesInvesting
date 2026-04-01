'use client'

import { motion, useInView, animate } from "framer-motion"
import { useRef, useEffect } from "react"
import { Play } from "lucide-react"

// Simple builder for Sanity images (used as a fallback until real integration)
import { urlForImage } from "@/lib/sanity.image"

function Counter({ value, suffix }: { value: number; suffix?: string }) {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

    useEffect(() => {
        const node = nodeRef.current;
        if (isInView && node) {
            const controls = animate(0, value, {
                duration: 2.5,
                ease: "easeOut",
                onUpdate(v) {
                    node.textContent = Math.floor(v).toString() + (suffix || '');
                }
            });
            return () => controls.stop();
        }
    }, [isInView, value, suffix]);

    return <span ref={nodeRef}>0{suffix}</span>;
}

interface Super30TrustProps {
    logoMarquee?: any[]
    statsCounter?: { label: string; value: number; suffix?: string }[]
    videoTestimonials?: { videoUrl: string; overlayText?: string }[]
}

export function Super30Trust({ logoMarquee, statsCounter, videoTestimonials }: Super30TrustProps) {
    const hasLogos = logoMarquee && logoMarquee.length > 0;
    const hasStats = statsCounter && statsCounter.length > 0;
    const hasVideos = videoTestimonials && videoTestimonials.length > 0;

    if (!hasLogos && !hasStats && !hasVideos) return null;

    return (
        <section className="py-24 bg-[#0E0E11] relative z-10 border-t border-white/5 overflow-hidden">
            <div className="w-[80%] mx-auto max-w-7xl">
                
                {/* Stats Counter Section */}
                {hasStats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-24 cursor-default">
                        {statsCounter.map((stat, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="text-center group"
                            >
                                <div className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 tracking-tighter group-hover:text-gold transition-colors duration-500 will-change-transform">
                                    <Counter value={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-sm md:text-base text-gray-500 font-medium tracking-wide uppercase">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Logo Marquee */}
                {hasLogos && (
                    <div className="mb-24 relative">
                        <div className="text-center mb-10">
                            <p className="text-sm uppercase tracking-widest text-gray-500 font-medium">Alumni from top institutions & companies</p>
                        </div>
                        
                        {/* Fade Edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0E0E11] to-transparent z-10" />
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0E0E11] to-transparent z-10" />

                        <div className="flex overflow-hidden group">
                            <motion.div 
                                className="flex gap-16 md:gap-32 items-center pr-16 md:pr-32"
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{ duration: 30, ease: "linear", repeat: Infinity }}
                                whileHover={{ animationPlayState: "paused" }}
                                style={{ width: "max-content" }}
                            >
                                {/* Duplicate the array once to create the infinite loop effect seamlessly */}
                                {[...logoMarquee, ...logoMarquee].map((logo, i) => (
                                    <div key={i} className="w-32 md:w-48 h-12 relative flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                        {/* Using standard img for marquee to avoid Next Image hydration/layout complexities inside an infinite motion loop */}
                                        <img 
                                            src={urlForImage(logo)?.width(400).url()} 
                                            alt="Partner Logo" 
                                            className="max-w-full max-h-full object-contain"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                )}

                {/* Micro Video Testimonials */}
                {hasVideos && (
                    <div>
                        <motion.h3 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-2xl font-bold text-center text-white mb-10"
                        >
                            Hear it directly from <span className="text-gold">them</span>.
                        </motion.h3>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videoTestimonials.map((video, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className="group relative rounded-2xl overflow-hidden aspect-[9/16] bg-[#1a1a20] border border-white/5 cursor-pointer shadow-lg hover:border-gold/30 hover:shadow-gold/10 hover:-translate-y-2 transition-all duration-500"
                                >
                                    <video 
                                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        src={video.videoUrl}
                                        playsInline
                                        muted
                                        loop
                                        onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                                        onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                                    />
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-gold/90 group-hover:text-black text-white transition-all duration-300">
                                            <Play className="w-5 h-5 ml-1" />
                                        </div>
                                        {video.overlayText && (
                                            <p className="text-white font-medium text-lg drop-shadow-md">
                                                "{video.overlayText}"
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
