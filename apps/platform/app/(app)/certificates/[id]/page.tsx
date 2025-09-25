// app/certificates/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation" // useRouter borttagen (oanvänd)
import { getEmployees, findCertificateById } from "@/lib/storage"
import type { Certificate, Employee } from "@/lib/types"
import PageHeader from "@/components/PageHeader"

/* ---------- Helpers ---------- */
function daysUntil(dateIso?: string): number | null {
  if (!dateIso) return null
  const d = new Date(dateIso)
  if (isNaN(d.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}

const SOON_THRESHOLD = 30 // dagar

/* ---------- Page ---------- */
export default function CertificateDetailPage() {
  const params = useParams<{ id: string | string[] }>()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [cert, setCert] = useState<Certificate | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)

  function load() {
    const res = findCertificateById(id)
    if (!res) {
      setCert(null)
      setEmployee(null)
      return
    }
    setCert(res.cert)
    const emp = getEmployees().find((e) => e.id === res.employeeId) || null
    setEmployee(emp)
  }

  useEffect(() => {
    load()
    const onStorage = () => load()
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const d = daysUntil(cert?.expiryDate)
  const isExpired = d !== null && d < 0
  const isSoon = d !== null && d >= 0 && d <= SOON_THRESHOLD

  // CSV helper (escaping)
  const csvEsc = (v: unknown) => {
    const s = String(v ?? "—")
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  function exportOne() {
    if (!cert || !employee) return
    const rows = [
      ["Certifikat-ID", cert.id],
      ["Certifikatnamn", cert.name ?? "—"],
      ["Utfärdare", cert.issuer ?? "—"],
      ["Nummer", cert.number ?? "—"],
      ["Utfärdat", cert.issueDate ?? "—"],
      ["Giltigt till", cert.expiryDate ?? "—"],
      ["Notering", cert.notes ?? "—"],
      ["Anställd", employee.name],
      ["Anställnings-ID", employee.id],
    ]
    const csvContent = rows
      .map(([k, v]) => `${csvEsc(k)},${csvEsc(v)}`)
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `certificate_${cert.id}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function onArchive() {
    if (!cert || !employee) return
    if (!confirm("Arkivera certifikat?")) return
    const emps = getEmployees()
    const updated = emps.map((e) =>
      e.id === employee.id
        ? {
            ...e,
            certificates: e.certificates.map((c) =>
              c.id === cert.id ? { ...c, status: "archived" } : c
            ),
          }
        : e
    )
    localStorage.setItem("employees", JSON.stringify(updated))
    // Ingen manuell dispatch av "storage" – load() räcker i denna flik.
    load()
  }

  /* ---------- Not found ---------- */
  if (!cert || !employee) {
    return (
      <main className="space-y-6">
        <PageHeader
          title="Certifikat saknas"
          breadcrumbs={[
            { label: "Certifikat", href: "/certificates" },
            { label: "Detalj" },
          ]}
        />
        <p className="text-sm text-gray-600">
          Vi kunde inte hitta certifikatet.
        </p>
        <Link
          href="/certificates"
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 inline-block"
        >
          ← Tillbaka till certifikat
        </Link>
      </main>
    )
  }

  /* ---------- Normal vy ---------- */
  return (
    <main className="space-y-6">
      <PageHeader
        title={cert.name || "Certifikat"}
        breadcrumbs={[
          { label: "Certifikat", href: "/certificates" },
          { label: cert.name || "Detalj" },
        ]}
        actions={
          <div className="flex gap-2">
            <Link
              href="/certificates"
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200"
            >
              ← Tillbaka
            </Link>

            {/* Exportera med ikon */}
            <button
              onClick={exportOne}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  d="M12 3v12m0 0l-4-4m4 4l4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
              Exportera certifikat
            </button>

            {cert.status !== "archived" && (
              <button
                onClick={onArchive}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="4" rx="1" />
                  <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                  <path d="M9 12h6" strokeLinecap="round" />
                </svg>
                Arkivera
              </button>
            )}
          </div>
        }
      />

      {/* Statusrad under titel */}
      <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
        {cert.status === "archived" ? (
          <span className="rounded-full border px-2 py-0.5 text-xs border-gray-300 bg-gray-100 text-gray-700">
            Arkiverat
          </span>
        ) : isExpired ? (
          <span className="rounded-full border px-2 py-0.5 text-xs border-red-200 bg-red-50 text-red-700">
            {`Utgick ${
              cert.expiryDate
                ? new Date(cert.expiryDate).toLocaleDateString("sv-SE")
                : ""
            }`}
          </span>
        ) : (
          <>
            <span className="rounded-full border px-2 py-0.5 text-xs border-green-200 bg-green-50 text-green-700">
              Aktivt
            </span>
            {isSoon ? (
              <span className="rounded-full border px-2 py-0.5 text-xs border-amber-200 bg-amber-50 text-amber-800">
                {`Utgår om ${d === 1 ? "1 dag" : `${d} dagar`}`}
              </span>
            ) : null}
          </>
        )}
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Certifikatinformation</h2>
        <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          <div>
            Nummer: <span className="text-gray-800">{cert.number || "—"}</span>
          </div>
          <div>
            Utfärdare:{" "}
            <span className="text-gray-800">{cert.issuer || "—"}</span>
          </div>
          <div>
            Utfärdat:{" "}
            <span className="text-gray-800">{cert.issueDate || "—"}</span>
          </div>
          <div>
            Giltigt till:{" "}
            <span className="text-gray-800">{cert.expiryDate || "—"}</span>
          </div>
          <div className="md:col-span-2">
            Notering: <span className="text-gray-800">{cert.notes || "—"}</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Kopplat till anställd</h2>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="font-medium text-gray-900">{employee.name}</div>
            <div className="text-gray-600">{employee.role || "—"}</div>
            <div className="mt-1 space-y-1 text-gray-600">
              <div>
                E-post:{" "}
                <span className="text-gray-800">{employee.email || "—"}</span>
              </div>
              <div>
                Tel:{" "}
                <span className="text-gray-800">{employee.phone || "—"}</span>
              </div>
            </div>
          </div>

          <Link
            href={`/employees/${encodeURIComponent(
              employee.id
            )}#cert-${encodeURIComponent(cert.id)}`}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200"
          >
            Öppna anställd
          </Link>
        </div>
      </section>

      <div className="text-xs text-gray-500">Certifikat-ID: {cert.id}</div>
    </main>
  )
}
