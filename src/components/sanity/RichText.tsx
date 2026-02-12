import { PortableText as PortableTextReact, PortableTextComponents } from "@portabletext/react"
import { urlForImage } from "@/lib/sanity.image"
import Image from "next/image"
import Link from "next/link"

const components: PortableTextComponents = {
    types: {
        image: ({ value }: any) => {
            const imageUrl = urlForImage(value)?.url()
            return (
                <div className="relative w-full aspect-video my-8 rounded-xl overflow-hidden bg-secondary/20">
                    {imageUrl && (
                        <Image
                            src={imageUrl}
                            alt={value.alt || "Post image"}
                            fill
                            className="object-cover"
                        />
                    )}
                </div>
            )
        },
    },
    block: {
        h1: ({ children }: any) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
        h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
        blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">
                {children}
            </blockquote>
        ),
        normal: ({ children }: any) => <p className="leading-relaxed mb-6 text-lg">{children}</p>,
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
