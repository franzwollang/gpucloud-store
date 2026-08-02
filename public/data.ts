/**
 * GPU catalog entrypoint for UI consumers.
 *
 * Offerings + indicative $/hr come from the committed gpurentalprices.com
 * daily snapshot (CC BY 4.0). Family copy and risk placeholders stay curated
 * in `src/lib/catalog/`. Refresh with `pnpm catalog:ingest`.
 */
import {
  GPURENTALPRICES_ATTRIBUTION,
  normalizeGpuRentalSnapshot,
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

export const catalogSource = {
  ...GPURENTALPRICES_ATTRIBUTION,
  date: stats.sourceDate,
  stats
} as const;

export type { NormalizeStats };
