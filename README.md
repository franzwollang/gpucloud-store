# GPUCloud Store

Marketing + lead-capture site for a **GPU capacity broker**: help teams discover real GPU configurations, build a cluster “plan”, and request a quote for dedicated capacity across providers.

## What this repo contains

- **Home page funnel** (`src/app/[locale]/(root)/(home)/page.tsx`): hero search → availability → use cases → “how it works” → contact form (header Request Quote CTA; Predator/ClickBurst live under `src/components/ui/`).
- **Plan builder**: visitors can add multiple GPU configurations to a “plan” and carry it into the contact form.
- **Localization**: `next-intl` via `src/app/[locale]/…` and `public/locales/*`.

## Tech stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS** + Radix UI primitives
- **Zustand** stores (plan/UI state)
- **Prisma** (optional; only needed if you persist leads in a DB)

## Getting started

### Prerequisites

- **Node**: pinned via Volta (`package.json` → `volta.node`)
- **pnpm**: pinned via `packageManager` in `package.json`

### Install

```bash
pnpm install
cp .env.example .env
```

Populate `.env` as needed (see “Environment variables” below).

### Run locally

```bash
pnpm dev
```

### Build / typecheck

```bash
pnpm build
pnpm check
```

## Environment variables

See `.env.example` (and keep it up to date when adding new vars). Notably:

- **`NEXT_PUBLIC_SITE_DOMAIN`**: canonical domain used for SEO/sitemaps.
- **Analytics (optional)**: `NEXT_PUBLIC_GTM_ID`, Mailchimp vars.
- **`DATABASE_URL`**: required only if Prisma-backed persistence is enabled.

## Notes for contributors

- **Product + UX issues**: tracked in `OPEN_ISSUES.md` (roadmap in `PLANNING.md`).
- **Contact form submission**: `src/core/contact/` + `src/server/actions/submitContact.ts` via an in-repo `dullahan-web` stand-in (`dullahanUI/packages/dullahan-web`). Swap for the real DullahanUI package when published; persist leads via Prisma/CRM when configured (`DATABASE_URL`).
- **Temporary Dullahan stand-in**: do not grow `dullahanUI/` — see that package’s README.

## Scripts

- **`pnpm dev`**: run Next dev server
- **`pnpm build`**: production build
- **`pnpm start`**: serve production build
- **`pnpm check`**: lint + typecheck
- **`pnpm catalog:ingest`**: refresh `public/data/gpurentalprices-latest.json` (fails soft to last-good)
- **`pnpm format:write`**: format

## GPU catalog (indicative market prices)

Featured availability and search read `gpuCatalog` from `public/data.ts`, which
normalizes the committed [gpurentalprices.com](https://gpurentalprices.com/data)
daily snapshot (CC BY 4.0). Curated provider allowlist + `provisioningType` map
live under `src/lib/catalog/`. Prices are indicative list rates, not contracted
quotes. Shadeform / Latitude enrichment notes: `src/server/catalog/enrichment.md`.
