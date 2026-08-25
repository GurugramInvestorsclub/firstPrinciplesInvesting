"use client"

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react"

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

// Plan view of a 30-seat theatre filling up in a plausible order (19s).
export function SeatsFig({ seatCount = 30 }: { seatCount?: number }) {
    const t = useClock(19)
    const cx = 280
    const cy = 56

    const arrivals = useMemo(() => {
        const arr: { i: number; score: number }[] = []
        for (let r = 0; r < 5; r++)
            for (let c = 0; c < 6; c++) {
                const i = r * 6 + c
                arr.push({ i, score: Math.abs(c - 2.5) * 0.9 + Math.abs(r - 1.7) * 0.8 + rnd(i + 3) * 2.4 })
            }
        arr.sort((a, b) => a.score - b.score)
        let acc = 0
        const timed = arr.map((o, k) => {
            acc += 0.35 + rnd(k * 7.77 + 1) * 1.9 + (k % 7 === 6 ? 1.4 : 0)
            return { i: o.i, at: acc }
        })
        const total = timed[timed.length - 1].at
        const map: Record<number, number> = {}
        timed.forEach((o) => {
            map[o.i] = o.at / total
        })
        return map
    }, [])

    const fill = seg(t, 0.04, 0.74)
    const breathe = 0.5 + 0.5 * Math.sin(t * Math.PI * 2)
    const seats: React.ReactNode[] = []
    for (let r = 0; r < 5; r++) {
        const R = 226 + r * 50
        for (let c = 0; c < 6; c++) {
            const i = r * 6 + c
            const a = -0.52 + (c / 5) * 1.04
            const x = cx + R * Math.sin(a)
            const y = cy + R * Math.cos(a)
            const p = seg(fill, arrivals[i], Math.min(1, arrivals[i] + 0.05))
            const eb = p <= 0 ? 0 : 1 + 1.9 * Math.pow(p - 1, 3) + 0.9 * Math.pow(p - 1, 2)
            const sc = 0.58 + 0.42 * eb
            const sway = p > 0 ? Math.sin(t * Math.PI * 2 * 2 + i * 1.9) * 0.5 : 0
            seats.push(
                <g key={"s" + i} transform={`rotate(${(-a * 180) / Math.PI} ${x.toFixed(1)} ${y.toFixed(1)})`}>
                    <rect x={x - 9} y={y - 3} width={18} height={9} strokeWidth={1} style={{ fill: "none", stroke: "#F4F1EA", opacity: 0.2 }} />
                    {p > 0 ? (
                        <g
                            transform={`translate(${(x + sway).toFixed(2)} ${y.toFixed(2)}) scale(${sc.toFixed(3)}) translate(${(-x).toFixed(2)} ${(-y).toFixed(2)})`}
                            style={{ opacity: Math.min(1, p * 1.6) }}
                        >
                            <rect x={x - 9} y={y - 3} width={18} height={9} style={{ fill: "var(--ac)", opacity: 0.28 }} />
                            <path
                                d={`M${x - 9} ${y - 3} L${x - 9} ${y - 9} M${x + 9} ${y - 3} L${x + 9} ${y - 9}`}
                                strokeWidth={1.4}
                                fill="none"
                                style={{ stroke: "var(--ac)", opacity: 0.55 }}
                            />
                            <circle cx={x} cy={y - 8} r={5.2} style={{ fill: "var(--ac)" }} />
                        </g>
                    ) : null}
                </g>
            )
        }
    }
    return (
        <svg viewBox="0 0 560 600" style={svgStyle}>
            <path d="M110 74 Q280 34 450 74" fill="none" strokeWidth={2.2} style={{ stroke: "var(--ac)", opacity: 0.9 }} />
            <path d="M132 96 L280 118 L428 96 L450 74 Q280 34 110 74 Z" style={{ fill: "var(--ac)", opacity: 0.06 + 0.05 * breathe }} />
            <defs>
                <linearGradient id="fpFloor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#F4F1EA" stopOpacity={0.05} />
                    <stop offset=".72" stopColor="#F4F1EA" stopOpacity={0.022} />
                    <stop offset="1" stopColor="#F4F1EA" stopOpacity={0} />
                </linearGradient>
            </defs>
            <path d="M150 150 L280 128 L410 150 L546 596 L14 596 Z" style={{ fill: "url(#fpFloor)", opacity: 0.7 + 0.3 * breathe }} />
            <line x1={280} x2={280} y1={128} y2={148} strokeWidth={1.6} style={{ stroke: "var(--ac)", opacity: 0.8 }} />
            <circle cx={280} cy={122} r={7} style={{ fill: "var(--ac)" }} />
            <g>{seats}</g>
            <text x={280} y={596} textAnchor="middle" style={mono(12, "#8A8578", ".18em")}>
                {`${seatCount} SEATS · ONE COHORT`}
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

