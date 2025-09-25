// app/projects/new/page.tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import PageHeader from "@/components/PageHeader"
import ProjectForm from "@/components/ProjectForm"

export default function NewProjectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCancel = () => {
    const rt = searchParams.get("returnTo")
    if (rt && rt.startsWith("/")) {
      router.replace(rt as any)
    } else {
      router.replace("/projects")
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Nytt projekt "
        breadcrumbs={[
          { label: "Projekt", href: "/projects" },
          { label: "Nytt projekt" },
        ]}
      />

      {/* Samma kort som de andra sidorna */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <ProjectForm
          onCreated={() => {
            const rt = searchParams.get("returnTo")
            if (rt && rt.startsWith("/")) {
              router.replace(rt as any)
            } else {
              router.replace("/projects")
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
