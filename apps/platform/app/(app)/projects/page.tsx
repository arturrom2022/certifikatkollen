"use client"

import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import ProjectsTable from "@/components/ProjectsTable"

export default function ProjectsPage() {
  const btn =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-200 inline-flex items-center gap-2"

  function triggerExport() {
    // Låt tabellen sköta CSV via event – matchar övriga sidor
    window.dispatchEvent(new CustomEvent("export-projects"))
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Projekt"
        subtitle="Hantera pågående och avslutade projekt"
      />

      <ProjectsTable
        toolbarSuffix={
          <div className="flex items-center gap-3">
            <Link
              href="/projects/new"
              className={btn}
              title="Lägg till projekt"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 9v6M9 12h6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
              Lägg till projekt
            </Link>

            <button
              onClick={triggerExport}
              className={btn}
              title="Exportera projekt"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
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
