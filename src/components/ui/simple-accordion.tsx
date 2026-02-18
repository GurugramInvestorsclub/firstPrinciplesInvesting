"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionItemProps {
    title: string
    children: React.ReactNode
    isOpen?: boolean
    onToggle?: () => void
}

export function AccordionItem({ title, children, isOpen, onToggle }: AccordionItemProps) {
    return (
        <div className="mb-4 rounded-xl border border-white/5 bg-[#1A1A1A] overflow-hidden transition-all duration-300 hover:border-gold/20">
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between px-6 py-5 text-left transition-all"
            >
                <span className={cn("text-lg font-medium text-text-primary", isOpen && "text-gold")}>
                    {title}
                </span>
                <ChevronDown
                    className={cn("h-5 w-5 shrink-0 text-gold transition-transform duration-300", isOpen && "rotate-180")}
                />
            </button>
            <div
                className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-0 text-text-secondary leading-relaxed">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

interface SimpleAccordionProps {
    items: {
        title: string
        content: string
    }[]
}

export function SimpleAccordion({ items }: SimpleAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <div className="w-full">
            {items.map((item, index) => (
                <AccordionItem
                    key={index}
                    title={item.title}
                    isOpen={openIndex === index}
                    onToggle={() => setOpenIndex(prev => prev === index ? null : index)}
                >
                    {item.content}
                </AccordionItem>
            ))}
        </div>
    )
}
