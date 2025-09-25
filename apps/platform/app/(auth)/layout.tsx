// app/(auth)/layout.tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Logga in | Kompetensspårning",
  description: "Säker inloggning till Kompetensspårning",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const year = new Date().getFullYear()

  return (
    <html lang="sv" className="h-full">
      <body className="min-h-screen">
        {/* 2-kolumners layout som fyller hela höjden */}
        <div className="min-h-screen grid md:grid-cols-2">
          {/* Vänster: formulär + footer längst ner, centrerad under formuläret */}
          <div className="relative flex items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">{children}</div>

            {/* Footer – enhetlig i vänsterkolumnen */}
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
              <div className="w-full max-w-md px-2 text-center text-xs text-gray-500 space-y-2">
                <div className="flex justify-center gap-4">
                  <a
                    href="/privacy"
                    className="underline underline-offset-4 hover:decoration-solid decoration-dotted pointer-events-auto"
                  >
                    Integritetspolicy
                  </a>
                  <a
                    href="/security"
                    className="underline underline-offset-4 hover:decoration-solid decoration-dotted pointer-events-auto"
                  >
                    Säkerhetspolicy
                  </a>
                  <a
                    href="/terms"
                    className="underline underline-offset-4 hover:decoration-solid decoration-dotted pointer-events-auto"
                  >
                    Användarvillkor
                  </a>
                </div>
                <div>
                  © {year} Certifikatkollen. Alla rättigheter förbehållna.
                </div>
              </div>
            </div>
          </div>

          {/* Höger: hero/bildpanel */}
          <div className="hidden md:block bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="h-full w-full flex items-center justify-center p-12">
              <div className="max-w-lg">
                <h1 className="text-4xl font-extrabold tracking-tight text-indigo-900">
                  Upptäck Certifikatkollen.
                </h1>
                <p className="mt-4 text-indigo-900/80 leading-relaxed">
                  Hantera certifikat, få påminnelser och håll koll på
                  efterlevnad – allt på ett ställe. Logga in för att komma
                  igång.
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
