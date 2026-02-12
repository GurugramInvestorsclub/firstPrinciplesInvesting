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
    slug: { current: string }
    date: string
    location: string
    shortDescription: string
    longDescription: PortableTextBlock[]
    registrationLink: string
    image?: any
}
