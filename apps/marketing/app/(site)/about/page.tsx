
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="section">
      <div className="container-narrow prose max-w-none">
        <h1>Om oss</h1>
        <p className="lead">Vi bygger verktyg som gör efterlevnad enkel för bygg & entreprenad. Certifikatkollen startade som ett sidoprojekt och har vuxit genom nära dialog med platschefer och HR.</p>
        <p>Vill du veta mer? <Link href="/contact" className="link-underline">Kontakta oss</Link>.</p>
      </div>
    </main>
  )
}
