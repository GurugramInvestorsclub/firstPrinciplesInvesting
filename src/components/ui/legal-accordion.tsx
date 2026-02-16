"use client"

import { useState } from "react"
import { ChevronDown, Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface LegalAccordionProps {
    items: {
        id: string
        title: string
        content: React.ReactNode
    }[]
}

export function LegalAccordion({ items }: LegalAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const toggle = (index: number) => {
        setOpenIndex(prev => prev === index ? null : index)
    }

    return (
        <div className="w-full border-t border-neutral-800">
            {items.map((item, index) => {
                const isOpen = openIndex === index
                return (
                    <div key={item.id} className="border-b border-neutral-800 last:border-0 group">
                        <button
                            onClick={() => toggle(index)}
                            className={cn(
                                "flex w-full items-center justify-between py-6 md:py-8 text-left transition-all duration-300 group-hover:bg-neutral-900/40 -mx-4 px-4 rounded-lg",
                                isOpen && "bg-neutral-900/40 pb-4"
                            )}
                        >
                            <span className={cn(
                                "text-lg md:text-xl font-medium tracking-wide transition-colors duration-300 pr-8",
                                isOpen ? "text-[#C6A84A]" : "text-[#F0EDE8] group-hover:text-[#C6A84A]/80"
                            )}>
                                {item.title}
                            </span>

                            <div className={cn(
                                "shrink-0 transition-all duration-300 text-neutral-500 group-hover:text-[#C6A84A]",
                                isOpen && "rotate-180 text-[#C6A84A]"
                            )}>
                                {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            </div>
                        </button>

                        <div
                            className={cn(
                                "grid transition-all duration-500 ease-in-out",
                                isOpen ? "grid-rows-[1fr] opacity-100 pb-8" : "grid-rows-[0fr] opacity-0"
                            )}
                        >
                            <div className="overflow-hidden">
                                <div className="prose prose-invert max-w-none prose-p:leading-8 prose-li:marker:text-neutral-600 prose-ul:pl-0 text-neutral-300 pl-4 md:pl-6 border-l border-neutral-800 ml-4">
                                    {item.content}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
