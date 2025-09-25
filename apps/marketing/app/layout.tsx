import type { Metadata } from "next"
import "./globals.css" // du kan ta bort den här raden om du inte vill ha global CSS

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
