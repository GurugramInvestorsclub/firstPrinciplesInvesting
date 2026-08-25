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

// Anime-inspired Super30 Investment Masterclass Amphitheatre.
// Depicts 30 distinct cohort students + 1 teacher/mentor in a cinematic, elevated amphitheatre view.
export function SeatsFig({ seatCount = 30 }: { seatCount?: number }) {
    const t = useClock(24)
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

    const stageCx = 280
    const stageCy = 140

    // Generate 30 distinct student seats arranged across 4 curved amphitheatre rows
    const students = useMemo(() => {
        const list: {
            id: number
            row: number
            x: number
            y: number
            scale: number
            hairStyle: number
            actionType: number
            phase: number
        }[] = []

        let id = 0

        // Row 1 (Front Row): 6 students
        const r1Count = 6
        for (let i = 0; i < r1Count; i++) {
            const angle = -0.55 + (i / (r1Count - 1)) * 1.1
            const r = 115
            list.push({
                id: id++,
                row: 1,
                x: stageCx + r * Math.sin(angle),
                y: stageCy + r * Math.cos(angle) * 0.7 + 60,
                scale: 1.0,
                hairStyle: i % 4,
                actionType: i % 3,
                phase: i * 0.8,
            })
        }

        // Row 2 (Middle-Front Row): 7 students
        const r2Count = 7
        for (let i = 0; i < r2Count; i++) {
            const angle = -0.68 + (i / (r2Count - 1)) * 1.36
            const r = 185
            list.push({
                id: id++,
                row: 2,
                x: stageCx + r * Math.sin(angle),
                y: stageCy + r * Math.cos(angle) * 0.68 + 120,
                scale: 0.92,
                hairStyle: (i + 1) % 4,
                actionType: (i + 1) % 4,
                phase: i * 0.7 + 1.2,
            })
        }

        // Row 3 (Middle-Back Row): 8 students
        const r3Count = 8
        for (let i = 0; i < r3Count; i++) {
            const angle = -0.76 + (i / (r3Count - 1)) * 1.52
            const r = 260
            list.push({
                id: id++,
                row: 3,
                x: stageCx + r * Math.sin(angle),
                y: stageCy + r * Math.cos(angle) * 0.65 + 185,
                scale: 0.84,
                hairStyle: (i + 2) % 4,
                actionType: (i + 2) % 3,
                phase: i * 0.6 + 2.1,
            })
        }

        // Row 4 (Back Row): 9 students
        const r4Count = 9
        for (let i = 0; i < r4Count; i++) {
            const angle = -0.82 + (i / (r4Count - 1)) * 1.64
            const r = 340
            list.push({
                id: id++,
                row: 4,
                x: stageCx + r * Math.sin(angle),
                y: stageCy + r * Math.cos(angle) * 0.62 + 250,
                scale: 0.76,
                hairStyle: (i + 3) % 4,
                actionType: (i + 3) % 4,
                phase: i * 0.5 + 3.4,
            })
        }

        return list
    }, [stageCx, stageCy])

    const timeSec = t * 24
    const envProgress = seg(timeSec, 0, 0.6)
    const stageProgress = seg(timeSec, 0.4, 1.0)
    const lightsBreathe = 0.5 + 0.5 * Math.sin(timeSec * 0.6)

    const teacherGesture = Math.sin(timeSec * 1.2) * 3
    const screenPulse = seg((timeSec % 8) / 8, 0.2, 0.5) * (1 - seg((timeSec % 8) / 8, 0.5, 0.8))

    return (
        <svg
            ref={svgRef}
            viewBox="0 0 560 600"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ ...svgStyle, cursor: "crosshair" }}
        >
            <defs>
                <radialGradient id="stageSpotlight" cx="50%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#D4A359" stopOpacity={0.35 + 0.1 * lightsBreathe} />
                    <stop offset="40%" stopColor="#8A5D1C" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#12110F" stopOpacity={0} />
                </radialGradient>

                <radialGradient id="screenGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--ac)" stopOpacity={0.25 + 0.15 * screenPulse} />
                    <stop offset="100%" stopColor="#12110F" stopOpacity={0} />
                </radialGradient>

                <radialGradient id="seatLightGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--ac)" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="var(--ac)" stopOpacity={0} />
                </radialGradient>
            </defs>

            {/* Layer 1: Background Architectural Walls & Presentation Screen (Parallax ~ 1.5px) */}
            <g
                transform={`translate(${(mouse.x * 1.5).toFixed(2)}, ${(mouse.y * 1.5).toFixed(2)})`}
                style={{ opacity: envProgress, transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
                <path d="M 40 180 Q 280 80 520 180" fill="none" stroke="#26231F" strokeWidth="20" opacity={0.6} />
                <path d="M 20 270 Q 280 130 540 270" fill="none" stroke="#1E1C19" strokeWidth="18" opacity={0.7} />
                <path d="M 0 380 Q 280 200 560 380" fill="none" stroke="#181614" strokeWidth="16" opacity={0.8} />

                {[-0.8, -0.4, 0.4, 0.8].map((pos, idx) => {
                    const colX = stageCx + pos * 240
                    return (
                        <line
                            key={"col-" + idx}
                            x1={colX}
                            y1={30}
                            x2={colX}
                            y2={160}
                            stroke="#F4F1EA"
                            strokeWidth={1}
                            strokeDasharray="2 8"
                            style={{ opacity: 0.1 }}
                        />
                    )
                })}

                <rect x={150} y={35} width={260} height={95} rx={4} fill="#161412" stroke="var(--ac)" strokeWidth={1} style={{ opacity: 0.8 }} />
                <rect x={150} y={35} width={260} height={95} rx={4} fill="url(#screenGlow)" />

                <g style={{ opacity: 0.75 }}>
                    <circle cx={280} cy={72} r={8} fill="none" stroke="var(--ac)" strokeWidth={1.2} />
                    <circle cx={280} cy={72} r={3} fill="var(--ac)" />
                    <text x={280} y={94} textAnchor="middle" style={mono(9, "var(--ac)", ".14em")}>
                        FIRST PRINCIPLES
                    </text>

                    {[
                        { label: "CYCLICALS", x: 200, y: 55 },
                        { label: "DEMERGERS", x: 360, y: 55 },
                        { label: "BLUE OCEANS", x: 200, y: 95 },
                        { label: "ALPHA", x: 360, y: 95 },
                    ].map((node, i) => (
                        <g key={"sn-" + i}>
                            <line x1={280} y1={72} x2={node.x} y2={node.y} stroke="#F4F1EA" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.4} />
                            <circle cx={node.x} cy={node.y} r={3} fill="#F4F1EA" opacity={0.6 + (i === Math.floor(timeSec / 2) % 4 ? 0.4 : 0)} />
                            <text x={node.x} y={node.y + (node.y > 70 ? 12 : -8)} textAnchor="middle" style={mono(7.5, "#C5BFB5", ".1em")}>
                                {node.label}
                            </text>
                        </g>
                    ))}
                </g>
            </g>

            {/* Layer 2: Stage & Teacher (Parallax ~ 3.5px) */}
            <g
                transform={`translate(${(mouse.x * 3.5).toFixed(2)}, ${(mouse.y * 3.5).toFixed(2)})`}
                style={{ opacity: stageProgress, transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
                <ellipse cx={280} cy={145} rx={160} ry={35} fill="url(#stageSpotlight)" />

                <path d="M 130 148 Q 280 162 430 148" fill="none" stroke="var(--ac)" strokeWidth={1.8} style={{ opacity: 0.7 }} />
                <path d="M 140 151 Q 280 165 420 151" fill="none" stroke="#8A5D1C" strokeWidth={1} style={{ opacity: 0.3 }} />

                <g transform={`rotate(${teacherGesture.toFixed(2)} 280 140)`}>
                    <ellipse cx={280} cy={138} rx={12} ry={22} fill="var(--ac)" opacity={0.12} />

                    <path
                        d="M 273 148 L 271 128 Q 271 120 280 118 Q 289 120 289 128 L 287 148 Z"
                        fill="#1C1A17"
                        stroke="var(--ac)"
                        strokeWidth={1.2}
                    />

                    <circle cx={280} cy={114} r={6} fill="#24211D" stroke="var(--ac)" strokeWidth={1} />

                    <path
                        d={`M 286 123 Q 296 ${120 + Math.sin(timeSec * 1.5) * 4} 302 ${115 + Math.sin(timeSec * 1.5) * 5}`}
                        fill="none"
                        stroke="var(--ac)"
                        strokeWidth={1.4}
                        strokeLinecap="round"
                    />

                    <circle cx={280} cy={107} r={1.5} fill="#F4F1EA" opacity={0.8} />
                </g>
            </g>

            {/* Layer 3: Amphitheatre Curved Seating Rows & 30 Students (Parallax ~ 2.8px) */}
            <g
                transform={`translate(${(mouse.x * 2.8).toFixed(2)}, ${(mouse.y * 2.8).toFixed(2)})`}
                style={{ transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
                <path d="M 110 220 Q 280 248 450 220" fill="none" stroke="#2B2823" strokeWidth={4} opacity={0.8} />
                <path d="M 70 300 Q 280 338 490 300" fill="none" stroke="#24211D" strokeWidth={4} opacity={0.85} />
                <path d="M 35 390 Q 280 435 525 390" fill="none" stroke="#1E1C19" strokeWidth={4} opacity={0.9} />
                <path d="M 10 490 Q 280 542 550 490" fill="none" stroke="#181614" strokeWidth={4} opacity={0.95} />

                {students.map((st) => {
                    const studentEntrance = seg(timeSec, 0.8 + (st.id / 30) * 1.2, 0.8 + (st.id / 30) * 1.2 + 0.3)
                    if (studentEntrance <= 0) return null

                    const isMoving = st.id % 7 === Math.floor(timeSec * 0.5) % 7
                    const moveOffset = isMoving ? Math.sin(timeSec * 3 + st.phase) * 1.5 : 0
                    const noteArmMove = st.actionType === 1 ? Math.sin(timeSec * 4 + st.phase) * 1.2 : 0

                    const opacityVal = Math.min(1, studentEntrance * (st.row === 1 ? 0.95 : st.row === 2 ? 0.88 : st.row === 3 ? 0.78 : 0.68))

                    return (
                        <g
                            key={"st-" + st.id}
                            transform={`translate(${(st.x + moveOffset).toFixed(1)}, ${st.y.toFixed(1)}) scale(${st.scale})`}
                            style={{ opacity: opacityVal }}
                        >
                            <circle cx={0} cy={14} r={3} fill="url(#seatLightGlow)" />
                            <circle cx={0} cy={14} r={1.5} fill="#D4A359" opacity={0.8} />

                            <path
                                d="M -11 12 Q -12 2 -4 0 Q 0 -1 4 0 Q 12 2 11 12 Z"
                                fill="#1A1815"
                                stroke={st.row === 1 ? "var(--ac)" : "#4A443B"}
                                strokeWidth={0.8}
                            />

                            {st.hairStyle === 0 && (
                                <path d="M -5 -2 C -7 -10 7 -10 5 -2 Z" fill="#292520" stroke="var(--ac)" strokeWidth={0.6} />
                            )}
                            {st.hairStyle === 1 && (
                                <g>
                                    <circle cx={0} cy={-5} r={5} fill="#24201B" stroke="var(--ac)" strokeWidth={0.6} />
                                    <path d="M 3 -4 Q 8 -2 6 4" fill="none" stroke="var(--ac)" strokeWidth={0.8} />
                                </g>
                            )}
                            {st.hairStyle === 2 && (
                                <path d="M -6 -1 Q -8 -9 0 -11 Q 8 -9 6 -1 Z" fill="#1F1C18" stroke="var(--ac)" strokeWidth={0.6} />
                            )}
                            {st.hairStyle === 3 && (
                                <g>
                                    <ellipse cx={0} cy={-5} rx={5} ry={4.5} fill="#2A2621" />
                                    <line x1={-5} y1={-5} x2={5} y2={-5} stroke="var(--ac)" strokeWidth={0.8} />
                                </g>
                            )}

                            {st.actionType === 1 && (
                                <g transform={`translate(${noteArmMove.toFixed(1)}, 0)`}>
                                    <rect x={-5} y={6} width={10} height={5} rx={1} fill="#F4F1EA" opacity={0.6} />
                                    <line x1={-3} y1={8} x2={3} y2={8} stroke="var(--ac)" strokeWidth={0.6} />
                                </g>
                            )}

                            {st.actionType === 3 && isMoving && (
                                <path d="M 6 3 L 10 -4" fill="none" stroke="var(--ac)" strokeWidth={1} strokeLinecap="round" />
                            )}
                        </g>
                    )
                })}
            </g>

            {/* Bottom Amphitheatre Caption */}
            <text x={stageCx} y={582} textAnchor="middle" style={mono(11, "#C5BFB5", ".18em")}>
                {`${seatCount} COHORT MEMBERS · FIRST PRINCIPLES`}
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

