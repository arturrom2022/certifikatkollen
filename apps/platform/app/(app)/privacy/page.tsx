// app/privacy/page.tsx
"use client"

import PageHeader from "@/components/PageHeader"

export default function PrivacyPage() {
  const updated = "2025-01-01"

  return (
    <main className="space-y-6">
      <PageHeader title="Integritetspolicy" />

      {/* Senast uppdaterad – vänster, utan extra indrag */}
      <p className="text-sm text-gray-500">Senast uppdaterad: {updated}</p>

      {/* Brödtext – vänsterställd med behaglig läsbredd */}
      <div className="prose prose-gray max-w-3xl space-y-6">
        <p>
          Den här policyn beskriver hur <strong>Certifikatkollen</strong>{" "}
          (“tjänsten”, “vi”, “oss”) samlar in, använder, delar och skyddar
          personuppgifter i enlighet med dataskyddsförordningen (GDPR) och annan
          tillämplig lagstiftning. Policyn kompletterar våra{" "}
          <a href="/terms" className="underline decoration-dotted">
            Användarvillkor
          </a>{" "}
          och{" "}
          <a href="/security" className="underline decoration-dotted">
            Säkerhetspolicy
          </a>
          .
        </p>

        <h2>1. Personuppgiftsansvarig</h2>
        <p>
          Personuppgiftsansvarig är <strong>Certifikatkollen</strong>. Du kan nå
          oss via{" "}
          <a
            href="mailto:support@certifikatkollen.se"
            className="underline decoration-dotted"
          >
            support@certifikatkollen.se
          </a>
          .
        </p>

        <h2>2. Vilka personuppgifter vi behandlar</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Konto- och profiluppgifter:</strong> namn, e-postadress,
            roll, autentiseringsuppgifter.
          </li>
          <li>
            <strong>Anställdadata:</strong> namn, kontaktuppgifter,
            certifikatinformation, giltighetsdatum, noteringar.
          </li>
          <li>
            <strong>Fakturering och betalningar:</strong> företagsuppgifter,
            fakturaadress, betalningshistorik.
          </li>
          <li>
            <strong>Teknisk information:</strong> loggar, IP-adress, enhets- och
            webbläsardata, inloggningshändelser.
          </li>
          <li>
            <strong>Supportärenden:</strong> information du lämnar i
            kommunikation med oss via e-post eller supportformulär.
          </li>
          <li>
            <strong>Användningsdata:</strong> statistik över användning av
            plattformens funktioner (för felsökning och förbättring).
          </li>
        </ul>

        <h2>3. Ändamål och rättslig grund</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Tillhandahålla tjänsten:</strong> för att uppfylla vårt{" "}
            <em>avtal</em> med er organisation.
          </li>
          <li>
            <strong>Administration och support:</strong> baserat på{" "}
            <em>berättigat intresse</em> att säkerställa funktionalitet, svara
            på frågor och hantera incidenter.
          </li>
          <li>
            <strong>Fakturering, bokföring och rättsliga skyldigheter:</strong>{" "}
            för att uppfylla <em>lagkrav</em>.
          </li>
          <li>
            <strong>Utveckling av tjänsten:</strong> baserat på{" "}
            <em>berättigat intresse</em> att analysera användning och förbättra
            funktioner.
          </li>
          <li>
            <strong>Marknadskommunikation:</strong> endast efter ditt{" "}
            <em>samtycke</em> (nyhetsbrev, produktinformation).
          </li>
        </ul>

        <h2>4. Lagringstider</h2>
        <p>
          Vi sparar personuppgifter endast så länge det är nödvändigt för de
          ändamål som anges ovan:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Konto- och kunddata: under avtalstiden + 12 månader.</li>
          <li>
            Anställdadata/certifikat: så länge organisationen själv väljer att
            lagra dem i plattformen. Administratörer kan radera när som helst.
          </li>
          <li>Supportärenden: normalt upp till 24 månader.</li>
          <li>Loggar: normalt upp till 12 månader.</li>
          <li>
            Bokföringsdata: minst 7 år enligt svensk lagstiftning
            (Bokföringslagen).
          </li>
        </ul>

        <h2>5. Mottagare och överföringar</h2>
        <p>
          Vi delar personuppgifter endast med betrodda{" "}
          <em>personuppgiftsbiträden</em> (t.ex. drift, molntjänster, support,
          betalningsleverantörer). All behandling regleras genom biträdesavtal.
          Huvudsaklig behandling sker inom EU/EES. Vid eventuell överföring
          utanför EU/EES används lämpliga skyddsmekanismer, t.ex.
          EU-kommissionens standardavtalsklausuler (SCC).
        </p>

        <h2>6. Dina rättigheter</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Rätt till tillgång – få kopia av de uppgifter vi behandlar.</li>
          <li>
            Rätt till rättelse – korrigera felaktiga eller ofullständiga
            uppgifter.
          </li>
          <li>
            Rätt till radering – begära att uppgifter raderas (“rätten att bli
            bortglömd”).
          </li>
          <li>
            Rätt till begränsning av behandling – tillfälligt stoppa viss
            behandling.
          </li>
          <li>
            Rätt till dataportabilitet – få ut data i strukturerat,
            maskinläsbart format.
          </li>
          <li>
            Rätt att invända – mot behandling baserad på berättigat intresse.
          </li>
          <li>
            Rätt att återkalla samtycke – för behandling som bygger på ditt
            samtycke.
          </li>
          <li>
            Rätt att klaga till tillsynsmyndighet – i Sverige{" "}
            <a
              href="https://www.imy.se/"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-dotted"
            >
              Integritetsskyddsmyndigheten (IMY)
            </a>
            .
          </li>
        </ul>

        <h2>7. Säkerhet</h2>
        <p>
          Vi vidtar tekniska och organisatoriska säkerhetsåtgärder för att
          skydda personuppgifter, inklusive kryptering (i transit och i vila),
          åtkomstkontroller, loggning, säker utvecklingsprocess (SSDLC) och
          regelbundna säkerhetsuppdateringar. Se även vår{" "}
          <a href="/security" className="underline decoration-dotted">
            Säkerhetspolicy
          </a>
          .
        </p>

        <h2>8. Cookies och spårning</h2>
        <p>
          Vi använder endast nödvändiga cookies för inloggning,
          sessionshantering och säkerhet. Eventuella analys- eller
          funktionscookies används endast efter samtycke. Du kan när som helst
          återkalla eller ändra ditt samtycke via webbläsarinställningar.
        </p>

        <h2>9. Ändringar i policyn</h2>
        <p>
          Vi kan uppdatera denna policy vid behov. Väsentliga ändringar
          kommuniceras i tjänsten eller via e-post. Senaste versionen finns
          alltid på denna sida.
        </p>

        <h2>10. Kontakt</h2>
        <p>
          Har du frågor om vår integritetspolicy eller hur vi behandlar
          personuppgifter? Kontakta oss på{" "}
          <a
            href="mailto:support@certifikatkollen.se"
            className="underline decoration-dotted"
          >
            support@certifikatkollen.se
          </a>
          .
        </p>
      </div>
    </main>
  )
}
