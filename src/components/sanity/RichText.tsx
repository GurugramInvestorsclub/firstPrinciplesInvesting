import { PortableText as PortableTextReact, PortableTextComponents } from "@portabletext/react"
import { urlForImage, getImageDimensions } from "@/lib/sanity.image"
import Image from "next/image"
import Link from "next/link"

const components: PortableTextComponents = {
    types: {
        image: ({ value }: any) => {
            if (!value?.asset?._ref) {
                return null
            }
            const imageUrl = urlForImage(value)?.url()
            const { width, height } = getImageDimensions(value) || { width: 800, height: 450 } // Fallback

            return (
                <figure className="my-8 p-3 sm:p-4 rounded-2xl bg-[#F5B800] shadow-lg shadow-[#F5B800]/15 border border-[#F5B800]/30 transition-transform duration-300 hover:scale-[1.005]">
                    {imageUrl && (
                        <div className="rounded-xl overflow-hidden bg-white/95 shadow-sm">
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
                        <figcaption className="mt-2.5 text-center text-xs font-mono font-semibold text-black/90 tracking-wide">
                            {value.caption}
                        </figcaption>
                    )}
                </figure>
            )
        },
    },
    block: {
        h1: ({ children }: any) => <h1 className="text-3xl font-bold text-gold mt-8 mb-4">{children}</h1>,
        h2: ({ children }: any) => <h2 className="text-2xl font-bold text-gold mt-8 mb-4">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-xl font-bold text-gold mt-6 mb-3">{children}</h3>,
        h4: ({ children }: any) => <h4 className="text-lg font-bold text-gold mt-6 mb-3">{children}</h4>,
        h5: ({ children }: any) => <h5 className="text-base font-bold text-gold mt-4 mb-2">{children}</h5>,
        h6: ({ children }: any) => <h6 className="text-sm font-bold text-gold mt-4 mb-2">{children}</h6>,
        blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-gold pl-4 italic text-muted-foreground my-4">
                {children}
            </blockquote>
        ),
        normal: ({ children }: any) => <p className="leading-relaxed mb-3 text-lg">{children}</p>,
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
            const rel = !value.href.startsWith("/") ? "noreferrer noopener" : undefined
            return (
                <Link
                    href={value.href}
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
    return <PortableTextReact value={value} components={components} />
}
