// components/QuickActions.tsx
"use client"

import Link from "next/link"

export default function QuickActions({
  onExport,
  className = "",
}: {
  onExport?: () => void
  className?: string
}) {
  const btn =
    "rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex items-center gap-2"

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Nytt projekt */}
      <Link href="/projects/new" className={btn} title="Lägg till projekt">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 7a2 2 0 0 1 2-2h7l5 5v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M14 5v4h4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
        Lägg till projekt
      </Link>

      {/* Ny anställd */}
      <Link href="/employees/new" className={btn} title="Lägg till anställd">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <circle
            cx="12"
            cy="7"
            r="3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M4 20a8 8 0 0 1 16 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M19 7h3m-1.5-1.5V8.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
        Lägg till anställd
      </Link>

      {/* Nytt certifikat */}
      <Link
        href="/certificates/new"
        className={btn}
        title="Lägg till certifikat"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 3h9l3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 8v6m-3-3h6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
        Lägg till certifikat
      </Link>

      {/* Exportera rapport (valfri) */}
      <button
        type="button"
        onClick={onExport}
        className={btn}
        title="Exportera översiktsrapport"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3v10m0 0l-4-4m4 4l4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
        Exportera rapport
      </button>
    </div>
  )
}
