
import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-gray-200">
      <div className="container-narrow py-10 text-sm text-gray-600 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="font-semibold text-gray-800">Certifikatkollen</div>
          <nav className="flex items-center gap-4">
            <Link href="/privacy" className="link-underline">Integritetspolicy</Link>
            <Link href="/security" className="link-underline">Säkerhet</Link>
            <Link href="/terms" className="link-underline">Villkor</Link>
            <Link href="/contact" className="link-underline">Kontakt</Link>
          </nav>
        </div>
        <div className="text-center md:text-left">© {year} Certifikatkollen. Alla rättigheter förbehållna.</div>
      </div>
    </footer>
  )
}
