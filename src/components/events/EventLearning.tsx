'use client'

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { Event } from "@/lib/types"

export function EventLearning({ event }: { event: Event }) {
    if (!event.learningPoints || event.learningPoints.length === 0) return null;

    return (
        <section id="learning" className="py-24 md:py-32 bg-[#0E0E11] border-y border-white/5 relative z-10">
            <div className="w-[80%] mx-auto max-w-screen-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-3xl mx-auto mb-20 text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white uppercase tracking-tight">
                        Master the Market Cycle <span className="text-gold">Framework</span>
                    </h2>
                    <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
                        This isn't just information. It's a systematic approach to gaining a decisive market edge.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {event.learningPoints.map((point, idx) => {
                        // Logic to parse description for payoff and bullets if present
                        const lines = point.description.split('\n').filter(l => l.trim() !== '');
                        const payoff = lines.length > 0 ? lines[0] : "";
                        const bullets = lines.slice(1).map(l => l.replace(/^[-\u2022]\s*/, '').trim());

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={{ y: -12, scale: 1.02 }}
                                className="relative flex flex-col bg-[#111113]/40 border border-white/5 p-10 rounded-[24px] hover:border-gold/30 hover:shadow-[0_40px_100px_rgba(255,199,44,0.15)] transition-all duration-700 group overflow-hidden"
                            >
                                {/* Subtle background glow */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/5 rounded-full blur-[80px] group-hover:bg-gold/10 transition-all duration-700" />

                                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20 mb-10 group-hover:scale-110 group-hover:bg-gold/20 transition-all duration-500">
                                    <CheckCircle2 className="w-7 h-7 text-gold" />
                                </div>

                                <h3 className="font-bold text-2xl mb-4 text-white group-hover:text-gold transition-colors duration-300 tracking-tight">
                                    {point.title}
                                </h3>

                                {payoff ? (
                                    <p className="text-gray-300 font-medium mb-8 leading-relaxed italic border-l-2 border-gold/30 pl-4">
                                        {payoff}
                                    </p>
                                ) : (
                                    <p className="text-gray-400 leading-relaxed font-light mb-8 italic">
                                        Outcome-driven transformation.
                                    </p>
                                )}

                                {bullets.length > 0 ? (
                                    <ul className="space-y-4 mt-auto">
                                        {bullets.map((bullet, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-400 leading-relaxed">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="space-y-4 mt-auto">
                                        <div className="flex items-start gap-3 text-sm text-gray-400 leading-relaxed">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                                            Systematize your decision-making process
                                        </div>
                                        <div className="flex items-start gap-3 text-sm text-gray-400 leading-relaxed">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                                            Eliminate emotional bias with first-principles
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    )
}
