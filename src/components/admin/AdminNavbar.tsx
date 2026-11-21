"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_LINKS = [
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/registrations", label: "Registrations" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/broadcast", label: "Broadcast" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/super30-codes", label: "Super 30 Codes" },
]

export default function AdminNavbar() {
  const pathname = usePathname()

  return (
    <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(link.href))
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors text-sm font-medium ${
              isActive ? "text-[#F5B800] font-semibold" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
