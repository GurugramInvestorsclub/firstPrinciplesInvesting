"use client"

export function NoiseOverlay() {
    return (
        <div
            className="pointer-events-none fixed inset-0 z-[100] opacity-[0.04] mix-blend-overlay"
            style={{
                backgroundImage: "url('/noise.svg')",
                backgroundRepeat: "repeat",
            }}
            aria-hidden="true"
        />
    )
}
