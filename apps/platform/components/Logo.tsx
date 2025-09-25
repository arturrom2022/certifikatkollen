// components/Logo.tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

function pickLogoUrl(raw: unknown): string | null {
  try {
    const s = raw && typeof raw === "string" ? JSON.parse(raw) : raw
    if (!s || typeof s !== "object") return null
    const a: any = s
    return a.logoDataUrl || a.logoUrl || a?.branding?.logoUrl || null
  } catch {
    return null
  }
}

function readLogoFromStorage(): string | null {
  const c = localStorage.getItem("company")
  const cs = localStorage.getItem("companySettings")
  return pickLogoUrl(c) || pickLogoUrl(cs)
}

export default function Logo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const load = () => setLogoUrl(readLogoFromStorage())

  useEffect(() => {
    load()
    const onStorage = (e: StorageEvent) => {
      if (e.key === "company" || e.key === "companySettings") load()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-zinc-900"
    >
      <span>Certifikatkollen</span>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt="Företagslogotyp"
          className="ml-2 max-h-5 max-w-[100px] shrink-0 object-contain"
        />
      ) : null}
    </Link>
  )
}
