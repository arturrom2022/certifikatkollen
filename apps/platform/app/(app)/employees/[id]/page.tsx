// app/employees/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import type { Route } from "next"
import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import { getEmployees, removeCertificate } from "@/lib/storage" // removeEmployee borttagen
import type { Employee } from "@/lib/types"
import { isFavoriteEmployee, toggleFavoriteEmployee } from "@/lib/favorites"

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

// Samma nyckel som i tabellen
const ARCHIVED_EMPLOYEES_KEY = "archivedEmployees"
function loadArchivedEmployees(): Set<string> {
  try {
    const raw = localStorage.getItem(ARCHIVED_EMPLOYEES_KEY)
    if (!raw) return new Set()
    return new Set<string>(JSON.parse(raw))
  } catch {
    return new Set()
  }
}
function persistArchivedEmployees(ids: Set<string>) {
  localStorage.setItem(ARCHIVED_EMPLOYEES_KEY, JSON.stringify([...ids]))
}

/* ---------- Page ---------- */
export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [emp, setEmp] = useState<Employee | null>(null)

  // ?saved=1 → liten banner “Certifikat sparat”, som sedan tas bort
  const search = useSearchParams()
  const savedInUrl = search.get("saved") === "1"
  const [showSaved, setShowSaved] = useState<boolean>(savedInUrl)

  // Favorit-state
  const [fav, setFav] = useState<boolean>(false)

  // Arkiveringsstate (för den här anställden)
  const [isArchived, setIsArchived] = useState<boolean>(false)

  useEffect(() => {
    if (!savedInUrl) return
    const t = setTimeout(() => {
      setShowSaved(false)
      const url = new URL(window.location.href)
      url.searchParams.delete("saved")
      const next =
        url.pathname +
        (url.searchParams.toString() ? `?${url.searchParams.toString()}` : "")
      router.replace(next as Route)
    }, 4000)
    return () => clearTimeout(t)
  }, [savedInUrl, router])

  // Ladda anställd + lyssna på storage
  useEffect(() => {
    function load() {
      const match = getEmployees().find((e) => e.id === id)
      setEmp(match ?? null)
      if (match) {
        setFav(isFavoriteEmployee(match.id))
        const archived = loadArchivedEmployees()
        setIsArchived(archived.has(match.id))
      }
    }
    load()
    const onStorage = (e?: StorageEvent) => {
      if (
        !e ||
        e.key === null ||
        e.key === ARCHIVED_EMPLOYEES_KEY ||
        e.key === "employees"
      ) {
        load()
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [id])

  // Scroll & highlight om #cert-... finns i URL
  useEffect(() => {
    if (!emp) return
    const focusHashTarget = () => {
      const hash = window.location.hash
      if (!hash) return
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (!el) return
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      el.classList.add("highlight-border")
      const t = setTimeout(() => el.classList.remove("highlight-border"), 2600)
      return () => clearTimeout(t)
    }
    focusHashTarget()
    window.addEventListener("hashchange", focusHashTarget)
    return () => window.removeEventListener("hashchange", focusHashTarget)
  }, [emp])

  /* ---------- Not found ---------- */
  if (!emp) {
    return (
      <main className="space-y-6">
        <PageHeader
          title="Anställd saknas"
          breadcrumbs={[
            { label: "Anställda", href: "/employees" },
            { label: "Detalj" },
          ]}
          actions={
            <Link
              href="/employees"
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              ← Tillbaka
            </Link>
          }
        />
        <p className="text-sm text-gray-600">
          Vi kunde inte hitta anställd med id: {id}
        </p>
      </main>
    )
  }

  // === Exportera hela anställd som CSV ===
  function exportEmployee(e: Employee) {
    const header = [
      ["Anställnings-ID", e.id],
      ["Namn", e.name ?? "—"],
      ["Roll", e.role ?? "—"],
      ["E-post", e.email ?? "—"],
      ["Telefon", e.phone ?? "—"],
    ]
      .map(([k, v]) => `${k},${String(v).replaceAll(",", " ")}`)
      .join("\n")

    const certLines =
      e.certificates.length > 0
        ? [
            "\nCertifikat:",
            "Namn,Utfärdare,Nummer,Utfärdat,Giltigt till,Status",
            ...e.certificates.map((c) =>
              [
                c.name ?? "—",
                c.issuer ?? "—",
                c.number ?? "—",
                c.issueDate ?? "—",
                c.expiryDate ?? "—",
                c.status ?? "active",
              ]
                .map((v) => String(v).replaceAll(",", " "))
                .join(",")
            ),
          ].join("\n")
        : "\nCertifikat: Inga"

    const csv = `${header}${certLines}`
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `employee_${e.id}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Arkivera anställd (utan att radera), synka via storage-event
  function onArchiveEmployee() {
    if (!emp) return
    if (confirm("Arkivera anställd?")) {
      const set = loadArchivedEmployees()
      set.add(emp.id)
      persistArchivedEmployees(set)
      setIsArchived(true)
      // meddela andra vyer (t.ex. tabellen)
      window.dispatchEvent(
        new StorageEvent("storage", { key: ARCHIVED_EMPLOYEES_KEY })
      )
    }
  }

  function onDeleteCert(certId: string) {
    if (!emp) return // null-guard
    if (confirm("Ta bort certifikat?")) {
      removeCertificate(emp.id, certId)
      setEmp((prev) =>
        prev
          ? {
              ...prev,
              certificates: prev.certificates.filter((c) => c.id !== certId),
            }
          : prev
      )
    }
  }

  // === Exportera ett (1) certifikat som CSV ===
  function exportSingleCertificate(row: {
    employeeId: string
    employeeName: string
    cert: {
      id: string
      name?: string
      issuer?: string
      number?: string
      issueDate?: string
      expiryDate?: string
      notes?: string
    }
  }) {
    const csvContent = [
      ["Certifikat-ID", row.cert.id],
      ["Certifikatnamn", row.cert.name ?? "—"],
      ["Utfärdare", row.cert.issuer ?? "—"],
      ["Nummer", row.cert.number ?? "—"],
      ["Utfärdat", row.cert.issueDate ?? "—"],
      ["Giltigt till", row.cert.expiryDate ?? "—"],
      ["Notering", row.cert.notes ?? "—"],
      ["Anställd", row.employeeName],
      ["Anställnings-ID", row.employeeId],
    ]
      .map(([k, v]) => `${k},${v}`)
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `certificate_${row.cert.id}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // === Arkivera ett (1) certifikat ===
  function onArchiveOne(employeeId: string, certId: string) {
    if (!confirm("Arkivera certifikat?")) return
    const emps = getEmployees()
    const updated = emps.map((e) =>
      e.id === employeeId
        ? {
            ...e,
            certificates: e.certificates.map((c) =>
              c.id === certId ? { ...c, status: "archived" } : c
            ),
          }
        : e
    )
    localStorage.setItem("employees", JSON.stringify(updated))
    window.dispatchEvent(new StorageEvent("storage", { key: "employees" }))
  }

  /* ---------- Normal vy ---------- */
  return (
    <main className="space-y-6">
      <PageHeader
        title={emp.name}
        breadcrumbs={[
          { label: "Anställda", href: "/employees" },
          { label: emp.name },
        ]}
        actions={
          <div className="flex gap-2 items-center">
            {/* Badge flyttad hit för att title ska vara string */}
            {isArchived && (
              <span className="inline-block rounded-full border px-2 py-0.5 text-[10px] leading-4 border-gray-300 bg-gray-100 text-gray-700">
                Arkiverat
              </span>
            )}

            {/* Tillbaka */}
            <Link
              href="/employees"
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200"
            >
              ← Tillbaka
            </Link>
            {/* Favoritknapp */}
            <button
              type="button"
              onClick={() => {
                const next = toggleFavoriteEmployee(emp.id)
                setFav(next)
              }}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex items-center gap-2"
              title={fav ? "Ta bort från favoriter" : "Lägg till i favoriter"}
              aria-pressed={fav}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {fav ? (
                  <path
                    d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z"
                    fill="currentColor"
                  />
                ) : (
                  <path
                    d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                )}
              </svg>
              Favorit
            </button>

            {/* Nya knappar */}
            <button
              onClick={() => exportEmployee(emp)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200"
            >
              Exportera anställd
            </button>
            <button
              onClick={onArchiveEmployee}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200"
            >
              Arkivera anställd
            </button>
          </div>
        }
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Kontakt</h2>
        <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          <div>
            E-post: <span className="text-gray-800">{emp.email || "—"}</span>
          </div>
          <div>
            Telefon: <span className="text-gray-800">{emp.phone || "—"}</span>
          </div>
          <div>
            ID: <span className="text-gray-800">{emp.id}</span>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Certifikat ({emp.certificates.length})
          </h2>

          {showSaved && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
              Certifikat sparat
            </div>
          )}

          <Link
            href={`/certificates/new?employeeId=${encodeURIComponent(
              emp.id
            )}&returnTo=${encodeURIComponent("/employees/" + emp.id)}`}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200"
          >
            + Lägg till certifikat
          </Link>
        </div>

        {emp.certificates.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
            Inga certifikat registrerade ännu.
          </div>
        ) : (
          <ul className="space-y-3">
            {emp.certificates.map((c) => {
              const d = daysUntil(c.expiryDate)
              const isExpired = d !== null && d < 0
              const isSoon = d !== null && d >= 0 && d <= SOON_THRESHOLD
              const isArchived = c.status === "archived"

              const expiryClass = "text-gray-700"

              return (
                <li
                  key={c.id}
                  id={`cert-${c.id}`}
                  className="rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-base font-medium">{c.name}</div>

                        {/* === Statusbadges (matchar certifikattabellen) === */}
                        {isArchived ? (
                          <span className="rounded-full border px-2 py-0.5 text-xs border-gray-300 bg-gray-50 text-gray-700">
                            Arkiverat
                          </span>
                        ) : isExpired ? (
                          <span className="rounded-full border px-2 py-0.5 text-xs border-red-200 bg-red-50 text-red-800">
                            {`Utgick ${new Date(
                              c.expiryDate!
                            ).toLocaleDateString("sv-SE")}`}
                          </span>
                        ) : (
                          <>
                            <span className="rounded-full border px-2 py-0.5 text-xs border-green-200 bg-green-50 text-green-800">
                              Aktivt
                            </span>
                            {isSoon ? (
                              <span className="rounded-full border px-2 py-0.5 text-xs border-amber-200 bg-amber-50 text-amber-800">
                                {`Utgår om ${d === 1 ? "1 dag" : `${d} dagar`}`}
                              </span>
                            ) : null}
                          </>
                        )}
                        {/* === /Statusbadges === */}
                      </div>
                      {c.issuer && (
                        <div className="text-xs text-gray-500">
                          Utfärdare: {c.issuer}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 md:ml-6 flex items-center gap-2">
                      <button
                        onClick={() =>
                          exportSingleCertificate({
                            employeeId: emp.id,
                            employeeName: emp.name,
                            cert: {
                              id: c.id,
                              name: c.name,
                              issuer: c.issuer,
                              number: c.number,
                              issueDate: c.issueDate,
                              expiryDate: c.expiryDate,
                              notes: c.notes,
                            },
                          })
                        }
                        aria-label="Exportera"
                        className="group relative rounded-full p-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            d="M12 3v10m0 0l-4-4m4 4l4-4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 z-20">
                          Exportera
                        </span>
                      </button>

                      <button
                        onClick={() => onArchiveOne(emp.id, c.id)}
                        aria-label="Arkivera"
                        className="group relative rounded-full p-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect x="3" y="4" width="18" height="4" rx="1" />
                          <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                          <path d="M9 12h6" strokeLinecap="round" />
                        </svg>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 z-20">
                          Arkivera
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div>
                      Nummer:{" "}
                      <span className="text-gray-800">{c.number || "—"}</span>
                    </div>
                    <div>
                      Utfärdat:{" "}
                      <span className="text-gray-800">
                        {c.issueDate || "—"}
                      </span>
                    </div>
                    <div>
                      Giltigt till:{" "}
                      <span className="text-gray-700">
                        {c.expiryDate || "—"}
                      </span>
                    </div>
                  </div>

                  {c.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      Anteckningar:{" "}
                      <span className="text-gray-800">{c.notes}</span>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Certifikat-ID: {c.id}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
