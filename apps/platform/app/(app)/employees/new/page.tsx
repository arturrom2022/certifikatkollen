// app/employees/new/page.tsx
"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import EmployeeForm from "@/components/EmployeeForm"
import PageHeader from "@/components/PageHeader"

function NewEmployeePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCancel = () => {
    const rt = searchParams.get("returnTo")
    if (rt && rt.startsWith("/")) {
      router.replace(rt as any)
    } else {
      router.replace("/employees")
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Ny anställd"
        breadcrumbs={[
          { label: "Anställda", href: "/employees" },
          { label: "Ny anställd" },
        ]}
      />

      {/* ⬇️ Samma vita bakgrund som på projektsidan */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <EmployeeForm
          onCreated={() => {
            const rt = searchParams.get("returnTo")
            if (rt && rt.startsWith("/")) {
              router.replace(rt as any)
            } else {
              router.replace("/employees")
            }
          }}
          actions={
            <>
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
            </>
          }
        />
      </div>
    </main>
  )
}

export default function NewEmployeePage() {
  return (
    <Suspense fallback={null}>
      <NewEmployeePageInner />
    </Suspense>
  )
}
