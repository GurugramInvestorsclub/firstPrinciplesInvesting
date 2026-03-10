export function AmbientLighting() {
    return (
        <div
            className="fixed inset-0 pointer-events-none z-[-1]"
            style={{
                background: `
                    radial-gradient(circle at 20% 30%, rgba(255,199,44,0.08), transparent 40%),
                    radial-gradient(circle at 80% 70%, rgba(255,199,44,0.05), transparent 50%),
                    #0b0b0c
                `
            }}
        />
    )
}
