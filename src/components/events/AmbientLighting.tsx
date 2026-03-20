export function AmbientLighting() {
    return (
        <div
            className="fixed inset-0 pointer-events-none z-[-1]"
            style={{
                background: `
                    radial-gradient(circle at 10% 20%, rgba(255,199,44,0.05), transparent 40%),
                    radial-gradient(circle at 90% 80%, rgba(255,199,44,0.03), transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(59,130,246,0.02), transparent 60%),
                    #0b0b0c
                `
            }}
        />
    )
}
