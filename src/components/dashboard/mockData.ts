// Institutional Mock Data for the Research Desk

export interface Company {
    id: string
    name: string
    ticker: string
    industry: string
    summary: string
    thesis: string
    updates: { quarter: string; text: string; date: string }[]
    commentary: string
    valuation: {
        metric: string
        base: string
        bull: string
        bear: string
    }[]
    risks: string[]
    timeline: { year: string; title: string; desc: string; conviction: "High" | "Medium" | "Low" }[]
}

export interface Industry {
    id: string
    name: string
    overview: string
    landscape: string[]
    map: { segment: string; players: string[] }[]
    readingPath: string[]
    developments: string[]
}

export interface Event {
    id: string
    title: string
    date: string
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
    bodyMarkdown: string
}

export const mockIndustries: Industry[] = [
    {
        id: "defense",
        name: "Defense Electronics",
        overview: "India's defense spending is shifting rapidly towards electronics indigenization. Sonar, avionics, radar systems, and electronic warfare subsystems are seeing local sourcing mandates compound from 20% to over 70%.",
        landscape: ["Avionics & Flight Controls", "Radar & Sonar Subsystems", "Electronic Warfare Payloads", "Missile Guidance Computers"],
        map: [
            { segment: "Tier 1 Integrators", players: ["Bharat Electronics (BEL)", "Hindustan Aeronautics (HAL)"] },
            { segment: "Subsystem Developers", players: ["Astra Microwave", "Data Patterns", "Zen Technologies"] },
            { segment: "Component Suppliers", players: ["Centum Electronics", "Avantel"] }
        ],
        readingPath: [
            "Introduction to Indian Defense Capital Budgets",
            "Radar Technology Lifecycles & local sourcing barriers",
            "Avionics Mappings: HAL & BEL relationships",
            "Contract Analysis: Order book billing milestones"
        ],
        developments: [
            "Ministry of Defense publishes 5th Positive Indigenization List targeting complex line-replaceable units.",
            "BEL bags ₹3,200 Cr contract for advanced naval radar assemblies.",
            "Astra Microwave secures joint development agreement for GaN-based transmit-receive modules."
        ]
    },
    {
        id: "space",
        name: "Space Systems",
        overview: "The commercial space ecosystem in India is transitioning from a government monopoly to private payload manufacturing, launch systems, and satellite ground terminal services, driven by deregulation.",
        landscape: ["Launch Vehicle Payloads", "Satellite Bus Assemblies", "Ground Station Transceivers", "Hyperspectral Earth Imaging"],
        map: [
            { segment: "Launch Operators", players: ["Skyroot Aerospace", "Agnikul Cosmos"] },
            { segment: "Payload Manufacturers", players: ["L&T Aerospace", "Ananth Technologies"] },
            { segment: "Ground Terminals & Data", players: ["Avantel", "Pixxel Space"] }
        ],
        readingPath: [
            "Understanding IN-SPACe deregulation policies",
            "The economics of small satellite launch systems",
            "Payload supply chains: Transponders & sensors"
        ],
        developments: [
            "IN-SPACe announces ₹1,000 Cr seed funding framework for private space startups.",
            "Skyroot successfully tests Raman-II engine at ISRO facilities.",
            "Avantel expands satellite communication terminal factory in Hyderabad."
        ]
    },
    {
        id: "ems",
        name: "Electronics Manufacturing Services (EMS)",
        overview: "EMS in India is shifting from basic PCBA assembly to high-complexity systems integration (Box-Build). Margins are expanding as operators optimize working capital and input sourcing networks.",
        landscape: ["Box-Build Assembly", "PCBA Board Population", "Component Sourcing Networks", "Automotive & Industrial IoT Modules"],
        map: [
            { segment: "High-Volume Consumer", players: ["Dixon Technologies", "Amber Enterprises"] },
            { segment: "High-Mix Low-Volume", players: ["Kaynes Technology", "Syrma SGS", "Avalon Technologies"] },
            { segment: "Specialized Industrial", players: ["Centum Electronics"] }
        ],
        readingPath: [
            "Analyzing working capital cycles in EMS models",
            "The value leap: PCBA assembly vs Box-Build integration",
            "PLI scheme dynamics: Import duties and margins"
        ],
        developments: [
            "Kaynes Tech commences pilot operations at its advanced OSAT semiconductor testing plant in Hyderabad.",
            "Dixon Tech bags major contract for domestic mobile handset assembly.",
            "Syrma SGS opens new automotive module line in Chennai."
        ]
    }
]

export const mockCompanies: Company[] = [
    {
        id: "bel",
        name: "Bharat Electronics (BEL)",
        ticker: "BEL",
        industry: "Defense Electronics",
        summary: "BEL is India's premier defense electronics integrator, commanding a 60%+ market share in defense radar, sonar, communication terminals, and electronic warfare suites.",
        thesis: "BEL operates as a virtual monopoly on state defense contracts. The business has zero debt, ROCE exceeding 28%, and a multi-year order book of ₹75,000 Cr providing high revenue visibility.",
        updates: [
            { quarter: "Q4 FY26", text: "Revenue rose 18% YoY driven by faster execution of naval missile radar assemblies. Order inflow hit ₹8,500 Cr for the quarter.", date: "May 2026" },
            { quarter: "Q3 FY26", text: "EBITDA margins expanded by 80 bps to 23.2% due to high-value component indigenization in radars.", date: "Feb 2026" }
        ],
        commentary: "Management states that the positive indigenization lists have created a structural barrier for foreign rivals. BEL is investing ₹1,200 Cr in a new software-defined radio manufacturing plant to expand capacity.",
        valuation: [
            { metric: "Implied CAGR (Base)", base: "14.5%", bull: "17.0%", bear: "11.2%" },
            { metric: "WACC Threshold", base: "11.0%", bull: "10.5%", bear: "12.0%" },
            { metric: "Target Multiple (P/E)", base: "32x", bull: "40x", bear: "24x" }
        ],
        risks: [
            "Dependence on a single buyer (Indian Armed Forces / Ministry of Defense).",
            "Working capital delays if government payment cycles lengthen.",
            "Technological obsolescence in legacy radar components."
        ],
        timeline: [
            { year: "2024", title: "Radars Indigenization Push", desc: "Conviction upgraded to high as local content share in radar orders crossed 65%.", conviction: "High" },
            { year: "2025", title: "Naval Avionics Expansion", desc: "Monitored cash conversion cycle deterioration closely due to naval shipbuilding delays.", conviction: "Medium" },
            { year: "2026", title: "Semiconductor Assembly Ventures", desc: "Conviction restored to high following JVs for military-grade chipset fabrication.", conviction: "High" }
        ]
    },
    {
        id: "kaynes",
        name: "Kaynes Technology",
        ticker: "KAYNES",
        industry: "Electronics Manufacturing Services (EMS)",
        summary: "Kaynes is a leading high-mix, low-volume EMS provider servicing industrial, automotive, defense, and medical electronics, now expanding into OSAT chip packaging.",
        thesis: "Kaynes is capturing margins by transitioning from pure PCBA component mounting to full box-build assembly. Its venture into OSAT semiconductor packaging creates a massive vertical moat.",
        updates: [
            { quarter: "Q4 FY26", text: "OSAT plant construction in Hyderabad completed ahead of schedule. Pilot validation runs commenced with global clients.", date: "June 2026" },
            { quarter: "Q3 FY26", text: "Order book expanded to ₹4,200 Cr. Industrial and automotive verticals lead growth.", date: "March 2026" }
        ],
        commentary: "Management expects the OSAT chip packaging facility to achieve commercial revenue by Q2 FY27. EBITDA margins are projected to expand towards 16% as box-build and packaging share increases.",
        valuation: [
            { metric: "Implied CAGR (Base)", base: "22.5%", bull: "28.0%", bear: "16.5%" },
            { metric: "Target Multiple (P/E)", base: "45x", bull: "55x", bear: "32x" },
            { metric: "Capex Efficiency", base: "1.8x", bull: "2.2x", bear: "1.3x" }
        ],
        risks: [
            "High capex requirements for OSAT semiconductor facility.",
            "Input raw material dependency on imported chips from Taiwan & China.",
            "Key personnel retention risks in highly specialized packaging teams."
        ],
        timeline: [
            { year: "2024", title: "Box Build Transition", desc: "Initial positioning when box-build revenue share grew to 35% of product mix.", conviction: "Medium" },
            { year: "2025", title: "OSAT Semiconductor Pivot", desc: "Upgraded conviction to high upon analyzing land allocation and technology partner deals in Hyderabad.", conviction: "High" }
        ]
    }
]

export const mockEvents: Event[] = [
    {
        id: "event-1",
        title: "Semiconductor OSAT & ATMP Supply Chain Analysis",
        date: "July 12, 2026",
        type: "Webinar",
        description: "A deep dive into packaging tech, capital efficiency, and Indian entrants like Kaynes and CG Power.",
        slidesUrl: "#",
        recordingUrl: "#"
    },
    {
        id: "event-2",
        title: "Defense Electronics: Avionics & Sonar Mappings",
        date: "August 8, 2026",
        type: "Webinar",
        description: "Breaking down defense positive indigenization lists and BEL vendor networks.",
        slidesUrl: "#"
    },
    {
        id: "event-3",
        title: "Q1 FY27 Member Meetup: Portfolio Thesis Review",
        date: "September 27, 2026",
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
    }
]
