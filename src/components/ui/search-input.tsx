"use client"

import { Search, X } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"
import { cn } from "@/lib/utils"

export function SearchInput({ className }: { className?: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [value, setValue] = useState(searchParams.get("search") || "")

    // Update local state when URL params change (e.g. back button)
    useEffect(() => {
        setValue(searchParams.get("search") || "")
    }, [searchParams])

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set(name, value)
            } else {
                params.delete(name)
            }
            return params.toString()
        },
        [searchParams]
    )

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault()

        // Only trigger search if value changed (or if explicitly submitting same value, 
        // though typically we only care if it differs from current URL)
        // ideally we push even if same to allow "refresh" but for now let's just push
        startTransition(() => {
            router.push(`${pathname}?${createQueryString("search", value)}`, {
                scroll: false,
            })
        })
    }

    const handleClear = () => {
        setValue("")
        startTransition(() => {
            router.push(`${pathname}?${createQueryString("search", "")}`, {
                scroll: false,
            })
        })
    }

    return (
        <form
            onSubmit={handleSearch}
            className={cn(
                "relative w-full max-w-sm flex items-center rounded-full border border-text-secondary/20 bg-bg-deep pl-4 pr-1 py-1 transition-colors hover:border-gold/50 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold",
                className
            )}
        >
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search insights..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none min-w-0"
            />

            <div className="flex items-center gap-1 shrink-0 ml-2">
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-gold text-bg-deep hover:bg-gold-muted transition-colors disabled:opacity-50"
                    aria-label="Search"
                >
                    {isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-bg-deep border-t-transparent" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )}
                </button>
            </div>
        </form>
    )
}
