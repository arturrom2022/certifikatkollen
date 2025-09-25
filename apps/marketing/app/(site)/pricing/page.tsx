
import Link from 'next/link'

export default function PricingPage() {
  return (
    <main className="section">
      <div className="container-narrow prose max-w-none">
        <h1>Priser</h1>
        <p className="lead">Transparent prissättning utan dolda avgifter. Välj planen som passar storleken på ert bolag.</p>
        <p>Vill du veta mer? <Link href="/contact" className="link-underline">Kontakta oss</Link>.</p>
      </div>
    </main>
  )
}
