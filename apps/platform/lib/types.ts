// lib/types.ts

// --- Certifikat ---
export type CertificateStatus = "active" | "archived"

export type Certificate = {
  id: string
  name: string
  issuer?: string
  number?: string
  issueDate?: string
  expiryDate?: string
  notes?: string
  status: CertificateStatus
}

// --- Anställd ---
export type Employee = {
  id: string
  name: string
  email?: string
  role?: string
  phone?: string
  certificates: Certificate[]
}

// --- Projekt (behåll om du använder projekt) ---
export type ProjectStatus = "active" | "completed" | "on-hold" | "cancelled"

export type ProjectMember = {
  employeeId: string
  addedAt: string
}

export type Project = {
  id: string
  name: string
  customer?: string
  location?: string
  startDate?: string
  endDate?: string
  status: ProjectStatus
  description?: string
  members: ProjectMember[]
}
