import type { GpuCatalog, GpuFamily, PriceEstimate } from '@/types/gpu';

import { getAvgChipHourlyFrom } from '@/lib/catalog/pricing';
import type { UseCaseTemplate, UseCaseTemplateItem } from '@/lib/useCaseTemplates';

export type TemplateLineEstimate = {
  gpuModel: string;
  gpuCount: number;
  /** Average indicative $/hr for this line (exact-count preferred). */
  avgHourly: number | null;
  /** True when at least one exact `gpuCount` offering contributed. */
  usedExactCount: boolean;
};

export type TemplateHourlyEstimate = {
  /** Sum of line averages — display as “Avg $X/hr”. */
  avgHourly: number | null;
  lines: TemplateLineEstimate[];
};

/**
 * Collect indicative totals for a template line.
 * Prefer offerings whose `gpuCount` matches the template item; otherwise fall
 * back to per-GPU scaling (`hourlyFrom / offeringCount * targetCount`).
 * Catalog `hourlyFrom` is always the total for that offering’s GPU count.
 */
function collectHourlyRatesForLine(
  gpuFamily: GpuFamily,
  targetGpuCount: number
): { rates: number[]; usedExactCount: boolean } {
  const exact: number[] = [];
  const scaled: number[] = [];
  const seenExact = new Set<string>();
  const seenScaled = new Set<string>();

  const consider = (
    price: PriceEstimate | undefined,
    offeringGpuCount: number
  ) => {
    if (!price || typeof price.hourlyFrom !== 'number') return;
    if (!(price.hourlyFrom > 0)) return;
    const count = Math.max(1, offeringGpuCount);
    // Dedupe commercial + identical region copies on the same offering.
    const key = `${count}:${price.hourlyFrom.toFixed(4)}`;

    if (count === targetGpuCount) {
      if (seenExact.has(key)) return;
      seenExact.add(key);
      exact.push(price.hourlyFrom);
      return;
    }

    if (seenScaled.has(key)) return;
    seenScaled.add(key);
    scaled.push((price.hourlyFrom / count) * targetGpuCount);
  };

  for (const offering of gpuFamily.offerings) {
    const offeringCount = offering.gpuCount || 1;
    consider(offering.commercial.price, offeringCount);
    for (const region of offering.regions) {
      consider(region.price, offeringCount);
    }
  }

  if (exact.length > 0) {
    return { rates: exact, usedExactCount: true };
  }
  return { rates: scaled, usedExactCount: false };
}

function mean(rates: number[]): number {
  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
}

function estimateLine(
  catalog: GpuCatalog,
  item: UseCaseTemplateItem
): TemplateLineEstimate {
  const empty: TemplateLineEstimate = {
    gpuModel: item.gpuModel,
    gpuCount: item.gpuCount,
    avgHourly: null,
    usedExactCount: false
  };

  const gpuFamily = catalog.gpus.find(gpu => gpu.model === item.gpuModel);
  if (!gpuFamily) return empty;

  const { rates, usedExactCount } = collectHourlyRatesForLine(
    gpuFamily,
    item.gpuCount
  );

  if (rates.length > 0) {
    return {
      gpuModel: item.gpuModel,
      gpuCount: item.gpuCount,
      avgHourly: mean(rates),
      usedExactCount
    };
  }

  // Last resort: family-wide avg $/GPU × count (same as availability cards).
  const avgPerGpu = getAvgChipHourlyFrom(gpuFamily);
  if (avgPerGpu === null) return empty;

  return {
    gpuModel: item.gpuModel,
    gpuCount: item.gpuCount,
    avgHourly: avgPerGpu * item.gpuCount,
    usedExactCount: false
  };
}

export function estimateTemplateHourlyRange(
  template: UseCaseTemplate,
  catalog: GpuCatalog
): TemplateHourlyEstimate {
  const lines = template.items.map(item => estimateLine(catalog, item));

  if (lines.some(line => line.avgHourly === null)) {
    return {
      avgHourly: null,
      lines
    };
  }

  return {
    avgHourly: lines.reduce((sum, line) => sum + line.avgHourly!, 0),
    lines
  };
}

export function formatHourlyAmount(hourly: number): string {
  return `$${hourly.toFixed(2)}`;
}

/** Indicative average label for templates / availability-style estimates. */
export function formatTemplateHourlyRange(
  estimate: Pick<TemplateHourlyEstimate, 'avgHourly'>,
  fallback: string
): string {
  if (estimate.avgHourly === null) return fallback;
  return `Avg ${formatHourlyAmount(estimate.avgHourly)}/hr`;
}

export function formatLineHourlyPrice(
  line: TemplateLineEstimate,
  fallback: string
): string {
  if (line.avgHourly === null) return fallback;
  return `Avg ${formatHourlyAmount(line.avgHourly)}/hr`;
}
