"use client"

import * as React from "react"

type SortDir = "asc" | "desc"
type Props = {
  title: string
  isActive: boolean // kolumnen är den som sorteras just nu
  dir: SortDir | null // aktuell riktning (eller null = ingen)
  onToggle: () => void // asc -> desc -> null (din 3-stegare)
  className?: string // extra utility-classes på <th> om du vill
}

/**
 * Visuellt och interaktionsmässigt matchar certifikatsidan:
 * - <th class="px-0"> och själva knappen har px-4 py-4
 * - Dubbla pilar staplade med liten negativ spacing
 * - Button fyller hela cellen för generös klickyta
 */
export default function HeaderCell({
  title,
  isActive,
  dir,
  onToggle,
  className,
}: Props) {
  // a11y: mappa till aria-sort enligt WAI-ARIA Authoring Practices
  const ariaSort: React.AriaAttributes["aria-sort"] =
    !isActive || dir === null
      ? "none"
      : dir === "asc"
      ? "ascending"
      : "descending"

  return (
    <th className={`px-0 ${className ?? ""}`} aria-sort={ariaSort}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full th-shell focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
      >
        <span>{title}</span>
        <span className="inline-flex flex-col items-center leading-none -space-y-2">
          <svg
            viewBox="0 0 20 20"
            className={`h-4 w-4 ${
              isActive && dir === "asc" ? "text-gray-900" : "text-gray-400"
            }`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 5l4 5H6l4-5z" />
          </svg>
          <svg
            viewBox="0 0 20 20"
            className={`h-4 w-4 ${
              isActive && dir === "desc" ? "text-gray-900" : "text-gray-400"
            }`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 15l-4-5h8l-4 5z" />
          </svg>
        </span>
      </button>
    </th>
  )
}
