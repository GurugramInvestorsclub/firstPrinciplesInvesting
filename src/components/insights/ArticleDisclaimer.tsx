import { RichText } from "@/components/sanity/RichText"
import { getPortableTextChildrenText } from "@/lib/toc"

const DISCLOSURE_PREFIX_REGEX = /^((?:disclosures?|disclaimer)\s*[:\-]\s*)([\s\S]*)$/i

function highlightDisclosurePrefixInBlocks(blocks: any[]): any[] {
    let handledFirstBlock = false

    return blocks.map((block) => {
        if (handledFirstBlock || !block || block._type !== "block" || !Array.isArray(block.children)) {
            return block
        }

        const fullText = getPortableTextChildrenText(block.children)
        if (!fullText.trim()) {
            return block
        }

        handledFirstBlock = true

        if (!/^\s*(?:disclosures?|disclaimer)\s*[:\-]/i.test(fullText)) {
            return block
        }

        let matched = false
        const updatedChildren: any[] = []

        for (const child of block.children) {
            if (!matched && child && child._type === "span" && typeof child.text === "string" && child.text.trim().length > 0) {
                matched = true
                const leadingSpaceMatch = child.text.match(/^(\s*)([\s\S]*)$/)
                const leadingSpace = leadingSpaceMatch?.[1] || ""
                const trimmedStart = leadingSpaceMatch?.[2] || child.text
                const prefixMatch = trimmedStart.match(DISCLOSURE_PREFIX_REGEX)

                if (prefixMatch) {
                    const existingMarks = Array.isArray(child.marks) ? child.marks : []
                    const boldMarks = existingMarks.includes("strong") ? existingMarks : [...existingMarks, "strong"]

                    if (leadingSpace) {
                        updatedChildren.push({
                            ...child,
                            _key: `${child._key || "span"}-ws`,
                            text: leadingSpace,
                        })
                    }

                    updatedChildren.push({
                        ...child,
                        _key: `${child._key || "span"}-label`,
                        text: prefixMatch[1],
                        marks: boldMarks,
                    })

                    if (prefixMatch[2]) {
                        updatedChildren.push({
                            ...child,
                            _key: `${child._key || "span"}-body`,
                            text: prefixMatch[2],
                            marks: existingMarks,
                        })
                    }
                    continue
                }
            }
            updatedChildren.push(child)
        }

        return {
            ...block,
            children: updatedChildren,
        }
    })
}

interface ArticleDisclaimerProps {
    disclaimer: any
    variant?: "article" | "reader"
    className?: string
}

export function ArticleDisclaimer({
    disclaimer,
    variant = "article",
    className = "",
}: ArticleDisclaimerProps) {
    const hasCustomDisclaimer = Array.isArray(disclaimer)
        ? disclaimer.length > 0
        : Boolean(disclaimer)

    const containerBase =
        variant === "reader"
            ? "article-disclaimer-box mt-8 p-4 md:p-5 rounded-xl border border-gold/40 bg-[radial-gradient(ellipse_at_top_left,rgba(245,184,0,0.08),transparent_70%),rgba(20,20,24,0.6)] backdrop-blur-sm shadow-[0_0_20px_rgba(245,184,0,0.08)] text-xs font-mono text-neutral-200 leading-relaxed text-left w-full"
            : "article-disclaimer-box p-4 md:p-5 rounded-xl border border-gold/40 bg-[radial-gradient(circle_at_top_left,rgba(245,184,0,0.1),transparent_70%),rgba(245,184,0,0.02)] backdrop-blur-sm shadow-[0_0_20px_rgba(245,184,0,0.1)] text-xs leading-relaxed text-neutral-200 font-mono"

    if (hasCustomDisclaimer) {
        const formattedDisclaimer = Array.isArray(disclaimer)
            ? highlightDisclosurePrefixInBlocks(disclaimer)
            : disclaimer

        return (
            <div className={`${containerBase} ${className}`.trim()}>
                <div className="text-xs leading-relaxed space-y-2 [&_p]:text-xs [&_p]:leading-relaxed [&_p]:text-neutral-200 [&_strong]:text-gold [&_strong]:font-bold [&_strong]:text-xs [&_span]:text-xs">
                    {typeof formattedDisclaimer === "string" ? (
                        (() => {
                            const match = formattedDisclaimer.trim().match(DISCLOSURE_PREFIX_REGEX)
                            if (match) {
                                return (
                                    <p>
                                        <strong className="font-bold text-gold text-xs mr-1 uppercase tracking-wider">
                                            {match[1].trim()}
                                        </strong>{" "}
                                        {match[2]}
                                    </p>
                                )
                            }
                            return <p>{formattedDisclaimer}</p>
                        })()
                    ) : (
                        <RichText value={formattedDisclaimer} />
                    )}
                </div>
            </div>
        )
    }

    if (variant === "reader") {
        return (
            <div className={`${containerBase} ${className}`.trim()}>
                <span className="text-gold font-bold uppercase block mb-1.5 text-[11px] tracking-wider">
                    DISCLAIMER:
                </span>
                First Principles Investing is an independent research house. We do not provide personalized stock recommendations or advisory calls. This research is for educational and learning purposes. All investments are subject to capital risk.
            </div>
        )
    }

    return (
        <div className={`${containerBase} ${className}`.trim()}>
            <div className="text-xs text-neutral-200 space-y-2 leading-relaxed">
                <p>
                    <strong className="font-bold text-gold text-xs mr-1 uppercase tracking-wider">
                        Disclaimer:
                    </strong>{" "}
                    This report is for educational purposes only and does not constitute investment advice. We may own securities discussed in this report and may buy or sell them without notice. Readers should assume that we are invested and may be biased.
                </p>
                <p>
                    First Principles Research is not registered with SEBI as a Research Analyst or Investment Adviser. Please do your own research before making any investment decisions.
                </p>
            </div>
        </div>
    )
}
