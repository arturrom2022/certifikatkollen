"use client"

import Link from "next/link"

export default function SiteFooter() {
  const year = new Date().getFullYear()
  const version = "2.01"

  return (
    <footer className="mt-12">
      {/* Full-bleed separator */}
      <div className="w-full border-t border-gray-200" />

      {/* Innehållet i centrerad container – samma som header */}
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between text-sm">
        <div className="flex gap-6 items-center">
          <Link
            href="/privacy"
            scroll
            className="hover:underline hover:underline-offset-4"
          >
            Integritetspolicy
          </Link>
          <Link
            href="/security"
            scroll
            className="hover:underline hover:underline-offset-4"
          >
            Säkerhetspolicy
          </Link>
          <Link
            href="/terms"
            scroll
            className="hover:underline hover:underline-offset-4"
          >
            Användarvillkor
          </Link>
          <Link
            href="/support"
            scroll
            className="hover:underline hover:underline-offset-4"
          >
            Support
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span>© {year}</span>
          <a
            href="https://www.certifikatkollen.se"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:underline hover:underline-offset-4"
          >
            Certifikatkollen
            {/* Sned pil (45°) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6h8m0 0v8m0-8L6 18"
              />
            </svg>
          </a>
          <span className="text-gray-500">Version {version}</span>
        </div>
      </div>
    </footer>
  )
}
