// apps/platform/app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import Providers from "@/components/Providers" // ⬅️ default-import (fix)

export const metadata: Metadata = {
  title: "Kompetensspårning – Frontend",
  description:
    "SaaS för byggföretag: hantera anställda och certifikat (frontend-only)",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" className="h-full">
      <body className="min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
