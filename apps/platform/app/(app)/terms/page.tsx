// app/terms/page.tsx
"use client"

import PageHeader from "@/components/PageHeader"

export default function TermsPage() {
  const updated = "2025-01-01"

  return (
    <main className="space-y-6">
      <PageHeader title="Användarvillkor" />

      {/* Senast uppdaterad – nu direkt under titeln, utan indrag */}
      <p className="text-sm text-gray-500">Senast uppdaterad: {updated}</p>

      {/* Brödtext – vänsterjusterad, men med maxbredd för läsbarhet */}
      <div className="prose prose-gray max-w-3xl space-y-6">
        <p>
          Dessa användarvillkor (”<strong>Villkoren</strong>”) reglerar din
          åtkomst till och användning av <strong>Certifikatkollen</strong> (”
          <strong>Tjänsten</strong>”). Genom att skapa konto, logga in eller
          använda Tjänsten bekräftar du att du har läst och accepterar
          Villkoren. Om du använder Tjänsten för en organisations räkning
          intygar du att du har behörighet att binda organisationen till
          Villkoren. Om du inte accepterar Villkoren ska du inte använda
          Tjänsten.
        </p>

        <h2>1. Definitioner</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Kund</strong>: den juridiska eller fysiska person som
            tecknar eller använder Tjänsten.
          </li>
          <li>
            <strong>Användare</strong>: person som bjuds in eller annars får
            åtkomst till Tjänsten av Kunden.
          </li>
          <li>
            <strong>Kunddata</strong>: information som Kunden eller Användare
            laddar upp till eller genererar i Tjänsten (t.ex. uppgifter om
            anställda, certifikat, bilagor och loggar).
          </li>
          <li>
            <strong>Personuppgifter</strong>: sådan Kunddata som utgör
            personuppgifter enligt tillämplig dataskyddslagstiftning.
          </li>
        </ul>

        <h2>2. Avtalets omfattning</h2>
        <p>
          Vi tillhandahåller Tjänsten som en molntjänst ”som den är”. Funktioner
          kan variera mellan planer och kan förändras över tid enligt avsnitt 10
          och 16 nedan.
        </p>

        <h2>3. Konto, roller och åtkomst</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Kunden ansvarar för att upprätta och administrera konton,
            behörigheter och roller samt för att endast behöriga personer får
            åtkomst.
          </li>
          <li>
            Användare ska skydda sina inloggningsuppgifter. Kund ansvarar för
            all aktivitet som sker via dess konton.
          </li>
          <li>
            Kunden ska omedelbart meddela oss vid misstänkt obehörig åtkomst
            eller säkerhetsincident.
          </li>
        </ul>

        <h2>4. Tillåten användning</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Det är förbjudet att använda Tjänsten i strid med lag, tredje mans
            rättigheter eller dessa Villkor, inklusive men inte begränsat till
            intrång, trakasserier, skadlig kod, intrångsförsök eller kringgående
            av tekniska skydd.
          </li>
          <li>
            Det är inte tillåtet att{" "}
            <em>kopiera, dekompilera, modifiera, reverse-engineera</em> eller på
            annat sätt försöka härleda källkod, utöver vad som tillåts enligt
            tvingande lag.
          </li>
          <li>
            Du får inte hyra ut, sälja, vidarelicensiera eller på annat sätt
            kommersiellt utnyttja Tjänsten utan vårt uttryckliga skriftliga
            medgivande.
          </li>
        </ul>

        <h2>5. Kunddata och ansvar</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Kunden äger Kunddata. Kunden ansvarar för att Kunddata är korrekt,
            laglig och att nödvändiga samtycken eller rättsliga grunder finns.
          </li>
          <li>
            Kunden är ensam ansvarig för hur Tjänsten används inom den egna
            organisationen, inklusive beslut som fattas baserat på information i
            Tjänsten.
          </li>
          <li>
            Kunden ansvarar för att upprätthålla egna backuper av exporterad
            data vid behov. Vi kan tillhandahålla exportfunktioner och rimlig
            assistans enligt avsnitt 12.
          </li>
        </ul>

        <h2>6. Personuppgifter och dataskydd</h2>
        <p>
          Parterna erkänner att Kunden är personuppgiftsansvarig och vi är
          personuppgiftsbiträde för Personuppgifter som behandlas i Tjänsten.
          Behandling sker enligt vår{" "}
          <a href="/privacy" className="underline decoration-dotted">
            Integritetspolicy
          </a>{" "}
          som utgör en integrerad del av dessa Villkor. Vid konflikt gäller DPA
          för behandling av Personuppgifter. Vi får anlita godkända
          underbiträden och kommer att hålla en uppdaterad lista tillgänglig.
        </p>

        <h2>7. Säkerhet</h2>
        <p>
          Vi vidtar lämpliga tekniska och organisatoriska åtgärder för att
          skydda Tjänsten och Kunddata, inklusive åtkomstkontroller, loggning
          och regelbundna uppdateringar. Mer information finns på{" "}
          <a href="/security" className="underline decoration-dotted">
            /security
          </a>
          . Kunden ansvarar för säker konfiguration av konton, roller och
          integrationer samt för Användares enheter och nätverk.
        </p>

        <h2>8. Immaterialrätt och licens</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Alla rättigheter till Tjänsten, varumärken, design, programvara och
            innehåll (exklusive Kunddata) tillhör oss eller våra licensgivare.
          </li>
          <li>
            Kunden får en begränsad, icke-exklusiv och icke-överförbar licens
            att använda Tjänsten under avtalstiden i enlighet med Villkoren.
          </li>
          <li>
            Kunden kan lämna synpunkter eller förslag (”Feedback”). Vi får fritt
            använda sådan Feedback för att förbättra Tjänsten utan ersättning
            eller skyldigheter gentemot Kunden.
          </li>
        </ul>

        <h2>9. Tredjepartstjänster och integreringar</h2>
        <p>
          Tjänsten kan integrera med tredjepartsprodukter. Sådan användning
          regleras av respektive tredjeparts villkor och integritetspolicy. Vi
          ansvarar inte för tredje parts produkter eller tillgänglighet.
        </p>

        <h2>10. Drift, förändringar och underhåll</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Vi strävar efter hög tillgänglighet men garanterar inte att Tjänsten
            är fri från avbrott eller fel. Planerade underhåll kan medföra korta
            avbrott. Vid större förändringar eller driftstörningar informerar vi
            i rimlig omfattning.
          </li>
          <li>
            Vi kan när som helst lägga till, ändra eller ta bort funktioner.
            Väsentliga försämringar kommuniceras enligt avsnitt 16.
          </li>
        </ul>

        <h2>11. Avgifter och betalning (om tillämpligt)</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Pris, plan och faktureringsperiod framgår av beställningen eller
            prislistan i Tjänsten. Om ingen avgift tas ut gäller relevanta delar
            av Villkoren ändå.
          </li>
          <li>
            Obetalda belopp kan leda till tillfällig avstängning till dess att
            betalning erhållits. Dröjsmålsränta kan debiteras enligt lag.
          </li>
          <li>
            Alla priser anges exklusive skatter och avgifter om inte annat
            anges.
          </li>
        </ul>

        <h2>12. Dataportabilitet och export</h2>
        <p>
          Kunden kan när som helst exportera Kunddata via tillgängliga
          exportverktyg. På skriftlig begäran och i den mån det är tekniskt
          rimligt kan vi bistå med ytterligare export mot skälig ersättning.
        </p>

        <h2>13. Uppsägning och radering</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Kunden kan säga upp användningen när som helst. För betalda
            abonnemang gäller uppsägning vid utgången av aktuell period, om inte
            annat anges i beställningen.
          </li>
          <li>
            Vi kan stänga av eller säga upp åtkomst med omedelbar verkan vid
            väsentligt avtalsbrott, brott mot lag, säkerhetsrisk eller utebliven
            betalning.
          </li>
          <li>
            Efter uppsägning raderar eller anonymiserar vi Kunddata enligt våra
            rutiner och DPA. Kunden ansvarar för att exportera data innan
            upphörande.
          </li>
        </ul>

        <h2>14. Garanti och ansvarsbegränsning</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Tjänsten tillhandahålls i befintligt skick och i mån av
            tillgänglighet. Vi lämnar inga garantier utöver vad som uttryckligen
            anges i Villkoren.
          </li>
          <li>
            I den utsträckning lag medger ansvarar vi inte för indirekta skador,
            utebliven vinst, följdskador, goodwillförlust eller
            informationsförlust.
          </li>
          <li>
            Vårt sammanlagda ansvar under en tolvmånadersperiod är begränsat
            till de avgifter som Kunden betalat för Tjänsten under samma period
            (eller 0 kr vid kostnadsfri användning).
          </li>
        </ul>

        <h2>15. Force majeure</h2>
        <p>
          Ingen part ansvarar för underlåtenhet att fullgöra sina åtaganden som
          beror på omständigheter utanför partens rimliga kontroll, såsom
          myndighetsbeslut, krig, strejk, pandemi, el- eller internetavbrott,
          leverantörsstörningar eller liknande händelser.
        </p>

        <h2>16. Ändringar av Villkoren</h2>
        <p>
          Vi kan uppdatera Villkoren från tid till annan. Väsentliga ändringar
          meddelas i Tjänsten eller via e-post före ikraftträdande. Om du
          fortsätter använda Tjänsten efter att ändringarna trätt i kraft
          accepterar du de uppdaterade villkoren. Den aktuella versionen finns
          alltid publicerad på denna sida.
        </p>

        <h2>17. Överlåtelse</h2>
        <p>
          Kunden får inte överlåta detta avtal utan vårt skriftliga medgivande.
          Vi får överlåta avtalet i samband med omstrukturering, fusion,
          företagsförsäljning eller till närstående bolag, förutsatt att det nya
          bolaget åtar sig Villkoren.
        </p>

        <h2>18. Ogiltighet/Severability</h2>
        <p>
          Om någon bestämmelse i Villkoren bedöms ogiltig ska detta inte påverka
          giltigheten av övriga bestämmelser. Den ogiltiga bestämmelsen ska
          ersättas med en giltig bestämmelse som ligger så nära den ursprungliga
          avsikten som möjligt.
        </p>

        <h2>19. Tillämplig lag och tvistelösning</h2>
        <p>
          Svensk materiell rätt ska tillämpas, utan hänsyn till dess
          lagvalsregler. Tvister som inte kan lösas genom förhandling ska
          avgöras av svensk allmän domstol med Stockholms tingsrätt som första
          instans. Om Kunden är konsument kan tvingande konsumentskyddsregler ge
          rätt att vända sig till Allmänna reklamationsnämnden (ARN).
        </p>

        <h2>20. Kontakt</h2>
        <p>
          Frågor om Villkoren, dataskydd eller säkerhet? Kontakta oss på{" "}
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
