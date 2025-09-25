"use client"

import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import EmployeeTable from "@/components/EmployeeTable"

export default function EmployeesPage() {
  const btn =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex items-center gap-2"

  function triggerExport() {
    window.dispatchEvent(new CustomEvent("export-employees"))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anställda"
        subtitle="Hantera företagets anställda och deras certifikat"
      />

      <EmployeeTable
        toolbarSuffix={
          <div className="flex items-center gap-3">
            <Link
              href="/employees/new"
              className={btn}
              title="Lägg till anställd"
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
                <circle cx="9" cy="7" r="4" />
                <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <path d="M19 8v6M16 11h6" strokeLinecap="round" />
              </svg>
              Lägg till anställd
            </Link>

            <button
              onClick={triggerExport}
              className={btn}
              title="Exportera anställda"
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
    </div>
  )
}
