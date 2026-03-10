'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Event } from "@/lib/types"
import { ChevronDown } from "lucide-react"

export function EventAgenda({ event }: { event: Event }) {
    if (!event.agenda || event.agenda.length === 0) return null;

    return (
        <section id="agenda" className="py-24 relative">
            <div className="w-[80%] mx-auto max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Event Agenda</h2>
                </motion.div>

                <div className="space-y-4">
                    {event.agenda.map((item, idx) => (
                        <AgendaItem key={idx} item={item} index={idx} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function AgendaItem({ item, index }: { item: any, index: number }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[16px] overflow-hidden hover:border-gold/20 transition-colors"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer focus:outline-none"
            >
                <div>
                    <span className="text-sm font-bold text-gold tracking-wider uppercase mb-2 block">
                        {item.time}
                    </span>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0 text-gray-500 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
                >
                    <ChevronDown className="w-5 h-5" />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
                            {item.description}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
