import React from "react"
import { Search, SlidersHorizontal } from "lucide-react"

export type CategoryFilter = "All" | "Companies" | "Sectors" | "Earnings" | "Valuation" | "Questions"
export type SortOption = "recently_active" | "newest" | "most_discussed"

interface ForumSearchFilterProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeCategory: CategoryFilter
  setActiveCategory: (cat: CategoryFilter) => void
  activeSort: SortOption
  setActiveSort: (sort: SortOption) => void
  accentColor?: string
}

const CATEGORIES: CategoryFilter[] = ["All", "Companies", "Sectors", "Earnings", "Valuation", "Questions"]

export function ForumSearchFilter({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  activeSort,
  setActiveSort,
  accentColor = "var(--gold, #f5b800)",
}: ForumSearchFilterProps) {
  return (
    <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Search Input Bar & Sort Dropdown */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "16px",
              height: "16px",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          />
          <input
            type="text"
            placeholder="Search companies, discussions, sectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 16px 11px 42px",
              borderRadius: "8px",
              background: "rgba(26, 26, 26, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: "13.5px",
              outline: "none",
              transition: "border-color 0.15s ease",
            }}
            className="focus:border-gold-500/60"
          />
        </div>

        {/* Sort Select */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SlidersHorizontal style={{ width: "14px", height: "14px", color: "rgba(255, 255, 255, 0.4)" }} />
          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value as SortOption)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(26, 26, 26, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "rgba(255, 255, 255, 0.85)",
              fontSize: "13px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="recently_active">Recently Active</option>
            <option value="newest">Newest First</option>
            <option value="most_discussed">Most Discussed</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "4px",
          scrollbarWidth: "none",
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12.5px",
                fontWeight: isActive ? 700 : 500,
                background: isActive ? `${accentColor}22` : "rgba(255, 255, 255, 0.04)",
                color: isActive ? accentColor : "rgba(255, 255, 255, 0.65)",
                border: isActive ? `1px solid ${accentColor}66` : "1px solid rgba(255, 255, 255, 0.08)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
              className="hover:text-white hover:bg-white/10"
            >
              {cat}
            </button>
          )
        })}
      </div>
    </div>
  )
}
