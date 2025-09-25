"use client"

import { useState, type ReactNode } from "react"
import { addProject } from "@/lib/storage"

export default function ProjectForm({
  onCreated,
  actions,
}: {
  onCreated?: () => void
  actions?: ReactNode
}) {
  const [name, setName] = useState("")
  const [customer, setCustomer] = useState("")
  const [location, setLocation] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")

  const [errors, setErrors] = useState<{
    name?: string
    customer?: string
    location?: string
    startDate?: string
    endDate?: string
  }>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const next: typeof errors = {}
    if (!name.trim()) next.name = "Ange projektnamn"
    if (!customer.trim()) next.customer = "Ange kund"
    if (!location.trim()) next.location = "Ange plats/ort"
    if (!startDate) next.startDate = "Ange startdatum"
    if (!endDate) next.endDate = "Ange slutdatum"
    if (
      !next.startDate &&
      !next.endDate &&
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      next.endDate = "Slutdatum kan inte vara före startdatum"
    }

    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    addProject({ name, customer, location, startDate, endDate, description })

    setName("")
    setCustomer("")
    setLocation("")
    setStartDate("")
    setEndDate("")
    setDescription("")
    setErrors({})
    onCreated?.()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <LabeledInput
          label="Projektnamn"
          value={name}
          onChange={(v) => {
            setName(v)
            if (errors.name) setErrors((e) => ({ ...e, name: undefined }))
          }}
          required
          placeholder="Ex. Kontorshus Sundbyberg"
          error={errors.name}
        />
        <LabeledInput
          label="Kund"
          value={customer}
          onChange={(v) => {
            setCustomer(v)
            if (errors.customer)
              setErrors((e) => ({ ...e, customer: undefined }))
          }}
          required
          placeholder="Ex. Sundbybergs kommun"
          error={errors.customer}
        />
        <LabeledInput
          label="Plats/Ort"
          value={location}
          onChange={(v) => {
            setLocation(v)
            if (errors.location)
              setErrors((e) => ({ ...e, location: undefined }))
          }}
          required
          placeholder="Ex. Sundbyberg"
          error={errors.location}
        />
        <LabeledInput
          label="Startdatum"
          type="date"
          value={startDate}
          onChange={(v) => {
            setStartDate(v)
            if (errors.startDate || errors.endDate) {
              setErrors((e) => ({
                ...e,
                startDate: undefined,
                endDate: undefined,
              }))
            }
          }}
          required
          error={errors.startDate}
        />
        <LabeledInput
          label="Slutdatum"
          type="date"
          value={endDate}
          onChange={(v) => {
            setEndDate(v)
            if (errors.endDate) setErrors((e) => ({ ...e, endDate: undefined }))
          }}
          required
          error={errors.endDate}
        />
      </div>

      <label className="block">
        <span className="block text-xs font-medium text-gray-700">
          Beskrivning
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-xl border border-gray-300 p-2"
          placeholder="Kort beskrivning av projektet…"
        />
      </label>

      {actions ? <div className="flex justify-end gap-3">{actions}</div> : null}
    </form>
  )
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  error,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  placeholder?: string
  error?: string
}) {
  const invalid = Boolean(error)
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-gray-300 p-2"
      />
      {invalid ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </label>
  )
}
