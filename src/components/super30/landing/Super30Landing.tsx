"use client"

// Super30 landing page — recreated from design_handoff_super30/Super30.dc.html.
// Ink/paper editorial layout: ochre is editorial, green is action. Radius 0,
// no shadows; separation is 1px hairlines and 1px grid gaps only.

import { CSSProperties, ReactNode, useEffect, useRef } from "react"
import { Super30Program, Testimonial } from "@/lib/types"
import { isEventRegistrationOpen } from "@/lib/utils"
import { wireReveal } from "./reveal"
import { AlphaFig, CyclicalsFig, DemergerFig, HeroFig, OceanFig, SeatStripFig, SeatsFig } from "./figures"
import { Super30Checkout } from "./Super30Checkout"

const SERIF = "var(--font-s30-serif), 'Instrument Serif', serif"
const SANS = "var(--font-s30-sans), 'IBM Plex Sans', system-ui, sans-serif"
const MONO = "var(--font-s30-mono), 'IBM Plex Mono', monospace"

const INK = "#12110F"
const PAPER = "#F4F1EA"
const OCHRE_PAPER = "#8A5D1C"

const wrap: CSSProperties = { maxWidth: 1180, margin: "0 auto" }

const eyebrow = (paper?: boolean): CSSProperties => ({
    fontFamily: MONO,
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 1,
    letterSpacing: ".18em",
    textTransform: "uppercase",
    color: paper ? OCHRE_PAPER : "var(--ac)",
    margin: "0 0 28px",
})

const bigH2 = (paper?: boolean): CSSProperties => ({
    fontFamily: SERIF,
    fontWeight: 400,
    fontSize: "clamp(46px,7vw,96px)",
    lineHeight: 1,
    letterSpacing: "-.015em",
    margin: "0 0 32px",
    color: paper ? INK : PAPER,
})

const sectionH2 = (paper?: boolean): CSSProperties => ({
    fontFamily: SERIF,
    fontWeight: 400,
    fontSize: "clamp(34px,4.8vw,66px)",
    lineHeight: 1.06,
    letterSpacing: "-.01em",
    margin: "0 0 40px",
    maxWidth: 860,
    color: paper ? INK : PAPER,
})

const standfirst = (paper?: boolean): CSSProperties => ({
    maxWidth: 720,
    fontFamily: SANS,
    fontWeight: 300,
    fontSize: "clamp(18px,1.9vw,22px)",
    lineHeight: 1.55,
    color: paper ? "rgba(18,17,15,.72)" : "rgba(244,241,234,.72)",
    margin: 0,
})

const bodyText = (paper?: boolean): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: 300,
    fontSize: 16,
    lineHeight: 1.65,
    color: paper ? "rgba(18,17,15,.7)" : "rgba(244,241,234,.7)",
    margin: 0,
})

const figCaption = (paper?: boolean): CSSProperties => ({
    fontFamily: MONO,
    fontWeight: 400,
    fontSize: 12,
    lineHeight: 1.5,
    letterSpacing: ".06em",
    color: paper ? "#77726A" : "var(--muted)",
    margin: "14px 0 0",
})

interface FrameworkData {
    num: string
    kicker: string
    title: string
    standfirst: string
    figure: ReactNode
    caption: string
    bullets: [string, string, string]
    triplet: [string, string, string]
    paper?: boolean
    borderTop?: boolean
}

function Triplet({ items, paper }: { items: [string, string, string]; paper?: boolean }) {
    return (
        <div
            data-reveal
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                gap: 1,
                background: paper ? "rgba(18,17,15,.14)" : "rgba(244,241,234,.14)",
            }}
        >
            {items.map((text, i) => (
                <div key={i} style={{ background: paper ? PAPER : INK, padding: "30px 26px" }}>
                    <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: 16, lineHeight: 1.55, color: paper ? INK : PAPER, margin: 0 }}>{text}</p>
                </div>
            ))}
        </div>
    )
}

function FrameworkSection({ num, kicker, title, standfirst: sf, figure, caption, bullets, triplet, paper, borderTop }: FrameworkData) {
    return (
        <section
            className="s30l-sec"
            style={{
                background: paper ? PAPER : undefined,
                color: paper ? INK : undefined,
                borderTop: borderTop ? "1px solid rgba(244,241,234,.1)" : undefined,
            }}
        >
            <div style={wrap}>
                <div data-reveal style={{ display: "flex", gap: 22, alignItems: "baseline", marginBottom: 34 }}>
                    <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 13, lineHeight: 1, letterSpacing: ".14em", color: paper ? OCHRE_PAPER : "var(--ac)" }}>{num}</span>
                    <span
                        style={{
                            fontFamily: MONO,
                            fontWeight: 400,
                            fontSize: 13,
                            lineHeight: 1,
                            letterSpacing: ".14em",
                            textTransform: "uppercase",
                            color: paper ? "#77726A" : "var(--muted)",
                        }}
                    >
                        {kicker}
                    </span>
                </div>
                <h2 data-reveal className="s30l-pretty" style={bigH2(paper)}>
                    {title}
                </h2>
                <p data-reveal className="s30l-pretty" style={standfirst(paper)}>
                    {sf}
                </p>
                <div data-reveal style={{ margin: "64px 0 60px", border: `1px solid ${paper ? "rgba(18,17,15,.14)" : "rgba(244,241,234,.12)"}`, padding: "26px 26px 18px" }}>
                    <div style={{ aspectRatio: "1000/400", width: "100%" }}>{figure}</div>
                    <p style={figCaption(paper)}>{caption}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 44, marginBottom: 64 }}>
                    {bullets.map((b, i) => (
                        <p key={i} data-reveal className="s30l-pretty" style={bodyText(paper)}>
                            {b}
                        </p>
                    ))}
                </div>
                <Triplet items={triplet} paper={paper} />
            </div>
        </section>
    )
}

export function Super30Landing({ program, siteTestimonials = [] }: { program: Super30Program; siteTestimonials?: Testimonial[] }) {
    const rootRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!rootRef.current) return
        return wireReveal(rootRef.current)
    }, [])

    const batchName = program.batchName?.trim() || ""
    const seats = program.seatsAvailable && program.seatsAvailable > 0 ? program.seatsAvailable : 30
    const seatsWord = seats === 30 ? "Thirty" : String(seats)
    const seatsWordLower = seats === 30 ? "thirty" : String(seats)
    const registrationOpen =
        !program.isSoldOut && (program.applicationDeadline ? isEventRegistrationOpen(program.applicationDeadline) : true)
    // Reviews: batch-specific testimonials from the program document win; otherwise
    // fall back to the site-wide testimonials shown on the homepage.
    const programReviews = (program.testimonials ?? [])
        .filter((t) => t?.text)
        .map((t) => ({ quote: t.text, name: t.name, role: undefined as string | undefined }))
    const fallbackReviews = siteTestimonials
        .filter((t) => t?.quote)
        .map((t) => ({ quote: t.quote, name: t.name, role: t.role }))
    const reviews = (programReviews.length > 0 ? programReviews : fallbackReviews).slice(0, 6)
    const reviewsAreBatchSpecific = programReviews.length > 0

    const frameworks: FrameworkData[] = [
        {
            num: "01",
            kicker: "Framework",
            title: "Cyclicals",
            standfirst:
                "Every cyclical business tells the same story in a different commodity. Price leads earnings, earnings invite capacity, and capacity ends the cycle. The work is knowing where on the curve you are standing.",
            figure: <CyclicalsFig />,
            caption: "Illustrative — the shape of a cycle, not a specific commodity.",
            bullets: [
                "Reading the cycle from supply rather than sentiment: capex announcements, utilisation, inventory and imports, rather than the last quarter’s earnings.",
                "Why the cheapest-looking point of a cycle is usually the most expensive place to buy, and what the low-cost producer looks like on a balance sheet.",
                "Exiting into strength — the signals that show up well before the downgrade cycle starts and the story turns.",
            ],
            triplet: [
                "The lowest-cost producer with a balance sheet that survives the trough.",
                "When capacity is being shut down, not when it is being announced.",
                "When the incremental capacity gets funded and the cycle prices itself in.",
            ],
            borderTop: true,
        },
        {
            num: "02",
            kicker: "Framework · Demergers",
            title: "Special situations",
            standfirst:
                "A conglomerate is priced as one story. A demerger forces the market to price two. Most of the value in special situations sits in the gap between one multiple and two.",
            figure: <DemergerFig />,
            caption: "Illustrative — how a sum-of-parts discount closes, not a forecast.",
            bullets: [
                "Why a holding structure trades below the sum of its parts, and what specifically has to change for that discount to close.",
                "Reading the scheme of arrangement: record dates, entitlement ratios, and the mechanics that create forced sellers on listing.",
                "Separating a genuine re-rating from a discount that was always deserved — some parents are cheap for good reason.",
            ],
            triplet: [
                "The business that was invisible while it sat inside the parent.",
                "Before the market has given that business a price of its own.",
                "Once both entities are priced honestly on their own merits.",
            ],
            paper: true,
        },
        {
            num: "03",
            kicker: "Framework",
            title: "Blue oceans",
            standfirst:
                "In a red ocean, everyone sells the same thing to the same customer and price is the only lever left. A blue ocean is a market a business has largely created for itself. The same capital earns very different returns in the two.",
            figure: <OceanFig />,
            caption: "Illustrative — competitive density and where margin goes.",
            bullets: [
                "Telling a blue ocean from a temporary lead: what keeps the water uncontested once the numbers get noticed.",
                "Why red-ocean businesses look cheap on every screen you will ever run, and stay cheap for a decade.",
                "Pricing power as the cleanest available evidence that the ocean is still blue.",
            ],
            triplet: [
                "Businesses defining a category rather than fighting for share in one.",
                "While the market still values it as one competitor among many.",
                "When the water turns red: new entrants, discounting, falling margins.",
            ],
        },
        {
            num: "04",
            kicker: "Framework",
            title: "Alpha capture",
            standfirst:
                "Alpha capture is a scan, not a hunch. It looks for businesses that are already growing aggressively — growth visible in the reported numbers — and then asks whether it can continue.",
            figure: <AlphaFig />,
            caption: "Illustrative — a scan surfacing businesses already compounding.",
            bullets: [
                "Where aggressive growth shows up first: order books, capacity additions, and revenue running well ahead of the sector.",
                "Separating growth that is genuinely compounding from a single good quarter, a low base, or an acquisition.",
                "Running the scan on a schedule, so a name is caught while it is still growing rather than after the re-rating.",
            ],
            triplet: [
                "Companies already growing aggressively, with that growth visible in reported numbers.",
                "While the growth is in the numbers but not yet in the price.",
                "When growth decelerates — whatever the story says.",
            ],
            borderTop: true,
        },
    ]

    const curriculum: [string, string][] = [
        ["The four frameworks", "Cyclicals, special situations, blue oceans and alpha capture, each taught as a full loop: framework, live case, your turn."],
        ["What not to buy", "The exclusions that do most of the work: models, valuation zones, timeframes, and stories that belong in the pump-and-dump bucket."],
        ["Position sizing", "How conviction translates into weight, and how a portfolio is built so that being right is actually paid for."],
        ["Data and screens", "The filings, disclosures and screens each framework actually needs, and how to run them without drowning in noise."],
        ["Post-mortems", "Real mistakes taken apart in public. Every framework has a failure mode, and knowing it is most of the protection."],
        ["Questions and follow-up", "Open sessions with the cohort, plus the checklists and templates to take back to your own portfolio."],
    ]

    const bonuses: [string, string][] = [
        ["Free complimentary access to membership for 2 months", "Everything behind the members wall for the two months following the batch, at no cost."],
        ["50% off on monthly webinars during the period", "Half price on every monthly webinar for as long as the complimentary access runs."],
        ["Access to the demerger tracker", "The running list of announced and in-progress demergers we watch, with the dates that matter."],
    ]

    return (
        <div ref={rootRef} className="s30l">
            {/* ── Hero ── */}
            <section className="s30l-hero" style={{ position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: "auto 0 -40px 0", height: 560, opacity: 0.5, pointerEvents: "none" }}>
                    <HeroFig />
                </div>
                <div
                    style={{
                        ...wrap,
                        position: "relative",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit,minmax(min(400px,100%),1fr))",
                        gap: 72,
                        alignItems: "center",
                    }}
                >
                    <div>
                        <p style={{ ...eyebrow(), margin: "0 0 40px" }}>
                            {batchName ? `Super30 · ${batchName} · Limited cohort` : "Super30 · Limited cohort"}
                        </p>
                        <h1
                            style={{
                                fontFamily: SERIF,
                                fontWeight: 400,
                                fontSize: "clamp(76px,15vw,208px)",
                                lineHeight: 0.86,
                                letterSpacing: "-.02em",
                                margin: "0 0 44px",
                                color: PAPER,
                            }}
                        >
                            Super30
                        </h1>
                        <p
                            className="s30l-pretty"
                            style={{
                                maxWidth: 680,
                                fontFamily: SANS,
                                fontWeight: 300,
                                fontSize: "clamp(19px,2vw,24px)",
                                lineHeight: 1.5,
                                color: "rgba(244,241,234,.76)",
                                margin: "0 0 52px",
                            }}
                        >
                            16 hours of LIVE ONLINE Cohorts on a mission to discover mis-priced businesses using FOUR investment frameworks taught
                            from first principles. Each framework answers What to buy, when to buy and When to sell.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
                            <a href="#register" className="s30l-btn-go">
                                Register for Super30
                            </a>
                            <a href="#frameworks" className="s30l-link-ghost">
                                Why join ↓
                            </a>
                        </div>
                    </div>
                    <div className="s30l-hero-fig" style={{ width: "100%", maxWidth: 520, justifySelf: "end", aspectRatio: "560/600" }}>
                        <SeatsFig seatCount={seats} />
                    </div>
                </div>
            </section>

            {/* ── The program ── */}
            <section className="s30l-sec" style={{ borderTop: "1px solid rgba(244,241,234,.1)" }}>
                <div style={{ ...wrap, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(320px,100%),1fr))", gap: 64 }}>
                    <div data-reveal>
                        <p style={eyebrow()}>The program</p>
                        <p
                            className="s30l-pretty"
                            style={{ fontFamily: SANS, fontWeight: 300, fontSize: "clamp(22px,2.4vw,30px)", lineHeight: 1.42, color: PAPER, margin: "0 0 24px" }}
                        >
                            Super 30 teaches specific Investment processes. Supported by LIVE case studies.
                        </p>
                        <p className="s30l-pretty" style={{ fontFamily: SANS, fontWeight: 300, fontSize: 17, lineHeight: 1.62, color: "rgba(244,241,234,.66)", margin: 0 }}>
                            Four frameworks, each one a complete decision loop rather than a screen or a tip — the same loop applied to a commodity
                            producer, a demerger, a category creator, and finally to your own portfolio.
                        </p>
                    </div>
                    <div data-reveal style={{ display: "grid", gap: 2, alignContent: "start" }}>
                        {(
                            [
                                ["Duration", "16 hours, live"],
                                ["Frameworks", "Four"],
                                ["Cohort", `${seats} participants`],
                                ["Format", "Framework, case, practice"],
                            ] as [string, string][]
                        ).map(([k, v], i, arr) => (
                            <div
                                key={k}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 16,
                                    padding: "22px 0",
                                    borderTop: "1px solid rgba(244,241,234,.14)",
                                    borderBottom: i === arr.length - 1 ? "1px solid rgba(244,241,234,.14)" : undefined,
                                }}
                            >
                                <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: 14, lineHeight: 1, letterSpacing: ".1em", color: "var(--muted)" }}>{k}</span>
                                <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 22, lineHeight: 1, color: PAPER }}>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Three questions ── */}
            <section id="frameworks" className="s30l-sec-tq" style={{ scrollMarginTop: 90 }}>
                <div
                    data-reveal
                    style={{ ...wrap, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))", gap: 1, background: "rgba(244,241,234,.14)" }}
                >
                    {(
                        [
                            ["What to buy", "The business characteristics that have to be present before anything else matters."],
                            ["When to buy", "Timing read from evidence in the business, not from the price chart."],
                            ["When to sell", "The exit decided in advance, so it is not made in the middle of a drawdown."],
                        ] as [string, string][]
                    ).map(([k, v]) => (
                        <div key={k} style={{ background: INK, padding: "34px 30px" }}>
                            <p
                                style={{
                                    fontFamily: MONO,
                                    fontWeight: 500,
                                    fontSize: 12,
                                    lineHeight: 1,
                                    letterSpacing: ".16em",
                                    textTransform: "uppercase",
                                    color: "var(--ac)",
                                    margin: "0 0 16px",
                                }}
                            >
                                {k}
                            </p>
                            <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: 16, lineHeight: 1.6, color: "rgba(244,241,234,.7)", margin: 0 }}>{v}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── The four frameworks ── */}
            {frameworks.map((f) => (
                <FrameworkSection key={f.num} {...f} />
            ))}

            {/* ── How the time is spent ── */}
            <section className="s30l-sec" style={{ background: PAPER, color: INK }}>
                <div style={wrap}>
                    <p data-reveal style={eyebrow(true)}>
                        Sixteen hours
                    </p>
                    <h2
                        data-reveal
                        style={{
                            fontFamily: SERIF,
                            fontWeight: 400,
                            fontSize: "clamp(34px,4.6vw,62px)",
                            lineHeight: 1.06,
                            letterSpacing: "-.01em",
                            margin: "0 0 64px",
                            maxWidth: 820,
                        }}
                    >
                        How the time is spent
                    </h2>
                    <div
                        data-reveal
                        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: 1, background: "rgba(18,17,15,.14)" }}
                    >
                        {curriculum.map(([title, body], i) => (
                            <div key={title} style={{ background: PAPER, padding: "38px 32px" }}>
                                <p style={{ fontFamily: MONO, fontWeight: 400, fontSize: 13, lineHeight: 1, letterSpacing: ".12em", color: OCHRE_PAPER, margin: "0 0 18px" }}>
                                    {"0" + (i + 1)}
                                </p>
                                <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 26, lineHeight: 1.2, margin: "0 0 14px" }}>{title}</h3>
                                <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: 16, lineHeight: 1.6, color: "rgba(18,17,15,.68)", margin: 0 }}>{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Register ── */}
            <section id="register" className="s30l-reg" style={{ position: "relative", overflow: "hidden", scrollMarginTop: 90 }}>
                <div style={{ position: "absolute", inset: "auto 0 -60px 0", height: 420, opacity: 0.32, pointerEvents: "none" }}>
                    <HeroFig />
                </div>
                <div
                    style={{
                        ...wrap,
                        position: "relative",
                        border: "1px solid rgba(35,192,119,.3)",
                        borderTop: "3px solid var(--go)",
                        background: "rgba(18,17,15,.72)",
                        backdropFilter: "blur(6px)",
                    }}
                >
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(360px,100%),1fr))" }}>
                        <div style={{ padding: "clamp(36px,4vw,64px)" }}>
                            <div data-reveal style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "9px 16px", border: "1px solid rgba(35,192,119,.4)", marginBottom: 36 }}>
                                {registrationOpen && (
                                    <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
                                        <span style={{ position: "absolute", inset: 0, background: "var(--go)", borderRadius: "50%", animation: "s30lPulse 1.8s ease-in-out infinite" }} />
                                        <span style={{ position: "absolute", inset: 0, background: "var(--go)", borderRadius: "50%", animation: "s30lRing 1.8s ease-out infinite" }} />
                                    </span>
                                )}
                                <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 12, lineHeight: 1, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--go)" }}>
                                    {batchName ? `${batchName} · ` : ""}
                                    {registrationOpen ? "Registration open" : program.isSoldOut ? "Sold out" : "Registration closed"}
                                </span>
                            </div>
                            <h2
                                data-reveal
                                style={{
                                    fontFamily: SERIF,
                                    fontWeight: 400,
                                    fontSize: "clamp(42px,5.6vw,78px)",
                                    lineHeight: 1,
                                    letterSpacing: "-.015em",
                                    margin: "0 0 28px",
                                }}
                            >
                                {seatsWord} seats. Then it closes.
                            </h2>
                            <p
                                data-reveal
                                className="s30l-pretty"
                                style={{
                                    fontFamily: SANS,
                                    fontWeight: 300,
                                    fontSize: "clamp(17px,1.8vw,20px)",
                                    lineHeight: 1.55,
                                    color: "rgba(244,241,234,.7)",
                                    margin: "0 0 40px",
                                    maxWidth: 520,
                                }}
                            >
                                {batchName || "Super30"} runs as a single cohort of {seatsWordLower}. Four frameworks, sixteen hours, and the
                                discipline to use them long after the sessions end.
                            </p>
                            <ul data-reveal style={{ listStyle: "none", margin: "0 0 40px", padding: 0, display: "grid", gap: 16 }}>
                                {[
                                    "Two months of complimentary membership",
                                    "50% off monthly webinars for the period",
                                    "Access to the demerger tracker",
                                ].map((item) => (
                                    <li key={item} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "baseline" }}>
                                        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 14, lineHeight: 1.35, color: "var(--go)" }}>✓</span>
                                        <span style={{ fontFamily: SANS, fontWeight: 300, fontSize: 17, lineHeight: 1.45, color: "rgba(244,241,234,.82)" }}>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div data-reveal style={{ display: "grid", gap: 14, maxWidth: 400 }}>
                                <div style={{ aspectRatio: `${(seats * 11.2).toFixed(1)}/28`, width: "100%" }}>
                                    <SeatStripFig count={seats} />
                                </div>
                                <p style={{ fontFamily: MONO, fontWeight: 400, fontSize: 11, lineHeight: 1, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", margin: 0 }}>
                                    {seatsWord} seats per cohort
                                </p>
                            </div>
                        </div>
                        <div data-reveal className="s30l-reg-right" style={{ padding: "clamp(36px,4vw,64px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <Super30Checkout program={program} registrationOpen={registrationOpen} seats={seats} />
                        </div>
                    </div>
                    <p
                        data-reveal
                        style={{
                            fontFamily: SANS,
                            fontWeight: 300,
                            fontSize: 13,
                            lineHeight: 1.7,
                            color: "rgba(244,241,234,.42)",
                            margin: 0,
                            padding: "26px clamp(36px,4vw,64px)",
                            borderTop: "1px solid rgba(244,241,234,.14)",
                        }}
                    >
                        Super30 is an educational program. Nothing taught in it is a buy or sell recommendation. Investing in securities is subject
                        to market risk, and past performance is not indicative of future results.
                    </p>
                </div>
            </section>

            {/* ── Reviews (batch testimonials if present, else the homepage community reviews) ── */}
            {reviews.length > 0 && (
                <section className="s30l-sec" style={{ background: PAPER, color: INK }}>
                    <div style={wrap}>
                        <p data-reveal style={eyebrow(true)}>
                            {reviewsAreBatchSpecific ? "Previous batches" : "Our community"}
                        </p>
                        <h2 data-reveal className="s30l-pretty" style={sectionH2(true)}>
                            {reviewsAreBatchSpecific
                                ? "Still not convinced — here is what our previous batchmates have to say"
                                : "Still not convinced — here is what our community has to say"}
                        </h2>
                        <div data-reveal="line" style={{ height: 1, background: OCHRE_PAPER, opacity: 0.5, margin: "0 0 56px" }} />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(320px,100%),1fr))", gap: 1, background: "rgba(18,17,15,.14)" }}>
                            {reviews.map((t, i) => (
                                <div
                                    key={i}
                                    data-reveal
                                    data-reveal-delay={(i * 0.09).toFixed(2)}
                                    style={{ background: PAPER, padding: "40px 34px", display: "flex", flexDirection: "column", gap: 26, justifyContent: "space-between" }}
                                >
                                    <p className="s30l-pretty" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(20px,1.9vw,25px)", lineHeight: 1.42, margin: 0 }}>
                                        {t.quote}
                                    </p>
                                    <p
                                        style={{
                                            fontFamily: MONO,
                                            fontWeight: 400,
                                            fontSize: 12,
                                            lineHeight: 1.6,
                                            letterSpacing: ".1em",
                                            textTransform: "uppercase",
                                            color: "#77726A",
                                            margin: 0,
                                        }}
                                    >
                                        {t.name}
                                        {t.role ? ` · ${t.role}` : ""}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div data-reveal style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, marginTop: 56 }}>
                            <a href="#register" className="s30l-btn-go">
                                Register for Super30
                            </a>
                            <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: "rgba(18,17,15,.6)" }}>
                                {reviewsAreBatchSpecific
                                    ? "Quotes are from participants of earlier batches, published with permission."
                                    : "Quotes are from our community, published with permission."}
                            </span>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Bonuses ── */}
            <section className="s30l-sec" style={{ borderTop: "1px solid rgba(244,241,234,.1)" }}>
                <div style={wrap}>
                    <p data-reveal style={eyebrow()}>
                        Included with the batch
                    </p>
                    <h2 data-reveal className="s30l-pretty" style={sectionH2()}>
                        Wait, that’s not all — we have some bonus for you
                    </h2>
                    <div data-reveal="line" style={{ height: 1, background: "var(--ac)", opacity: 0.5, margin: "0 0 56px" }} />
                    <div style={{ display: "grid", gap: 1, background: "rgba(244,241,234,.14)" }}>
                        {bonuses.map(([title, body], i) => (
                            <div
                                key={title}
                                data-reveal
                                data-reveal-delay={(i * 0.09).toFixed(2)}
                                style={{ background: INK, display: "grid", gridTemplateColumns: "auto 1fr", gap: 40, alignItems: "baseline", padding: "40px 8px 40px 0" }}
                            >
                                <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: 13, lineHeight: 1, letterSpacing: ".14em", color: "var(--ac)", minWidth: 44 }}>
                                    {"0" + (i + 1)}
                                </span>
                                <div>
                                    <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(26px,3vw,38px)", lineHeight: 1.15, margin: "0 0 12px", color: PAPER }}>{title}</h3>
                                    <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: 16, lineHeight: 1.6, color: "rgba(244,241,234,.66)", margin: 0, maxWidth: 640 }}>{body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div data-reveal style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, marginTop: 56 }}>
                        <a href="#register" className="s30l-btn-go">
                            Register for Super30
                        </a>
                        <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: 14, lineHeight: 1.5, color: "rgba(244,241,234,.6)" }}>
                            All three are included with a {batchName || "Super30"} seat.
                        </span>
                    </div>
                </div>
            </section>

            <style jsx global>{`
                .s30l {
                    --ac: #b57a28;
                    --go: #23c077;
                    --ink: #12110f;
                    --paper: #f4f1ea;
                    --muted: #8a8578;
                    font-family: var(--font-s30-sans), 'IBM Plex Sans', system-ui, sans-serif;
                    background: var(--ink);
                    color: var(--paper);
                    overflow-x: hidden;
                    -webkit-font-smoothing: antialiased;
                }
                .s30l-pretty {
                    text-wrap: pretty;
                }
                .s30l-sec {
                    padding: 110px 48px;
                }
                .s30l-sec-tq {
                    padding: 0 48px 110px;
                }
                .s30l-hero {
                    padding: 150px 48px 120px;
                }
                .s30l-reg {
                    padding: 130px 48px 110px;
                }
                .s30l-reg-right {
                    border-left: 1px solid rgba(244, 241, 234, 0.14);
                }
                .s30l a {
                    text-decoration: none;
                }
                .s30l-btn-go {
                    font-family: var(--font-s30-mono), 'IBM Plex Mono', monospace;
                    font-weight: 500;
                    font-size: 13px;
                    line-height: 1;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    padding: 20px 34px;
                    background: var(--go);
                    color: #08150e;
                    display: inline-block;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                }
                .s30l-btn-go:hover {
                    transform: translateY(-2px);
                    opacity: 0.92;
                    color: #08150e;
                }
                .s30l-link-ghost {
                    font-family: var(--font-s30-mono), 'IBM Plex Mono', monospace;
                    font-weight: 400;
                    font-size: 13px;
                    line-height: 1;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    padding: 20px 4px;
                    color: rgba(244, 241, 234, 0.6);
                    border-bottom: 1px solid rgba(244, 241, 234, 0.24);
                    transition: color 0.2s ease, border-color 0.2s ease;
                }
                .s30l-link-ghost:hover {
                    color: var(--paper);
                    border-bottom-color: rgba(244, 241, 234, 0.6);
                }
                .s30l-btn-register {
                    display: block;
                    width: 100%;
                    text-align: center;
                    font-family: var(--font-s30-mono), 'IBM Plex Mono', monospace;
                    font-weight: 500;
                    font-size: 14px;
                    line-height: 1;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    padding: 26px 32px;
                    background: var(--go);
                    color: #08150e;
                    border: none;
                    border-radius: 0;
                    cursor: pointer;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                }
                .s30l-btn-register:hover:not(:disabled) {
                    transform: translateY(-2px);
                    opacity: 0.92;
                }
                .s30l-btn-register:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }
                .s30l-btn-outline {
                    font-family: var(--font-s30-mono), 'IBM Plex Mono', monospace;
                    font-weight: 500;
                    font-size: 12px;
                    line-height: 1;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    background: transparent;
                    border: 1px solid var(--go);
                    border-radius: 0;
                    color: var(--go);
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                .s30l-btn-outline:hover:not(:disabled) {
                    background: rgba(35, 192, 119, 0.08);
                }
                .s30l-btn-outline:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .s30l input::placeholder {
                    color: rgba(244, 241, 234, 0.35);
                    letter-spacing: 0.1em;
                }
                .s30l input:focus {
                    border-color: rgba(35, 192, 119, 0.6) !important;
                }
                @keyframes s30lPulse {
                    0%,
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.35;
                        transform: scale(0.72);
                    }
                }
                @keyframes s30lRing {
                    0% {
                        opacity: 0.55;
                        transform: scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(2.6);
                    }
                }
                @media (max-width: 640px) {
                    .s30l-sec {
                        padding: 80px 22px;
                    }
                    .s30l-sec-tq {
                        padding: 0 22px 80px;
                    }
                    .s30l-hero {
                        padding: 120px 22px 90px;
                    }
                    .s30l-reg {
                        padding: 90px 22px 80px;
                    }
                    .s30l-hero-fig {
                        justify-self: start !important;
                    }
                }
            `}</style>
        </div>
    )
}
