"use client"

import { useState, useEffect } from "react"
import { Share2, Check } from "lucide-react"

export function ShareButton({ title, text }: { title: string, text?: string }) {
    const [isMounted, setIsMounted] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    const handleShare = async () => {
        const url = window.location.href;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: text || title,
                    url,
                })
            } catch (error) {
                // User aborted share or other error
                console.log('Error sharing', error)
            }
        } else {
            try {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } catch (error) {
                console.log('Error copying to clipboard', error)
            }
        }
    }

    return (
        <button
            onClick={handleShare}
            className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-black shadow-xl hover:bg-gold/90 transition-all hover:scale-105 active:scale-95 border-2 border-black/10"
            title="Share this article"
            aria-label="Share this article"
        >
            {copied ? (
                <Check className="h-6 w-6" />
            ) : (
                <Share2 className="h-6 w-6 ml-[-2px]" /> // Small offset to perfectly center the Share2 icon visually
            )}
        </button>
    )
}
