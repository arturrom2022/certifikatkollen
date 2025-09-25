"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

function IconHome({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <path
        d="M3 11.5 12 4l9 7.5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 10.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9.5"
        strokeWidth="1.8"
      />
    </svg>
  )
}
function IconUsers({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="9" cy="7" r="4" strokeWidth="1.8" />
      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16 3.13a4 4 0 0 1 0 7.75"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
function IconBadge({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <rect x="3" y="4" width="18" height="16" rx="3" strokeWidth="1.8" />
      <path d="M7 8h10M7 12h6" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function IconProjects({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <rect x="3" y="4" width="7" height="16" rx="1.5" strokeWidth="1.8" />
      <rect x="14" y="8" width="7" height="12" rx="1.5" strokeWidth="1.8" />
    </svg>
  )
}

const NAV = [
  { href: "/", label: "Översikt", icon: <IconHome /> },
  { href: "/projects", label: "Projekt", icon: <IconProjects /> },
  { href: "/employees", label: "Anställda", icon: <IconUsers /> },
  { href: "/certificates", label: "Certifikat", icon: <IconBadge /> },
]

export default function HeaderNav({ className = "" }: { className?: string }) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href)

  return (
    <nav className={`flex items-center gap-1 ${className}`}>
      {NAV.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={[
              "flex items-center min-h-9 gap-2 rounded-xl px-3 py-2 text-sm font-semibold tracking-tight transition",
              active ? "bg-gray-200" : "hover:bg-gray-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30",
            ].join(" ")}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
