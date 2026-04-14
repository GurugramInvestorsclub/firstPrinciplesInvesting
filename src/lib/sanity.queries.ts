import { groq } from 'next-sanity'

export const postQuery = groq`
  *[_type == "post" && (!defined($search) || title match $search + "*" || excerpt match $search + "*")] | order(publishedAt desc) {
    title,
    slug,
    isFeatured,
    excerpt,
    access,
    mainImage,
    publishedAt
  }
`

// Fetch the single most recently updated featured post
export const featuredPostQuery = groq`
  *[_type == "post" && isFeatured == true] | order(_updatedAt desc)[0] {
    title,
    slug,
    isFeatured,
    excerpt,
    access,
    mainImage,
    publishedAt
  }
`

// Fetch ALL posts, ordered by date
export const allPostsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    title,
    slug,
    isFeatured,
    excerpt,
    access,
    mainImage,
    publishedAt
  }
`

export const recentPostsQuery = groq`
  *[_type == "post"] | order(publishedAt desc)[0...3] {
    title,
    slug,
    excerpt,
    access,
    publishedAt,
    mainImage
  }
`

export const singlePostQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    title,
    slug,
    excerpt,
    access,
    mainImage,
    publishedAt,
    body,
    previewBody,
    paywallHeadline,
    paywallCtaText
  }
`

export const eventsQuery = groq`
  *[_type == "event" && date >= now()] | order(date asc) {
    eventId,
    title,
    slug,
    date,
    location,
    price,
    shortDescription,
    image,
    registrationLink
  }
`

export const upcomingEventsHomeQuery = groq`
  *[_type == "event" && date >= now()] | order(date asc)[0...3] {
    eventId,
    title,
    slug,
    date,
    location,
    price,
    shortDescription,
    image,
    registrationLink
  }
`

export const singleEventQuery = groq`
  *[_type == "event" && slug.current == $slug][0] {
    eventId,
    title,
    subHeading,
    slug,
    date,
    location,
    price,
    highlightStat,
    shortDescription,
    whyThisMatters,
    learningPoints,
    targetAudience,
    speaker,
    agenda,
    faq,
    longDescription,
    registrationLink,
    whatsappLink,
    image
  }
`

export const pastEventsQuery = groq`
  *[_type == "event" && date < now()] | order(date desc) {
    eventId,
    title,
    slug,
    date,
    location,
    price,
    shortDescription,
    image
  }
`

export const testimonialsQuery = groq`
  *[_type == "testimonial"] | order(_createdAt desc) {
    name,
    role,
    quote,
    photo
  }
`

export const allSuper30ProgramsQuery = groq`
  *[_type == "super30Program" && isActive == true] | order(_createdAt desc) {
    _id,
    title,
    slug,
    batchName,
    tagline,
    shortDescription,
    seatsAvailable,
    applicationDeadline,
    price,
    eventId,
    isSoldOut
  }
`

export const singleSuper30Query = groq`
  *[_type == "super30Program" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    batchName,
    tagline,
    shortDescription,
    headline,
    subheadline,
    heroVideo,
    investorsEducated,
    batchNumber,
    seatsRemaining,
    applyByDate,
    socialProofBadge,
    ctaText,
    seatsAvailable,
    applicationDeadline,
    painPoints,
    philosophyHeading,
    philosophyDescription,
    deliverables,
    outcomes,
    whoItsFor,
    whoItsNotFor,
    price,
    currency,
    eventId,
    comparisonTable,
    saleEndsAt,
    logoMarquee,
    videoTestimonials,
    statsCounter,
    caseStudies,
    testimonials,
    faq,
    whatsappLink,
    isActive,
    isSoldOut
  }
`
