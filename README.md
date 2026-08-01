# GPUCloud Store

Marketing + lead-capture site for a **GPU capacity broker**: help teams discover real GPU configurations, build a cluster “plan”, and request a quote for dedicated capacity across providers.

## What this repo contains

- **Home page funnel** (`src/app/[locale]/(root)/(home)/page.tsx`): hero search → availability → use cases → “how it works” → CTA → contact form.
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
- **Contact form submission** (dullahan-web hybrid forms):
  - Shared Zod contract: `contactSubmitInput` / `createContactFormSchema` in `src/core/contact/`.
  - Committed transition: `contactPageModel` → `submitContactAction` (`src/server/actions/submitContact.ts`).
  - Human UI: `ContactWithPlanForm` via `useTransition('submit')`; plan items come from the Zustand plan store.
  - Submit handler is still a validated stub (logs in dev); Prisma/CRM persistence is M5 when `DATABASE_URL` is set.
  - Remaining M2 gaps: dullahan action registry for agents, server Zod issue → RHF field mapping.

## Scripts

- **`pnpm dev`**: run Next dev server
- **`pnpm build`**: production build
- **`pnpm start`**: serve production build
- **`pnpm check`**: lint + typecheck
- **`pnpm format:write`**: format
