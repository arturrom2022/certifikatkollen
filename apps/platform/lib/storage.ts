// lib/storage.ts
"use client"

import { Employee, Certificate, Project, ProjectStatus } from "./types"

/* ====================== Hjälp & utils ====================== */
function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
export function uid(prefix = ""): string {
  const rnd = Math.random().toString(36).slice(2, 8)
  return `${prefix}${Date.now().toString(36)}${rnd}`
}

/* ====================== Projekt ====================== */
const PROJECTS_KEY = "ks_projects_v1" // byt till v2 om du vill nolla projekt också

export function getProjects(): Project[] {
  if (typeof window === "undefined") return []
  return safeParse<Project[]>(localStorage.getItem(PROJECTS_KEY), []).map(
    (p) => ({
      members: [],
      status: "active",
      ...p,
    })
  )
}
export function getProjectById(projectId: string): Project | null {
  return getProjects().find((p) => p.id === projectId) ?? null
}
export function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}
export function addProject(input: Partial<Project>): Project {
  const list = getProjects()
  const p: Project = {
    id: uid("prj_"),
    name: input.name ?? "Nytt projekt",
    customer: input.customer ?? "",
    location: input.location ?? "",
    startDate: input.startDate ?? "",
    endDate: input.endDate ?? "",
    status: input.status ?? "active",
    description: input.description ?? "",
    members: input.members ?? [],
  }
  saveProjects([p, ...list])
  return p
}
export function updateProject(updated: Project) {
  const list = getProjects()
  const idx = list.findIndex((p) => p.id === updated.id)
  if (idx === -1) return
  list[idx] = updated
  saveProjects(list)
}
export function removeProject(projectId: string) {
  const list = getProjects().filter((p) => p.id !== projectId)
  saveProjects(list)
}
export function setProjectStatus(projectId: string, status: ProjectStatus) {
  const list = getProjects()
  const idx = list.findIndex((p) => p.id === projectId)
  if (idx === -1) return
  list[idx].status = status
  saveProjects(list)
}
export function addMemberToProject(projectId: string, employeeId: string) {
  const list = getProjects()
  const idx = list.findIndex((p) => p.id === projectId)
  if (idx === -1) return
  const exists = (list[idx].members ?? []).some(
    (m) => m.employeeId === employeeId
  )
  if (!exists) {
    list[idx].members = [
      { employeeId, addedAt: new Date().toISOString() },
      ...(list[idx].members ?? []),
    ]
    saveProjects(list)
  }
}
export function removeMemberFromProject(projectId: string, employeeId: string) {
  const list = getProjects()
  const idx = list.findIndex((p) => p.id === projectId)
  if (idx === -1) return
  list[idx].members = (list[idx].members ?? []).filter(
    (m) => m.employeeId !== employeeId
  )
  saveProjects(list)
}

/* ====================== Anställda & certifikat ====================== */
const EMPLOYEES_KEY = "ks_employees_v2" // ← NY nyckel

export function getEmployees(): Employee[] {
  if (typeof window === "undefined") return []
  return safeParse<Employee[]>(localStorage.getItem(EMPLOYEES_KEY), [])
}
export function saveEmployees(list: Employee[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(list))
}
export function addEmployee(
  emp: Omit<Employee, "id" | "certificates">
): Employee {
  const list = getEmployees()
  const newEmp: Employee = { id: uid("emp_"), certificates: [], ...emp }
  saveEmployees([newEmp, ...list])
  return newEmp
}
export function updateEmployee(updated: Employee) {
  const list = getEmployees().map((e) => (e.id === updated.id ? updated : e))
  saveEmployees(list)
}
export function removeEmployee(employeeId: string) {
  const list = getEmployees().filter((e) => e.id !== employeeId)
  saveEmployees(list)
}
export function addCertificate(
  employeeId: string,
  cert: Omit<Certificate, "id" | "status">
): Certificate {
  const list = getEmployees()
  const idx = list.findIndex((e) => e.id === employeeId)
  if (idx === -1) throw new Error("Employee not found")
  const newCert: Certificate = { id: uid("cert_"), status: "active", ...cert }
  list[idx].certificates = [newCert, ...list[idx].certificates]
  saveEmployees(list)
  return newCert
}
export function removeCertificate(employeeId: string, certificateId: string) {
  const list = getEmployees()
  const idx = list.findIndex((e) => e.id === employeeId)
  if (idx === -1) return
  list[idx].certificates = list[idx].certificates.filter(
    (c) => c.id !== certificateId
  )
  saveEmployees(list)
}
export function findCertificateById(
  certId: string
): { employeeId: string; cert: Certificate } | null {
  const list = getEmployees()
  for (const e of list) {
    const c = e.certificates.find((c) => c.id === certId)
    if (c) return { employeeId: e.id, cert: c }
  }
  return null
}

/* ====================== CSV & download ====================== */
export function csvEscape(value: string | undefined | null): string {
  const v = (value ?? "").toString()
  if (v.includes(",") || v.includes("\n") || v.includes('"')) {
    return '"' + v.replace(/"/g, '""') + '"'
  }
  return v
}
export function toEmployeesCSV(list: Employee[]): string {
  const header = [
    "employee_id",
    "name",
    "email",
    "role",
    "phone",
    "cert_count",
  ].join(",")
  const rows = list.map((e) =>
    [
      e.id,
      e.name,
      e.email ?? "",
      e.role ?? "",
      e.phone ?? "",
      String(e.certificates.length),
    ]
      .map(csvEscape)
      .join(",")
  )
  return [header, ...rows].join("\n")
}
export function toCertificatesCSV(list: Employee[]): string {
  const header = [
    "employee_id",
    "employee_name",
    "certificate_id",
    "name",
    "issuer",
    "number",
    "issue_date",
    "expiry_date",
    "notes",
  ].join(",")
  const rows: string[] = []
  for (const e of list) {
    for (const c of e.certificates) {
      rows.push(
        [
          e.id,
          e.name,
          c.id,
          c.name,
          c.issuer ?? "",
          c.number ?? "",
          c.issueDate ?? "",
          c.expiryDate ?? "",
          (c.notes ?? "").replace(/\n/g, " "),
        ]
          .map(csvEscape)
          .join(",")
      )
    }
  }
  return [header, ...rows].join("\n")
}
export function download(filename: string, data: string, mime = "text/csv") {
  const blob = new Blob([data], { type: `${mime};charset=utf-8;` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
