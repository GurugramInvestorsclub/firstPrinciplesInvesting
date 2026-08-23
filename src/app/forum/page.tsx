import Link from "next/link"
import { ShieldCheck, Sparkles, ArrowRight, Compass } from "lucide-react"
import { ForumLayout } from "@/components/forum/ForumLayout"

export const metadata = {
  title: "Community Forums | First Principles Investing",
  description: "Private investment research forums for Subscribers and Super 30 Cohort members.",
}

export default function ForumHubPage() {
  return (
    <ForumLayout>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "20px",
            background: "rgba(245, 184, 0, 0.12)",
            color: "var(--gold, #f5b800)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          <Compass style={{ width: "14px", height: "14px" }} />
          Research Knowledge Base
        </div>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: 0,
            color: "#ffffff",
          }}
        >
          Community Forums
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "rgba(255, 255, 255, 0.6)",
            maxWidth: "580px",
            margin: "10px auto 0",
            lineHeight: "1.6",
          }}
        >
          Structured investment discussions, business analysis, and thesis debate for Super 30 members and Insights subscribers.
        </p>
      </div>

      {/* Forum Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
        {/* Card 1: Super 30 Forum */}
        <div
          style={{
            background: "rgba(22, 22, 22, 0.85)",
            border: "1px solid rgba(245, 184, 0, 0.3)",
            borderRadius: "14px",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "rgba(245, 184, 0, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles style={{ width: "22px", height: "22px", color: "var(--gold, #f5b800)" }} />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  background: "rgba(245, 184, 0, 0.15)",
                  color: "var(--gold, #f5b800)",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                PASSCODE REQUIRED
              </span>
            </div>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.01em" }}>
              SUPER 30 FORUM
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13.5px", marginTop: "8px", lineHeight: "1.55" }}>
              Discuss businesses, sectors, earnings and investment ideas with the Super 30 cohort.
            </p>
          </div>

          <div style={{ marginTop: "28px" }}>
            <Link
              href="/forum/super30"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "12px 18px",
                borderRadius: "8px",
                background: "var(--gold, #f5b800)",
                color: "#000000",
                fontWeight: 700,
                fontSize: "13.5px",
                textDecoration: "none",
              }}
            >
              Open Super 30 Forum <ArrowRight style={{ width: "15px", height: "15px" }} />
            </Link>
          </div>
        </div>

        {/* Card 2: Subscribers Forum */}
        <div
          style={{
            background: "rgba(22, 22, 22, 0.85)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "14px",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "rgba(16, 185, 129, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck style={{ width: "22px", height: "22px", color: "#10b981" }} />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                MEMBERS ONLY
              </span>
            </div>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.01em" }}>
              SUBSCRIBERS FORUM
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13.5px", marginTop: "8px", lineHeight: "1.55" }}>
              Exclusive research discussions for FPI Insights members.
            </p>
          </div>

          <div style={{ marginTop: "28px" }}>
            <Link
              href="/forum/subscribers"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "12px 18px",
                borderRadius: "8px",
                background: "#10b981",
                color: "#000000",
                fontWeight: 700,
                fontSize: "13.5px",
                textDecoration: "none",
              }}
            >
              Open Subscribers Forum <ArrowRight style={{ width: "15px", height: "15px" }} />
            </Link>
          </div>
        </div>
      </div>
    </ForumLayout>
  )
}
