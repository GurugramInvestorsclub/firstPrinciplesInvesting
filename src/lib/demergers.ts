export interface DemergerRecord {
    id: string
    companyName: string
    symbol?: string
    demergedEntity: string
    newTicker?: string
    ratio?: string
    status: string
    stageRaw?: string
    announcementDate?: string
    recordDate?: string
    listingDate?: string
    sector?: string
    marketCap?: string
    rationale?: string
    exchangeLink?: string
    valuation?: string
    notes?: string
}

const GOOGLE_SHEET_ID = "1AXHfMMJT8kJHDyyMUltsaKISW-JvryacBI6McPlctiY"
const GID = "1568933591"

// Direct Google Sheet export CSV URL
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv&gid=${GID}`
// Alternative gviz CSV URL fallback
const GVIZ_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`

/**
 * Robust CSV parser that handles quotes, commas inside text, and title rows.
 */
export function parseCSVToDemergers(csvText: string): DemergerRecord[] {
    const rawLines: string[] = []
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
                rawLines.push(currentLine)
            }
            currentLine = ""
        } else {
            currentLine += char
        }
    }
    if (currentLine.trim()) {
        rawLines.push(currentLine)
    }

    if (rawLines.length === 0) return []

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

    // Find the actual header line by searching for header keywords
    let headerRowIndex = -1
    let headers: string[] = []

    for (let i = 0; i < rawLines.length; i++) {
        const parsed = parseLine(rawLines[i]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""))
        const matchesKeyword = parsed.some((cell) =>
            ["parentcompany", "parent", "company", "resultingentity", "currentstage", "recorddate", "stage", "ticker"].some((k) => cell.includes(k))
        )
        if (matchesKeyword) {
            headerRowIndex = i
            headers = parsed
            break
        }
    }

    if (headerRowIndex === -1) {
        // Fallback: use first non-empty line as header
        headerRowIndex = 0
        headers = parseLine(rawLines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""))
    }

    const getFieldIndex = (possibleNames: string[]): number => {
        return headers.findIndex((h) => possibleNames.some((p) => h.includes(p.toLowerCase().replace(/[^a-z0-9]/g, ""))))
    }

    const colCompany = getFieldIndex(["parentcompanydemerged", "parentcompany", "parent", "company"])
    const colParentTicker = getFieldIndex(["parenttickerbse", "parentticker", "ticker"])
    const colDemerged = getFieldIndex(["resultingentitynew", "resultingentity", "resulting", "newentity", "spinoff"])
    const colNewTicker = getFieldIndex(["newentityticker", "newticker"])
    const colRatio = getFieldIndex(["entitlementratio", "swapratio", "entitlement", "ratio", "swap"])
    const colStatus = getFieldIndex(["currentstage", "stage", "status"])
    const colRecord = getFieldIndex(["recorddate", "record"])
    const colFiling = getFieldIndex(["filingdisclosure", "filing", "disclosure"])
    const colValuation = getFieldIndex(["valuation", "sotp"])
    const colSector = getFieldIndex(["sector", "industry"])

    const records: DemergerRecord[] = []

    for (let i = headerRowIndex + 1; i < rawLines.length; i++) {
        const row = parseLine(rawLines[i])
        if (row.length === 0 || !row.some((cell) => cell.length > 0)) continue

        const companyName = colCompany !== -1 ? row[colCompany] : (row[1] || row[0])
        if (!companyName || companyName.toLowerCase().includes("sample") || companyName.startsWith("#") || companyName.toLowerCase() === "parent company") continue

        const parentTicker = colParentTicker !== -1 ? row[colParentTicker] : ""
        const demergedEntity = colDemerged !== -1 && row[colDemerged] ? row[colDemerged] : "Spin-off Entity"
        const newTicker = colNewTicker !== -1 ? row[colNewTicker] : ""
        const ratio = colRatio !== -1 && row[colRatio] ? row[colRatio] : ""
        const rawStage = colStatus !== -1 && row[colStatus] ? row[colStatus] : "Announced"
        const recordDate = colRecord !== -1 ? row[colRecord] : ""
        const filingLink = colFiling !== -1 ? row[colFiling] : ""
        const valuation = colValuation !== -1 ? row[colValuation] : ""
        const sector = colSector !== -1 ? row[colSector] : ""

        records.push({
            id: `demerger-${i}`,
            companyName: companyName.replace(/^["']|["']$/g, ""),
            symbol: parentTicker || extractSymbol(companyName),
            demergedEntity: demergedEntity.replace(/^["']|["']$/g, ""),
            newTicker: newTicker || "",
            ratio: ratio,
            status: normalizeStatus(rawStage),
            stageRaw: rawStage,
            recordDate: recordDate,
            exchangeLink: filingLink,
            valuation: valuation,
            sector: sector || "Equities",
            rationale: `Demerger of ${demergedEntity} from ${companyName}. Current Stage: ${rawStage}.`,
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
    if (s.includes("listed") || s.includes("completed") || s.includes("done") || s.includes("7.")) return "Listed"
    if (s.includes("effective") || s.includes("record") || s.includes("ex-date") || s.includes("6.")) return "Record Date Set"
    if (s.includes("nclt") || s.includes("approval") || s.includes("pending") || s.includes("regulatory") || s.includes("clearance") || s.includes("2.") || s.includes("3.") || s.includes("4.") || s.includes("5.")) return "NCLT Approval Pending"
    if (s.includes("announced") || s.includes("board") || s.includes("1.")) return "Announced"
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
                cache: "no-store",
                headers: {
                    "Cache-Control": "no-cache",
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

    // Fallback sample records if Google Sheet access is restricted
    return {
        records: FALLBACK_DEMERGER_RECORDS,
        lastUpdated: "Fallback Dataset (Sheet Restricted)",
        isLive: false,
    }
}

export const FALLBACK_DEMERGER_RECORDS: DemergerRecord[] = [
    {
        id: "demerger-1",
        companyName: "Tata Motors Ltd",
        symbol: "500570",
        demergedEntity: "Tata Commercial Vehicles & Tata Passenger Electric Vehicles",
        newTicker: "TBD",
        ratio: "1 : 1",
        status: "NCLT Approval Pending",
        stageRaw: "2. Regulatory clearance",
        announcementDate: "2024-03-04",
        recordDate: "TBD Q3 FY25",
        listingDate: "TBD Q4 FY25",
        sector: "Automobile & EV",
        marketCap: "₹3,40,000 Cr",
        valuation: "Open SOTP →",
        rationale: "Separation of Commercial Vehicle (CV) business from Passenger Vehicle (PV + EV + JLR) business to enhance focus and market valuations.",
    },
    {
        id: "demerger-2",
        companyName: "HEG Ltd",
        symbol: "509631",
        demergedEntity: "HEG Graphite Ltd (→ renamed HEG Ltd)",
        newTicker: "Not yet listed",
        ratio: "1 : 1",
        status: "Record Date Set",
        stageRaw: "6. Effective / Record date",
        recordDate: "07/09/2026",
        valuation: "Open SOTP →",
        sector: "Graphite & Industrial",
    },
    {
        id: "demerger-3",
        companyName: "India Glycols Ltd",
        symbol: "500201",
        demergedEntity: "Ennature Bio Pharma + IGL Spirits",
        newTicker: "see tab",
        ratio: "1 : 1",
        status: "Record Date Set",
        stageRaw: "6. Effective / Record date",
        recordDate: "02/09/2026",
        valuation: "Open SOTP →",
        sector: "Pharma & Spirits",
    },
]
