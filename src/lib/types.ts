import { PortableTextBlock } from "sanity"

export interface Post {
    _id: string
    title: string
    slug: { current: string }
    excerpt: string
    mainImage?: any
    publishedAt: string
    body: PortableTextBlock[]
}

export interface Event {
    _id: string
    title: string
    subHeading?: string
    slug: { current: string }
    date: string
    location: string
    highlightStat?: string
    shortDescription: string
    whyThisMatters?: PortableTextBlock[]
    learningPoints?: { title: string; description: string }[]
    targetAudience?: { title: string; description: string }[]
    speaker?: {
        name: string
        image: any
        bio: string
        credentials: string[]
    }
    agenda?: { time: string; title: string; description: string }[]
    faq?: { question: string; answer: string }[]
    longDescription?: PortableTextBlock[]
    registrationLink: string
    image?: any
}

export interface Testimonial {
    name: string
    role?: string
    company?: string
    quote: string
    photo?: any
    featured: boolean
    order?: number
}
