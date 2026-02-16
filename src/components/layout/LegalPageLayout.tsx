import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ReactNode } from "react"

interface LegalPageLayoutProps {
    title: string
    lastUpdated: string
    children: ReactNode
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen bg-[#0B0B0C] text-[#F0EDE8] font-sans selection:bg-neutral-800 selection:text-white">
            <Navbar />

            <main className="flex-1 pb-32 pt-32 md:pt-40">
                <div className="container max-w-[900px] mx-auto px-6 md:px-12">
                    {/* Header */}
                    <header className="mb-20">
                        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#F0EDE8] mb-8 uppercase">
                            {title}
                        </h1>

                        <div className="text-sm text-neutral-400 flex flex-col gap-1">
                            <span className="uppercase tracking-wider text-xs font-medium text-neutral-500">Last Updated</span>
                            <span className="font-mono text-neutral-400">{lastUpdated}</span>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="prose prose-invert max-w-none 
                        prose-headings:text-[#F0EDE8] prose-headings:font-semibold
                        
                        /* H2 - Section Headings */
                        prose-h2:text-xl md:prose-h2:text-2xl 
                        prose-h2:tracking-wide 
                        prose-h2:mt-16 prose-h2:mb-6
                        prose-h2:pt-12
                        prose-h2:border-t prose-h2:border-neutral-800
                        first:prose-h2:border-t-0 first:prose-h2:pt-0 first:prose-h2:mt-0

                        /* H3 - Subsections */
                        prose-h3:text-lg md:prose-h3:text-xl
                        prose-h3:font-medium
                        prose-h3:mt-10 prose-h3:mb-4
                        prose-h3:text-[#F0EDE8]
                        
                        /* Paragraphs */
                        prose-p:text-base md:prose-p:text-[17px]
                        prose-p:leading-relaxed
                        prose-p:text-neutral-300
                        prose-p:mb-5

                        /* Lists */
                        prose-li:text-neutral-300 prose-li:leading-relaxed prose-li:marker:text-neutral-600
                        prose-ul:space-y-2 prose-ul:my-6
                        
                        /* Links */
                        prose-a:text-neutral-200 hover:prose-a:text-white prose-a:transition-colors prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4
                        
                        /* Strong */
                        prose-strong:text-white prose-strong:font-medium
                        
                        /* HR */
                        prose-hr:border-neutral-800 prose-hr:my-16">
                        {children}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
