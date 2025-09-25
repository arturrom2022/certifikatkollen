// app/projects/ProjectsTable.tsx
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import type React from "react"
import {
  getProjects,
  setProjectStatus,
  removeProject,
  download,
} from "@/lib/storage"
import type { Project } from "@/lib/types"
import FilterBar, { type Option } from "@/components/FilterBar"
import HeaderCell from "@/components/table/HeaderCell"

type Filter = "active" | "closed" | "all"
type SortKey = "name" | "customer" | null
type SortDir = "asc" | "desc"

export default function ProjectsTable({
  toolbarPrefix,
  toolbarSuffix, // ⬅️ knappar till höger om söket
}: {
  toolbarPrefix?: ReactNode
  toolbarSuffix?: ReactNode
}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState<Filter>("active")
  const [query, setQuery] = useState("")

  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  // ⬇️ Bulk-val
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [showSug, setShowSug] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const listboxId = "project-search-suggestions"

  function refresh() {
    setProjects(getProjects())
  }

  useEffect(() => {
    refresh()
    const onStorage = () => refresh()
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  useEffect(() => {
    const handler = () => exportProjects()
    window.addEventListener("export-projects", handler)
    return () => window.removeEventListener("export-projects", handler)
  }, [projects])

  const allNames = useMemo(() => {
    const set = new Set<string>()
    for (const p of projects) if (p.name?.trim()) set.add(p.name.trim())
    return Array.from(set).sort((a, b) => a.localeCompare(b, "sv"))
  }, [projects])

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        (p.customer ?? "").toLowerCase().includes(q) ||
        (p.location ?? "").toLowerCase().includes(q)
      )
    })
  }, [projects, filter, query])

  const displayed = useMemo(() => {
    if (!sortKey) return filtered
    const arr = [...filtered]
    const factor = sortDir === "asc" ? 1 : -1

    if (sortKey === "name") {
      arr.sort((a, b) => factor * a.name.localeCompare(b.name, "sv"))
    } else if (sortKey === "customer") {
      arr.sort((a, b) => {
        const ac = a.customer ?? ""
        const bc = b.customer ?? ""
        const cmp = ac.localeCompare(bc, "sv")
        if (cmp !== 0) return factor * cmp
        const sec = (a.location ?? "").localeCompare(b.location ?? "", "sv")
        return factor * sec
      })
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

  function closeProject(id: string) {
    if (!confirm("Avsluta projekt?")) return
    setProjectStatus(id, "closed")
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    refresh()
  }
  function reopenProject(id: string) {
    setProjectStatus(id, "active")
    refresh()
  }
  function onDelete(id: string) {
    if (!confirm("Ta bort projekt? Detta går inte att ångra.")) return
    removeProject(id)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    refresh()
  }

  function toProjectsCSV(ps: Project[]) {
    const headers = [
      "Projekt-ID",
      "Namn",
      "Status",
      "Kund",
      "Plats",
      "Start",
      "Slut",
      "Beskrivning",
    ]
    const rows = ps.map((p) => [
      p.id ?? "",
      p.name ?? "",
      p.status ?? "",
      p.customer ?? "",
      p.location ?? "",
      p.startDate ?? "",
      p.endDate ?? "",
      (p.description ?? "").replace(/\r?\n/g, " "),
    ])
    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((cell) =>
            /[",;\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell
          )
          .join(",")
      )
      .join("\n")
    return csv
  }

  function exportProjects() {
    const csv = toProjectsCSV(getProjects())
    if (typeof download === "function") {
      download("projects.csv", csv)
      return
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "projects.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // ⬇️ Bulk helpers
  const allDisplayedIds = useMemo(() => displayed.map((p) => p.id), [displayed])
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
    const sel = displayed.filter((p) => selectedIds.has(p.id))
    if (sel.length === 0) return
    const csv = toProjectsCSV(sel)
    if (typeof download === "function") {
      download("projects_selected.csv", csv)
    } else {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "projects_selected.csv"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }
  }
  function closeSelected() {
    if (selectedIds.size === 0) return
    if (!confirm("Avsluta valda projekt?")) return
    for (const id of Array.from(selectedIds)) setProjectStatus(id, "closed")
    setSelectedIds(new Set())
    refresh()
  }
  function deleteSelected() {
    if (selectedIds.size === 0) return
    if (!confirm("Ta bort valda projekt? Detta går inte att ångra.")) return
    for (const id of Array.from(selectedIds)) removeProject(id)
    setSelectedIds(new Set())
    refresh()
  }

  // Copy helpers (om kontaktfält finns i Project-modellen)
  async function copyToClipboard(text?: string | null) {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  const statusOptions: Option[] = [
    { value: "all", label: "Alla" },
    { value: "active", label: "Pågående" },
    { value: "closed", label: "Avslutade" },
  ]

  const filtersDisabled = selectedIds.size > 0

  return (
    <div className="space-y-6">
      {/* Rad med filter/sök + (växlande) bulk-åtgärder */}
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
            selectValue={filter}
            onSelectChange={(v) => setFilter(v as Filter)}
            searchId="search"
            searchLabel="Sök"
            searchPlaceholder="Sök projekt"
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
            toolbarPrefix={toolbarPrefix}
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {selectedIds.size > 0 ? (
            <>
              <span className="rounded-full bg-white px-2 py-1 text-sm text-gray-700 border ring-1 ring-blue-600 border-blue-600">
                {selectedIds.size} valda
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
                onClick={closeSelected}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex items-center gap-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Avsluta valda
              </button>
              <button
                onClick={deleteSelected}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex items-center gap-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
                </svg>
                Ta bort valda
              </button>
            </>
          ) : (
            toolbarSuffix
          )}
        </div>
      </div>

      {/* Tabell */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* ändrat: table-fixed -> table-auto */}
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <colgroup>
            <col style={{ width: "44px" }} />
            <col style={{ width: "38%" }} />
            <col style={{ width: "26%" }} />
            {/* period-kolumnen får lite mer utrymme + min-bredd */}
            <col style={{ width: "24%", minWidth: 260 }} />
            <col style={{ width: "176px" }} />
          </colgroup>
          <thead className="bg-gray-50">
            <tr className="text-left text-sm font-semibold text-gray-700 divide-x divide-gray-200">
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
                title="Projekt"
                isActive={sortKey === "name"}
                dir={sortKey === "name" ? sortDir : null}
                onToggle={() => toggleSort("name")}
              />
              <HeaderCell
                title="Kund / Plats"
                isActive={sortKey === "customer"}
                dir={sortKey === "customer" ? sortDir : null}
                onToggle={() => toggleSort("customer")}
              />
              {/* inga radbrytningar i rubriken */}
              <th className="px-4 py-4 whitespace-nowrap">Period</th>
              <th className="px-4 py-4">Åtgärder</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {displayed.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Inga projekt.
                </td>
              </tr>
            )}
            {displayed.map((p) => {
              const selected = selectedIds.has(p.id)
              const customerEmail = (p as any).customerEmail as
                | string
                | undefined
              const customerPhone = (p as any).customerPhone as
                | string
                | undefined

              return (
                <tr
                  key={p.id}
                  className="align-top hover:bg-slate-50 divide-x divide-gray-200 md:[&>td]:border-y md:[&>td]:border-gray-200 md:[&>td:first-child]:border-l md:[&>td:last-child]:border-r"
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Markera ${p.name}`}
                      checked={selected}
                      onChange={() => toggleSelectOne(p.id)}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900"
                    />
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      {p.status === "active" ? (
                        <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700">
                          Pågående
                        </span>
                      ) : (
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                          Avslutat
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <div className="mt-1 line-clamp-2 text-xs text-gray-600">
                        {p.description}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <div className="text-gray-900">{p.customer || "—"}</div>
                    <div className="text-xs text-gray-600">
                      {p.location || "—"}
                    </div>

                    {/* Ev. kontaktuppgifter för kund (visas bara om fälten finns) */}
                    {customerEmail && (
                      <div className="group/item mt-1 inline-flex items-center gap-1 text-xs">
                        <span className="text-gray-800">{customerEmail}</span>
                        <button
                          onClick={() => copyToClipboard(customerEmail)}
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
                            <rect x="9" y="9" width="11" height="11" rx="2" />
                            <rect x="4" y="4" width="11" height="11" rx="2" />
                          </svg>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                            Kopiera e-post
                          </span>
                        </button>
                      </div>
                    )}
                    {customerPhone && (
                      <div className="group/item mt-1 inline-flex items-center gap-1 text-xs">
                        <span className="text-gray-800">{customerPhone}</span>
                        <button
                          onClick={() => copyToClipboard(customerPhone)}
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
                            <rect x="9" y="9" width="11" height="11" rx="2" />
                            <rect x="4" y="4" width="11" height="11" rx="2" />
                          </svg>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
                            Kopiera telefon
                          </span>
                        </button>
                      </div>
                    )}
                  </td>

                  {/* inga radbrytningar i Period-cellen */}
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <div className="text-gray-900">
                      {p.startDate || "—"}
                      {p.endDate ? ` – ${p.endDate}` : ""}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/projects/${encodeURIComponent(p.id)}`}
                        className="group relative rounded-full p-2 text-gray-600 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/30"
                        aria-label="Visa projekt"
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
                            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                          Visa projekt
                        </span>
                      </Link>

                      {p.status === "active" ? (
                        <button
                          onClick={() => closeProject(p.id)}
                          className="group relative rounded-full p-2 text-gray-600 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/30"
                          aria-label="Avsluta"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <rect x="6" y="6" width="12" height="12" rx="2" />
                          </svg>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            Avsluta
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => reopenProject(p.id)}
                          className="group relative rounded-full p-2 text-gray-600 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/30"
                          aria-label="Återöppna"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <polygon
                              points="8,5 19,12 8,19"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            Återöppna
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => onDelete(p.id)}
                        className="group relative rounded-full p-2 text-gray-600 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-black/30"
                        aria-label="Ta bort"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                          Ta bort
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
