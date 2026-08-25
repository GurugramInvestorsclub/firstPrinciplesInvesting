"use client"

import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"

// Shared animation helpers (see design_handoff_super30/README.md)
const seg = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)))
const ease = (x: number) => 1 - Math.pow(1 - x, 3)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const MONO = "var(--font-s30-mono), 'IBM Plex Mono', monospace"
const SERIF = "var(--font-s30-serif), 'Instrument Serif', serif"
const SANS = "var(--font-s30-sans), 'IBM Plex Sans', sans-serif"

const mono = (size: number, fill: string, ls?: string): React.CSSProperties => ({
    fontFamily: MONO,
    fontSize: size,
    letterSpacing: ls || ".1em",
    fill,
})
const serif = (size: number, fill: string): React.CSSProperties => ({
    fontFamily: SERIF,
    fontSize: size,
    fill,
})

function usePrefersReducedMotion() {
    return useSyncExternalStore(
        (onStoreChange) => {
            const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
            mq.addEventListener("change", onStoreChange)
            return () => mq.removeEventListener("change", onStoreChange)
        },
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        () => false
    )
}

// One normalised clock per figure: t in [0,1) over `period` seconds.
// Reduced motion freezes every clock at t = 0.34 (a legible static frame).
function useClock(period: number) {
    const reduced = usePrefersReducedMotion()
    const [t, setT] = useState(0.34)
    useEffect(() => {
        if (reduced) return
        let raf: number
        const start = performance.now()
        const step = (n: number) => {
            setT((((n - start) / 1000) / period) % 1)
            raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
    }, [period, reduced])
    return reduced ? 0.34 : t
}

const rnd = (n: number) => {
    const v = Math.sin(n * 12.9898) * 43758.5453
    return v - Math.floor(v)
}

const svgStyle: React.CSSProperties = { width: "100%", height: "100%", display: "block", overflow: "visible" }

// Ambient sine-wave backdrop behind the hero and register sections (30s).
export function HeroFig() {
    const t = useClock(30)
    const line = (amp: number, ph: number, base: number, cycles: number) => {
        let d = ""
        for (let x = 0; x <= 1440; x += 10) {
            const y = base + amp * Math.sin((x / 1440) * Math.PI * 2 * cycles + ph + t * Math.PI * 2)
            d += (x === 0 ? "M" : "L") + x + " " + y.toFixed(1)
        }
        return d
    }
    return (
        <svg viewBox="0 0 1440 560" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <path d={line(64, 0, 300, 1.5)} fill="none" strokeWidth={1.1} style={{ stroke: "var(--ac)", opacity: 0.55 }} />
            <path d={line(46, 1.6, 352, 2)} fill="none" strokeWidth={1} style={{ stroke: "#F4F1EA", opacity: 0.14 }} />
            <path d={line(88, 3.1, 400, 1)} fill="none" strokeWidth={1} style={{ stroke: "var(--ac)", opacity: 0.3 }} />
            <path d={line(34, 4.4, 470, 2.6)} fill="none" strokeWidth={1} style={{ stroke: "#F4F1EA", opacity: 0.1 }} />
        </svg>
    )
}

// Abstract "Super30 Investment Network" — 30 cohort nodes, first-principles central core,
// controlled connections, information flow particles, mouse parallax, and periodic convergence.
export function SeatsFig({ seatCount = 30 }: { seatCount?: number }) {
    const t = useClock(25)
    const cx = 280
    const cy = 290

    const svgRef = useRef<SVGSVGElement | null>(null)
    const [mouse, setMouse] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false })

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return
        const rect = svgRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
        setMouse({ x, y, active: true })
    }

    const handleMouseLeave = () => {
        setMouse({ x: 0, y: 0, active: false })
    }

    // Generate 30 cohort nodes in 3 concentric architectural orbits around (cx, cy)
    const nodes = useMemo(() => {
        const arr: { id: number; x: number; y: number; layer: number; phase: number; isConvergeTarget?: boolean }[] = []
        let id = 0

        // Inner Orbit: 8 nodes at R = 125
        for (let i = 0; i < 8; i++) {
            const angle = i * ((Math.PI * 2) / 8) - Math.PI / 2
            arr.push({
                id: id++,
                x: cx + 125 * Math.cos(angle),
                y: cy + 125 * Math.sin(angle),
                layer: 1,
                phase: i * 0.7 + 0.2,
                isConvergeTarget: i % 2 === 0,
            })
        }

        // Middle Orbit: 12 nodes at R = 195
        for (let i = 0; i < 12; i++) {
            const angle = i * ((Math.PI * 2) / 12) - Math.PI / 2 + Math.PI / 12
            arr.push({
                id: id++,
                x: cx + 195 * Math.cos(angle),
                y: cy + 195 * Math.sin(angle),
                layer: 2,
                phase: i * 0.5 + 1.1,
                isConvergeTarget: i % 3 === 0,
            })
        }

        // Outer Orbit: 10 nodes at R = 248
        for (let i = 0; i < 10; i++) {
            const angle = i * ((Math.PI * 2) / 10) - Math.PI / 2 + Math.PI / 20
            arr.push({
                id: id++,
                x: cx + 248 * Math.cos(angle),
                y: cy + 248 * Math.sin(angle),
                layer: 3,
                phase: i * 0.9 + 2.3,
                isConvergeTarget: i % 4 === 0,
            })
        }

        return arr
    }, [cx, cy])

    // Generate controlled structural connections
    const connections = useMemo(() => {
        const lines: { n1: number; n2?: number; isCore?: boolean }[] = []
        // Connect all nodes to central core
        nodes.forEach((n) => {
            lines.push({ n1: n.id, isCore: true })
        })
        // Connect ring neighbors and ring-to-ring neighbors
        nodes.forEach((n, i) => {
            if (n.layer === 1) {
                const nextInner = (i + 1) % 8
                lines.push({ n1: n.id, n2: nextInner })
                const targetMiddle = 8 + (i * 12) / 8
                lines.push({ n1: n.id, n2: Math.floor(targetMiddle) })
            } else if (n.layer === 2) {
                const nextMiddle = 8 + ((i - 8 + 1) % 12)
                lines.push({ n1: n.id, n2: nextMiddle })
                const targetOuter = 20 + Math.floor(((i - 8) * 10) / 12)
                if (targetOuter < 30) {
                    lines.push({ n1: n.id, n2: targetOuter })
                }
            }
        })
        return lines
    }, [nodes])

    const timeSec = t * 25
    const entranceCore = seg(timeSec, 0, 0.5)
    const entranceLines = seg(timeSec, 1.2, 2.4)

    const convCycle = (timeSec % 10) / 10
    const convIntensity = seg(convCycle, 0.82, 0.9) * (1 - seg(convCycle, 0.9, 0.98))

    const coreRot1 = (t * 360).toFixed(1)
    const coreRot2 = (-t * 360 * 1.25).toFixed(1)

    const cursorSvgX = cx + mouse.x * 240
    const cursorSvgY = cy + mouse.y * 250

    return (
        <svg
            ref={svgRef}
            viewBox="0 0 560 600"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ ...svgStyle, cursor: "crosshair" }}
        >
            <defs>
                <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--ac)" stopOpacity={0.35 + 0.3 * convIntensity} />
                    <stop offset="60%" stopColor="#8A5D1C" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#12110F" stopOpacity={0} />
                </radialGradient>
                <radialGradient id="nodePulseGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--ac)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="var(--ac)" stopOpacity={0} />
                </radialGradient>
            </defs>

            {/* Layer 1: Background Architectural Arcs (Parallax ~ 1.8px) */}
            <g transform={`translate(${(mouse.x * 1.8).toFixed(2)}, ${(mouse.y * 1.8).toFixed(2)})`}>
                <circle cx={cx} cy={cy} r={265} fill="none" stroke="#F4F1EA" strokeWidth={1} strokeDasharray="3 8" style={{ opacity: 0.07 }} />
                <circle cx={cx} cy={cy} r={205} fill="none" stroke="var(--ac)" strokeWidth={1} strokeDasharray="2 6" style={{ opacity: 0.12 }} />
                <circle cx={cx} cy={cy} r={135} fill="none" stroke="#F4F1EA" strokeWidth={1} strokeDasharray="4 10" style={{ opacity: 0.09 }} />
            </g>

            {/* Layer 2: Network Connections & Information Flow (Parallax ~ 3.2px) */}
            <g transform={`translate(${(mouse.x * 3.2).toFixed(2)}, ${(mouse.y * 3.2).toFixed(2)})`}>
                {connections.map((c, idx) => {
                    const n1 = nodes[c.n1]
                    const n2 = c.isCore ? { x: cx, y: cy } : nodes[c.n2!]
                    if (!n1 || !n2) return null

                    const lineProgress = seg(entranceLines, (c.n1 / 30) * 0.5, (c.n1 / 30) * 0.5 + 0.5)
                    if (lineProgress <= 0) return null

                    let proximityOpacity = 0
                    if (mouse.active) {
                        const d1 = Math.hypot(cursorSvgX - n1.x, cursorSvgY - n1.y)
                        const d2 = Math.hypot(cursorSvgX - n2.x, cursorSvgY - n2.y)
                        if (d1 < 100 || d2 < 100) proximityOpacity = 0.25
                    }

                    const isHighlight = c.isCore && n1.isConvergeTarget && convIntensity > 0
                    const strokeOp = isHighlight
                        ? 0.15 + 0.45 * convIntensity
                        : Math.min(1, lineProgress) * (0.08 + (c.isCore ? 0.06 : 0) + proximityOpacity)

                    return (
                        <line
                            key={"conn-" + idx}
                            x1={n1.x.toFixed(1)}
                            y1={n1.y.toFixed(1)}
                            x2={n2.x.toFixed(1)}
                            y2={n2.y.toFixed(1)}
                            stroke={isHighlight ? "var(--ac)" : c.isCore ? "var(--ac)" : "#F4F1EA"}
                            strokeWidth={isHighlight ? 1.6 : 1}
                            style={{ opacity: strokeOp, transition: "opacity 0.3s ease" }}
                        />
                    )
                })}

                {/* Information Particles travelling along selected connections */}
                {nodes
                    .filter((n) => n.id % 4 === 0)
                    .map((n, pIdx) => {
                        const pTime = (t * 25 * 0.2 + pIdx * 0.25) % 1
                        const px = n.x + (cx - n.x) * pTime
                        const py = n.y + (cy - n.y) * pTime
                        const pOpacity = Math.sin(pTime * Math.PI) * 0.75 * (1 + convIntensity)
                        return (
                            <circle
                                key={"part-" + pIdx}
                                cx={px.toFixed(1)}
                                cy={py.toFixed(1)}
                                r={2}
                                style={{ fill: "var(--ac)", opacity: pOpacity }}
                            />
                        )
                    })}
            </g>

            {/* Layer 3: Central Core & Inner Structure (Parallax ~ 5.5px) */}
            <g transform={`translate(${(mouse.x * 5.5).toFixed(2)}, ${(mouse.y * 5.5).toFixed(2)})`}>
                <circle cx={cx} cy={cy} r={95} fill="url(#coreGlow)" style={{ opacity: Math.min(1, entranceCore * 1.5) }} />

                <g transform={`rotate(${coreRot1} ${cx} ${cy})`} style={{ opacity: 0.3 + 0.3 * convIntensity }}>
                    <polygon
                        points={[0, 45, 90, 135, 180, 225, 270, 315]
                            .map((deg) => {
                                const rad = (deg * Math.PI) / 180
                                return `${(cx + 72 * Math.cos(rad)).toFixed(1)},${(cy + 72 * Math.sin(rad)).toFixed(1)}`
                            })
                            .join(" ")}
                        fill="none"
                        stroke="var(--ac)"
                        strokeWidth={1}
                        strokeDasharray="4 6"
                    />
                </g>

                <g transform={`rotate(${coreRot2} ${cx} ${cy})`} style={{ opacity: 0.4 + 0.4 * convIntensity }}>
                    <rect
                        x={cx - 38}
                        y={cy - 38}
                        width={76}
                        height={76}
                        fill="none"
                        stroke="#F4F1EA"
                        strokeWidth={1}
                        style={{ opacity: 0.25 }}
                    />
                    <polygon
                        points={`${cx},${cy - 48} ${cx + 48},${cy} ${cx},${cy + 48} ${cx - 48},${cy}`}
                        fill="rgba(138,93,28,0.06)"
                        stroke="var(--ac)"
                        strokeWidth={1.2}
                    />
                </g>

                {/* Site Brand Logo (The Brain logo) */}
                <image
                    href="/logo.png"
                    x={cx - 32}
                    y={cy - 32}
                    width={64}
                    height={64}
                    preserveAspectRatio="xMidYMid meet"
                    style={{
                        opacity: Math.min(1, entranceCore * 1.5),
                        filter: `drop-shadow(0 0 12px rgba(181,122,40,${(0.5 + 0.4 * convIntensity).toFixed(2)}))`,
                        transition: "filter 0.3s ease",
                    }}
                />
            </g>

            {/* Layer 4: 30 Cohort Nodes (Parallax ~ 4.2px) */}
            <g transform={`translate(${(mouse.x * 4.2).toFixed(2)}, ${(mouse.y * 4.2).toFixed(2)})`}>
                {nodes.map((n) => {
                    const nodeEntrance = seg(timeSec, 0.4 + (n.id / 30) * 0.9, 0.4 + (n.id / 30) * 0.9 + 0.3)
                    if (nodeEntrance <= 0) return null

                    const breatheOsc = 0.5 + 0.5 * Math.sin(timeSec * 2.2 + n.phase)
                    const baseRadius = n.layer === 1 ? 3.8 : n.layer === 2 ? 3.4 : 3.0
                    const nodeR = baseRadius + breatheOsc * 0.8

                    let isHovered = false
                    let hoverBoost = 0
                    if (mouse.active) {
                        const dist = Math.hypot(cursorSvgX - n.x, cursorSvgY - n.y)
                        if (dist < 90) {
                            isHovered = true
                            hoverBoost = (1 - dist / 90) * 0.6
                        }
                    }

                    const isConvTarget = n.isConvergeTarget && convIntensity > 0
                    const convBoost = isConvTarget ? convIntensity * 0.5 : 0

                    const nodeOpacity = Math.min(
                        1,
                        nodeEntrance * (0.55 + breatheOsc * 0.35 + hoverBoost + convBoost)
                    )
                    const finalRadius = nodeR + hoverBoost * 2 + convBoost * 1.5

                    return (
                        <g key={"node-" + n.id}>
                            {(isHovered || isConvTarget) && (
                                <circle
                                    cx={n.x.toFixed(1)}
                                    cy={n.y.toFixed(1)}
                                    r={(finalRadius * 2.4).toFixed(1)}
                                    fill="url(#nodePulseGlow)"
                                    style={{ opacity: hoverBoost + convBoost }}
                                />
                            )}
                            <circle
                                cx={n.x.toFixed(1)}
                                cy={n.y.toFixed(1)}
                                r={finalRadius.toFixed(2)}
                                style={{
                                    fill: isConvTarget || isHovered ? "var(--ac)" : n.layer === 1 ? "var(--ac)" : "#F4F1EA",
                                    opacity: nodeOpacity,
                                    transition: "opacity 0.2s ease",
                                }}
                            />
                        </g>
                    )
                })}
            </g>

            {/* Bottom Caption Badge */}
            <text x={cx} y={582} textAnchor="middle" style={mono(11, "#8A8578", ".18em")}>
                {`${seatCount} COHORT MEMBERS · FIRST PRINCIPLES SYSTEM`}
            </text>
        </svg>
    )
}

// Thirty cells filling green bottom-up in a shuffled order (11s). Caption lives in HTML.
export function SeatStripFig({ count = 30 }: { count?: number }) {
    const t = useClock(11)
    const order = useMemo(() => {
        const a: { i: number; s: number }[] = []
        for (let i = 0; i < count; i++) a.push({ i, s: rnd(i + 11) })
        a.sort((x, y) => x.s - y.s)
        const m: Record<number, number> = {}
        a.forEach((o, k) => {
            m[o.i] = (k + 1) / count
        })
        return m
    }, [count])
    const fill = seg(t, 0.05, 0.8)
    const cells: React.ReactNode[] = []
    for (let i = 0; i < count; i++) {
        const p = seg(fill, order[i] - 0.034, order[i])
        const x = i * 11.2
        cells.push(
            <g key={"c" + i}>
                <rect x={x} y={1} width={8} height={26} strokeWidth={1} style={{ fill: "none", stroke: "#F4F1EA", opacity: 0.22 }} />
                {p > 0 ? <rect x={x} y={1 + 26 * (1 - p)} width={8} height={26 * p} style={{ fill: "var(--go)", opacity: 0.4 + 0.6 * p }} /> : null}
            </g>
        )
    }
    return (
        <svg viewBox={`0 0 ${(count * 11.2).toFixed(1)} 28`} style={{ width: "100%", height: "100%", display: "block" }}>
            <g>{cells}</g>
        </svg>
    )
}

// Price leading capacity around a full cycle, with the active quarter lit (22s).
export function CyclicalsFig() {
    const t = useClock(22)
    const W = 1000
    const price = (u: number) => 176 + 96 * Math.cos(u * Math.PI * 2)
    const supply = (u: number) => 206 + 74 * Math.cos((u - 0.18) * Math.PI * 2)
    const mk = (f: (u: number) => number) => {
        let d = ""
        for (let i = 0; i <= 200; i++) {
            const u = i / 200
            d += (i ? "L" : "M") + (u * W).toFixed(1) + " " + f(u).toFixed(1)
        }
        return d
    }
    const phases: [string, string][] = [
        ["Trough", "capex frozen, supply shrinks"],
        ["Upturn", "price moves, earnings follow"],
        ["Peak", "new capacity lands"],
        ["Downturn", "overhang, margins give it back"],
    ]
    const idx = Math.min(3, Math.floor(t * 4))
    const mx = t * W
    const my = price(t)
    return (
        <svg viewBox="0 0 1000 400" style={svgStyle}>
            <g>
                {[0.25, 0.5, 0.75].map((u, i) => (
                    <line key={"g" + i} x1={u * W} x2={u * W} y1={40} y2={300} strokeWidth={1} strokeDasharray="2 5" style={{ stroke: "#F4F1EA", opacity: 0.16 }} />
                ))}
            </g>
            <rect x={idx * 250} y={40} width={250} height={260} style={{ fill: "var(--ac)", opacity: 0.07 }} />
            <line x1={0} x2={W} y1={300} y2={300} strokeWidth={1} style={{ stroke: "#F4F1EA", opacity: 0.3 }} />
            <path d={mk(supply)} fill="none" strokeWidth={1.4} strokeDasharray="5 5" style={{ stroke: "#F4F1EA", opacity: 0.38 }} />
            <path d={mk(price)} fill="none" strokeWidth={2.2} style={{ stroke: "var(--ac)" }} />
            <line x1={mx} x2={mx} y1={my} y2={300} strokeWidth={1} style={{ stroke: "var(--ac)", opacity: 0.45 }} />
            <circle cx={mx} cy={my} r={6.5} style={{ fill: "var(--ac)" }} />
            <circle cx={mx} cy={my} r={14} strokeWidth={1} fill="none" style={{ stroke: "var(--ac)", opacity: 0.4 }} />
            <text x={8} y={62} style={mono(12, "#B57A28")}>
                PRICE
            </text>
            <text x={8} y={84} style={mono(12, "#8A8578")}>
                CAPACITY
            </text>
            <g>
                {phases.map((p, i) => (
                    <g key={"p" + i}>
                        <text x={i * 250 + 14} y={332} style={mono(12, i === idx ? "#B57A28" : "#6E6A60", ".14em")}>
                            {"0" + (i + 1)}
                        </text>
                        <text x={i * 250 + 44} y={332} style={serif(24, i === idx ? "#F4F1EA" : "#6E6A60")}>
                            {p[0]}
                        </text>
                        <text x={i * 250 + 14} y={360} style={{ fontFamily: SANS, fontSize: 13, fill: i === idx ? "rgba(244,241,234,.66)" : "#4E4B45" }}>
                            {p[1]}
                        </text>
                    </g>
                ))}
            </g>
        </svg>
    )
}

// One listed entity splitting into two separately priced businesses (17s, on paper).
export function DemergerFig() {
    const t = useClock(17)
    const fade = seg(t, 0.06, 0.16)
    const sx = ease(seg(t, 0.18, 0.44))
    const sy = ease(seg(t, 0.46, 0.62))
    const s1 = seg(t, 0.18, 0.62)
    const s2 = ease(seg(t, 0.6, 0.88))
    const s3 = seg(t, 0.62, 0.94)
    const box = (fromX: number, fromY: number, fromH: number, toX: number, toY: number, toH: number) => ({
        x: lerp(fromX, toX, sx),
        y: lerp(fromY, toY, sy),
        w: 300,
        h: lerp(fromH, toH, sy),
    })
    const a = box(350, 92, 100, 118, 116, 122)
    const b = box(350, 192, 100, 582, 116, 122)
    const bar = (x: number, y: number, w: number) => [
        <line key={"bt" + x} x1={x} x2={x + 300} y1={y} y2={y} strokeWidth={1} style={{ stroke: "#12110F", opacity: 0.16 }} />,
        <rect key={"br" + x} x={x} y={y + 10} width={Math.max(0, w * s2)} height={12} style={{ fill: "var(--ac)" }} />,
    ]
    return (
        <svg viewBox="0 0 1000 400" style={svgStyle}>
            <rect x={344} y={86} width={312} height={212} fill="none" strokeWidth={1} strokeDasharray="4 6" style={{ stroke: "#12110F", opacity: 0.5 * (1 - fade) }} />
            <text x={500} y={74} textAnchor="middle" style={{ ...mono(12, "#12110F", ".16em"), opacity: 1 - fade }}>
                ONE LISTED ENTITY, ONE MULTIPLE
            </text>
            <line x1={344} x2={656} y1={192} y2={192} strokeWidth={1.4} strokeDasharray="6 5" style={{ stroke: "#A93B32", opacity: (1 - fade) * 0.9 }} />
            <rect x={a.x} y={a.y} width={a.w} height={a.h} strokeWidth={1.4} style={{ fill: "#12110F", stroke: "#12110F" }} />
            <text x={a.x + 22} y={a.y + 40} style={mono(11, "#B57A28", ".16em")}>
                CORE
            </text>
            <text x={a.x + 22} y={a.y + 76} style={serif(28, "#F4F1EA")}>
                Visible business
            </text>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} strokeWidth={1.4} style={{ fill: "none", stroke: "#12110F", opacity: 0.55 }} />
            <text x={b.x + 22} y={b.y + 40} style={mono(11, "#8A5D1C", ".16em")}>
                DEMERGED
            </text>
            <text x={b.x + 22} y={b.y + 76} style={serif(28, "#12110F")}>
                Hidden business
            </text>
            <g style={{ opacity: s1 }}>
                {bar(a.x, 268, 190)}
                {bar(b.x, 268, 264)}
                <text x={a.x} y={306} style={mono(12, "#77726A")}>
                    PRICED SEPARATELY
                </text>
                <text x={b.x} y={306} style={mono(12, "#77726A")}>
                    PRICED SEPARATELY
                </text>
            </g>
            <text x={500} y={366} textAnchor="middle" style={{ ...serif(30, "#12110F"), opacity: s1 }}>
                {"Sum of parts " + (1 + 0.42 * s3).toFixed(2) + "× the parent"}
            </text>
        </svg>
    )
}

// Crowded red ocean vs open blue ocean, margins diverging (20s).
export function OceanFig() {
    const t = useClock(20)
    const dots: React.ReactNode[] = []
    for (let i = 0; i < 32; i++) {
        const bx = 120 + (i % 8) * 34
        const by = 152 + Math.floor(i / 8) * 38
        const jx = Math.sin(t * Math.PI * 2 * 1.4 + i * 1.73) * 7
        const jy = Math.cos(t * Math.PI * 2 * 1.1 + i * 2.31) * 6
        dots.push(<circle key={"r" + i} cx={bx + jx} cy={by + jy} r={5.4} style={{ fill: "#A93B32", opacity: 0.8 }} />)
    }
    const blues = ([[640, 168], [790, 250], [880, 140]] as [number, number][]).map((p, i) => {
        const jx = Math.sin(t * Math.PI * 2 * 0.4 + i * 2.1) * 16
        const jy = Math.cos(t * Math.PI * 2 * 0.33 + i * 1.3) * 12
        return <circle key={"b" + i} cx={p[0] + jx} cy={p[1] + jy} r={i === 0 ? 11 : 6} style={{ fill: "#2E6FA7", opacity: i === 0 ? 0.95 : 0.55 }} />
    })
    const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2)
    return (
        <svg viewBox="0 0 1000 400" style={svgStyle}>
            <text x={96} y={40} style={mono(12, "#A93B32", ".16em")}>
                RED OCEAN
            </text>
            <text x={96} y={66} style={{ fontFamily: SANS, fontSize: 14, fill: "rgba(244,241,234,.55)" }}>
                Same product, same customer. Price is the only lever.
            </text>
            <rect x={96} y={92} width={300} height={200} fill="none" strokeWidth={1} style={{ stroke: "#A93B32", opacity: 0.45 }} />
            <g>{dots}</g>
            <line x1={96} x2={396} y1={318} y2={318 + 26 * pulse} strokeWidth={1.6} style={{ stroke: "#A93B32", opacity: 0.85 }} />
            <text x={96} y={378} style={mono(12, "#8A8578")}>
                {"MARGIN ↓"}
            </text>
            <line x1={500} x2={500} y1={20} y2={380} strokeWidth={1} strokeDasharray="3 7" style={{ stroke: "#F4F1EA", opacity: 0.2 }} />
            <text x={604} y={40} style={mono(12, "#2E6FA7", ".16em")}>
                BLUE OCEAN
            </text>
            <text x={604} y={66} style={{ fontFamily: SANS, fontSize: 14, fill: "rgba(244,241,234,.55)" }}>
                A market largely created by the business itself.
            </text>
            <rect x={604} y={92} width={300} height={200} fill="none" strokeWidth={1} style={{ stroke: "#2E6FA7", opacity: 0.35 }} />
            <g>{blues}</g>
            <line x1={604} x2={904} y1={318} y2={318 - 26 * pulse} strokeWidth={1.6} style={{ stroke: "#2E6FA7", opacity: 0.9 }} />
            <text x={604} y={378} style={mono(12, "#8A8578")}>
                {"MARGIN ↑"}
            </text>
        </svg>
    )
}

// A scan line sweeping annual data points from 2005 to 2025, flagging alpha compounding.
export function AlphaFig() {
    const t = useClock(16)
    const x0 = 110
    const x1 = 920
    const yTop = 50
    const yBottom = 380

    const getX = (yr: number) => x0 + ((yr - 2005) / 20.7) * (x1 - x0)
    const getY = (val: number) => yBottom - (val / 40.0) * (yBottom - yTop)

    const rawData: { yr: number; val: number; label: string; textDy?: number; textDx?: number }[] = [
        { yr: 2005, val: 28.66, label: "28.66%", textDy: -12, textDx: -4 },
        { yr: 2006, val: 23.58, label: "23.58%", textDy: -12 },
        { yr: 2007, val: 16.56, label: "16.56%", textDy: -12 },
        { yr: 2008, val: 12.70, label: "12.70%", textDy: -12 },
        { yr: 2009, val: 4.49, label: "4.49%", textDy: -12, textDx: -6 },
        { yr: 2010, val: 9.76, label: "9.76%", textDy: -12 },
        { yr: 2011, val: 30.88, label: "30.88%", textDy: -14 },
        { yr: 2012, val: 2.13, label: "2.13%", textDy: -10 },
        { yr: 2013, val: 3.43, label: "3.43%", textDy: -12 },
        { yr: 2014, val: 2.03, label: "2.03%", textDy: -10 },
        { yr: 2015, val: 23.83, label: "23.83%", textDy: -14 },
        { yr: 2016, val: 16.76, label: "16.76%", textDy: -12 },
        { yr: 2017, val: 6.00, label: "6.00%", textDy: -12 },
        { yr: 2018, val: 13.17, label: "13.17%", textDy: -12 },
        { yr: 2019, val: 5.48, label: "5.48%", textDy: -12 },
        { yr: 2020, val: 0.84, label: "0.84%", textDy: -10, textDx: 2 },
        { yr: 2021, val: 3.04, label: "3.04%", textDy: -12 },
        { yr: 2022, val: 30.18, label: "30.18%", textDy: -14 },
        { yr: 2023, val: 11.78, label: "11.78%", textDy: -12 },
        { yr: 2024, val: 8.71, label: "8.71%", textDy: -12 },
        { yr: 2025, val: 17.79, label: "17.79%", textDy: -14 },
        { yr: 2025.7, val: 4.82, label: "4.82%", textDy: -10 },
    ]

    const pts = rawData.map((d) => ({
        ...d,
        x: getX(d.yr),
        y: getY(d.val),
    }))

    const fullPath = pts.reduce((acc, pt, i) => acc + (i === 0 ? "M" : " L") + pt.x.toFixed(1) + " " + pt.y.toFixed(1), "")

    const scanProgress = seg(t, 0.04, 0.96)
    const scanX = x0 + (x1 - x0) * scanProgress

    // Build SVG path segment up to scanX
    let scannedPath = ""
    for (let i = 0; i < pts.length; i++) {
        const pt = pts[i]
        if (i === 0) {
            scannedPath += `M${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
        } else {
            const prev = pts[i - 1]
            if (scanX >= pt.x) {
                scannedPath += ` L${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
            } else if (scanX > prev.x) {
                const ratio = (scanX - prev.x) / (pt.x - prev.x)
                const interpY = prev.y + (pt.y - prev.y) * ratio
                scannedPath += ` L${scanX.toFixed(1)} ${interpY.toFixed(1)}`
                break
            } else {
                break
            }
        }
    }

    const yGridValues = [40, 30, 20, 10, 0]
    const xGridYears = [2005, 2010, 2015, 2020, 2025]

    return (
        <svg viewBox="0 0 1000 470" style={svgStyle}>
            {/* Grid lines (horizontal & vertical dotted lines) */}
            <g>
                {yGridValues.map((v) => {
                    const y = getY(v)
                    return (
                        <g key={"yg-" + v}>
                            <line
                                x1={x0}
                                x2={x1}
                                y1={y}
                                y2={y}
                                strokeWidth={1}
                                strokeDasharray="3 4"
                                style={{ stroke: "#F4F1EA", opacity: 0.12 }}
                            />
                            <text x={x0 - 16} y={y + 4} textAnchor="end" style={mono(11, "#8A8578")}>
                                {v.toFixed(2)}%
                            </text>
                        </g>
                    )
                })}
                {xGridYears.map((yr) => {
                    const x = getX(yr)
                    return (
                        <g key={"xg-" + yr}>
                            <line
                                x1={x}
                                x2={x}
                                y1={yTop}
                                y2={yBottom}
                                strokeWidth={1}
                                strokeDasharray="3 4"
                                style={{ stroke: "#F4F1EA", opacity: 0.12 }}
                            />
                            <text x={x} y={yBottom + 24} textAnchor="middle" style={mono(12, "#8A8578")}>
                                {yr}
                            </text>
                        </g>
                    )
                })}
                <text x={(x0 + x1) / 2} y={yBottom + 54} textAnchor="middle" style={mono(12, "#8A8578", ".18em")}>
                    YEAR
                </text>
            </g>

            {/* Background Full Path (Dashed / Muted) */}
            <path d={fullPath} fill="none" stroke="var(--ac)" strokeWidth={1.4} strokeDasharray="3 3" style={{ opacity: 0.22 }} />

            {/* Active Scanned Path */}
            <path d={scannedPath} fill="none" stroke="var(--ac)" strokeWidth={2.4} style={{ opacity: 1 }} />

            {/* Data Points and Percentage Labels */}
            <g>
                {pts.map((pt, i) => {
                    const isRevealed = scanX >= pt.x - 3
                    return (
                        <g key={"pt-" + i}>
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isRevealed ? 3.5 : 2}
                                style={{
                                    fill: isRevealed ? "var(--ac)" : "#8A8578",
                                    opacity: isRevealed ? 1 : 0.25,
                                    transition: "opacity 0.2s ease",
                                }}
                            />
                            <text
                                x={pt.x + (pt.textDx || 0)}
                                y={pt.y + (pt.textDy || -12)}
                                textAnchor="middle"
                                style={{
                                    ...mono(11, isRevealed ? "#F4F1EA" : "rgba(244,241,234,0.3)"),
                                    fontWeight: isRevealed ? 500 : 400,
                                    opacity: isRevealed ? 1 : 0.2,
                                }}
                            >
                                {pt.label}
                            </text>
                        </g>
                    )
                })}
            </g>

            {/* Scan Line Overlay */}
            <line x1={scanX} x2={scanX} y1={yTop - 10} y2={yBottom + 10} strokeWidth={1.4} style={{ stroke: "var(--ac)", opacity: 0.8 }} />
            <rect x={scanX - 32} y={yTop - 10} width={32} height={yBottom - yTop + 20} style={{ fill: "var(--ac)", opacity: 0.08 }} />
            <text x={Math.min(scanX + 8, x1 - 40)} y={yTop - 16} style={mono(11, "#B57A28", ".16em")}>
                SCAN
            </text>
        </svg>
    )
}

