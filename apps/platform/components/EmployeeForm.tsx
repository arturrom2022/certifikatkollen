// components/EmployeeForm.tsx
"use client"

import { useState, type ReactNode } from "react"
import { addEmployee } from "@/lib/storage"

export default function EmployeeForm({
  onCreated,
  actions,
}: {
  onCreated?: () => void
  actions?: ReactNode
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [phone, setPhone] = useState("")
  const [busy, setBusy] = useState(false)

  // Felmeddelanden (alla fält obligatoriska)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    role?: string
    phone?: string
  }>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newErrors: typeof errors = {}
    if (!name.trim()) newErrors.name = "Ange namn"
    if (!email.trim()) newErrors.email = "Ange e-post"
    if (!role.trim()) newErrors.role = "Ange roll"
    if (!phone.trim()) newErrors.phone = "Ange telefon"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setBusy(true)
    try {
      addEmployee({
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        phone: phone.trim(),
      })

      // Rensa fält och fel
      setName("")
      setEmail("")
      setRole("")
      setPhone("")
      setErrors({})

      onCreated?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Namn</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-300 p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Anna Bygg"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">E-post</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-300 p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="anna@företag.se"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Roll</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-300 p-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Snickare"
          />
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Telefon</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-300 p-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+46 ..."
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Knappar: använd inskickade actions om de finns, annars fallback */}
      {actions ? (
        <div className="flex justify-end gap-3">{actions}</div>
      ) : (
        <button
          disabled={busy}
          className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Spara
        </button>
      )}
    </form>
  )
}
