// components/PageHeader.tsx
"use client"

import Breadcrumbs from "./Breadcrumbs"
import { ReactNode } from "react"

type Crumb = { label: string; href?: string }

export default function PageHeader({
  items,
  breadcrumbs,
  title,
  subtitle,
  actions,
  className = "",
}: {
  /** Äldre prop-namn – lämnas kvar för bakåtkompatibilitet */
  items?: Crumb[]
  /** Nyare prop-namn – föredras om båda skickas in */
  breadcrumbs?: Crumb[]
  /** Valfri – renderas som H1 under brödsmulorna om satt */
  title?: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}) {
  const crumbs: Crumb[] = breadcrumbs ?? items ?? []

  return (
    <div className={className}>
      {/* Rad 1: Breadcrumbs */}
      {crumbs.length > 0 && (
        <div className="mb-1">
          <Breadcrumbs items={crumbs} />
        </div>
      )}

      {/* Rad 2: Titel/undertitel + actions */}
      <div className="flex items-center justify-between gap-3">
        <div>
          {title && (
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          )}
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>

        {actions ? (
          <div className="min-h-[40px] flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  )
}
