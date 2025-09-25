
'use client'
import { useState } from 'react'

export default function ContactPage() {
  const [state, setState] = useState<'idle'|'sent'>('idle')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('sent')
  }

  return (
    <main className="section">
      <div className="container-narrow">
        <h1 className="text-3xl font-bold text-brand-800">Kontakta oss</h1>
        <p className="mt-2 text-gray-700">Fyll i formuläret så återkommer vi vanligtvis inom 1 arbetsdag.</p>

        {state === 'idle' ? (
          <form onSubmit={onSubmit} className="mt-6 card p-6 space-y-4 max-w-xl">
            <label className="block">
              <span className="text-sm font-medium">Namn</span>
              <input required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="För- och efternamn" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">E‑post</span>
              <input required type="email" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="namn@företag.se" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Meddelande</span>
              <textarea required rows={5} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Berätta kort om ert behov..." />
            </label>
            <button className="rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700">Skicka</button>
          </form>
        ) : (
          <div className="mt-6 card p-6 max-w-xl">
            <div className="text-brand-700 font-semibold">Tack! </div>
            <div className="text-sm text-gray-700 mt-1">Ditt meddelande är skickat. Vi återkommer snart.</div>
          </div>
        )}
      </div>
    </main>
  )
}
