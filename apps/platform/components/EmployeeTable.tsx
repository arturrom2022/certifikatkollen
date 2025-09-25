// app/employees/EmployeeTable.tsx
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ReactNode } from "react"

import {
  getEmployees,
  removeEmployee,
  toEmployeesCSV,
  download,
} from "@/lib/storage"
import type { Employee } from "@/lib/types"
import FilterBar, { type Option } from "@/components/FilterBar"
import HeaderCell from "@/components/table/HeaderCell"
import { useRouter } from "next/navigation" // ⬅️ tillagd

// ⬇️ Sorterings-typer
type SortKey = "name" | "contact" | "certCount" | null
type SortDir = "asc" | "desc"

// ⬇️ Statusfilter
type StatusFilter = "all" | "noCerts" | "soon" | "expired" | "archived"

export default function EmployeeTable({
  toolbarSuffix, // knappar till höger om söket
}: {
  toolbarSuffix?: ReactNode
}) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [query, setQuery] = useState("")
  const router = useRouter() // ⬅️ tillagd

  const [status, setStatus] = useState<StatusFilter>("all")

  // sorteringsstate
  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  // ⬇️ Valda rader för bulk-åtgärder
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [showSug, setShowSug] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const listboxId = "employee-search-suggestions"

  // ⬇️ Skeleton loading vid initial laddning
  const [isLoading, setIsLoading] = useState(true)

  // ⬇️ Arkiveringsstatus (persist via localStorage)
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
  const [archivedEmployeeIds, setArchivedEmployeeIds] = useState<Set<string>>(
    new Set()
  )

  function refresh() {
    setEmployees(getEmployees())
  }

  useEffect(() => {
    refresh()
    setIsLoading(false)
    const handler = () => refresh()
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  // Initiera/lyssna arkiveringsstatus
  useEffect(() => {
    setArchivedEmployeeIds(loadArchivedEmployees())
  }, [])
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === ARCHIVED_EMPLOYEES_KEY) {
        setArchivedEmployeeIds(loadArchivedEmployees())
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  useEffect(() => {
    const handler = () => exportEmployees()
    window.addEventListener("export-employees", handler)
    return () => window.removeEventListener("export-employees", handler)
  }, [employees])

  function onArchiveEmployee(id: string) {
    if (confirm("Arkivera anställd?")) {
      // markera som arkiverad (radera inte)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setArchivedEmployeeIds((prev) => {
        const next = new Set(prev)
        next.add(id)
        persistArchivedEmployees(next)
        return next
      })
      refresh()
    }
  }

  function exportEmployees() {
    download("employees.csv", toEmployeesCSV(employees))
  }

  function exportSingleEmployee(e: Employee) {
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

  const allNames = useMemo(() => {
    const set = new Set<string>()
    for (const e of employees)
      if (e.name && e.name.trim()) set.add(e.name.trim())
    return Array.from(set).sort((a, b) => a.localeCompare(b, "sv"))
  }, [employees])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length === 0) return []
    return allNames.filter((n) => n.toLowerCase().includes(q)).slice(0, 8)
  }, [allNames, query])

  function onSearchFocus() {
    setShowSug(query.trim().length > 0)
  }
  function onSearchBlur() {
    setTimeout(() => setShowSug(false), 120)
  }
  function onSearchChange(val: string) {
    setQuery(val)
    setShowSug(val.trim().length > 0)
    setActiveIdx(-1)
  }
  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSug || suggestions.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx((i) => (i + 1) % suggestions.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === "Enter") {
      if (activeIdx >= 0) {
        e.preventDefault()
        setQuery(suggestions[activeIdx])
        setShowSug(false)
      }
    } else if (e.key === "Escape") {
      setShowSug(false)
    }
  }
  function pickSuggestion(name: string) {
    setQuery(name)
    setShowSug(false)
  }

  /* ===== Flyttat UPP: helpers som används i filter/sort ===== */
  const SOON_THRESHOLD = 30
  function daysUntil(dateIso?: string): number | null {
    if (!dateIso) return null
    const d = new Date(dateIso)
    if (isNaN(d.getTime())) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    d.setHours(0, 0, 0, 0)
    return Math.round((d.getTime() - today.getTime()) / 86400000)
  }
  function isActiveCert(c: Employee["certificates"][number]) {
    const d = daysUntil(c.expiryDate)
    const notArchived = c.status !== "archived"
    const notExpired = d === null || d >= 0
    return notArchived && notExpired
  }
  function activeCertCount(e: Employee) {
    return e.certificates.reduce((acc, c) => acc + (isActiveCert(c) ? 1 : 0), 0)
  }
  function soonExpiringCount(e: Employee) {
    let n = 0
    for (const c of e.certificates) {
      if (!isActiveCert(c)) continue
      const d = daysUntil(c.expiryDate)
      if (d !== null && d >= 0 && d <= SOON_THRESHOLD) n++
    }
    return n
  }
  function expiredCount(e: Employee) {
    let n = 0
    for (const c of e.certificates) {
      const d = daysUntil(c.expiryDate)
      if (c.status !== "archived" && d !== null && d < 0) n++
    }
    return n
  }
  function totalCertCount(e: Employee) {
    return e.certificates.length
  }
  /* ===== /helpers ===== */

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return employees.filter((e) => {
      const isArchived = archivedEmployeeIds.has(e.id)

      // Statusfilter
      if (status === "archived" && !isArchived) return false
      if (status === "noCerts" && (isArchived || totalCertCount(e) !== 0))
        return false
      if (status === "soon" && (isArchived || soonExpiringCount(e) === 0))
        return false
      if (status === "expired" && (isArchived || expiredCount(e) === 0))
        return false
      // "all" visar alla, inkl arkiverade

      // Sökfilter
      if (!q) return true
      const inEmployee = [e.name, e.email, e.role, e.phone].some((v) =>
        (v ?? "").toLowerCase().includes(q)
      )
      const inCerts = e.certificates.some((c) =>
        [c.name, c.issuer, c.number, c.notes].some((v) =>
          (v ?? "").toLowerCase().includes(q)
        )
      )
      return inEmployee || inCerts
    })
  }, [employees, query, status, archivedEmployeeIds])

  // sorterad vy inkl. certCount
  const displayed = useMemo(() => {
    if (!sortKey) return filtered
    const arr = [...filtered]
    const factor = sortDir === "asc" ? 1 : -1

    if (sortKey === "name") {
      arr.sort((a, b) => factor * a.name.localeCompare(b.name, "sv"))
    } else if (sortKey === "contact") {
      arr.sort((a, b) => {
        const ae = a.email ?? ""
        const be = b.email ?? ""
        const cmp = ae.localeCompare(be, "sv")
        if (cmp !== 0) return factor * cmp
        const sec = (a.phone ?? "").localeCompare(b.phone ?? "", "sv")
        return factor * sec
      })
    } else if (sortKey === "certCount") {
      arr.sort((a, b) => factor * (activeCertCount(a) - activeCertCount(b)))
    }
    return arr
  }, [filtered, sortKey, sortDir])

  // 3-stegstoggling
  function toggleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir("asc")
    } else if (sortDir === "asc") {
      setSortDir("desc")
    } else {
      setSortKey(null)
    }
  }

  // ⬇️ Bulk helpers
  const allDisplayedIds = useMemo(() => displayed.map((e) => e.id), [displayed])
  const allSelectedOnPage =
    selectedIds.size > 0 && allDisplayedIds.every((id) => selectedIds.has(id))
  const someSelectedOnPage =
    selectedIds.size > 0 &&
    allDisplayedIds.some((id) => selectedIds.has(id)) &&
    !allSelectedOnPage

  function toggleSelectAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelectedOnPage) {
        for (const id of allDisplayedIds) next.delete(id)
      } else {
        for (const id of allDisplayedIds) next.add(id)
      }
      return next
    })
  }
  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function exportSelected() {
    const sel = employees.filter((e) => selectedIds.has(e.id))
    if (sel.length === 0) return
    download("employees_selected.csv", toEmployeesCSV(sel))
  }
  function archiveSelected() {
    if (selectedIds.size === 0) return
    if (!confirm("Arkivera valda anställda?")) return
    for (const id of Array.from(selectedIds)) {
      removeEmployee(id)
    }
    setSelectedIds(new Set())
    refresh()
  }

  // ⬇️ Status-alternativ
  const statusOptions: Option[] = [
    { value: "all", label: "Alla" },
    { value: "noCerts", label: "Ej certifikat" },
    {
      value: "soon",
      label: "Utgår snart",
    },
    { value: "expired", label: "Utgångna" },
    { value: "archived", label: "Arkiverade" },
  ]

  // ⬇️ Copy helpers
  async function copyToClipboard(text?: string | null) {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // no-op
    }
  }

  const filtersDisabled = selectedIds.size > 0

  // ⬇️ Helper för skeletonrad (matchar 5 kolumner)
  function SkeletonRow({ i }: { i: number }) {
    return (
      <tr
        key={`sk-${i}`}
        aria-hidden="true"
        className="divide-x divide-gray-200 md:[&>td]:border-y md:[&>td]:border-gray-200 md:[&>td:first-child]:border-l md:[&>td:last-child]:border-r"
      >
        <td className="px-4 py-3">
          <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-3 w-24 bg-gray-100 rounded animate-pulse" />
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-6 w-14 rounded-full bg-gray-200 animate-pulse" />
          </div>
          <div className="mt-3 h-4 w-16 bg-gray-100 rounded animate-pulse" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-4 w-40 bg-gray-100 rounded animate-pulse" />
        </td>
        <td className="px-4 py-3">
          <div className="ml-auto h-8 w-28 bg-gray-200 rounded-xl animate-pulse" />
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      {/* Verktygsfält utan card-bakgrund */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        {/* Gråa ut/disablea när val finns */}
        <div
          className={`md:flex-1 md:min-w-0 ${
            filtersDisabled ? "opacity-60 pointer-events-none" : ""
          }`}
          aria-disabled={filtersDisabled}
        >
          <FilterBar
            selectId="status"
            selectLabel="Status"
            selectOptions={statusOptions}
            selectValue={status}
            onSelectChange={(v) => setStatus(v as StatusFilter)}
            searchId="search"
            searchLabel="Sök"
            searchPlaceholder="Sök anställda"
            searchValue={query}
            onSearchChange={onSearchChange}
            onSearchFocus={onSearchFocus}
            onSearchBlur={onSearchBlur}
            onSearchKeyDown={onSearchKeyDown}
            searchAriaControls={listboxId}
            autocomplete={
              showSug && suggestions.length > 0 ? (
                <ul
                  id={listboxId}
                  role="listbox"
                  className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                >
                  {suggestions.map((name, idx) => {
                    const active = idx === activeIdx
                    return (
                      <li
                        key={name + idx}
                        role="option"
                        aria-selected={active}
                        className={`cursor-pointer px-3 py-2 text-sm ${
                          active ? "bg-gray-100" : "hover:bg-gray-50"
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          pickSuggestion(name)
                        }}
                        onMouseEnter={() => setActiveIdx(idx)}
                      >
                        {name}
                      </li>
                    )
                  })}
                </ul>
              ) : null
            }
          />
        </div>

        {/* EN gemensam actions-yta som växlar läge */}
        <div className="flex items-center gap-3 shrink-0">
          {selectedIds.size > 0 ? (
            <>
              <span className="rounded-full bg-white px-2 py-1 text-sm text-gray-700 border  outline-none ring-1 ring-blue-600 border-blue-600">
                {selectedIds.size} valda
              </span>

              <button
                onClick={exportSelected}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex itemscenter gap-2"
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
                    d="M12 3v10m0 0l-4-4m4 4l4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
                Exportera valda
              </button>

              <button
                onClick={archiveSelected}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="4" width="18" height="4" rx="1" />
                  <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                  <path d="M9 12h6" strokeLinecap="round" />
                </svg>
                Arkivera valda
              </button>
            </>
          ) : (
            toolbarSuffix
          )}
        </div>
      </div>

      {/* Tabell */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          {/* Kolumn: checkbox + Anställd → Certifikat → Kontakt → Åtgärder */}
          <colgroup>
            <col style={{ width: "44px" }} />
            {/* ⇣ justerade procentsatser */}
            <col style={{ width: "30%" }} />
            <col style={{ width: "44%" }} />
            <col style={{ width: "26%" }} />
            <col style={{ width: "176px" }} />
          </colgroup>
          <thead className="bg-gray-50">
            <tr className="text-left text-sm font-semibold text-gray-700 divide-x divide-gray-200">
              {/* Select-all checkbox i headern */}
              <th className="px-4 py-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    aria-label="Markera alla på sidan"
                    checked={allSelectedOnPage}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelectedOnPage
                    }}
                    onChange={toggleSelectAllOnPage}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900"
                  />
                  <span className="sr-only">Markera alla</span>
                </label>
              </th>

              <HeaderCell
                title="Anställd"
                isActive={sortKey === "name"}
                dir={sortKey === "name" ? sortDir : null}
                onToggle={() => toggleSort("name")}
              />

              <HeaderCell
                title="Certifikat"
                isActive={sortKey === "certCount"}
                dir={sortKey === "certCount" ? sortDir : null}
                onToggle={() => toggleSort("certCount")}
              />

              <HeaderCell
                title="Kontakt"
                isActive={sortKey === "contact"}
                dir={sortKey === "contact" ? sortDir : null}
                onToggle={() => toggleSort("contact")}
              />

              <th className="px-4 py-4">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <SkeletonRow key={i} i={i} />
                ))}
              </>
            )}

            {!isLoading && displayed.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Inga poster (än). Lägg till en anställd och/eller certifikat.
                </td>
              </tr>
            )}

            {!isLoading &&
              displayed.map((e) => {
                return (
                  <tr
                    key={e.id}
                    onClick={() =>
                      router.push(`/employees/${encodeURIComponent(e.id)}`)
                    }
                    aria-label={`Öppna ${e.name}`}
                    className={`divide-x divide-gray-200 md:[&>td]:border-y md:[&>td]:border-gray-200 md:[&>td:first-child]:border-l md:[&>td:last-child]:border-r hover:bg-slate-100 cursor-pointer ${
                      selectedIds.has(e.id)
                        ? "bg-slate-100 relative after:content-[''] after:absolute after:inset-y-0 after:left-0 after:w-0.5 after:bg-blue-600"
                        : ""
                    }`}
                  >
                    {/* Checkbox-kolumn — vertikalt centrerad */}
                    <td className="px-4 py-3 align-middle">
                      <input
                        type="checkbox"
                        aria-label={`Markera ${e.name}`}
                        checked={selectedIds.has(e.id)}
                        onChange={() => toggleSelectOne(e.id)}
                        onClick={(ev) => ev.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-gray-900"
                      />
                    </td>

                    {/* Anställd (badge när arkiverad) */}
                    <td className="px-4 py-3 text-sm align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {e.name}
                        </span>
                        {archivedEmployeeIds.has(e.id) && (
                          <span className="rounded-full border px-2 py-0.5 text-xs border-gray-300 bg-gray-50 text-gray-700">
                            Arkiverat
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {e.role || "—"}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      {(() => {
                        const total = totalCertCount(e)
                        const soon = soonExpiringCount(e) // aktiva som utgår inom 30 dagar
                        const exp = expiredCount(e) // utgångna (ej arkiverade)

                        // Inga certifikat alls
                        if (total === 0) {
                          return (
                            <span className="inline-block rounded-full border px-2 py-0.5 text-xs border-gray-300 bg-gray-50 text-gray-700">
                              Inga certifikat kopplade till anställd
                            </span>
                          )
                        }

                        // Totalt + endast "utgår snart" och "utgångna" badges
                        return (
                          <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                            <span className="text-sm text-gray-900 font-medium">
                              {`${total} certifikat`}
                            </span>

                            {soon > 0 && (
                              <span className="inline-block rounded-full border px-2 py-0.5 text-xs border-amber-200 bg-amber-50 text-amber-800 whitespace-nowrap shrink-0">
                                {soon} utgår snart
                              </span>
                            )}

                            {exp > 0 && (
                              <span className="inline-block rounded-full border px-2 py-0.5 text-xs border-red-200 bg-red-50 text-red-800 whitespace-nowrap shrink-0">
                                {exp} utgångna
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </td>

                    {/* Kontakt — top aligned */}
                    <td className="px-4 py-3 text-sm align-top">
                      <div className="flex flex-col items-start gap-1">
                        {/* E-post */}
                        <div className="group/item flex items-center gap-1">
                          <a
                            href={e.email ? `mailto:${e.email}` : undefined}
                            onClick={(ev) => ev.stopPropagation()}
                            className="text-gray-800 truncate hover:underline"
                          >
                            {e.email || "—"}
                          </a>
                          {e.email && (
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation()
                                void copyToClipboard(e.email)
                              }}
                              aria-label="Kopiera e-post"
                              className="relative group/btn opacity-0 group-hover/item:opacity-100 transition rounded p-1 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/30"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <rect
                                  x="9"
                                  y="9"
                                  width="11"
                                  height="11"
                                  rx="2"
                                />
                                <rect
                                  x="4"
                                  y="4"
                                  width="11"
                                  height="11"
                                  rx="2"
                                />
                              </svg>
                              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                                Kopiera e-post
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Telefon */}
                        <div className="group/item flex items-center gap-1">
                          <a
                            href={e.phone ? `tel:${e.phone}` : undefined}
                            onClick={(ev) => ev.stopPropagation()}
                            className="truncate hover:underline"
                          >
                            {e.phone || "—"}
                          </a>
                          {e.phone && (
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation()
                                void copyToClipboard(e.phone)
                              }}
                              aria-label="Kopiera telefon"
                              className="relative group/btn opacity-0 group-hover/item:opacity-100 transition rounded p-1 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/30"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <rect
                                  x="9"
                                  y="9"
                                  width="11"
                                  height="11"
                                  rx="2"
                                />
                                <rect
                                  x="4"
                                  y="4"
                                  width="11"
                                  height="11"
                                  rx="2"
                                />
                              </svg>
                              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                                Kopiera telefon
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Åtgärder — top aligned */}
                    <td className="px-4 py-3 text-sm align-top">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/employees/${encodeURIComponent(e.id)}`}
                          onClick={(ev) => ev.stopPropagation()}
                          aria-label="Visa anställd"
                          className="group relative rounded-full p-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 select-none"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path
                              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            Visa anställd
                          </span>
                        </Link>

                        <button
                          onClick={(ev) => {
                            ev.stopPropagation()
                            exportSingleEmployee(e)
                          }}
                          aria-label="Exportera"
                          className="group relative rounded-full p-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 select-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 select-none"
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
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            Exportera
                          </span>
                        </button>

                        <button
                          onClick={(ev) => {
                            ev.stopPropagation()
                            onArchiveEmployee(e.id)
                          }}
                          aria-label="Arkivera"
                          className="group relative rounded-full p-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 select-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 select-none"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <rect x="3" y="4" width="18" height="4" rx="1" />
                            <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                            <path d="M9 12h6" strokeLinecap="round" />
                          </svg>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            Arkivera
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
