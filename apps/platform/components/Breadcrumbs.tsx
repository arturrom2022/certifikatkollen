"use client"

import Link from "next/link"
import type { Route } from "next"

type Crumb = {
  label: string
  href?: string
}

export default function Breadcrumbs({
  items,
  className = "",
}: {
  items: Crumb[]
  className?: string
}) {
  if (!items?.length) return null

  return (
    <nav
      className={`flex items-center text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        const safeHref: Route | null =
          item.href && item.href.startsWith("/") ? (item.href as Route) : null

        return (
          <span key={i} className="flex items-center">
            {i > 0 && (
              <span aria-hidden className="mx-1 text-gray-400">
                ›
              </span>
            )}
            {isLast || !safeHref ? (
              <span className="truncate text-gray-700 font-medium">
                {item.label}
              </span>
            ) : (
              <Link
                href={safeHref}
                className="truncate text-gray-500 hover:text-gray-900"
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
