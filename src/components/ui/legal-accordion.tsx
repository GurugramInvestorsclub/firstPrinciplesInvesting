import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface LegalAccordionProps {
    items: {
        id: string
        title: string
        content: React.ReactNode
    }[]
}

export function LegalAccordion({ items }: LegalAccordionProps) {
    return (
        <div className="w-full border-t border-neutral-800">
            {items.map((item, index) => (
                <details 
                    key={item.id} 
                    className="border-b border-neutral-800 last:border-0 group"
                    open={index === 0}
                >
                    <summary className={cn(
                        "flex w-full items-center justify-between py-6 md:py-8 text-left transition-all duration-300 hover:bg-neutral-900/40 -mx-4 px-4 rounded-lg cursor-pointer list-none [&::-webkit-details-marker]:hidden",
                        "group-open:bg-neutral-900/40 group-open:pb-4"
                    )}>
                        <span className={cn(
                            "text-lg md:text-xl font-medium tracking-wide transition-colors duration-300 pr-8 text-[#F0EDE8] group-hover:text-[#C6A84A]/80 group-open:text-[#C6A84A]"
                        )}>
                            {item.title}
                        </span>

                        <div className="shrink-0 transition-all duration-300 text-neutral-500 group-hover:text-[#C6A84A] group-open:text-[#C6A84A]">
                            <span className="group-open:hidden"><Plus className="w-5 h-5" /></span>
                            <span className="hidden group-open:inline"><Minus className="w-5 h-5" /></span>
                        </div>
                    </summary>

                    <div className="pb-8 pl-4 md:pl-6 border-l border-neutral-800 ml-4 animate-fade-in">
                        <div className="prose prose-invert max-w-none prose-p:leading-8 prose-li:marker:text-neutral-600 prose-ul:pl-0 text-neutral-300">
                            {item.content}
                        </div>
                    </div>
                </details>
            ))}
        </div>
    )
}
