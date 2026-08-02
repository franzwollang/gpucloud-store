import type { GpuCatalog, GpuFamily, PriceEstimate } from '@/types/gpu';

import { getMedianChipHourlyFrom, median } from '@/lib/catalog/pricing';
import type { UseCaseTemplate, UseCaseTemplateItem } from '@/lib/useCaseTemplates';

export type TemplateLineEstimate = {
  gpuModel: string;
  gpuCount: number;
  /** Median indicative $/hr for this line (exact-count preferred). */
  medianHourly: number | null;
  /** True when at least one exact `gpuCount` offering contributed. */
  usedExactCount: boolean;
};

export type TemplateHourlyEstimate = {
  /** Sum of line medians — display as “Mdn $X/hr”. */
  medianHourly: number | null;
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

function estimateLine(
  catalog: GpuCatalog,
  item: UseCaseTemplateItem
): TemplateLineEstimate {
  const empty: TemplateLineEstimate = {
    gpuModel: item.gpuModel,
    gpuCount: item.gpuCount,
    medianHourly: null,
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
      medianHourly: median(rates),
      usedExactCount
    };
  }

  // Last resort: family-wide median $/GPU × count (same as availability cards).
  const medianPerGpu = getMedianChipHourlyFrom(gpuFamily);
  if (medianPerGpu === null) return empty;

  return {
    gpuModel: item.gpuModel,
    gpuCount: item.gpuCount,
    medianHourly: medianPerGpu * item.gpuCount,
    usedExactCount: false
  };
}

export function estimateTemplateHourlyRange(
  template: UseCaseTemplate,
  catalog: GpuCatalog
): TemplateHourlyEstimate {
  const lines = template.items.map(item => estimateLine(catalog, item));

  if (lines.some(line => line.medianHourly === null)) {
    return {
      medianHourly: null,
      lines
    };
  }

  return {
    medianHourly: lines.reduce((sum, line) => sum + line.medianHourly!, 0),
    lines
  };
}

export function formatHourlyAmount(hourly: number): string {
  return `$${hourly.toFixed(2)}`;
}

/** Indicative median label for templates / availability-style estimates. */
export function formatTemplateHourlyRange(
  estimate: Pick<TemplateHourlyEstimate, 'medianHourly'>,
  fallback: string
): string {
  if (estimate.medianHourly === null) return fallback;
  return `Mdn ${formatHourlyAmount(estimate.medianHourly)}/hr`;
}

export function formatLineHourlyPrice(
  line: TemplateLineEstimate,
  fallback: string
): string {
  if (line.medianHourly === null) return fallback;
  return `Mdn ${formatHourlyAmount(line.medianHourly)}/hr`;
}
