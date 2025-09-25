// app/account/company-settings/page.tsx
"use client"

import { useEffect, useState } from "react"
import PageHeader from "@/components/PageHeader"

type Company = {
  name: string
  orgNumber: string
  industry?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  street?: string
  zip?: string
  city?: string
  country?: string
  logoDataUrl?: string
  notifyEmail?: string
  notifyDaysBefore?: number
  weeklyDigest?: boolean
  billingEmail?: string
  billingRef?: string
}

const LS_KEY = "company"

const DEFAULT_COMPANY: Company = {
  name: "",
  orgNumber: "",
  industry: "Bygg & anläggning",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  street: "",
  zip: "",
  city: "",
  country: "Sverige",
  logoDataUrl: "",
  notifyEmail: "",
  notifyDaysBefore: 30,
  weeklyDigest: true,
  billingEmail: "",
  billingRef: "",
}

// Enkel djupjämförelse för dirty check
function isEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export default function CompanySettingsPage() {
  const [company, setCompany] = useState<Company>(DEFAULT_COMPANY)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Redigeringsläge
  const [editing, setEditing] = useState(false)
  const [snapshot, setSnapshot] = useState<Company | null>(null)

  // Ladda från localStorage (endast data)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        // Om gamla poster har brandColor så ignoreras de automatiskt
        const parsed = JSON.parse(raw) as Partial<Company>
        const merged: Company = { ...DEFAULT_COMPANY, ...parsed }
        setCompany(merged)
        setLogoPreview(merged.logoDataUrl || null)
      }
    } catch {}
  }, [])

  const isDirty = Boolean(editing && snapshot && !isEqual(company, snapshot))

  function save() {
    if (!isDirty) return
    setSaving(true)
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(company))
      window.dispatchEvent(new StorageEvent("storage", { key: LS_KEY }))
      setEditing(false) // lämna redigeringsläge
      setSnapshot(null)
    } finally {
      setSaving(false)
    }
  }

  function resetToDefaults() {
    if (!confirm("Återställ företagsinställningar?")) return

    // Återställ state
    setCompany(DEFAULT_COMPANY)
    setLogoPreview(null)

    // Spara i localStorage
    localStorage.setItem(LS_KEY, JSON.stringify(DEFAULT_COMPANY))

    // Informera andra flikar/komponenter
    window.dispatchEvent(new StorageEvent("storage", { key: LS_KEY }))

    // Avsluta ev. redigeringsläge
    setEditing(false)
    setSnapshot(null)
  }

  function startEditing() {
    setSnapshot(company) // spara nuvarande värden för Avbryt
    setEditing(true)
  }

  function cancelEditing() {
    if (snapshot) setCompany(snapshot)
    setEditing(false)
    setSnapshot(null)
  }

  // Export/Import-funktioner sparade om du vill återaktivera knappar senare
  function exportCompany() {
    const blob = new Blob([JSON.stringify(company, null, 2)], {
      type: "application/json;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "company-settings.json"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function importCompany(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<Company>
        const merged: Company = { ...DEFAULT_COMPANY, ...parsed }
        setCompany(merged)
        setLogoPreview(merged.logoDataUrl || null)
        localStorage.setItem(LS_KEY, JSON.stringify(merged))
        window.dispatchEvent(new StorageEvent("storage", { key: LS_KEY }))
      } catch {
        alert("Kunde inte läsa filen. Kontrollera att det är en giltig JSON.")
      }
    }
    reader.readAsText(file)
  }

  function onLogoSelected(file: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      setCompany((c) => ({ ...c, logoDataUrl: dataUrl }))
      setLogoPreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  // hjälpklass för disabled inputs i visningsläge
  const disabledCls = editing ? "" : "opacity-60 cursor-not-allowed bg-gray-50"
  const btn =
    "rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex items-center gap-2"

  return (
    <main className="space-y-6">
      {/* Grupp: header (utan 'senast sparat') */}
      <div>
        <PageHeader
          title="Företagsinställningar"
          subtitle="Hantera företagsuppgifter, aviseringar, branding och export."
          breadcrumbs={[
            { label: "Konto", href: "/account" },
            { label: "Företagsinställningar" },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {!editing ? (
                <button onClick={startEditing} className={btn}>
                  Redigera företagsinställningar
                </button>
              ) : (
                <>
                  <button onClick={cancelEditing} className={btn}>
                    Avbryt
                  </button>
                  <button
                    onClick={save}
                    disabled={saving || !isDirty}
                    className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? "Sparar…" : "Spara"}
                  </button>
                </>
              )}
            </div>
          }
        />
      </div>

      {/* Sektion: Företagsuppgifter */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">
          Företagsuppgifter
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <LabeledInput
            label="Företagsnamn"
            value={company.name}
            onChange={(v) => setCompany((c) => ({ ...c, name: v }))}
            placeholder="Ex. Bygg & Co AB"
            disabled={!editing}
            extraClass={disabledCls}
          />
          <LabeledInput
            label="Organisationsnummer"
            value={company.orgNumber}
            onChange={(v) => setCompany((c) => ({ ...c, orgNumber: v }))}
            placeholder="Ex. 556012-3456"
            disabled={!editing}
            extraClass={disabledCls}
          />
          <LabeledInput
            label="Bransch"
            value={company.industry ?? ""}
            onChange={(v) => setCompany((c) => ({ ...c, industry: v }))}
            placeholder="Bygg & anläggning"
            disabled={!editing}
            extraClass={disabledCls}
          />
        </div>
      </section>

      {/* Sektion: Kontakt & Adress */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">
          Kontakt & adress
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <LabeledInput
            label="Kontaktperson"
            value={company.contactName ?? ""}
            onChange={(v) => setCompany((c) => ({ ...c, contactName: v }))}
            disabled={!editing}
            extraClass={disabledCls}
          />
          <LabeledInput
            label="E-post"
            type="email"
            value={company.contactEmail ?? ""}
            onChange={(v) => setCompany((c) => ({ ...c, contactEmail: v }))}
            disabled={!editing}
            extraClass={disabledCls}
          />
          <LabeledInput
            label="Telefon"
            value={company.contactPhone ?? ""}
            onChange={(v) => setCompany((c) => ({ ...c, contactPhone: v }))}
            disabled={!editing}
            extraClass={disabledCls}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <LabeledInput
            label="Gatuadress"
            value={company.street ?? ""}
            onChange={(v) => setCompany((c) => ({ ...c, street: v }))}
            disabled={!editing}
            extraClass={disabledCls}
          />
          <div className="grid grid-cols-3 gap-3">
            <LabeledInput
              label="Postnr"
              value={company.zip ?? ""}
              onChange={(v) => setCompany((c) => ({ ...c, zip: v }))}
              disabled={!editing}
              extraClass={disabledCls}
            />
            <LabeledInput
              label="Ort"
              value={company.city ?? ""}
              onChange={(v) => setCompany((c) => ({ ...c, city: v }))}
              disabled={!editing}
              extraClass={disabledCls}
            />
            <LabeledInput
              label="Land"
              value={company.country ?? ""}
              onChange={(v) => setCompany((c) => ({ ...c, country: v }))}
              disabled={!editing}
              extraClass={disabledCls}
            />
          </div>
        </div>
      </section>

      {/* Sektion: Aviseringar */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">Aviseringar</h2>
        <p className="mt-1 text-sm text-gray-600">
          Automatiska e-postpåminnelser om certifikat som snart går ut.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <LabeledInput
            label="Mottagar-e-post"
            type="email"
            value={company.notifyEmail ?? ""}
            onChange={(v) => setCompany((c) => ({ ...c, notifyEmail: v }))}
            placeholder="t.ex. hr@dittforetag.se"
            disabled={!editing}
            extraClass={disabledCls}
          />
          <LabeledInput
            label="Dagar innan utgång"
            type="number"
            min={0}
            value={String(company.notifyDaysBefore ?? 30)}
            onChange={(v) =>
              setCompany((c) => ({
                ...c,
                notifyDaysBefore: Math.max(0, Number(v) || 0),
              }))
            }
            disabled={!editing}
            extraClass={disabledCls}
          />
          <LabeledCheckbox
            label="Veckosammanfattning"
            checked={!!company.weeklyDigest}
            onChange={(checked) =>
              setCompany((c) => ({ ...c, weeklyDigest: checked }))
            }
            disabled={!editing}
          />
        </div>
      </section>

      {/* Sektion: Branding (utan Primär färg) */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">Branding</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {/* Endast logotyp + förhandsvisning */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Logotyp (PNG/SVG)
            </label>
            <label
              className={`inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm ${
                editing
                  ? "cursor-pointer hover:bg-gray-50"
                  : "opacity-60 cursor-not-allowed"
              }`}
              aria-disabled={!editing}
            >
              Ladda upp
              <input
                type="file"
                accept="image/png,image/svg+xml"
                className="hidden"
                disabled={!editing}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) onLogoSelected(f)
                }}
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Förhandsvisning
            </label>
            <div className="flex h-12 items-center rounded-xl border border-gray-200 bg-gray-50 px-3">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt="Företagslogotyp"
                  className="max-h-9"
                />
              ) : (
                <span className="text-xs text-gray-500">Ingen logotyp</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sektion: Fakturering (placeholder) */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">Fakturering</h2>
        <p className="mt-1 text-sm text-gray-600">
          Dessa fält används för fakturareferenser och utskick.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <LabeledInput
            label="Faktura-e-post"
            type="email"
            value={company.billingEmail ?? ""}
            onChange={(v) => setCompany((c) => ({ ...c, billingEmail: v }))}
            placeholder="ekonomi@dittforetag.se"
            disabled={!editing}
            extraClass={disabledCls}
          />
          <LabeledInput
            label="Referens"
            value={company.billingRef ?? ""}
            onChange={(v) => setCompany((c) => ({ ...c, billingRef: v }))}
            placeholder="Kostnadsställe/Ref"
            disabled={!editing}
            extraClass={disabledCls}
          />
        </div>
      </section>

      {/* Farlig zon */}
      <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <h2 className="text-sm font-semibold text-red-800">Farlig zon</h2>
        <p className="mt-1 text-sm text-red-700">
          Återställ företagsinställningarna till standard.
        </p>
        <button
          onClick={resetToDefaults}
          className="mt-3 rounded-xl border border-red-300 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-100"
        >
          Återställ företagsinställningar
        </button>
      </section>
    </main>
  )
}

/* --- Små, återanvändbara fältkomponenter --- */
function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  disabled = false,
  extraClass = "",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  min?: number
  disabled?: boolean
  extraClass?: string
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-700">{label}</span>
      <input
        type={type}
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 ${extraClass}`}
      />
    </label>
  )
}

function LabeledCheckbox({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <label
      className={`mt-6 inline-flex items-center gap-2 ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-black/10"
      />
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  )
}
