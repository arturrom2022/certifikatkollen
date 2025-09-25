"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { addCertificate, getEmployees } from "@/lib/storage"
import type { Employee, Certificate } from "@/lib/types"

export default function CertificateForm({
  onCreated,
}: {
  onCreated?: () => void
}) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeId, setEmployeeId] = useState<string>("")

  // Förnyelse
  const [renewFromId, setRenewFromId] = useState<string | null>(null)

  // Fält
  const [name, setName] = useState("")
  const [issuer, setIssuer] = useState("")
  const [number, setNumber] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [notes, setNotes] = useState("")

  // Felmeddelanden (alla utom notes)
  const [errors, setErrors] = useState<{
    employeeId?: string
    name?: string
    issuer?: string
    number?: string
    issueDate?: string
    expiryDate?: string
  }>({})

  // ⬇️ Lokal avbryt-funktion (samma logik som på sidan)
  const handleCancel = () => {
    const rt = searchParams.get("returnTo")
    if (rt && rt.startsWith("/")) {
      router.replace(rt as any)
    } else {
      router.replace("/certificates")
    }
  }

  // 1) Ladda employees
  useEffect(() => {
    setEmployees(getEmployees())
  }, [])

  // 2) Förvälj employeeId från query
  useEffect(() => {
    const qId = searchParams.get("employeeId")
    const list = getEmployees()
    if (qId && list.some((e) => e.id === qId)) setEmployeeId(qId)
  }, [searchParams])

  // 3) Förifyll vid förnyelse (?renewFrom=certId)
  useEffect(() => {
    const renewFrom = searchParams.get("renewFrom")
    if (!renewFrom) return

    const list = employees.length ? employees : getEmployees()
    let cert: Certificate | undefined
    let ownerId = employeeId

    if (ownerId) {
      cert = list
        .find((e) => e.id === ownerId)
        ?.certificates.find((c) => c.id === renewFrom)
    }
    if (!cert) {
      for (const e of list) {
        const hit = e.certificates.find((c) => c.id === renewFrom)
        if (hit) {
          cert = hit
          ownerId = e.id
          break
        }
      }
    }
    if (!cert || !ownerId) return

    setEmployeeId(ownerId)
    setName(cert.name)
    setIssuer(cert.issuer ?? "")
    setNumber(cert.number ?? "")
    setIssueDate(new Date().toISOString().slice(0, 10))
    setExpiryDate("")
    setNotes("")
    setRenewFromId(renewFrom)
  }, [searchParams, employees, employeeId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: typeof errors = {}
    if (!employeeId) newErrors.employeeId = "Välj en anställd"
    if (!name.trim()) newErrors.name = "Ange ett certifikatnamn"
    if (!issuer.trim()) newErrors.issuer = "Ange utfärdare"
    if (!number.trim()) newErrors.number = "Ange certifikatsnummer"
    if (!issueDate) newErrors.issueDate = "Ange datum för utfärdat"
    if (!expiryDate) newErrors.expiryDate = "Ange giltigt till-datum"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload = {
      name: name.trim(),
      issuer: issuer.trim(),
      number: number.trim(),
      issueDate,
      expiryDate,
      notes: notes.trim() || undefined,
    }

    addCertificate(employeeId, payload)

    window.dispatchEvent(new StorageEvent("storage", { key: "employees" }))

    setName("")
    setIssuer("")
    setNumber("")
    setIssueDate("")
    setExpiryDate("")
    setNotes("")
    setErrors({})

    const rt = searchParams.get("returnTo")
    if (rt && rt.startsWith("/")) {
      router.replace(rt as any)
    } else {
      router.replace("/certificates")
    }

    onCreated?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Anställd</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 p-2"
          >
            <option value="">Välj anställd...</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          {errors.employeeId && (
            <p className="text-sm text-red-600 mt-1">{errors.employeeId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Certifikatnamn</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-300 p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Heta arbeten"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Utfärdare</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-300 p-2"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="Organisation"
          />
          {errors.issuer && (
            <p className="text-sm text-red-600 mt-1">{errors.issuer}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Nummer</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-300 p-2"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Certifikatsnummer"
          />
          {errors.number && (
            <p className="text-sm text-red-600 mt-1">{errors.number}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Utfärdat</label>
          <input
            type="date"
            className="mt-1 w-full rounded-xl border border-gray-300 p-2"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />
          {errors.issueDate && (
            <p className="text-sm text-red-600 mt-1">{errors.issueDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Giltigt till</label>
          <input
            type="date"
            className="mt-1 w-full rounded-xl border border-gray-300 p-2"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
          {errors.expiryDate && (
            <p className="text-sm text-red-600 mt-1">{errors.expiryDate}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Anteckningar</label>
          <textarea
            className="mt-1 w-full rounded-xl border border-gray-300 p-2"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Kommentarer"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
        >
          Avbryt
        </button>
        <button
          type="submit"
          className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Spara
        </button>
      </div>
    </form>
  )
}
