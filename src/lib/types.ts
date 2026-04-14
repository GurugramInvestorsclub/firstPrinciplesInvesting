import { PortableTextBlock } from "sanity"

export interface Post {
    _id: string
    title: string
    slug: { current: string }
    isFeatured?: boolean
    excerpt: string
    access?: "public" | "subscriber"
    mainImage?: any
    publishedAt: string
    body: PortableTextBlock[]
    previewBody?: PortableTextBlock[]
    paywallHeadline?: string
    paywallCtaText?: string
}

export interface Event {
    _id: string
    eventId: string
    title: string
    subHeading?: string
    slug: { current: string }
    date: string
    location: string
    price: number
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
    registrationLink?: string
    image?: any
    whatsappLink?: string
    startTime?: string
    endTime?: string
}

export interface Testimonial {
    name: string
    role?: string
    quote: string
    photo?: any
}

export interface Super30Program {
    _id: string
    title: string
    slug: { current: string }
    batchName?: string
    tagline?: string
    shortDescription?: string
    investorsEducated?: string
    batchNumber?: string
    seatsRemaining?: string
    applyByDate?: string
    headline?: string
    subheadline?: string
    heroVideo?: string
    socialProofBadge?: { text: string; avatars?: any[] }
    ctaText?: string
    seatsAvailable?: number
    applicationDeadline?: string
    painPoints?: string[]
    philosophyHeading?: string
    philosophyDescription?: PortableTextBlock[]
    deliverables?: { title: string; description: string }[]
    outcomes?: string[]
    whoItsFor?: string[]
    whoItsNotFor?: string[]
    price?: number
    currency?: string
    eventId: string
    comparisonTable?: { feature: string; withoutSuper30: string; withSuper30: string }[]
    saleEndsAt?: string
    logoMarquee?: any[]
    videoTestimonials?: { videoUrl: string; overlayText?: string }[]
    statsCounter?: { label: string; value: number; suffix?: string }[]
    caseStudies?: { name: string; outcomeMetrics: string; description?: string }[]
    testimonials?: { name: string; text: string; image?: any }[]
    faq?: { question: string; answer: string }[]
    whatsappLink?: string
    isActive?: boolean
    isSoldOut?: boolean
}
