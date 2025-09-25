# Kompetensspårning – Frontend (Next.js + Tailwind)

**Frontend-only** MVP för en enkel SaaS-plattform där byggföretag kan hantera anställda och deras certifikat.

## Funktioner

- Lägg till anställd
- Skapa och spara certifikat kopplat till en anställd (en anställd kan ha flera certifikat)
- Översikt med **två vyer**: _Anställda_ eller _Certifikat_
- Sök i båda vyerna
- Ta bort anställd/certifikat
- Exportera **employees.csv** och **certificates.csv**
- All data sparas i **localStorage** (ingen backend)

## Kom igång

```bash
npm install
npm run dev
# öppna http://localhost:3000
```

## Struktur

- `app/` – App Router sidor (Next.js 14)
- `components/` – UI-komponenter
- `lib/` – typer + localStorage-hantering

> OBS: Detta är ren frontend. När du kopplar en backend kan du byta ut `lib/storage.ts` mot API-anrop.
