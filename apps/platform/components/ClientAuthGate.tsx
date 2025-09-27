// app/ClientAuthGate.tsx
"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function ClientAuthGate() {
  const pathname = usePathname() || "/"
  const router = useRouter()

  useEffect(() => {
    const PUBLIC_PATHS = new Set<string>([
      "/login",
      "/privacy",
      "/terms",
      "/security",
      "/support",
    ])

    const isAsset = () =>
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/icons")

    const isPublic = () =>
      PUBLIC_PATHS.has(pathname) || pathname.startsWith("/info/")

    const hasSession = () => {
      try {
        const a = localStorage.getItem("auth:user")
        const b = localStorage.getItem("currentUser")
        return Boolean(a || b)
      } catch {
        return false
      }
    }

    const enforce = () => {
      if (isAsset() || isPublic()) return
      if (!hasSession()) {
        const ret = encodeURIComponent(pathname || "/")
        router.replace(`/login?returnTo=${ret}`)
      }
    }

    enforce()

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "auth:user" || e.key === "currentUser") {
        enforce()
      }
    }
    window.addEventListener("storage", onStorage)

    const onVis = () => {
      if (document.visibilityState === "visible") enforce()
    }
    document.addEventListener("visibilitychange", onVis)

    return () => {
      window.removeEventListener("storage", onStorage)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [pathname, router])

  return null
}
