
import Link from 'next/link'

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="section">
        <div className="container-narrow grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-800">
              Upptäck Certifikatkollen.
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Hantera certifikat, få påminnelser och håll koll på efterlevnad – allt på ett ställe.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/contact" className="rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700">Boka demo</Link>
              <Link href="/pricing" className="rounded-xl border border-gray-300 px-4 py-2 hover:bg-gray-100">Se priser</Link>
            </div>
            <p className="mt-3 text-xs text-gray-500">14 dagar gratis. Ingen bindningstid.</p>
          </div>
          <div className="card p-6">
            <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
              <div className="text-xs text-brand-800 font-semibold mb-2">Dashboard (förhandsvisning)</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="card p-4 text-center">
                  <div className="text-3xl font-bold text-brand-700">24</div>
                  <div className="text-xs text-gray-600 mt-1">Aktiva certifikat</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-3xl font-bold text-brand-700">7</div>
                  <div className="text-xs text-gray-600 mt-1">Utgår 30 dagar</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-3xl font-bold text-brand-700">4</div>
                  <div className="text-xs text-gray-600 mt-1">Projekt</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-600">Automatiska påminnelser via e‑post & sms. Spårning per anställd & projekt.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-white">
        <div className="container-narrow">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-800">Varför välja oss?</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              ['Allt på ett ställe', 'Certifikat per anställd & projekt med tydlig status.'],
              ['Smarta påminnelser', 'Automatiska notifieringar innan giltighetstid går ut.'],
              ['Regelefterlevnad', 'Rapporter & revisionsspår redo för upphandling.']
            ].map(([t, d]) => (
              <div key={t} className="card p-5">
                <div className="text-brand-700 font-semibold">{t}</div>
                <div className="text-sm text-gray-600 mt-2">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="section">
        <div className="container-narrow">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-800">Enkelt pris</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="text-sm font-semibold text-gray-800">Start</div>
              <div className="mt-2 text-3xl font-extrabold">890 kr<span className="text-base font-normal">/mån</span></div>
              <ul className="mt-4 text-sm text-gray-700 space-y-2">
                <li>Upp till 25 anställda</li>
                <li>Påminnelser</li>
                <li>Export (CSV)</li>
              </ul>
              <Link href="/contact" className="mt-6 inline-flex rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700">Kom igång</Link>
            </div>
            <div className="card p-6 border-brand-400">
              <div className="text-sm font-semibold text-gray-800">Pro</div>
              <div className="mt-2 text-3xl font-extrabold">1 990 kr<span className="text-base font-normal">/mån</span></div>
              <ul className="mt-4 text-sm text-gray-700 space-y-2">
                <li>Upp till 100 anställda</li>
                <li>Projektvy & rapporter</li>
                <li>API/Webhooks</li>
              </ul>
              <Link href="/contact" className="mt-6 inline-flex rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700">Boka demo</Link>
            </div>
            <div className="card p-6">
              <div className="text-sm font-semibold text-gray-800">Enterprise</div>
              <div className="mt-2 text-3xl font-extrabold">Offert</div>
              <ul className="mt-4 text-sm text-gray-700 space-y-2">
                <li>Fler än 100 anställda</li>
                <li>SSO & SLA</li>
                <li>Onboarding med specialist</li>
              </ul>
              <Link href="/contact" className="mt-6 inline-flex rounded-xl border border-gray-300 px-4 py-2 hover:bg-gray-100">Kontakta oss</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
