import React from "react"

export function ForumSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {[1, 2, 3, 4, 5].map((idx) => (
        <div
          key={idx}
          style={{
            background: "rgba(22, 22, 22, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
          className="animate-pulse"
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ width: "120px", height: "12px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "4px" }} />
            <div style={{ width: "60px", height: "12px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "4px" }} />
          </div>

          <div style={{ width: "70%", height: "18px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "4px" }} />

          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ width: "160px", height: "12px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "4px" }} />
            <div style={{ width: "200px", height: "12px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "4px" }} />
          </div>
        </div>
      ))}
    </div>
  )
}
