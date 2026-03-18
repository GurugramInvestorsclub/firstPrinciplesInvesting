"use client"

import { useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Calendar, BookOpen, ExternalLink, Home } from "lucide-react"
import { motion } from "framer-motion"

function ThankYouContent() {
    const searchParams = useSearchParams()
    const email = searchParams.get("email")
    const source = searchParams.get("source")
    const type = searchParams.get("type")

    useEffect(() => {
        // Fire tracking event: thank_you_view
        console.log("Tracking event: thank_you_view", { source, type, hasEmail: !!email })
        if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "thank_you_view", {
                source: source || "direct",
                type: type || "general",
                has_email: !!email
            })
        }

        // GSAP Micro-interactions
        const initGSAP = async () => {
            const gsap = (await import("gsap")).default
            // Subtle pulse for the main button glow
            gsap.to(".primary-btn-glow", {
                opacity: 0.4,
                scale: 1.1,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            })
        }
        initGSAP()
    }, [source, type, email])

    const trackClick = (label: string) => {
        console.log(`Tracking click: ${label}`)
        if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", label)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1, y: 0,
            transition: { duration: 0.6 }
        }
    }

    return (
        <main className="flex-1 flex flex-col items-center justify-center py-20 md:py-32 pt-40 px-4">
            <motion.div 
                className="max-w-3xl w-full text-center space-y-12"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* SECTION 1: Confirmation */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/10 text-gold mb-4 mx-auto">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 
                        className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        You&apos;re all set 👍
                    </h1>
                    <div className="space-y-2">
                        <p className="text-xl md:text-2xl text-text-secondary font-medium">
                            Your response has been recorded.
                        </p>
                        <p className="text-lg text-text-secondary/70">
                            We&apos;ll keep you posted with what&apos;s next.
                        </p>
                    </div>
                </motion.div>

                {/* SECTION 3: Primary CTA */}
                <motion.div variants={itemVariants} className="pt-8 relative">
                    {/* Premium Pulse Glow */}
                    <div className="primary-btn-glow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[60px] bg-gold/30 blur-2xl rounded-full pointer-events-none opacity-0" />
                    
                    <Button
                        asChild
                        size="lg"
                        className="group rounded-full px-10 h-14 text-lg font-bold bg-gold text-bg-deep hover:bg-gold-muted transition-all duration-300 shadow-lg shadow-gold/20 relative z-10"
                        onClick={() => trackClick("explore_click")}
                    >
                        <Link href="/insights">
                            Explore Our Insights
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </motion.div>

                {/* SECTION 2: Value Reinforcement (Moved below CTA) */}
                <motion.div 
                    variants={itemVariants} 
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12"
                >
                    {[
                        "Practical investing insights",
                        "No noise. Only what matters",
                        "Built for long-term investors"
                    ].map((text, i) => (
                        <motion.div 
                            key={i} 
                            whileHover={{ 
                                scale: 1.05, 
                                backgroundColor: "rgba(245, 184, 0, 0.05)", 
                                borderColor: "rgba(245, 184, 0, 0.3)",
                                color: "#F5B800"
                            }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center cursor-default transition-all duration-300 group"
                        >
                            <p className="text-sm font-medium text-text-secondary group-hover:text-gold transition-colors">{text}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* SECTION 4: Secondary CTA (Events) */}
                <motion.div variants={itemVariants} className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                    <div className="space-y-2">
                        {email ? (
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-gold font-semibold flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> You&apos;re already on the list 👍
                                </p>
                                <p className="text-sm text-text-secondary">We&apos;ll send you updates at {email}</p>
                            </div>
                        ) : (
                            <p className="text-text-primary md:text-lg font-medium">
                                Want updates on upcoming sessions and insights?
                            </p>
                        )}
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="rounded-full px-8 border-white/20 hover:border-gold/50 hover:bg-gold/5 text-text-primary"
                        onClick={() => trackClick("events_click")}
                    >
                        <Link href="/events" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Check Out Upcoming Events
                        </Link>
                    </Button>
                </motion.div>

                {/* SECTION 6: Exit Options */}
                <motion.div variants={itemVariants} className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-text-secondary">
                    <Link href="/" className="flex items-center gap-2 hover:text-text-primary transition-colors">
                        <Home className="w-4 h-4" /> Back to Home
                    </Link>
                    <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
                    <Link href="/insights" className="flex items-center gap-2 hover:text-text-primary transition-colors">
                        <BookOpen className="w-4 h-4" /> Browse Previous Content
                    </Link>
                </motion.div>
            </motion.div>
        </main>
    )
}

export default function ThankYouPage() {
    return (
        <div className="flex flex-col min-h-screen bg-bg-deep text-text-primary selection:bg-gold/20 selection:text-gold">
            <Navbar />
            <Suspense fallback={<div className="flex-1 flex items-center justify-center pt-20"><div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" /></div>}>
                <ThankYouContent />
            </Suspense>
            <Footer />
        </div>
    )
}
