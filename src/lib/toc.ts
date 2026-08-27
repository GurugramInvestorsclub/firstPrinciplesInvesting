export interface HeadingItem {
    id: string
    text: string
    level: number
}

/**
 * Convert heading text to a clean, URL-safe slug ID.
 * Handles numbers, special characters, and multiple spaces.
 */
export function slugifyHeading(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

/**
 * Recursively extract plain text from PortableText children.
 */
export function getPortableTextChildrenText(children: any[]): string {
    if (!Array.isArray(children)) return ""
    return children.map((c) => c?.text || "").join("")
}

/**
 * Parse PortableText body blocks and return an array of heading items.
 */
export function extractHeadings(body: any[]): HeadingItem[] {
    if (!Array.isArray(body) || body.length === 0) return []

    const headings: HeadingItem[] = []
    const usedSlugs = new Map<string, number>()

    body.forEach((block) => {
        if (block && block._type === "block" && /^h[1-6]$/.test(block.style)) {
            const level = parseInt(block.style.replace("h", ""), 10)
            const text = getPortableTextChildrenText(block.children)

            if (!text || !text.trim()) return

            let slug = slugifyHeading(text) || (block._key ? `heading-${block._key}` : "")
            if (!slug) return

            // Avoid duplicate IDs if the same heading text appears multiple times
            if (usedSlugs.has(slug)) {
                const count = usedSlugs.get(slug)! + 1
                usedSlugs.set(slug, count)
                slug = `${slug}-${count}`
            } else {
                usedSlugs.set(slug, 1)
            }

            headings.push({
                id: slug,
                text: text.trim(),
                level,
            })
        }
    })

    return headings
}
