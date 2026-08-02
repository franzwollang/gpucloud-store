import type { GpuFamily, PriceEstimate } from '@/types/gpu';

/**
 * Lowest indicative $/GPU-hr for a family, with the feed that produced it.
 * Multi-GPU plan rates are normalized by `gpuCount` so 8× SKUs don't drown
 * out 1× list prices when computing per-chip figures.
 */
export function getMinChipHourlyFrom(gpu: GpuFamily): {
  hourlyFrom: number | null;
  sourceId: string | null;
} {
  let minPrice: number | null = null;
  let sourceId: string | null = null;

  const consider = (price: PriceEstimate | undefined, gpuCount: number) => {
    if (!price || typeof price.hourlyFrom !== 'number') return;
    const count = Math.max(1, gpuCount);
    const perGpu = price.hourlyFrom / count;
    if (!(perGpu > 0)) return;
    if (minPrice === null || perGpu < minPrice) {
      minPrice = perGpu;
      sourceId = price.sourceId ?? null;
    }
  };

  for (const offering of gpu.offerings) {
    const gpuCount = offering.gpuCount || 1;
    consider(offering.commercial.price, gpuCount);
    for (const region of offering.regions) {
      consider(region.price, gpuCount);
    }
  }

  return { hourlyFrom: minPrice, sourceId };
}

/**
 * Mean indicative $/GPU-hr across offerings for a family.
 * One rate per offering (commercial, else first region price) so multi-region
 * duplicates don’t overweight a single SKU. No source attribution — blended.
 */
export function getAvgChipHourlyFrom(gpu: GpuFamily): number | null {
  const rates: number[] = [];

  for (const offering of gpu.offerings) {
    const count = Math.max(1, offering.gpuCount || 1);
    const price =
      typeof offering.commercial.price?.hourlyFrom === 'number'
        ? offering.commercial.price
        : offering.regions.find(region => typeof region.price?.hourlyFrom === 'number')
            ?.price;

    if (!price || typeof price.hourlyFrom !== 'number') continue;
    const perGpu = price.hourlyFrom / count;
    if (!(perGpu > 0)) continue;
    rates.push(perGpu);
  }

  if (rates.length === 0) return null;
  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
}
