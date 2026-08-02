/**
 * GPU catalog entrypoint for UI consumers.
 *
 * Offerings + indicative $/hr come from committed market snapshots:
 * - gpurentalprices.com (CC BY 4.0)
 * - gpucloudcompare.com (CC-BY-4.0)
 * - gridstackhub.ai (CC BY 4.0)
 *
 * Family copy and risk placeholders stay curated in `src/lib/catalog/`.
 * Refresh snapshots with `pnpm catalog:ingest`.
 *
 * Credit each price with its feed source under the price figure (see
 * CatalogAttribution + PriceEstimate.sourceId). Site footer lists all active
 * feeds once for overall attribution.
 */
import {
  GPUCLOUDCOMPARE_ATTRIBUTION,
  GPURENTALPRICES_ATTRIBUTION,
  GRIDSTACKHUB_ATTRIBUTION,
  mergeCatalogs,
  normalizeGpuCloudCompareSnapshot,
  normalizeGpuRentalSnapshot,
  normalizeGridstackSnapshot,
  sortGpuFamiliesByPopularity,
  type CatalogSourceCredit,
  type GpuCloudCompareSnapshot,
  type GpuRentalPricesSnapshot,
  type GridstackGpuPricingSnapshot,
  type NormalizeStats
} from '@/lib/catalog';
import type { GpuCatalog } from '@/types/gpu';

import compareSnapshotJson from './data/gpucloudcompare-latest.json';
import gridstackSnapshotJson from './data/gridstackhub-latest.json';
import rentalSnapshotJson from './data/gpurentalprices-latest.json';

const rentalSnapshot =
  rentalSnapshotJson as unknown as GpuRentalPricesSnapshot;
const compareSnapshot =
  compareSnapshotJson as unknown as GpuCloudCompareSnapshot;
const gridstackSnapshot =
  gridstackSnapshotJson as unknown as GridstackGpuPricingSnapshot;

const rentalResult = normalizeGpuRentalSnapshot(rentalSnapshot);
const compareResult = normalizeGpuCloudCompareSnapshot(compareSnapshot);
const gridstackResult = normalizeGridstackSnapshot(gridstackSnapshot);

const merged = mergeCatalogs(
  mergeCatalogs(rentalResult.catalog, compareResult.catalog),
  gridstackResult.catalog
);

const catalog: GpuCatalog = {
  ...merged,
  gpus: sortGpuFamiliesByPopularity(merged.gpus)
};

if (catalog.gpus.length === 0) {
  throw new Error(
    'GPU catalog normalize produced zero families. Restore public/data snapshots or relax the curated allowlist.'
  );
}

export const gpuCatalog: GpuCatalog = catalog;

const activeSourceIds = new Set<string>();
for (const gpu of catalog.gpus) {
  for (const offering of gpu.offerings) {
    const sourceId = offering.commercial.price.sourceId;
    if (sourceId) activeSourceIds.add(sourceId);
  }
}

const ALL_SOURCES: readonly CatalogSourceCredit[] = [
  GPURENTALPRICES_ATTRIBUTION,
  GPUCLOUDCOMPARE_ATTRIBUTION,
  GRIDSTACKHUB_ATTRIBUTION
];

/**
 * Sources that contributed indicative prices to this catalog build.
 */
export const catalogSources: readonly CatalogSourceCredit[] = ALL_SOURCES.filter(
  source => activeSourceIds.has(source.id)
);

/** @deprecated Prefer `catalogSources` — kept for callers that only need date/stats. */
export const catalogSource = {
  ...GPURENTALPRICES_ATTRIBUTION,
  date: rentalResult.stats.sourceDate,
  compareDate: compareResult.stats.sourceDate,
  gridstackDate: gridstackResult.stats.sourceDate,
  stats: rentalResult.stats,
  compareStats: compareResult.stats,
  gridstackStats: gridstackResult.stats,
  sources: catalogSources
} as const;

export type { CatalogSourceCredit, NormalizeStats };
