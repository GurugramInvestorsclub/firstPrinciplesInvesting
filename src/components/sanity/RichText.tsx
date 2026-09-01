import { PortableText as PortableTextReact, PortableTextComponents } from "@portabletext/react"
import { urlForImage, getImageDimensions } from "@/lib/sanity.image"
import { slugifyHeading, getPortableTextChildrenText } from "@/lib/toc"
import Image from "next/image"
import Link from "next/link"

function renderHeading(Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6", className: string) {
    return ({ children, value }: any) => {
        const text = getPortableTextChildrenText(value?.children)
        if (!text || !text.trim()) return null
        const id = text ? slugifyHeading(text) : (value?._key ? `heading-${value._key}` : undefined)
        return (
            <Tag id={id} className={`scroll-mt-28 ${className}`}>
                {children}
            </Tag>
        )
    }
}

function cleanBlocks(value: any) {
    if (!Array.isArray(value)) return value

    let lastNonEmptyIndex = value.length - 1
    while (lastNonEmptyIndex >= 0) {
        const block = value[lastNonEmptyIndex]
        if (block && block._type === "block") {
            const text = getPortableTextChildrenText(block.children)
            if (!text || !text.trim()) {
                lastNonEmptyIndex--
                continue
            }
        }
        break
    }

    if (lastNonEmptyIndex < 0) return []
    return value.slice(0, lastNonEmptyIndex + 1)
}

const components: PortableTextComponents = {
    types: {
        image: ({ value }: any) => {
            if (!value?.asset?._ref) {
                return null
            }
            const imageUrl = urlForImage(value)?.url()
            const { width, height } = getImageDimensions(value) || { width: 800, height: 450 } // Fallback

            return (
                <figure className="my-8 rounded-2xl border-2 border-[#F5B800] shadow-[0_0_25px_rgba(245,184,0,0.3)] overflow-hidden bg-[#12110F] transition-all duration-300 hover:shadow-[0_0_35px_rgba(245,184,0,0.45)]">
                    {imageUrl && (
                        <div className="w-full overflow-hidden bg-white/95">
                            <Image
                                src={imageUrl}
                                alt={value.alt || value.caption || "Post image"}
                                width={width}
                                height={height}
                                className="w-full h-auto block object-contain"
                                style={{
                                    maxWidth: "100%",
                                    aspectRatio: `${width} / ${height}`
                                }}
                            />
                        </div>
                    )}
                    {value.caption && (
                        <figcaption className="p-3 text-center text-xs font-mono font-medium text-gold tracking-wide bg-[#12110F] border-t border-[#F5B800]/20">
                            {value.caption}
                        </figcaption>
                    )}
                </figure>
            )
        },
    },
    block: {
        h1: renderHeading("h1", "text-3xl font-bold text-gold mt-8 mb-4"),
        h2: renderHeading("h2", "text-2xl font-bold text-gold mt-8 mb-4"),
        h3: renderHeading("h3", "text-xl font-bold text-gold mt-6 mb-3"),
        h4: renderHeading("h4", "text-lg font-bold text-gold mt-6 mb-3"),
        h5: renderHeading("h5", "text-base font-bold text-gold mt-4 mb-2"),
        h6: renderHeading("h6", "text-sm font-bold text-gold mt-4 mb-2"),
        blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-gold pl-4 italic text-muted-foreground my-4">
                {children}
            </blockquote>
        ),
        normal: ({ children, value }: any) => {
            const text = getPortableTextChildrenText(value?.children)
            if (!text || !text.trim()) {
                return null
            }
            return <p className="leading-relaxed mb-3 text-lg last:mb-0">{children}</p>
        },
    },
    list: {
        bullet: ({ children }: any) => (
            <ul className="list-disc list-outside pl-6 my-4 space-y-2 leading-relaxed text-base md:text-lg">
                {children}
            </ul>
        ),
        number: ({ children }: any) => (
            <ol className="list-decimal list-outside pl-6 my-4 space-y-2 leading-relaxed text-base md:text-lg">
                {children}
            </ol>
        ),
    },
    listItem: {
        bullet: ({ children }: any) => <li className="pl-1 mb-1 leading-relaxed">{children}</li>,
        number: ({ children }: any) => <li className="pl-1 mb-1 leading-relaxed">{children}</li>,
    },
    marks: {
        link: ({ children, value }: any) => {
            const href = value?.href || "#"
            const isHash = href.startsWith("#")
            const target = value?.target || (isHash ? undefined : "_blank")
            const rel = target === "_blank" ? "noopener noreferrer" : (!href.startsWith("/") ? "noreferrer noopener" : undefined)

            return (
                <Link
                    href={href}
                    target={target}
                    rel={rel}
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                    {children}
                </Link>
            )
        },
    },
}

export function RichText({ value }: { value: any }) {
    const cleanedValue = cleanBlocks(value)
    return <PortableTextReact value={cleanedValue} components={components} />
}
