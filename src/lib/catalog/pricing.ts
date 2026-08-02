import type { GpuFamily, PriceEstimate } from '@/types/gpu';

/**
 * Lowest indicative $/GPU-hr for a family, with the feed that produced it.
 * Multi-GPU plan rates are normalized by `gpuCount` so 8× SKUs don't drown
 * out 1× list prices when computing availability "from" cards.
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
