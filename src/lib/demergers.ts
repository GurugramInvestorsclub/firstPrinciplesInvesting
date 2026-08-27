export interface DemergerRecord {
    id: string
    companyName: string
    symbol?: string
    demergedEntity: string
    ratio: string
    status: "Announced" | "NCLT Approval Pending" | "Record Date Set" | "Listed" | string
    announcementDate?: string
    recordDate?: string
    listingDate?: string
    sector?: string
    marketCap?: string
    rationale?: string
    exchangeLink?: string
    memoLink?: string
    notes?: string
}

const GOOGLE_SHEET_ID = "1AXHfMMJT8kJHDyyMUltsaKISW-JvryacBI6McPlctiY"
const GID = "1568933591"

// Direct Google Sheet export CSV URL
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv&gid=${GID}`
// Alternative gviz CSV URL fallback
const GVIZ_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`

/**
 * Robust CSV parser that handles quotes, commas inside text, and empty fields.
 */
export function parseCSVToDemergers(csvText: string): DemergerRecord[] {
    const lines: string[] = []
    let currentLine = ""
    let insideQuotes = false

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i]
        const nextChar = csvText[i + 1]

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentLine += '"'
                i++
            } else {
                insideQuotes = !insideQuotes
            }
        } else if ((char === '\n' || char === '\r') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') {
                i++
            }
            if (currentLine.trim()) {
                lines.push(currentLine)
            }
            currentLine = ""
        } else {
            currentLine += char
        }
    }
    if (currentLine.trim()) {
        lines.push(currentLine)
    }

    if (lines.length < 2) return []

    const parseLine = (line: string): string[] => {
        const result: string[] = []
        let cur = ""
        let inQ = false

        for (let i = 0; i < line.length; i++) {
            const c = line[i]
            if (c === '"') {
                inQ = !inQ
            } else if (c === ',' && !inQ) {
                result.push(cur.trim())
                cur = ""
            } else {
                cur += c
            }
        }
        result.push(cur.trim())
        return result
    }

    const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""))

    const getFieldIndex = (possibleNames: string[]): number => {
        return headers.findIndex((h) => possibleNames.some((p) => h.includes(p)))
    }

    const colCompany = getFieldIndex(["company", "parent", "name", "stock"])
    const colDemerged = getFieldIndex(["demerged", "spinoff", "newentity", "entity", "child"])
    const colRatio = getFieldIndex(["ratio", "swap", "share"])
    const colStatus = getFieldIndex(["status", "stage", "state"])
    const colAnnounce = getFieldIndex(["announce", "announcement", "dateannounced"])
    const colRecord = getFieldIndex(["record", "recorddate", "exdate"])
    const colListing = getFieldIndex(["listing", "listed", "listingdate"])
    const colSector = getFieldIndex(["sector", "industry"])
    const colMarketCap = getFieldIndex(["mcap", "marketcap", "cap", "val"])
    const colRationale = getFieldIndex(["rationale", "thesis", "description", "details", "reason"])
    const colLink = getFieldIndex(["link", "filing", "url", "exchange"])
    const colNotes = getFieldIndex(["notes", "comment", "remarks"])

    const records: DemergerRecord[] = []

    for (let i = 1; i < lines.length; i++) {
        const row = parseLine(lines[i])
        if (row.length === 0 || !row.some((cell) => cell.length > 0)) continue

        const companyName = colCompany !== -1 ? row[colCompany] : row[0]
        if (!companyName || companyName.toLowerCase().includes("sample") || companyName.startsWith("#")) continue

        records.push({
            id: `demerger-${i}`,
            companyName: companyName.replace(/^["']|["']$/g, ""),
            symbol: extractSymbol(companyName),
            demergedEntity: colDemerged !== -1 && row[colDemerged] ? row[colDemerged] : "Spin-off Entity",
            ratio: colRatio !== -1 && row[colRatio] ? row[colRatio] : "1 : 1",
            status: colStatus !== -1 && row[colStatus] ? normalizeStatus(row[colStatus]) : "Announced",
            announcementDate: colAnnounce !== -1 ? row[colAnnounce] : "",
            recordDate: colRecord !== -1 ? row[colRecord] : "",
            listingDate: colListing !== -1 ? row[colListing] : "",
            sector: colSector !== -1 && row[colSector] ? row[colSector] : "General",
            marketCap: colMarketCap !== -1 ? row[colMarketCap] : "",
            rationale: colRationale !== -1 ? row[colRationale] : "",
            exchangeLink: colLink !== -1 ? row[colLink] : "",
            notes: colNotes !== -1 ? row[colNotes] : "",
        })
    }

    return records
}

function extractSymbol(name: string): string {
    const match = name.match(/\(([^)]+)\)/)
    return match ? match[1] : name.split(" ")[0].toUpperCase()
}

function normalizeStatus(statusRaw: string): string {
    const s = statusRaw.toLowerCase()
    if (s.includes("listed") || s.includes("completed") || s.includes("done")) return "Listed"
    if (s.includes("record") || s.includes("ex-date")) return "Record Date Set"
    if (s.includes("nclt") || s.includes("approval") || s.includes("pending")) return "NCLT Approval Pending"
    if (s.includes("announced") || s.includes("board")) return "Announced"
    return statusRaw || "Announced"
}

/**
 * Fetch live data from Google Sheets with fallbacks.
 */
export async function getDemergerData(): Promise<{ records: DemergerRecord[]; lastUpdated: string; isLive: boolean }> {
    const urls = [SHEET_CSV_URL, GVIZ_CSV_URL]

    for (const url of urls) {
        try {
            const res = await fetch(url, {
                next: { revalidate: 300 }, // Auto-revalidate every 5 minutes
                headers: {
                    "Cache-Control": "max-age=300",
                },
            })

            if (res.ok) {
                const text = await res.text()
                const records = parseCSVToDemergers(text)
                if (records.length > 0) {
                    return {
                        records,
                        lastUpdated: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                        isLive: true,
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching Google Sheets demerger CSV:", error)
        }
    }

    // Fallback sample records if Google Sheet access is restricted (401)
    return {
        records: FALLBACK_DEMERGER_RECORDS,
        lastUpdated: "Fallback Dataset (Sheet Restricted)",
        isLive: false,
    }
}

export const FALLBACK_DEMERGER_RECORDS: DemergerRecord[] = [
    {
        id: "demerger-1",
        companyName: "Tata Motors Ltd (TATAMOTORS)",
        symbol: "TATAMOTORS",
        demergedEntity: "Tata Commercial Vehicles & Tata Passenger Electric Vehicles",
        ratio: "1 : 1",
        status: "NCLT Approval Pending",
        announcementDate: "2024-03-04",
        recordDate: "TBD Q3 FY25",
        listingDate: "TBD Q4 FY25",
        sector: "Automobile & EV",
        marketCap: "₹3,40,000 Cr",
        rationale: "Separation of Commercial Vehicle (CV) business from Passenger Vehicle (PV + EV + JLR) business to enhance focus, capital allocation, and market valuations.",
    },
    {
        id: "demerger-2",
        companyName: "Raymond Ltd (RAYMOND)",
        symbol: "RAYMOND",
        demergedEntity: "Raymond Lifestyle Ltd & Raymond Realty Ltd",
        ratio: "1 : 1",
        status: "Record Date Set",
        announcementDate: "2023-04-27",
        recordDate: "2024-07-11",
        listingDate: "2024-09-05",
        sector: "Textiles & Real Estate",
        marketCap: "₹21,50,000 Cr",
        rationale: "Unlocking value by creating three pure-play listed entities: Lifestyle/Apparel, Real Estate, and Engineering.",
    },
    {
        id: "demerger-3",
        companyName: "ITC Ltd (ITC)",
        symbol: "ITC",
        demergedEntity: "ITC Hotels Ltd",
        ratio: "1 : 10 (1 ITC Hotel share for 10 ITC shares)",
        status: "Listed",
        announcementDate: "2023-07-24",
        recordDate: "2024-06-06",
        listingDate: "2024-08-14",
        sector: "FMCG & Hospitality",
        marketCap: "₹6,10,000 Cr",
        rationale: "Asset-right strategy for hospitality business while ITC retains 40% strategic stake and 60% directly held by ITC shareholders.",
    },
    {
        id: "demerger-4",
        companyName: "Reliance Industries Ltd (RELIANCE)",
        symbol: "RELIANCE",
        demergedEntity: "Jio Financial Services Ltd (JIOFIN)",
        ratio: "1 : 1",
        status: "Listed",
        announcementDate: "2022-10-21",
        recordDate: "2023-07-20",
        listingDate: "2023-08-21",
        sector: "Conglomerate / Financial Services",
        marketCap: "₹19,80,000 Cr",
        rationale: "Creation of a giant tech-enabled NBFC leveraging Jio ecosystem for consumer lending, AMC, insurance, and digital payments.",
    },
    {
        id: "demerger-5",
        companyName: "Vedanta Ltd (VEDL)",
        symbol: "VEDL",
        demergedEntity: "Vedanta Aluminum, Oil & Gas, Power, Steel, and Base Metals",
        ratio: "1 : 1 for each spin-off",
        status: "NCLT Approval Pending",
        announcementDate: "2023-09-29",
        recordDate: "TBD FY25",
        listingDate: "TBD FY25",
        sector: "Metals & Mining",
        marketCap: "₹1,65,000 Cr",
        rationale: "Demerger into 6 pure-play commodity sector leaders to unlock sum-of-the-parts (SOTP) value and reduce conglomerate discount.",
    },
    {
        id: "demerger-6",
        companyName: "Aditya Birla Fashion & Retail Ltd (ABFRL)",
        symbol: "ABFRL",
        demergedEntity: "Aditya Birla Lifestyle Brands Ltd",
        ratio: "1 : 1",
        status: "Announced",
        announcementDate: "2024-04-01",
        recordDate: "TBD Q3 FY25",
        listingDate: "TBD Q4 FY25",
        sector: "Retail & Apparel",
        marketCap: "₹31,000 Cr",
        rationale: "Separation of high-margin mature Lifestyle brands (Louis Philippe, Van Heusen, Allen Solly) from high-growth digital/ethnic portfolio.",
    },
]
