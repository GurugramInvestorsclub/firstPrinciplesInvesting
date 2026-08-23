import Link from "next/link"
import { ShieldCheck, Sparkles, MessageSquare, Lock, Key, ArrowRight, Compass } from "lucide-react"

export const metadata = {
  title: "Community Forums | First Principles Investing",
  description: "Private discussion forums for Subscribers and Super 30 Cohort members.",
}

export default function ForumHubPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-deep, #0a0a0a)",
        color: "var(--text-primary, #fff)",
        padding: "60px 24px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "20px",
              background: "rgba(245, 184, 0, 0.12)",
              color: "var(--gold, #f5b800)",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              marginBottom: "16px",
            }}
          >
            <Compass style={{ width: "16px", height: "16px" }} />
            FPI Community Hub
          </div>
          <h1
            style={{
              fontSize: "42px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "#fff",
            }}
          >
            Community Forums
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "rgba(255, 255, 255, 0.6)",
              maxWidth: "600px",
              margin: "12px auto 0",
              lineHeight: "1.6",
            }}
          >
            High-signal discussion spaces for active research subscribers and Super 30 cohort members.
          </p>
        </div>

        {/* Forum Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "28px" }}>
          {/* Card 1: Subscribers Forum */}
          <div
            style={{
              background: "rgba(26, 26, 26, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "32px",
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(16, 185, 129, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldCheck style={{ width: "26px", height: "26px", color: "#10b981" }} />
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  MEMBERS ONLY
                </span>
              </div>

              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: 0 }}>
                Subscribers Forum
              </h2>
              <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px", marginTop: "10px", lineHeight: "1.6" }}>
                Exclusive research discussions for active FPI Insights subscribers. Share analysis, ask questions, and engage with fellow investors.
              </p>
            </div>

            <div style={{ marginTop: "32px" }}>
              <Link
                href="/forum/subscribers"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  background: "#10b981",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                Enter Subscribers Forum <ArrowRight style={{ width: "16px", height: "16px" }} />
              </Link>
            </div>
          </div>

          {/* Card 2: Super 30 Forum */}
          <div
            style={{
              background: "rgba(26, 26, 26, 0.8)",
              border: "1px solid rgba(245, 184, 0, 0.25)",
              borderRadius: "16px",
              padding: "32px",
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(245, 184, 0, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles style={{ width: "26px", height: "26px", color: "var(--gold, #f5b800)" }} />
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "rgba(245, 184, 0, 0.15)",
                    color: "var(--gold, #f5b800)",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  PASSCODE REQUIRED
                </span>
              </div>

              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: 0 }}>
                Super 30 Forum
              </h2>
              <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px", marginTop: "10px", lineHeight: "1.6" }}>
                Private cohort space for Super 30 members. Enter your invitation passcode to unlock deep-dive discussions and cohort updates.
              </p>
            </div>

            <div style={{ marginTop: "32px" }}>
              <Link
                href="/forum/super30"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  background: "var(--gold, #f5b800)",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                Enter Super 30 Forum <ArrowRight style={{ width: "16px", height: "16px" }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
