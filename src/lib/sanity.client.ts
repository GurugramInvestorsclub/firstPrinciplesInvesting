import { createClient } from 'next-sanity'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "no-sanity-project-id"
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2023-05-03"

// Dedicated server-side read token for private datasets.
// When SANITY_API_READ_TOKEN is set, queries run authenticated against the private dataset.
// If unset, it gracefully falls back to unauthenticated CDN queries for backward compatibility.
const readToken = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: !readToken,
  token: readToken || undefined,
})

export function getSanityWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN
  if (!token) {
    return null
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  })
}