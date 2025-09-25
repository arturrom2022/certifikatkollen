// app/certificates/CertificatesTable.tsx
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import type React from "react"
import {
  getEmployees,
  toCertificatesCSV,
  download,
  saveEmployees,
} from "@/lib/storage" // removeCertificate borttagen (oanvänd)
import type { Certificate } from "@/lib/types"
import FilterBar, { type Option } from "@/components/FilterBar"
import HeaderCell from "@/components/table/HeaderCell"
import { useRouter } from "next/navigation"

type Row = {
  employeeId: string
  employeeName: string
  employeeEmail?: string
  employeePhone?: string
  cert: Certificate
}

type SortKey = "cert" | "employee" | null
type SortDir = "asc" | "desc"

export default function CertificatesTable({
  toolbarPrefix,
  toolbarSuffix,
}: {
  toolbarPrefix?: ReactNode
  toolbarSuffix?: ReactNode
}) {
  const [rows, setRows] = useState<Row[]>([])
  const [query, setQuery] = useState("")
  const router = useRouter()

  type StatusFilter = "all" | "active" | "soon" | "expired" | "archived"
  const [status, setStatus] = useState<StatusFilter>("all")

  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  // ⬇️ Bulk-val: nyckel = `${employeeId}::${certId}`
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

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

  function isExpired(cert: Certificate): boolean {
    if (!cert.expiryDate) return false
    const d = new Date(cert.expiryDate)
    const today = new Date()
    d.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    return d.getTime() < today.getTime()
  }

  function refresh() {
    const emps = getEmployees()
    const flat: Row[] = []

    for (const e of emps) {
      for (const c of e.certificates) {
        flat.push({
          employeeId: e.id,
          employeeName: e.name,
          employeeEmail: e.email,
          employeePhone: e.phone,
          cert: c,
        })
      }
    }

    flat.sort((a, b) => {
      const ad = a.cert.expiryDate
        ? new Date(a.cert.expiryDate).getTime()
        : Infinity
      const bd = b.cert.expiryDate
        ? new Date(b.cert.expiryDate).getTime()
        : Infinity
      if (ad !== bd) return ad - bd
      return a.cert.name.localeCompare(b.cert.name, "sv")
    })

    setRows(flat)
  }

  useEffect(() => {
    refresh()
    const handler = () => refresh()
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  useEffect(() => {
    const handler = () => exportCertificates()
    window.addEventListener("export-certificates", handler)
    return () => window.removeEventListener("export-certificates", handler)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (status !== "all") {
        if (status === "archived") {
          if (r.cert.status !== "archived") return false
        } else {
          if (r.cert.status === "archived") return false
          const expired = isExpired(r.cert)
          const d = daysUntil(r.cert.expiryDate)
          const soon = d !== null && d >= 0 && d <= SOON_THRESHOLD
          if (status === "expired" && !expired) return false
          if (status === "active" && expired) return false
          if (status === "soon" && !(soon && !expired)) return false
        }
      }

      if (!q) return true
      return (
        r.cert.name?.toLowerCase().includes(q) ||
        r.employeeName.toLowerCase().includes(q) ||
        (r.cert.issuer?.toLowerCase() ?? "").includes(q) ||
        (r.cert.number?.toLowerCase() ?? "").includes(q)
      )
    })
  }, [rows, query, status])

  const displayed = useMemo(() => {
    if (!sortKey) return filtered
    const arr = [...filtered]
    const factor = sortDir === "asc" ? 1 : -1
    if (sortKey === "cert") {
      arr.sort((a, b) => factor * a.cert.name.localeCompare(b.cert.name, "sv"))
    } else if (sortKey === "employee") {
      arr.sort(
        (a, b) => factor * a.employeeName.localeCompare(b.employeeName, "sv")
      )
    }
    return arr
  }, [filtered, sortKey, sortDir])

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

  function exportCertificates() {
    const emps = getEmployees()
    download("certificates.csv", toCertificatesCSV(emps))
  }

  // ⬇️ Bulk helpers
  const rowKey = (r: Row) => `${r.employeeId}::${r.cert.id}`
  const allDisplayedKeys = useMemo(() => displayed.map(rowKey), [displayed])
  const allSelectedOnPage =
    selectedKeys.size > 0 && allDisplayedKeys.every((k) => selectedKeys.has(k))
  const someSelectedOnPage =
    selectedKeys.size > 0 &&
    allDisplayedKeys.some((k) => selectedKeys.has(k)) &&
    !allSelectedOnPage

  function toggleSelectAllOnPage() {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (allSelectedOnPage) {
        for (const k of allDisplayedKeys) next.delete(k)
      } else {
        for (const k of allDisplayedKeys) next.add(k)
      }
      return next
    })
  }

  function toggleSelectOne(k: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  function exportSelected() {
    if (selectedKeys.size === 0) return
    // Bygg ett employees-träd som bara innehåller valda certifikat
    const emps = getEmployees()
    const selectedMap = new Map<string, Set<string>>() // empId -> set(certId)
    for (const k of selectedKeys) {
      const [empId, certId] = k.split("::")
      if (!selectedMap.has(empId)) selectedMap.set(empId, new Set())
      selectedMap.get(empId)!.add(certId)
    }
    const filteredEmps = emps
      .map((e) => ({
        ...e,
        certificates: e.certificates.filter((c) =>
          selectedMap.get(e.id)?.has(c.id)
        ),
      }))
      .filter((e) => e.certificates.length > 0)
    download("certificates_selected.csv", toCertificatesCSV(filteredEmps))
  }

  function archiveSelected() {
    if (selectedKeys.size === 0) return
    if (!confirm("Arkivera valda certifikat?")) return
    const emps = getEmployees()
    const selectedMap = new Map<string, Set<string>>()
    for (const k of selectedKeys) {
      const [empId, certId] = k.split("::")
      if (!selectedMap.has(empId)) selectedMap.set(empId, new Set())
      selectedMap.get(empId)!.add(certId)
    }
    const updated = emps.map((e) =>
      selectedMap.has(e.id)
        ? {
            ...e,
            certificates: e.certificates.map((c) =>
              selectedMap.get(e.id)!.has(c.id)
                ? { ...c, status: "archived" }
                : c
            ),
          }
        : e
    )
    saveEmployees(updated)
    setSelectedKeys(new Set())
    refresh()
  }

  const allCertNames = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) if (r.cert.name) set.add(r.cert.name.trim())
    return Array.from(set).sort((a, b) => a.localeCompare(b, "sv"))
  }, [rows])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length === 0) return []
    const list = allCertNames.filter((n) => n.toLowerCase().includes(q))
    return list.slice(0, 8)
  }, [allCertNames, query])

  const [showSug, setShowSug] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const listboxId = "cert-search-suggestions"

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

  // Copy helpers
  async function copyToClipboard(text?: string | null) {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  const statusOptions: Option[] = [
    { value: "all", label: "Alla" },
    { value: "active", label: "Aktiva" },
    { value: "soon", label: "Utgår snart" },
    { value: "expired", label: "Utgångna" },
    { value: "archived", label: "Arkiverade" },
  ]

  const filtersDisabled = selectedKeys.size > 0

  // CSV helper (escaping)
  const csvEsc = (v: unknown) => {
    const s = String(v ?? "—")
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  return (
    <div className="space-y-6">
      {/* Verktygsrad utan card-bakgrund, med bulk-åtgärder till höger */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
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
            searchPlaceholder="Sök certifikat"
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

        <div className="flex items-center gap-3 shrink-0">
          {selectedKeys.size > 0 ? (
            <>
              <span className="rounded-full bg-white px-2 py-1 text-sm text-gray-700 border ring-1 ring-blue-600 border-blue-600">
                {selectedKeys.size} valda
              </span>
              <button
                onClick={exportSelected}
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

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          <colgroup>
            <col style={{ width: "44px" }} />
            <col style={{ width: "46%" }} />
            <col style={{ width: "46%" }} />
            <col style={{ width: "176px" }} />
          </colgroup>
          <thead className="bg-gray-50">
            <tr className="text-left text-sm font-semibold text-gray-700 divide-x divide-gray-200">
              <th className="px-4 py-4 text-center">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    aria-label="Markera alla på sidan"
                    checked={allSelectedOnPage}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelectedOnPage
                    }}
                    onChange={toggleSelectAllOnPage}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900"
                  />
                  <span className="sr-only">Markera alla</span>
                </label>
              </th>
              <HeaderCell
                title="Certifikat"
                isActive={sortKey === "cert"}
                dir={sortKey === "cert" ? sortDir : null}
                onToggle={() => toggleSort("cert")}
              />
              <HeaderCell
                title="Anställd"
                isActive={sortKey === "employee"}
                dir={sortKey === "employee" ? sortDir : null}
                onToggle={() => toggleSort("employee")}
              />
              <th className="px-4 py-4 text-center">Åtgärder</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {displayed.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Inga certifikat ännu.
                </td>
              </tr>
            )}

            {displayed.map((r) => {
              const d = daysUntil(r.cert.expiryDate)
              const isArchived = r.cert.status === "archived"
              const isExpiredFlag = d !== null && d < 0
              const isSoon = d !== null && d >= 0 && d <= SOON_THRESHOLD
              const key = rowKey(r)
              const isSelected = selectedKeys.has(key)

              return (
                <tr
                  key={r.cert.id}
                  onClick={() =>
                    router.push(
                      `/certificates/${encodeURIComponent(r.cert.id)}`
                    )
                  }
                  aria-label={`Öppna ${r.cert.name}`}
                  className={`cursor-pointer align-top divide-x divide-gray-200 md:[&>td]:border-y md:[&>td]:border-gray-200 md:[&>td:first-child]:border-l md:[&>td:last-child]:border-r hover:bg-slate-100 ${
                    isSelected
                      ? "bg-slate-100 relative after:content-[''] after:absolute after:inset-y-0 after:left-0 after:w-0.5 after:bg-blue-600"
                      : ""
                  }`}
                >
                  {/* Checkbox (centrerad och align-middle) */}
                  <td className="px-4 py-3 text-center align-middle">
                    <input
                      type="checkbox"
                      aria-label={`Markera ${r.cert.name}`}
                      checked={selectedKeys.has(key)}
                      onChange={() => toggleSelectOne(key)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900"
                    />
                  </td>

                  {/* Certifikat (top-align) */}
                  <td className="relative px-4 py-3 text-sm align-top">
                    <div className="flex items-start gap-2 pr-24">
                      <div className="font-medium text-gray-900">
                        {r.cert.name}
                      </div>

                      {isArchived ? (
                        <span className="rounded-full border px-2 py-0.5 text-xs border-gray-300 bg-gray-50 text-gray-700">
                          Arkiverat
                        </span>
                      ) : isExpiredFlag ? (
                        <span className="rounded-full border px-2 py-0.5 text-xs border-red-200 bg-red-50 text-red-800">
                          {`Utgick ${new Date(
                            r.cert.expiryDate!
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
                    </div>

                    <div className="mt-1 space-y-1 text-xs text-gray-600">
                      <div>
                        Nr:{" "}
                        <span className="text-gray-800">
                          {r.cert.number || "—"}
                        </span>
                      </div>
                      <div>
                        Utfärdare:{" "}
                        <span className="text-gray-800">
                          {r.cert.issuer || "—"}
                        </span>
                      </div>
                      <div>
                        Utfärdat:{" "}
                        <span className="text-gray-800">
                          {r.cert.issueDate || "—"}
                        </span>
                      </div>
                      <div>
                        Giltigt till:{" "}
                        <span className="text-gray-800">
                          {r.cert.expiryDate || "—"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Anställd (top-align) */}
                  <td className="relative px-4 py-3 text-sm align-top">
                    <div className="font-medium text-gray-900">
                      {r.employeeName}
                    </div>

                    <div className="mt-1 space-y-1 text-xs text-gray-600">
                      {/* E-post */}
                      <div className="flex items-center gap-1 leading-4">
                        {r.employeeEmail ? (
                          <a
                            href={`mailto:${r.employeeEmail}`}
                            onClick={(e) => e.stopPropagation()}
                            className="peer text-gray-800 hover:underline underline-offset-4"
                          >
                            {r.employeeEmail}
                          </a>
                        ) : (
                          <span className="text-gray-800">—</span>
                        )}
                        {r.employeeEmail && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              void copyToClipboard(r.employeeEmail)
                            }}
                            aria-label="Kopiera e-post"
                            className="relative opacity-0 hover:opacity-100 peer-hover:opacity-100 transition rounded p-0.5 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/30 group"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <rect x="9" y="9" width="11" height="11" rx="2" />
                              <rect x="4" y="4" width="11" height="11" rx="2" />
                            </svg>
                            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                              Kopiera e-post
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Telefon */}
                      <div className="flex items-center gap-1 leading-4">
                        {r.employeePhone ? (
                          <a
                            href={`tel:${r.employeePhone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="peer text-gray-800 hover:underline underline-offset-4"
                          >
                            {r.employeePhone}
                          </a>
                        ) : (
                          <span className="text-gray-800">—</span>
                        )}
                        {r.employeePhone && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              void copyToClipboard(r.employeePhone)
                            }}
                            aria-label="Kopiera telefon"
                            className="relative opacity-0 hover:opacity-100 peer-hover:opacity-100 transition rounded p-0.5 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/30 group"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <rect x="9" y="9" width="11" height="11" rx="2" />
                              <rect x="4" y="4" width="11" height="11" rx="2" />
                            </svg>
                            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                              Kopiera telefon
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Åtgärder (horisontellt centrerade, top-align) */}
                  <td className="px-4 py-3 text-sm text-center align-top">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/certificates/${encodeURIComponent(r.cert.id)}`}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Visa certifikat"
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
                          Visa certifikat
                        </span>
                      </Link>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const rows = [
                            ["Certifikat-ID", r.cert.id],
                            ["Certifikatnamn", r.cert.name],
                            ["Utfärdare", r.cert.issuer || "—"],
                            ["Nummer", r.cert.number || "—"],
                            ["Utfärdat", r.cert.issueDate || "—"],
                            ["Giltigt till", r.cert.expiryDate || "—"],
                            ["Notering", r.cert.notes || "—"],
                            ["Anställd", r.employeeName],
                            ["Anställnings-ID", r.employeeId],
                          ]
                          const csvContent = rows
                            .map(
                              ([key, val]) => `${csvEsc(key)},${csvEsc(val)}`
                            )
                            .join("\n")

                          const blob = new Blob([csvContent], {
                            type: "text/csv;charset=utf-8;",
                          })
                          const url = URL.createObjectURL(blob)
                          const link = document.createElement("a")
                          link.setAttribute("href", url)
                          link.setAttribute(
                            "download",
                            `certificate_${r.cert.id}.csv`
                          )
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                          URL.revokeObjectURL(url)
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

                      {/* Återinförd: Arkivera */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const empId = r.employeeId
                          const certId = r.cert.id
                          if (confirm("Arkivera certifikat?")) {
                            const emps = getEmployees()
                            const updated = emps.map((e) =>
                              e.id === empId
                                ? {
                                    ...e,
                                    certificates: e.certificates.map((c) =>
                                      c.id === certId
                                        ? { ...c, status: "archived" }
                                        : c
                                    ),
                                  }
                                : e
                            )
                            saveEmployees(updated)
                            refresh()
                          }
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
