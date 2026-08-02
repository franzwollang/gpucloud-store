/**
 * GPU catalog entrypoint for UI consumers.
 *
 * Offerings + indicative $/hr come from committed market snapshots (currently
 * gpurentalprices.com, CC BY 4.0). Family copy and risk placeholders stay
 * curated in `src/lib/catalog/`. Refresh with `pnpm catalog:ingest`.
 *
 * Credit every active price source on pricing rows/cards only — not hero,
 * footer, or section chrome.
 */
import {
  GPURENTALPRICES_ATTRIBUTION,
  normalizeGpuRentalSnapshot,
  type CatalogSourceCredit,
  type GpuRentalPricesSnapshot,
  type NormalizeStats
} from '@/lib/catalog';
import type { GpuCatalog } from '@/types/gpu';

import snapshotJson from './data/gpurentalprices-latest.json';

const snapshot = snapshotJson as unknown as GpuRentalPricesSnapshot;

const { catalog, stats } = normalizeGpuRentalSnapshot(snapshot);

if (catalog.gpus.length === 0) {
  throw new Error(
    'GPU catalog normalize produced zero families. Restore public/data/gpurentalprices-latest.json or relax the curated allowlist.'
  );
}

export const gpuCatalog: GpuCatalog = catalog;

/**
 * Sources that contributed indicative prices to this catalog build.
 * Append additional credits when enrichment (Shadeform, Latitude, …) lands.
 */
export const catalogSources: readonly CatalogSourceCredit[] = [
  GPURENTALPRICES_ATTRIBUTION
];

/** @deprecated Prefer `catalogSources` — kept for callers that only need date/stats. */
export const catalogSource = {
  ...GPURENTALPRICES_ATTRIBUTION,
  date: stats.sourceDate,
  stats,
  sources: catalogSources
} as const;

export type { CatalogSourceCredit, NormalizeStats };
