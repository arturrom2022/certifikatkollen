"use client"

import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import CertificatesTable from "@/components/CertificatesTable"

export default function CertificatesPage() {
  const btn =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex items-center gap-2"

  function triggerExport() {
    window.dispatchEvent(new CustomEvent("export-certificates"))
  }

  return (
    // ⬇️ enda ändringen: isolate (skapar egen stacking context)
    <main className="space-y-6 isolate">
      <PageHeader
        title="Certifikat"
        subtitle="Hantera alla certifikat och deras giltighet"
      />

      <CertificatesTable
        toolbarSuffix={
          <div className="flex items-center gap-3">
            <Link
              href="/certificates/new"
              className={btn}
              title="Lägg till certifikat"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M6 3h9l3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 8v6m-3-3h6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
              Lägg till certifikat
            </Link>

            <button
              onClick={triggerExport}
              className={btn}
              title="Exportera certifikat (CSV)"
              aria-label="Exportera certifikat (CSV)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  d="M12 3v12m0 0l-4-4m4 4l4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
              Exportera tabellen
            </button>
          </div>
        }
      />
    </main>
  )
}
