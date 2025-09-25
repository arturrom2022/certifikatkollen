// app/account/page.tsx
"use client"

import Link from "next/link"
import PageHeader from "@/components/PageHeader"

function IconUser({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <circle cx="12" cy="8" r="4" strokeWidth="1.8" />
      <path
        d="M6 20v-1a6 6 0 0 1 12 0v1"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconCog({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        strokeWidth="1.6"
      />
      <path
        d="M19.4 15a7.6 7.6 0 0 0 .1-1 7.6 7.6 0 0 0-.1-1l1.7-1.3-1.7-3-2 .4a7.7 7.7 0 0 0-1.7-1l-.3-2.1H9.6l-.3 2.1a7.7 7.7 0 0 0-1.7 1l-2-.4-1.7 3L5.6 13a7.6 7.6 0 0 0-.1 1c0 .34.03.67.1 1l-1.7 1.3 1.7 3 2-.4c.52.42 1.1.77 1.7 1l.3 2.1h4.8l.3-2.1c.6-.23 1.18-.58 1.7-1l2 .4 1.7-3L19.4 15Z"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function IconLifeBuoy({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
      <path
        d="M4.6 7.5 7.5 4.6M16.5 4.6l2.9 2.9M19.4 16.5l-2.9 2.9M7.5 19.4 4.6 16.5"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export default function AccountOverviewPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Konto"
        subtitle="Allt som rör dig och ditt företag – profil, inställningar och support."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Min profil */}
        <Link
          href="/profile"
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition"
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <IconUser />
            <span>Min profil</span>
          </div>
          <div className="mt-1 text-lg font-semibold">
            Visa & redigera dina uppgifter
          </div>
          <div className="mt-2 text-sm text-gray-500">Öppna profil →</div>
        </Link>

        {/* Företagsinställningar */}
        <Link
          href="/account/settings"
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition"
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <IconCog />
            <span>Företagsinställningar</span>
          </div>
          <div className="mt-1 text-lg font-semibold">
            Uppgifter, aviseringar & branding
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Öppna inställningar →
          </div>
        </Link>

        {/* Support */}
        <Link
          href="/support"
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition"
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <IconLifeBuoy />
            <span>Support</span>
          </div>
          <div className="mt-1 text-lg font-semibold">
            Få hjälp och kontakta oss
          </div>
          <div className="mt-2 text-sm text-gray-500">Till support →</div>
        </Link>
      </section>
    </main>
  )
}
