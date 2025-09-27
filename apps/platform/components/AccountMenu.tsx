// components/AccountMenu.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

type Role = "admin" | "manager" | "member" | "read_only" | undefined
type CurrentUser = {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: Role
  orgId?: string
}

export default function AccountMenu() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Fallback till localStorage om vi inte har session (för övergångsperioden)
  const [localUser, setLocalUser] = useState<CurrentUser | null>(null)
  useEffect(() => {
    try {
      const a = localStorage.getItem("currentUser")
      const b = localStorage.getItem("auth:user")
      setLocalUser(
        a
          ? (JSON.parse(a) as CurrentUser)
          : b
            ? (JSON.parse(b) as CurrentUser)
            : null
      )
    } catch {}
  }, [])

  // Slutlig user: prioritera NextAuth-sessionen
  const user: CurrentUser | null = (session?.user as CurrentUser) ?? localUser

  // UI–state för menyn
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

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
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const displayName = user?.name || user?.email || "Gäst"
  const displayEmail = user?.email ?? "—"
  const role: Role = user?.role ?? "admin" // defaulta till admin för din nuvarande demo
  const initials = useMemo(() => {
    const base = user?.name || user?.email || "?"
    return (
      base
        .split(/[ .@_]/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? "")
        .join("") || "?"
    )
  }, [user?.name, user?.email])

  const roleLabel: Record<Exclude<Role, undefined>, string> = {
    admin: "Admin",
    manager: "Chef",
    member: "Medlem",
    read_only: "Läs",
  }

  function roleBadge(role: Role) {
    const label = role ? roleLabel[role] : "—"
    const cls =
      role === "admin"
        ? "border-amber-300 bg-amber-50 text-amber-800"
        : role === "manager"
          ? "border-blue-300 bg-blue-50 text-blue-800"
          : role === "member"
            ? "border-gray-300 bg-gray-50 text-gray-800"
            : "border-slate-300 bg-slate-50 text-slate-800"
    return (
      <span
        className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] ${cls}`}
      >
        Behörighet: {label}
      </span>
    )
  }

  async function handleLogout() {
    setOpen(false)
    // Rensa ev. gamla localStorage-nycklar och logga ut via NextAuth
    try {
      localStorage.removeItem("auth:user")
      localStorage.removeItem("currentUser")
    } catch {}
    await signOut({ callbackUrl: "/login", redirect: true })
  }

  // Laddningsknapp (skeleton) när session håller på att hämtas
  if (status === "loading") {
    return (
      <div
        className="h-8 w-8 animate-pulse rounded-full bg-gray-300"
        aria-label="Laddar…"
      />
    )
  }

  // Om helt utloggad och ingen fallback – visa “Logga in”
  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
      >
        Logga in
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`${displayName} (${roleLabel[role ?? "admin"]})`}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full
                   bg-gray-400 text-sm font-semibold text-white transition
                   hover:bg-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg"
        >
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900">
                {displayName}
              </div>
              <div className="truncate text-xs text-gray-600">
                {displayEmail}
              </div>
              <div className="mt-2">{roleBadge(role)}</div>
            </div>
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
