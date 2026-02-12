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
        <div className="border-b border-border/50 last:border-0">
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:text-primary"
            >
                {title}
                <ChevronDown
                    className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
                />
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100 mb-4" : "max-h-0 opacity-0"
                )}
            >
                <div className="text-muted-foreground text-sm leading-relaxed">
                    {children}
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
