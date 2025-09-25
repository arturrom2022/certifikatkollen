// app/(app)/layout.tsx
import type { Metadata } from "next"
import HeaderNav from "@/components/HeaderNav"
import Logo from "@/components/Logo"
import AccountMenu from "@/components/AccountMenu"
import SiteFooter from "@/components/SiteFooter"
import ClientAuthGate from "@/components/ClientAuthGate"

export const metadata: Metadata = {
  title: "Kompetensspårning – Frontend",
  description:
    "SaaS för byggföretag: hantera anställda och certifikat (frontend-only)",
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className="h-full">
      <body className="min-h-screen flex flex-col">
        {/* Auth-guard: om ej inloggad -> redirect till /login */}
        <ClientAuthGate />

        {/* Sticky header – alltid synlig */}
        <header className="sticky top-0 z-50">
          <div className="bg-gray-100 backdrop-blur border-b border-gray-200">
            <div className="mx-auto max-w-6xl px-6 flex items-center justify-between gap-6 py-4">
              <Logo />
              <div className="flex items-center">
                <HeaderNav />
                <div className="h-6 w-px bg-gray-300 mx-3" aria-hidden />
                <AccountMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Innehåll */}
        <div className="flex-1">
          <main className="mx-auto max-w-6xl px-6 pt-4">{children}</main>
        </div>

        <SiteFooter />
      </body>
    </html>
  )
}
