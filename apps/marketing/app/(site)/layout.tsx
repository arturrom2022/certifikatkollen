
import type { Metadata } from 'next'
import '../globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Certifikatkollen – Håll koll på certifikat & efterlevnad',
  description: 'Enkel plattform för att hantera certifikat, påminnelser och efterlevnad i bygg & entreprenad.',
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
