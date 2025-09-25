// app/projects/[id]/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { isFavoriteProject, toggleFavoriteProject } from "@/lib/favorites"
import {
  getProjects,
  updateProject,
  removeProject,
  addMemberToProject,
  removeMemberFromProject,
  getEmployees,
} from "@/lib/storage"
import type { Project, ProjectStatus, Employee } from "@/lib/types"
import PageHeader from "@/components/PageHeader"

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const projectId = String(params?.id ?? "")

  const [project, setProject] = useState<Project | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [saving, setSaving] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [loading, setLoading] = useState(true)
  const [fav, setFav] = useState<boolean>(false)

  // Load project + employees
  useEffect(() => {
    const prjs = getProjects()
    const p = prjs.find((x) => x.id === projectId) ?? null
    setProject(p)
    setEmployees(getEmployees())
    if (p) setFav(isFavoriteProject(p.id))
    setLoading(false)
  }, [projectId])

  const memberIds = useMemo(
    () => new Set(project?.members.map((m) => m.employeeId) ?? []),
    [project]
  )

  const availableToAdd = useMemo(
    () => employees.filter((e) => !memberIds.has(e.id)),
    [employees, memberIds]
  )

  function onField<K extends keyof Project>(key: K, val: Project[K]) {
    if (!project) return
    setProject({ ...project, [key]: val })
  }

  function onSave() {
    if (!project) return
    setSaving(true)
    try {
      updateProject(project)
    } finally {
      setSaving(false)
    }
  }

  function onDelete() {
    if (!project) return
    if (!confirm("Ta bort projektet? Detta kan inte ångras.")) return
    removeProject(project.id)
    router.push("/projects")
  }

  function onAddMember() {
    if (!project || !selectedEmployeeId) return
    addMemberToProject(project.id, selectedEmployeeId)
    // refresh local state
    const refreshed = getProjects().find((x) => x.id === project.id) ?? null
    setProject(refreshed)
    setSelectedEmployeeId("")
  }

  function onRemoveMember(empId: string) {
    if (!project) return
    removeMemberFromProject(project.id, empId)
    const refreshed = getProjects().find((x) => x.id === project.id) ?? null
    setProject(refreshed)
  }

  /* ---------- Loading-läge ---------- */
  if (loading) {
    return (
      <main className="space-y-6">
        <PageHeader
          title="Projekt"
          breadcrumbs={[
            { label: "Projekt", href: "/projects" },
            { label: "Detalj" },
          ]}
        />
        <p className="text-sm text-gray-600">Laddar projekt…</p>
      </main>
    )
  }

  /* ---------- Not found (efter laddning) ---------- */
  if (!project) {
    return (
      <main className="space-y-6">
        <PageHeader
          title="Projekt"
          breadcrumbs={[
            { label: "Projekt", href: "/projects" },
            { label: "Detalj" },
          ]}
        />
        <p className="text-sm text-gray-600">Projektet kunde inte hittas.</p>
        <button
          onClick={() => router.push("/projects")}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
        >
          Till projektlistan
        </button>
      </main>
    )
  }

  /* ---------- Normal vy ---------- */
  return (
    <main className="space-y-6">
      <PageHeader
        title={project.name || "Detalj"}
        breadcrumbs={[
          { label: "Projekt", href: "/projects" },
          { label: project.name || "Detalj" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200"
            >
              ← Tillbaka
            </button>

            {/* Favoritknapp */}
            <button
              type="button"
              onClick={() => {
                if (!project) return
                const next = toggleFavoriteProject(project.id)
                setFav(next)
              }}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex items-center gap-2"
              title={fav ? "Ta bort från favoriter" : "Lägg till i favoriter"}
              aria-pressed={fav}
            >
              {/* Star-ikon (fylld om fav=true, annars outline) */}
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
              {fav ? "Favorit" : "Favorit"}
            </button>

            {/* DINA BEFINTLIGA KNAPPAR – oförändrade */}
            <button
              onClick={onDelete}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200"
            >
              Arkivera projekt
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {saving ? "Sparar…" : "Spara"}
            </button>
          </div>
        }
      />

      {/* Projektinfo */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">Projektinfo</h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <LabeledInput
            label="Projektnamn"
            value={project.name}
            onChange={(v) => onField("name", v)}
          />
          <LabeledInput
            label="Kund"
            value={project.customer ?? ""}
            onChange={(v) => onField("customer", v)}
          />
          <LabeledInput
            label="Plats/Ort"
            value={project.location ?? ""}
            onChange={(v) => onField("location", v)}
          />
          <LabeledInput
            label="Startdatum"
            type="date"
            value={project.startDate ?? ""}
            onChange={(v) => onField("startDate", v)}
          />
          <LabeledInput
            label="Slutdatum"
            type="date"
            value={project.endDate ?? ""}
            onChange={(v) => onField("endDate", v)}
          />
          <LabeledSelect<ProjectStatus>
            label="Status"
            value={project.status}
            onChange={(v) => onField("status", v)}
            options={[
              { value: "active", label: "Pågående" },
              { value: "completed", label: "Avslutat" },
            ]}
          />
        </div>

        <label className="mt-3 block sm:col-span-2">
          <span className="block text-xs font-medium text-gray-700">
            Beskrivning
          </span>
          <textarea
            value={project.description ?? ""}
            onChange={(e) => onField("description", e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Kort beskrivning…"
          />
        </label>
      </section>

      {/* Medlemmar */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">
          Projektmedlemmar
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Välj anställd…</option>
            {availableToAdd.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} {e.role ? `— ${e.role}` : ""}
              </option>
            ))}
          </select>
          <button
            onClick={onAddMember}
            disabled={!selectedEmployeeId}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            Lägg till
          </button>
        </div>

        {project.members.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Inga medlemmar ännu.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200">
            {project.members.map((m) => {
              const emp = employees.find((e) => e.id === m.employeeId)
              return (
                <li
                  key={m.employeeId}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {emp?.name ?? "Okänd anställd"}
                    </div>
                    <div className="text-xs text-gray-600">
                      {emp?.role ?? ""} {emp?.email ? `• ${emp.email}` : ""}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveMember(m.employeeId)}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    Ta bort
                  </button>
                </li>
              )
            })}
          </ul>
        )}
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

function LabeledSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
