"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCurrentUser, signOut, type CurrentUser } from "@/lib/auth"

export default function AccountMenu() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<CurrentUser | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    const load = () => setUser(getCurrentUser())
    load()
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "currentUser" || e.key === "auth:user") load()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const initials =
    user?.name
      ?.split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?"

  async function handleLogout() {
    try {
      setOpen(false)
      await signOut()
    } finally {
      // Rensa båda nycklarna för säkerhets skull
      try {
        localStorage.removeItem("auth:user")
        localStorage.removeItem("currentUser")
      } catch {}
      // Trigga lyssnare (t.ex. i andra flikar)
      try {
        window.dispatchEvent(new StorageEvent("storage", { key: "auth:user" }))
        window.dispatchEvent(
          new StorageEvent("storage", { key: "currentUser" })
        )
      } catch {}
      // Gå till login och uppdatera UI
      router.replace("/login")
      router.refresh()
    }
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={user ? `${user.name} (${user.role})` : "Inte inloggad"}
        className="flex items-center justify-center rounded-full h-8 w-8 
             bg-gray-400 text-sm font-semibold text-white hover:bg-gray-500 
             transition focus-visible:outline-none focus-visible:ring-2 
             focus-visible:ring-black/30"
      >
        {initials}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg"
        >
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="text-sm font-semibold text-gray-900">
              {user?.name ?? "Gäst"}
            </div>
            <div className="text-xs text-gray-600">{user?.email ?? "—"}</div>
            {user?.role && (
              <div className="mt-2 inline-flex items-center rounded-lg border border-gray-300 bg-white px-2 py-0.5 text-[11px] text-gray-700">
                Behörighet: {user.role}
              </div>
            )}
          </div>

          <div className="my-2 h-px bg-gray-100" />

          <div className="space-y-1">
            <Link
              href="/profile"
              role="menuitem"
              className="block rounded-lg px-2 py-2 text-sm hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Min profil
            </Link>
            <Link
              href="/account/settings"
              role="menuitem"
              className="block rounded-lg px-2 py-2 text-sm hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Företagsinställningar
            </Link>
            <Link
              href="/support"
              role="menuitem"
              className="block rounded-lg px-2 py-2 text-sm hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Support
            </Link>
            <button
              role="menuitem"
              onClick={handleLogout}
              className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-gray-50"
            >
              Logga ut
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
