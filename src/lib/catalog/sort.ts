import type { GpuCatalog, GpuFamily, GpuFamilyId } from '@/types/gpu';

import { FAMILY_BLUEPRINTS } from './gpuSkuMap';

/** Canonical label used when a feed has no concrete location. */
export const MULTI_REGION_LABEL = 'Multi-region';

/**
 * Discovery bias for unfiltered search + availability CRT cards.
 * Ordered most popular / in-demand first for today's rental market.
 * Entries with no offerings in the live catalog are skipped automatically
 * (e.g. availabilitySection takes the first 6 that exist).
 */
export const GPU_FAMILY_POPULARITY_ORDER = [
  'h100-sxm',
  'h200',
  'b200',
  'h100-pcie',
  'a100-sxm',
  'l40s',
  'mi300x',
  'rtx-4090',
  'a100-pcie',
  'l40',
  'a10',
  'rtx-3090',
  'mi250'
] as const satisfies ReadonlyArray<GpuFamilyId>;

export const FEATURED_AVAILABILITY_COUNT = 6;

const POPULARITY_RANK = new Map<string, number>(
  GPU_FAMILY_POPULARITY_ORDER.map((id, index) => [id, index])
);

function popularityRank(familyId: string): number {
  return POPULARITY_RANK.get(familyId) ?? GPU_FAMILY_POPULARITY_ORDER.length;
}

function isMultiRegionLabel(label: string): boolean {
  return label.trim().toLowerCase() === MULTI_REGION_LABEL.toLowerCase();
}

/** Alphabetical region labels with Multi-region always last. */
export function sortRegionLabels(labels: Iterable<string>): string[] {
  return [...labels].sort((a, b) => {
    const aMulti = isMultiRegionLabel(a);
    const bMulti = isMultiRegionLabel(b);
    if (aMulti !== bMulti) return aMulti ? 1 : -1;
    return a.localeCompare(b);
  });
}

/** Sort region objects by `name` / `locationLabel` with Multi-region last. */
export function sortRegionsByLabel<
  T extends { name?: string; locationLabel?: string }
>(regions: T[]): T[] {
  return [...regions].sort((a, b) => {
    const aLabel = a.name ?? a.locationLabel ?? '';
    const bLabel = b.name ?? b.locationLabel ?? '';
    const aMulti = isMultiRegionLabel(aLabel);
    const bMulti = isMultiRegionLabel(bLabel);
    if (aMulti !== bMulti) return aMulti ? 1 : -1;
    return aLabel.localeCompare(bLabel);
  });
}

export function sortGpuFamiliesByPopularity<T extends { id: string }>(
  gpus: readonly T[]
): T[] {
  return [...gpus].sort(
    (a, b) => popularityRank(a.id) - popularityRank(b.id)
  );
}

/**
 * First `count` catalog families from the popularity list that have offerings.
 * Availability CRT cards should use this (default 6).
 */
export function getFeaturedCatalogGpus(
  catalog: GpuCatalog,
  count: number = FEATURED_AVAILABILITY_COUNT
): GpuFamily[] {
  const byId = new Map(catalog.gpus.map(gpu => [gpu.id, gpu]));
  const featured: GpuFamily[] = [];

  for (const id of GPU_FAMILY_POPULARITY_ORDER) {
    const gpu = byId.get(id);
    if (!gpu || gpu.offerings.length === 0) continue;
    featured.push(gpu);
    if (featured.length >= count) break;
  }

  // If popularity list undershoots (sparse catalog), fill from remaining gpus.
  if (featured.length < count) {
    const seen = new Set(featured.map(gpu => gpu.id));
    for (const gpu of sortGpuFamiliesByPopularity(catalog.gpus)) {
      if (seen.has(gpu.id) || gpu.offerings.length === 0) continue;
      featured.push(gpu);
      if (featured.length >= count) break;
    }
  }

  return featured;
}

/** Model display name for a family id (for callers that only have labels). */
export function popularityOrderedModels(): string[] {
  return GPU_FAMILY_POPULARITY_ORDER.map(id => FAMILY_BLUEPRINTS[id].model);
}
