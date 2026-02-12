import { groq } from 'next-sanity'

export const postQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    body
  }
`

export const recentPostsQuery = groq`
  *[_type == "post"] | order(publishedAt desc)[0...3] {
    title,
    slug,
    excerpt,
    publishedAt,
    mainImage
  }
`

export const singlePostQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    body
  }
`

export const eventsQuery = groq`
  *[_type == "event" && date >= now()] | order(date asc) {
    title,
    slug,
    date,
    location,
    shortDescription,
    image,
    registrationLink
  }
`

export const singleEventQuery = groq`
  *[_type == "event" && slug.current == $slug][0] {
    title,
    subHeading,
    slug,
    date,
    location,
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
    image
  }
`

export const pastEventsQuery = groq`
  *[_type == "event" && date < now()] | order(date desc) {
    title,
    slug,
    date,
    location,
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
