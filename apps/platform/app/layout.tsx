import type { Metadata } from "next"
import "./globals.css"
import Providers from "./providers" // ⟵ viktigt

export const metadata: Metadata = {
  title: "Certifikatkollen",
  description: "—",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
