// app/profile/page.tsx
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import PageHeader from "@/components/PageHeader"
import { getCurrentUser, updateCurrentUserProfile } from "@/lib/auth"

type UserForm = {
  name: string
  email: string
  role?: string
  phone?: string
  title?: string
  department?: string
  avatarDataUrl?: string
  locale?: string
  timezone?: string
  notifyEmail?: string
  weeklyDigest?: boolean
}

const ROLE_CONTENT: Record<
  string,
  { title: string; desc: string; permissions: string[] }
> = {
  admin: {
    title: "Administratör",
    desc: "Full åtkomst till plattformen inklusive användare, företagsinställningar och alla certifikat/anställda.",
    permissions: [
      "Hantera företagsinställningar och branding",
      "Lägga till/ta bort användare och justera roller",
      "Se och redigera alla projekt, anställda och certifikat",
      "Exportera/importera data",
    ],
  },
  manager: {
    title: "Chef/Projektledare",
    desc: "Åtkomst för att leda team och projekt, samt hantera certifikat inom sitt område.",
    permissions: [
      "Se och uppdatera anställda i egna team",
      "Hantera projekt och certifikat i tilldelade enheter",
      "Läsa rapporter och aviseringar",
    ],
  },
  user: {
    title: "Medarbetare",
    desc: "Grundläggande åtkomst för att se och uppdatera sin egen profil samt egna certifikat.",
    permissions: [
      "Uppdatera egen profil och kontaktuppgifter",
      "Se egna certifikat och aviseringar",
    ],
  },
}

export default function ProfilePage() {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    role: "",
    phone: "",
    title: "",
    department: "",
    avatarDataUrl: "",
    locale: "",
    timezone: "",
    notifyEmail: "",
    weeklyDigest: true,
  })

  // 🔒 Redigeringsläge (oförändrat)
  const [isEditing, setIsEditing] = useState(false)
  const originalRef = useRef<UserForm | null>(null)

  // Ladda aktuell användare
  useEffect(() => {
    const u = getCurrentUser() as Partial<UserForm> | null
    if (u) setForm((f) => ({ ...f, ...u }))
  }, [])

  function onChange<K extends keyof UserForm>(key: K, val: UserForm[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function startEdit() {
    if (isEditing) return
    // Spara en fryst kopia för jämförelse och Avbryt
    originalRef.current = JSON.parse(JSON.stringify(form))
    setIsEditing(true)
  }

  function cancelEdit() {
    if (originalRef.current) setForm(originalRef.current)
    setIsEditing(false)
  }

  function onSave() {
    setSaving(true)
    try {
      updateCurrentUserProfile(form)
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  // Disabled-logic: Spara aktiv endast om något ändrats i edit-läge
  const isDirty = useMemo(() => {
    if (!isEditing || !originalRef.current) return false
    return JSON.stringify(form) !== JSON.stringify(originalRef.current)
  }, [isEditing, form])

  const subtitle = "Hantera din personliga profil och kontaktuppgifter"

  // Behörighetsinfo (oförändrat)
  const roleKey = (form.role || "").toLowerCase().trim()
  const roleInfo = (roleKey && ROLE_CONTENT[roleKey]) || {
    title: form.role || "Okänd behörighet",
    desc: "Denna behörighet används i er organisation. Kontakta administratör om du behöver ändra behörighet eller få mer information.",
    permissions: ["Se din profil", "Uppdatera dina egna uppgifter"],
  }

  const btn =
    "rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex items-center gap-2"

  return (
    <main className="space-y-6">
      {/* Header med actions till höger (i linje med subtitle) */}
      <PageHeader
        title="Min profil"
        subtitle={subtitle}
        breadcrumbs={[
          { label: "Konto", href: "/account" },
          { label: "Min profil" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button onClick={startEdit} className={btn}>
                Redigera profil
              </button>
            ) : (
              <>
                <button onClick={cancelEdit} className={btn}>
                  Avbryt
                </button>
                <button
                  onClick={onSave}
                  disabled={saving || !isDirty}
                  className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 disabled:hover:bg-gray-900 disabled:cursor-not-allowed"
                >
                  {saving ? "Sparar…" : "Spara"}
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Profil (fält låsta i läsläge) */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">Profil</h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <LabeledInput
            label="Namn"
            value={form.name}
            onChange={(v) => onChange("name", v)}
            placeholder="För- och efternamn"
            disabled={!isEditing}
          />
          <LabeledInput
            label="E-post"
            type="email"
            value={form.email}
            onChange={(v) => onChange("email", v)}
            placeholder="namn@foretag.se"
            disabled={!isEditing}
          />
          <LabeledInput
            label="Telefon"
            value={form.phone ?? ""}
            onChange={(v) => onChange("phone", v)}
            placeholder="+46…"
            disabled={!isEditing}
          />
          <LabeledInput
            label="Titel/roll"
            value={form.title ?? form.role ?? ""}
            onChange={(v) => onChange("title", v)}
            placeholder="Projektledare"
            disabled={!isEditing}
          />
          <LabeledInput
            label="Avdelning"
            value={form.department ?? ""}
            onChange={(v) => onChange("department", v)}
            placeholder="Bygg & anläggning"
            disabled={!isEditing}
          />
        </div>
      </section>

      {/* Behörighet */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 tracking-tight">
          Behörighet
        </h2>
        <div className="mt-1 text-[15px] font-semibold text-gray-900 leading-6">
          {roleInfo.title}
        </div>
        <p className="mt-1 text-sm text-gray-600 leading-6 max-w-3xl">
          {roleInfo.desc}
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-gray-800">
          {roleInfo.permissions.map((p, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <svg
                className="mt-1 h-3.5 w-3.5 shrink-0 text-gray-500"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M16.7 5.5l-7.6 8-3.8-3.8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="leading-6">{p}</span>
            </li>
          ))}
        </ul>
        {!form.role && (
          <p className="mt-2 text-xs text-gray-500 leading-5">
            Saknar du behörighet eller behöver utökad åtkomst? Kontakta en
            administratör.
          </p>
        )}
      </section>

      {/* Preferenser */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">Preferenser</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <LabeledInput
            label="Språk (locale)"
            value={form.locale ?? ""}
            onChange={(v) => onChange("locale", v)}
            placeholder="sv-SE"
            disabled={!isEditing}
          />
          <LabeledInput
            label="Tidszon"
            value={form.timezone ?? ""}
            onChange={(v) => onChange("timezone", v)}
            placeholder="Europe/Stockholm"
            disabled={!isEditing}
          />
          <LabeledInput
            label="Aviserings-e-post"
            type="email"
            value={form.notifyEmail ?? form.email ?? ""}
            onChange={(v) => onChange("notifyEmail", v)}
            placeholder="aviseringar@foretag.se"
            disabled={!isEditing}
          />
        </div>

        <label
          className={`mt-3 inline-flex items-center gap-2 ${
            !isEditing ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={!!form.weeklyDigest}
            onChange={(e) => {
              if (!isEditing) return
              onChange("weeklyDigest", e.target.checked)
            }}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-black/10"
            disabled={!isEditing}
          />
          <span className="text-sm text-gray-800">
            Skicka veckosammanfattning
          </span>
        </label>
      </section>
    </main>
  )
}

/* --- små fältkomponenter --- */
function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <label className={`block ${disabled ? "opacity-60" : ""}`}>
      <span className="block text-xs font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed"
      />
    </label>
  )
}
