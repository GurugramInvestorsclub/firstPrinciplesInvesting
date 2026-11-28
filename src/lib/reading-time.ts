export function calculateReadingTime(bodyOrWordCount?: any[] | number): string {
    if (typeof bodyOrWordCount === "number") {
        if (bodyOrWordCount <= 0) return "15 min read"
        const min = Math.ceil(bodyOrWordCount / 220)
        return `${min} min read`
    }

    if (!bodyOrWordCount || !Array.isArray(bodyOrWordCount)) return "15 min read"

    let text = ""
    bodyOrWordCount.forEach((block: any) => {
        if (block._type === "block" && block.children) {
            block.children.forEach((child: any) => {
                if (child.text) {
                    text += " " + child.text
                }
            })
        }
    })

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length
    if (wordCount === 0) return "15 min read"
    const min = Math.ceil(wordCount / 220)
    return `${min} min read`
}
