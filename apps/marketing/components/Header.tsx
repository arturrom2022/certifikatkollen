
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Hem' },
  { href: '/about', label: 'Om oss' },
  { href: '/contact', label: 'Kontakt' },
  { href: '/pricing', label: 'Priser' },
]

export default function Header() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-gray-200">
      <div className="container-narrow flex items-center justify-between h-14">
        <Link href="/" className="font-extrabold tracking-tight text-brand-800">
          Certifikatkollen
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={
                (pathname === l.href ? 'text-brand-700' : 'text-gray-700 hover:text-brand-700') + ' transition'
              }>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/contact" className="hidden md:inline-flex rounded-xl border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100">Boka demo</Link>
          <a href="/login" className="inline-flex rounded-xl bg-brand-600 text-white px-3 py-1.5 text-sm hover:bg-brand-700">Logga in</a>
        </div>
      </div>
    </header>
  )
}
