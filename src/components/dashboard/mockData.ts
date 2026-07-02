// Simplified mock data for the Research Desk (Fallback data if Sanity CMS is empty)

export interface MockEvent {
    id: string
    title: string
    date: string
    time: string
    type: "Webinar" | "Live Meetup"
    description: string
    recordingUrl?: string
    slidesUrl?: string
}

export interface MockReport {
    id: string
    title: string
    slug: string
    excerpt: string
    industry: string
    difficulty: "Beginner" | "Intermediate" | "Advanced"
    readTime: string
    publishedAt: string
    access: "public" | "subscriber"
    bodyMarkdown: string
}

export const mockEvents: MockEvent[] = [
    {
        id: "event-1",
        title: "Semiconductor OSAT & ATMP Supply Chain Analysis",
        date: "July 12, 2026",
        time: "10:00 AM IST",
        type: "Webinar",
        description: "A deep dive into packaging tech, capital efficiency, and Indian entrants like Kaynes and CG Power.",
        slidesUrl: "#",
        recordingUrl: "#"
    },
    {
        id: "event-2",
        title: "Defense Electronics: Avionics & Sonar Mappings",
        date: "August 8, 2026",
        time: "11:30 AM IST",
        type: "Webinar",
        description: "Breaking down defense positive indigenization lists and BEL vendor networks.",
        slidesUrl: "#"
    },
    {
        id: "event-3",
        title: "Q1 FY27 Member Meetup: Portfolio Thesis Review",
        date: "September 27, 2026",
        time: "4:00 PM IST",
        type: "Live Meetup",
        description: "Discussing our active holdings, corporate governance scans, and answering member Q&A live."
    }
]

export const mockReports: MockReport[] = [
    {
        id: "rep-1",
        title: "Space Sector: Payload & Launch Systems",
        slug: "space-sector-launch-systems",
        excerpt: "An institutional mapping of private launch vehicles, satellite components, and ISRO deregulation vectors in India.",
        industry: "Space Systems",
        difficulty: "Advanced",
        readTime: "42 min read",
        publishedAt: "June 18, 2026",
        access: "subscriber",
        bodyMarkdown: `
# Space Sector: India's Private Launch Systems & Payloads

### SECTION 1: Industry Structure & Value Chain
India's space economy is undergoing a structural transition from a centralized state-monopolized agency model (ISRO) to an open, deregulated framework governed by IN-SPACe. Private launch operators, payload manufacturers, and ground terminal networks are positioning themselves to capture high-value satellite orbits.

#### The Payload Value Chain:
1. **Raw Materials:** Specialty alloys, carbon fibers, carbon-epoxy matrices, solar cells. Sourcing is global with severe import clearances.
2. **Subsystems:** Thrusters, guidance sensors, transponders, payload boards. Developed in-house or by specialized tier-2 vendors.
3. **Integration:** Launch vehicles, satellite buses. Highly complex, requiring ISRO facility access for test firings.

---

### SECTION 2: Moat Analysis (Switching Costs & Entry Barriers)
In aerospace engineering, switching costs are astronomical. Once a satellite manufacturer integrates a payload board (e.g., a software-defined transceiver developed by Avantel) into their bus structure, changing the transceiver requires:
- Re-engineering flight control software modules (2-3 years of testing).
- Re-certifying vibration tolerance thresholds.
- Re-evaluating payload thermal balancing models.

Consequently, payload developers command long-term pricing power and contract lock-ins that span satellite lifetimes (7-15 years).

---

### SECTION 3: Financial Projections & CAPEX Cycle
Aerospace manufacturing is highly capital intensive in the initial R&D phase (Capex turns are typically low, around 0.8x - 1.2x). However, once payload designs are standardized, unit economics expand rapidly due to operating leverage:
- **Gross Margins:** 60% - 70% on proprietary payloads.
- **Working Capital:** Long cycles (150-180 days) due to defense and state procurement terms.
- **ROCE Potential:** Can reach 24% at peak utilization rates as initial tooling costs amortize.

---

### SECTION 4: Key Risks & Vulnerabilities
1. **ISRO facility bottleneck:** Any delay in ISRO launch schedules or test-pad maintenance directly stalls private operator timelines.
2. **Global semiconductor supply:** Extreme reliance on military-grade chips that face export-import restrictions (ITAR regulations in the USA).
3. **Corporate governance:** Complex billing and joint ventures with regional state-backed agencies can lead to accounting complexities.
`
    },
    {
        id: "rep-2",
        title: "Defense Electronics: Radar & Avionics",
        slug: "defense-electronics-radar-avionics",
        excerpt: "An in-depth look at indigenization mandates, multi-year order books, and supplier moats in military hardware.",
        industry: "Defense Electronics",
        difficulty: "Advanced",
        readTime: "38 min read",
        publishedAt: "May 25, 2026",
        access: "subscriber",
        bodyMarkdown: `
# Defense Electronics: Radar & Avionics Indigenization Mappings

### SECTION 1: The Indigenization Mandate
The Ministry of Defense (MoD) has enforced Positive Indigenization Lists. Under these mandates, complex electronic assemblies (including software-defined radios, sonar, and avionics suites) must be sourced from domestic manufacturers. This creates a captive market for operators like Bharat Electronics (BEL) and Data Patterns.

#### Key Subsystems Mapped:
- **Avionics & Flight Controls:** Actuators, computers, glass cockpits.
- **Radar & Sonar:** Transmit-receive modules, signal processors, transducer arrays.
- **Electronic Warfare:** Jammer units, decoy systems.

---

### SECTION 2: The Monopoly Moat
BEL acts as the primary integrator for naval and air defense platforms. Since combat systems integration requires direct security clearance and access to naval warship blueprints, entry barriers are absolute:
- **Blueprint Access:** Private foreign suppliers are restricted from accessing naval designs.
- **Client Co-location:** System engineers must spend months at navy yards during assembly.

This creates a structural lock-in. A competitor cannot displace BEL without recreating years of integration blueprints.

---

### SECTION 3: Financial Synthesis
Radars and electronic warfare systems command premium margins:
- **EBITDA Margins:** Stable between 22% and 24% for T1 integrators.
- **ROCE:** Highly efficient (>28%) because the client (navy/air force) advances mobilization funds, reducing working capital funding costs.
- **Order Visibility:** 4x - 5x book-to-bill ratio provides solid revenue streams.
`
    },
    {
        id: "rep-3",
        title: "Understanding Indian Capital Allocation Models",
        slug: "indian-capital-allocation-models",
        excerpt: "A basic framework for retail investors checking return on capital, pledging, and promoter compensation.",
        industry: "General Investing",
        difficulty: "Beginner",
        readTime: "15 min read",
        publishedAt: "April 10, 2026",
        access: "public",
        bodyMarkdown: `
# Indian Capital Allocation: A Beginner's Framework

### SECTION 1: Return on Capital (ROCE)
Return on Capital Employed (ROCE) measures how efficiently a business uses its debt and equity capital. A company earning 25% ROCE compounds value much faster than one earning 10% ROCE in the long term.

---

### SECTION 2: Promoter Pledging & Debt Traps
Promoters pledging their shares to secure loans is a significant warning flag in the Indian markets. If the stock price drops, lenders can sell pledged shares, causing a tailspin. We prioritize debt-free or low-debt companies with zero promoter pledges.
`
    }
]
