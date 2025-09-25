// app/support/page.tsx
"use client"

import { useEffect, useState } from "react"
import PageHeader from "@/components/PageHeader"
import { getCurrentUser } from "@/lib/auth"

const SUPPORT_EMAIL = "support@dinplattform.se"
const SUPPORT_PHONE = "+46 8 123 45 67"
const SUPPORT_HOURS = "Vardagar 08:00–17:00"

type FormState = {
  name: string
  email: string
  subject: string
  message: string
}

export default function SupportPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [savedAt, setSavedAt] = useState<number | null>(null)

  // Förifyll med aktuell användare
  useEffect(() => {
    const u = getCurrentUser()
    setForm((f) => ({
      ...f,
      name: u?.name ?? f.name,
      email: u?.email ?? f.email,
    }))
    // ladda ev. utkast
    try {
      const raw = localStorage.getItem("supportDraft")
      if (raw) {
        const draft = JSON.parse(raw) as Partial<FormState>
        setForm((f) => ({ ...f, ...draft }))
      }
    } catch {}
  }, [])

  function onField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function saveDraft() {
    try {
      localStorage.setItem("supportDraft", JSON.stringify(form))
      setSavedAt(Date.now())
    } catch {}
  }

  function clearDraft() {
    try {
      localStorage.removeItem("supportDraft")
      setSavedAt(null)
    } catch {}
  }

  function mailtoUrl() {
    const subj = form.subject?.trim() || "Supportförfrågan"
    const bodyLines = [
      `Namn: ${form.name || "-"}`,
      `E-post: ${form.email || "-"}`,
      "",
      form.message || "",
    ]
    const body = encodeURIComponent(bodyLines.join("\n"))
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subj
    )}&body=${body}`
  }

  function onSend() {
    // spara utkast för säkerhets skull innan mailklienten öppnas
    saveDraft()
    window.location.href = mailtoUrl()
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Support"
        breadcrumbs={[
          { label: "Konto", href: "/account" },
          { label: "Support" },
        ]}
      />

      {savedAt && (
        <div className="text-xs text-gray-500" aria-live="polite">
          Utkast sparat {new Date(savedAt).toLocaleTimeString()}
        </div>
      )}

      {/* Kontaktinformation */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">Kontakt</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3 text-sm">
          <div className="space-y-1">
            <div className="text-gray-600">E-post</div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="underline decoration-dotted"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
          <div className="space-y-1">
            <div className="text-gray-600">Telefon</div>
            <a
              href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}
              className="underline decoration-dotted"
            >
              {SUPPORT_PHONE}
            </a>
          </div>
          <div className="space-y-1">
            <div className="text-gray-600">Öppettider</div>
            <div className="text-gray-900">{SUPPORT_HOURS}</div>
          </div>
        </div>
      </section>

      {/* Kontaktformulär (via mailto) */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">
          Kontakta support
        </h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <LabeledInput
            label="Namn"
            value={form.name}
            onChange={(v) => onField("name", v)}
            placeholder="Ditt namn"
          />
          <LabeledInput
            label="E-post"
            type="email"
            value={form.email}
            onChange={(v) => onField("email", v)}
            placeholder="namn@foretag.se"
          />
        </div>

        <div className="mt-3 grid gap-3">
          <LabeledInput
            label="Ämne"
            value={form.subject}
            onChange={(v) => onField("subject", v)}
            placeholder="Kort rubrik"
          />
          <LabeledTextarea
            label="Meddelande"
            rows={6}
            value={form.message}
            onChange={(v) => onField("message", v)}
            placeholder="Beskriv ditt ärende, gärna med projekt/anställd/certifikat-ID om relevant."
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onSend}
            className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Skicka via e-post
          </button>
          <button
            onClick={saveDraft}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            Spara utkast
          </button>
          <button
            onClick={clearDraft}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            Rensa utkast
          </button>
        </div>
      </section>
    </main>
  )
}

/* Små fältkomponenter, samma stil som på andra sidor */
function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
      />
    </label>
  )
}

function LabeledTextarea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-700">{label}</span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
      />
    </label>
  )
}
