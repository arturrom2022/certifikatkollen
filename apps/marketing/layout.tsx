// apps/marketing/app/layout.tsx
import type { Metadata } from "next"
import "./globals.css" // skapa filen i steg 2 (eller ta bort raden om du inte vill ha global css än)

export const metadata: Metadata = {
  title: "Certifikatkollen – Hemsida",
  description: "Marknadsföringssajt för Certifikatkollen",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" className="h-full">
      <body className="min-h-screen bg-white text-gray-900">{children}</body>
    </html>
  )
}
