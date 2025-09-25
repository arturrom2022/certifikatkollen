// app/(app)/page.tsx
"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { getEmployees, getProjects } from "@/lib/storage"
import type { Employee, Project } from "@/lib/types"
import PageHeader from "@/components/PageHeader"
import QuickActions from "@/components/QuickActions"
import { getFavorites } from "@/lib/favorites"

function daysUntil(dateIso?: string): number | null {
  if (!dateIso) return null
  const d = new Date(dateIso)
  if (isNaN(d.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}

export default function OverviewPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const favorites = useMemo(() => getFavorites(), [employees, projects])

  const favoriteProjects = useMemo(() => {
    const setIds = new Set(favorites.projects)
    return projects.filter((p) => setIds.has(p.id)).slice(0, 6)
  }, [projects, favorites.projects])

  const favoriteEmployees = useMemo(() => {
    const setIds = new Set(favorites.employees)
    return employees.filter((e) => setIds.has(e.id)).slice(0, 6)
  }, [employees, favorites.employees])

  function exportOverviewReport() {
    const rows: string[][] = []

    rows.push(["Rapport", "Översikt"])
    rows.push(["Genererad", new Date().toISOString()])
    rows.push([])
    rows.push(["Nyckeltal"])
    rows.push(["Aktiva projekt", String(activeProjectsCount)])
    rows.push(["Antal anställda", String(employeesCount)])
    rows.push(["Aktiva certifikat", String(activeCertificatesCount)])
    rows.push([])

    rows.push([`Går ut inom 30 dagar (${SOON_THRESHOLD})`])
    rows.push(["Certifikat", "Anställd", "Giltigt till", "Dagar kvar"])
    preview.forEach((item) => {
      rows.push([
        item.certName ?? "",
        item.employeeName ?? "",
        item.expiryDate ?? "",
        String(item.days ?? ""),
      ])
    })

    const csv = rows
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `oversikt_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const activityFeed = [
    ...employees.map((e) => ({
      type: "employee" as const,
      id: e.id,
      name: e.name,
      // minimal fix: Employee-typen saknar createdAt – använd any-cast + fallback
      date: (e as any).createdAt ?? e.certificates[0]?.issueDate ?? "",
    })),
    ...projects.map((p) => ({
      type: "project" as const,
      id: p.id,
      name: p.name,
      date: p.startDate,
    })),
    ...employees.flatMap((e) =>
      e.certificates.map((c) => ({
        type: "certificate" as const,
        id: c.id,
        name: c.name,
        employeeName: e.name,
        date: c.issueDate,
      }))
    ),
  ]
    .filter((a) => a.date)
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
    .slice(0, 5)

  useEffect(() => {
    setEmployees(getEmployees())
    setProjects(getProjects())
    const onStorage = () => {
      setEmployees(getEmployees())
      setProjects(getProjects())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const activeProjectsCount = projects.filter(
    (p) => p.status === "active"
  ).length
  const employeesCount = employees.length

  const activeCertificatesCount = employees.reduce((sum, e) => {
    const activeForEmployee = e.certificates.filter((c) => {
      if (c.status === "archived") return false
      const d = daysUntil(c.expiryDate)
      return d === null || d >= 0
    }).length
    return sum + activeForEmployee
  }, 0)

  const SOON_THRESHOLD = 30

  const soonList = employees
    .flatMap((e) =>
      e.certificates
        .filter((c) => {
          if (c.status === "archived") return false
          const d = daysUntil(c.expiryDate)
          return d !== null && d >= 0 && d <= SOON_THRESHOLD
        })
        .map((c) => ({
          employeeId: e.id,
          employeeName: e.name,
          certId: c.id,
          certName: c.name,
          days: daysUntil(c.expiryDate) ?? 0,
          expiryDate: c.expiryDate,
        }))
    )
    .sort((a, b) => a.days - b.days)

  const PREVIEW_LIMIT = 6
  const preview = soonList.slice(0, PREVIEW_LIMIT)
  const overflow = Math.max(0, soonList.length - PREVIEW_LIMIT)

  const projectsSoon = useMemo(() => {
    return projects
      .filter((p) => {
        if (!p.endDate) return false
        const d = daysUntil(p.endDate)
        return d !== null && d >= 0 && d <= SOON_THRESHOLD
      })
      .map((p) => ({
        id: p.id,
        name: p.name,
        endDate: p.endDate!,
        daysLeft: daysUntil(p.endDate!) ?? 0,
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [projects])

  const projectsOverdue = useMemo(() => {
    return projects
      .filter((p) => {
        if (!p.endDate) return false
        const d = daysUntil(p.endDate)
        return d !== null && d < 0
      })
      .map((p) => ({
        id: p.id,
        name: p.name,
        endDate: p.endDate!,
        daysLate: Math.abs(daysUntil(p.endDate!) ?? 0),
      }))
      .sort((a, b) => b.daysLate - a.daysLate)
  }, [projects])

  function hasActiveCerts(e: Employee) {
    return e.certificates.some((c) => {
      if (c.status === "archived") return false
      const d = daysUntil(c.expiryDate)
      return d === null || d >= 0
    })
  }
  const employeesWithoutActive = useMemo(
    () =>
      employees
        .filter((e) => !hasActiveCerts(e))
        .map((e) => ({ id: e.id, name: e.name, role: e.role }))
        .slice(0, 6),
    [employees]
  )
  const employeesWithoutActiveOverflow = Math.max(
    0,
    employees.filter((e) => !hasActiveCerts(e)).length - 6
  )

  return (
    <main className="space-y-6">
      <PageHeader
        title="Översikt"
        subtitle="Samlad överblick över projekt, anställda och certifikat."
        actions={<QuickActions onExport={exportOverviewReport} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/projects"
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition"
        >
          <div className="text-sm text-gray-600">Pågående projekt</div>
          <div className="mt-1 text-3xl font-bold">{activeProjectsCount}</div>
          <div className="mt-2 text-sm text-gray-500">Visa projekt →</div>
        </Link>

        <Link
          href="/employees"
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition"
        >
          <div className="text-sm text-gray-600">Antal anställda</div>
          <div className="mt-1 text-3xl font-bold">{employeesCount}</div>
          <div className="mt-2 text-sm text-gray-500">
            Visa alla anställda →
          </div>
        </Link>

        <Link
          href="/certificates"
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition"
        >
          <div className="text-sm text-gray-600">Antal aktiva certifikat</div>
          <div className="mt-1 text-3xl font-bold">
            {activeCertificatesCount}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Visa alla certifikat →
          </div>
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-medium">Favoriter</div>

        {favoriteProjects.length === 0 && favoriteEmployees.length === 0 ? (
          <div className="text-sm text-gray-500">
            Inga favoriter ännu. Öppna ett projekt eller en anställd och klicka
            på stjärnikonen för att lägga till här.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Projekt
              </div>
              {favoriteProjects.length === 0 ? (
                <div className="text-sm text-gray-500">—</div>
              ) : (
                <ul className="space-y-1 text-sm">
                  {favoriteProjects.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between"
                    >
                      <Link
                        href={`/projects/${encodeURIComponent(p.id)}`}
                        className="underline decoration-dotted"
                      >
                        {p.name}
                      </Link>
                      <span className="text-gray-600">
                        {p.endDate ? p.endDate : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Anställda
              </div>
              {favoriteEmployees.length === 0 ? (
                <div className="text-sm text-gray-500">—</div>
              ) : (
                <ul className="space-y-1 text-sm">
                  {favoriteEmployees.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between"
                    >
                      <Link
                        href={`/employees/${encodeURIComponent(e.id)}`}
                        className="underline decoration-dotted"
                      >
                        {e.name}
                      </Link>
                      <span className="text-gray-600">{e.role || "—"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-medium">Senaste aktivitet</div>

        {activityFeed.length === 0 ? (
          <div className="text-sm text-gray-500">
            Ingen aktivitet registrerad än.
          </div>
        ) : (
          <ul className="space-y-1 text-sm">
            {activityFeed.map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <div>
                  {a.type === "employee" && (
                    <Link
                      href={`/employees/${encodeURIComponent(a.id)}`}
                      className="underline decoration-dotted"
                    >
                      Ny anställd: {a.name}
                    </Link>
                  )}
                  {a.type === "project" && (
                    <Link
                      href={`/projects/${encodeURIComponent(a.id)}`}
                      className="underline decoration-dotted"
                    >
                      Nytt projekt: {a.name}
                    </Link>
                  )}
                  {a.type === "certificate" && (
                    <Link
                      href={`/certificates/${encodeURIComponent(a.id)}`}
                      className="underline decoration-dotted"
                    >
                      Nytt certifikat: {a.name} ({a.employeeName})
                    </Link>
                  )}
                </div>
                <span className="text-gray-500 text-xs">{a.date}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm font-medium">Projekt att bevaka</div>

        {projectsSoon.length === 0 && projectsOverdue.length === 0 ? (
          <div className="text-sm text-gray-500">Inga åtgärder behövs.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Snart slut (≤ {SOON_THRESHOLD} dagar)
              </div>
              {projectsSoon.length === 0 ? (
                <div className="text-sm text-gray-500">—</div>
              ) : (
                <ul className="space-y-1 text-sm">
                  {projectsSoon.slice(0, 6).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between"
                    >
                      <Link
                        href={`/projects/${encodeURIComponent(p.id)}`}
                        className="underline decoration-dotted"
                      >
                        {p.name}
                      </Link>
                      <span className="text-gray-600">
                        om <b>{p.daysLeft}</b> d
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Försenade (utgånget slutdatum)
              </div>
              {projectsOverdue.length === 0 ? (
                <div className="text-sm text-gray-500">—</div>
              ) : (
                <ul className="space-y-1 text-sm">
                  {projectsOverdue.slice(0, 6).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between"
                    >
                      <Link
                        href={`/projects/${encodeURIComponent(p.id)}`}
                        className="underline decoration-dotted"
                      >
                        {p.name}
                      </Link>
                      <span className="text-gray-600">{p.daysLate} d sen</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="mb-2 text-sm font-medium">Går ut inom 30 dagar</div>

        {preview.length === 0 ? (
          <div className="text-sm text-gray-500">
            Inga certifikat nära utgång.
          </div>
        ) : (
          <ul className="space-y-1 text-sm">
            {preview.map((item) => (
              <li
                key={item.certId}
                className="flex items-center justify-between"
              >
                <div>
                  <Link
                    href={`/certificates/${encodeURIComponent(item.certId)}`}
                    className="underline decoration-dotted"
                  >
                    {item.certName}
                  </Link>
                  <span className="text-gray-600"> — {item.employeeName}</span>
                  {item.expiryDate && (
                    <span className="ml-1 text-gray-500">
                      ({item.expiryDate}, om <b>{item.days}</b> d)
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {preview.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {overflow > 0 ? (
              <>
                +{overflow} fler –{" "}
                <a href="/certificates" className="underline">
                  Visa alla
                </a>
              </>
            ) : (
              <a href="/certificates" className="underline">
                Visa alla
              </a>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
