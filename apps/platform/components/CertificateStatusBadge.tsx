"use client"

type Props = {
  status: "active" | "archived" | undefined
  expiryDate?: string | null
  soonThreshold?: number // default 30
}

/** Samma färg-/textlogik som på certifikatslistan */
export default function CertificateStatusBadge({
  status,
  expiryDate,
  soonThreshold = 30,
}: Props) {
  const base = "rounded-full border px-2 py-0.5 text-xs"

  if (status === "archived") {
    return (
      <span className={`${base} border-gray-300 bg-gray-100 text-gray-700`}>
        Arkiverat
      </span>
    )
  }

  // Beräkna dagar till utgång (eller null om saknas/ogiltigt)
  const d = daysUntil(expiryDate)

  // Ingen utgång → Aktiv
  if (d === null) {
    return (
      <span className={`${base} border-green-200 bg-green-50 text-green-700`}>
        Aktiv
      </span>
    )
  }

  // Redan utgånget
  if (d < 0) {
    const dateLabel = expiryDate
      ? new Date(expiryDate).toLocaleDateString("sv-SE")
      : ""
    return (
      <span className={`${base} border-red-200 bg-red-50 text-red-700`}>
        Utgick {dateLabel}
      </span>
    )
  }

  // Går ut snart
  if (d <= soonThreshold) {
    const dText = d === 1 ? "1 dag" : `${d} dagar`
    return (
      <span className={`${base} border-amber-200 bg-amber-50 text-amber-800`}>
        Utgår om {dText}
      </span>
    )
  }

  // Aktiv (framtida, > threshold)
  return (
    <span className={`${base} border-green-200 bg-green-50 text-green-700`}>
      Aktiv
    </span>
  )
}

function daysUntil(dateIso?: string | null): number | null {
  if (!dateIso) return null
  const d = new Date(dateIso)
  if (isNaN(d.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}
