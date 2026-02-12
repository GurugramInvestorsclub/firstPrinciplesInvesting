export const metadata = {
    title: 'Next.js Studio',
    description: 'Sanity Studio for First Principles Investing',
}

export default function StudioLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body style={{ margin: 0 }}>{children}</body>
        </html>
    )
}
