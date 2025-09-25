// app/certificates/new/page.tsx
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import CertificateForm from "@/components/CertificateForm"
import PageHeader from "@/components/PageHeader"

export default function NewCertificatePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleCancel = () => {
    const rt = searchParams.get("returnTo")
    if (rt && rt.startsWith("/")) {
      router.replace(rt as any)
    } else {
      router.replace("/certificates")
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Nytt certifikat"
        breadcrumbs={[
          { label: "Certifikat", href: "/certificates" },
          { label: "Nytt certifikat" },
        ]}
      />

      {/* ⬇️ Samma vita bakgrund som på projektsidan */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <CertificateForm
          onCreated={() => {
            const rt = searchParams.get("returnTo")
            if (rt && rt.startsWith("/")) {
              router.replace(rt as any)
            } else {
              router.replace("/certificates")
            }
          }}
          // knappar renderas i formuläret
          actions={
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
              >
                Spara
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Avbryt
              </button>
            </div>
          }
        />
      </div>
    </main>
  )
}
