// app/(auth)/login/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Route } from "next"
import PageHeader from "@/components/PageHeader"

type FormState = {
  username: string
  password: string
  remember: boolean
}

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const returnToRaw = search.get("returnTo") || "/"
  const returnTo: Route = returnToRaw.startsWith("/")
    ? (returnToRaw as Route)
    : ("/" as Route)

  const [form, setForm] = useState<FormState>({
    username: "",
    password: "",
    remember: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // nya states för vy-läge och formulär
  const [mode, setMode] = useState<"login" | "reset" | "signup">("login")
  const [resetEmail, setResetEmail] = useState("")
  const [signup, setSignup] = useState({
    company: "",
    name: "",
    email: "",
    password: "",
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth:user")
      if (raw) router.replace(returnTo)
    } catch {}
  }, [router, returnTo])

  function onChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const username = form.username.trim()
    const password = form.password.trim()

    if (!username) return setError("Ange ditt användarnamn.")
    if (!password) return setError("Ange ditt lösenord.")

    try {
      setLoading(true)
      const looksLikeEmail = /@/.test(username)
      const payload = {
        name: username,
        email: looksLikeEmail ? username : undefined,
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem("auth:user", JSON.stringify(payload))
      try {
        window.dispatchEvent(new StorageEvent("storage", { key: "auth:user" }))
      } catch {}
      router.replace(returnTo)
    } catch {
      setError("Kunde inte slutföra inloggningen. Försök igen.")
    } finally {
      setLoading(false)
    }
  }

  function onResetSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!resetEmail) return setError("Ange din e-postadress.")
    // Här kopplar du backend senare
    alert(`Länk för återställning skickad till ${resetEmail}`)
    setMode("login")
  }

  function onSignupSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const { company, name, email, password } = signup
    if (!company.trim()) return setError("Ange företagsnamn.")
    if (!name.trim()) return setError("Ange ditt namn.")
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return setError("Ange en giltig e-postadress.")
    if (!password.trim() || password.length < 6)
      return setError("Lösenord måste vara minst 6 tecken.")

    // Demo: ”skapa konto” loggar in direkt
    const payload = {
      org: company.trim(),
      name: name.trim(),
      email: email.trim(),
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem("auth:user", JSON.stringify(payload))
    try {
      window.dispatchEvent(new StorageEvent("storage", { key: "auth:user" }))
    } catch {}
    router.replace(returnTo)
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title={
          mode === "login"
            ? "Logga in"
            : mode === "reset"
              ? "Återställ lösenord"
              : "Skapa konto"
        }
      />

      {mode === "login" && (
        <>
          {/* Login-formulär */}
          <form
            onSubmit={onSubmit}
            className="max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-800">
                  Användarnamn
                </span>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => onChange("username", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
                  placeholder="anvandare@foretag.se"
                  autoComplete="username"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-800">
                  Lösenord
                </span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => onChange("password", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => onChange("remember", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900"
                />
                <span className="text-sm text-gray-700">
                  Håll mig inloggad på den här enheten
                </span>
              </label>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 disabled:opacity-60"
            >
              {loading ? "Loggar in…" : "Logga in"}
            </button>

            <div className="mt-2 text-sm">
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="underline hover:decoration-solid underline-offset-4 decoration-dotted text-left"
              >
                Glömt lösenord?
              </button>
            </div>
          </form>

          {/* CTA: Skapa konto */}
          <div className="max-w-md mx-auto flex items-center justify-center gap-3">
            <span className="text-sm text-gray-700">
              Har ditt företag inget konto?
            </span>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white hover:bg-gray-100"
            >
              Skapa konto
            </button>
          </div>
        </>
      )}

      {mode === "reset" && (
        <>
          {/* Reset-formulär */}
          <form
            onSubmit={onResetSubmit}
            className="max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-800">
                Uppge din e-postadress
              </span>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
                placeholder="namn@foretag.se"
                autoComplete="email"
                required
              />
            </label>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200"
            >
              Skicka återställningslänk
            </button>

            <div className="mt-2 text-sm">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="underline underline-offset-4 hover:decoration-solid decoration-dotted"
              >
                ← Tillbaka till inloggning
              </button>
            </div>
          </form>
        </>
      )}

      {mode === "signup" && (
        <>
          {/* Skapa konto-formulär */}
          <form
            onSubmit={onSignupSubmit}
            className="max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-800">
                Företagsnamn
              </span>
              <input
                type="text"
                value={signup.company}
                onChange={(e) =>
                  setSignup({ ...signup, company: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
                placeholder="Ex: Bygg & Co AB"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-800">
                Ditt namn
              </span>
              <input
                type="text"
                value={signup.name}
                onChange={(e) => setSignup({ ...signup, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
                placeholder="För- och efternamn"
                autoComplete="name"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-800">
                E-post
              </span>
              <input
                type="email"
                value={signup.email}
                onChange={(e) =>
                  setSignup({ ...signup, email: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
                placeholder="namn@företag.se"
                autoComplete="email"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-800">
                Lösenord
              </span>
              <input
                type="password"
                value={signup.password}
                onChange={(e) =>
                  setSignup({ ...signup, password: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
                placeholder="Minst 6 tecken"
                autoComplete="new-password"
                required
              />
            </label>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200"
            >
              Skapa konto
            </button>

            <div className="mt-2 text-sm">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="underline underline-offset-4 hover:decoration-solid decoration-dotted"
              >
                ← Tillbaka till inloggning
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  )
}
