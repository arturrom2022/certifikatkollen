// app/security/page.tsx
"use client"

import PageHeader from "@/components/PageHeader"

export default function SecurityPage() {
  const updated = "2025-01-01"

  return (
    <main className="space-y-6">
      {/* Titel */}
      <PageHeader title="Säkerhetspolicy" />

      {/* Senast uppdaterad – vänsterställd, samma som övriga */}
      <p className="text-sm text-gray-500">Senast uppdaterad: {updated}</p>

      {/* Brödtext – smalare läsbredd, vänsterställd */}
      <div className="prose prose-gray max-w-3xl space-y-6">
        <p>
          Säkerhet är kärnan i <strong>Certifikatkollen</strong>. Den här sidan
          beskriver hur vi skyddar era uppgifter genom tekniska, organisatoriska
          och processuella kontroller. Dokumentet är utformat utifrån branschens
          bästa praxis och kompletterar våra{" "}
          <a href="/terms" className="underline decoration-dotted">
            Användarvillkor
          </a>{" "}
          och vår{" "}
          <a href="/privacy" className="underline decoration-dotted">
            Integritetspolicy
          </a>
          .
        </p>

        <h2>1. Styrning, roller & ansvar</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Ansvar:</strong> Säkerhetsarbetet leds av produktägare med
            definierade roller för drift, utveckling och incidenthantering.
          </li>
          <li>
            <strong>Policyer:</strong> Säkerhetspolicy, dataklassificering,
            åtkomstpolicy, policy för behörighetsrecensioner, policy för
            sårbarhetshantering och incidentpolicy. Policyerna ses över minst
            årligen.
          </li>
          <li>
            <strong>Utbildning:</strong> Medarbetare genomgår årlig
            säkerhetsutbildning (phishing, lösenordshygien, dataskydd) och
            onboarding med NDA.
          </li>
        </ul>

        <h2>2. Arkitektur & driftmiljö</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Miljösegregation:</strong> Separata miljöer för
            utveckling/test och produktion. Produktdata används aldrig i test
            utan avidentifiering.
          </li>
          <li>
            <strong>Principen om minsta privilegium:</strong> IAM-roller och
            tjänstkonton beviljas endast nödvändiga rättigheter.
          </li>
          <li>
            <strong>Hårdning:</strong> Basbilder och containrar byggs
            reproducerbart, uppdateras löpande och körs med begränsade
            privilegier.
          </li>
          <li>
            <strong>Nätverk:</strong> Brandväggsregler mellan tjänster,
            private-by-default, ingress via lastbalanserare/WAF.
          </li>
        </ul>

        <h2>3. Kryptering</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Transport:</strong> All trafik är krypterad med TLS
            (minst&nbsp;1.2). HSTS, säkra cipher-sviter och Perfect Forward
            Secrecy används. Osäker HTTP omdirigeras till HTTPS.
          </li>
          <li>
            <strong>Lagring:</strong> Data krypteras i vila (t.ex. AES-256 på
            databaser, diskar och säkerhetskopior). Nycklar hanteras med
            molnleverantörens KMS och regelbunden nyckelrotation.
          </li>
          <li>
            <strong>Hemligheter:</strong> API-nycklar och anslutningssträngar
            lagras i ett sekretshanteringssystem (ej i kod eller CI-loggar).
          </li>
        </ul>

        <h2>4. Identitet, autentisering & åtkomst</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>RBAC:</strong> Rollbaserad åtkomstkontroll för
            kundorganisationer. Administratörer kan styra roller och
            behörigheter per användare.
          </li>
          <li>
            <strong>Inloggning:</strong> Lösenord lagras aldrig i klartext utan
            hashas med modern algoritm (Argon2id eller bcrypt med hög kost).
            Kontroller för kontolåsning och ratelimiting finns.
          </li>
          <li>
            <strong>MFA/SSO:</strong> Stöd för flerfaktorsinloggning och
            företags-SSO (SAML/OIDC) kan erbjudas på begäran.
          </li>
          <li>
            <strong>Sessionssäkerhet:</strong> Säkra cookies (HttpOnly, Secure,
            SameSite), kortlivade access-tokens och regelbunden sessionrotation
            vid känsliga åtgärder.
          </li>
          <li>
            <strong>Behörighetsrecensioner:</strong> Återkommande granskning av
            administrativa rättigheter och tjänstkonton.
          </li>
        </ul>

        <h2>5. Applikationssäkerhet (SSDLC)</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Kodstandard:</strong> Code review med minst två par ögon på
            kritiska ändringar. Branch-skydd och obligatoriska checks.
          </li>
          <li>
            <strong>Skanning:</strong> SAST/DAST, beroendeskanning,
            licenskontroller och hemlighetsskanning i CI/CD.
          </li>
          <li>
            <strong>Skydd i runtime:</strong> Inputvalidering, parametriserade
            queries, output-encoding, CSP, CSRF-skydd, XSS-, SSRF- och
            clickjacking-skydd, samt filuppladdningskontroller.
          </li>
          <li>
            <strong>Ändringshantering:</strong> Versionshanterade migreringar,
            canary/gradual rollouts och möjlighet till snabb rollback.
          </li>
        </ul>

        <h2>6. Loggning, övervakning & varningar</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Audit-loggar:</strong> Viktiga händelser (inloggning,
            ändringar av behörighet, export, radering m.m.) loggas med tid,
            aktör och kontext.
          </li>
          <li>
            <strong>Telemetri:</strong> Mätvärden, hälsokontroller och
            centraliserad logghantering med larm på anomalier, fel och
            säkerhetshändelser.
          </li>
          <li>
            <strong>Bevarande:</strong> Loggar behålls enligt
            dataminimeringsprincipen och DPA/lagkrav.
          </li>
        </ul>

        <h2>7. Kundisolering & datasegregering</h2>
        <p>
          Kunddata isoleras logiskt per organisation. Åtkomstkontroller på
          applikations- och datalager begränsar åtkomst till endast relevant
          tenant. Exporter märks och skyddas.
        </p>

        <h2>8. Sårbarhetshantering & patchning</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Inventering:</strong> Kontinuerlig skanning av
            basbilder/beroenden. Prenumeration på säkerhetsbulletiner.
          </li>
          <li>
            <strong>Åtgärdsnivåer (riktlinjer):</strong> Kritisk (CVSS ≥ 9.0):
            snar åtgärd; Hög (7.0–8.9): inom kort; Medel/Låg: i planerade
            uppdateringsfönster. Riskbedömning kan tidigarelägga åtgärd.
          </li>
          <li>
            <strong>Extern testning:</strong> Återkommande
            penetrations-/granskningar. Sammanfattningar kan delas under NDA.
          </li>
        </ul>

        <h2>9. Backup, kontinuitet & katastrofåterställning</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Backuper:</strong> Regelbundna, krypterade backuper av
            databaser och filer. Teståterställningar genomförs periodiskt.
          </li>
          <li>
            <strong>Mål (riktvärden):</strong> RPO och RTO definieras per
            komponent; vi strävar efter snabba återställningar för kritiska
            delar.
          </li>
          <li>
            <strong>Kontinuitetsplan:</strong> Dokumenterade rutiner för
            driftstörningar, leverantörsbortfall och dataåterställning.
          </li>
        </ul>

        <h2>10. Dataretention & radering</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Retentionsprincip:</strong> Vi behåller personuppgifter
            endast så länge det krävs för avtal, rättslig grund eller enligt
            kundens instruktioner i DPA.
          </li>
          <li>
            <strong>Radering:</strong> På begäran raderar eller anonymiserar vi
            data enligt definierade processer. Backuper rensas enligt schema.
          </li>
          <li>
            <strong>Export:</strong> Administratörer kan när som helst exportera
            data i maskinläsbart format.
          </li>
        </ul>

        <h2>11. Incidenthantering & notifiering</h2>
        <p>
          Vi följer en etablerad livscykel: <em>identifiera</em>,{" "}
          <em>begränsa</em>, <em>åtgärda</em>, <em>återställa</em>,{" "}
          <em>utreda</em> och <em>lära</em>. Påverkade kunder informeras
          skyndsamt med känd påverkan, vilka data/konton som berörts, vidtagna
          åtgärder och rekommenderade kundåtgärder. Om tillämpligt uppfylls
          rättsliga anmälningskrav (t.ex. GDPR).
        </p>

        <h2>12. Tredjepart & leverantörer</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Subprocessorer:</strong> Vi använder noggrant utvalda
            leverantörer. Lista och ändringsrutiner redovisas i DPA.
          </li>
          <li>
            <strong>Due diligence:</strong> Genomgång av säkerhetsrutiner,
            dataplacering och certifieringar (om tillgängliga) innan användning.
          </li>
          <li>
            <strong>Avtal:</strong> Biträdesavtal och överföringsmekanismer
            (t.ex. standardavtalsklausuler) där så krävs.
          </li>
        </ul>

        <h2>13. Slutkundens säkerhetsansvar</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Administrera roller, MFA och åtkomster i er organisation.</li>
          <li>
            Säkerställ kvaliteten på uppladdad data och att laglig grund finns
            för personuppgiftsbehandling.
          </li>
          <li>
            Skydda klienter och nätverk (antivirus/EDR, patchning, MDM,
            webbläsarhårdning) och utbilda användare.
          </li>
          <li>
            Använd exportfunktioner och egna backuper enligt era interna krav.
          </li>
        </ul>

        <h2>14. Ansvarsfull sårbarhetsrapportering</h2>
        <p>
          Vi välkomnar rapporter om potentiella sårbarheter. Skicka en
          ansvarsfull rapport till{" "}
          <a
            href="mailto:support@certifikatkollen.se"
            className="underline decoration-dotted"
          >
            support@certifikatkollen.se
          </a>{" "}
          med beskrivning, reproduktionssteg, påverkan och kontaktuppgifter.
          Testa inte med data som inte tillhör dig, försök inte komma åt andra
          kunders uppgifter och påverka inte tillgängligheten. Vi återkopplar
          skyndsamt och koordinerar eventuell publicering.
        </p>

        <h2>15. Frågor</h2>
        <p>
          För frågor om säkerhet, efterlevnad eller underlag till
          säkerhetsgranskningar kontakta vår support på{" "}
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
