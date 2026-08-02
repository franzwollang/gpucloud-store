import type { GpuCatalog, GpuFamily, PriceEstimate } from '@/types/gpu';

import type { UseCaseTemplate, UseCaseTemplateItem } from '@/lib/useCaseTemplates';

export type TemplateLineEstimate = {
  gpuModel: string;
  gpuCount: number;
  minHourly: number | null;
  maxHourly: number | null;
  minSourceId: string | null;
  maxSourceId: string | null;
};

export type TemplateHourlyEstimate = {
  minHourly: number | null;
  maxHourly: number | null;
  sourceIds: string[];
  lines: TemplateLineEstimate[];
};

function collectHourlyRatesForLine(
  gpuFamily: GpuFamily,
  targetGpuCount: number
): Array<{ hourly: number; sourceId: string | null }> {
  const rates: Array<{ hourly: number; sourceId: string | null }> = [];

  const consider = (price: PriceEstimate | undefined, offeringGpuCount: number) => {
    if (!price || typeof price.hourlyFrom !== 'number') return;
    const count = Math.max(1, offeringGpuCount);
    const perGpu = price.hourlyFrom / count;
    if (!(perGpu > 0)) return;
    rates.push({
      hourly: perGpu * targetGpuCount,
      sourceId: price.sourceId ?? null
    });
  };

  for (const offering of gpuFamily.offerings) {
    const offeringCount = offering.gpuCount || 1;
    consider(offering.commercial.price, offeringCount);
    for (const region of offering.regions) {
      consider(region.price, offeringCount);
    }
  }

  return rates;
}

function estimateLine(
  catalog: GpuCatalog,
  item: UseCaseTemplateItem
): TemplateLineEstimate {
  const gpuFamily = catalog.gpus.find(gpu => gpu.model === item.gpuModel);
  if (!gpuFamily) {
    return {
      gpuModel: item.gpuModel,
      gpuCount: item.gpuCount,
      minHourly: null,
      maxHourly: null,
      minSourceId: null,
      maxSourceId: null
    };
  }

  const rates = collectHourlyRatesForLine(gpuFamily, item.gpuCount);
  if (rates.length === 0) {
    return {
      gpuModel: item.gpuModel,
      gpuCount: item.gpuCount,
      minHourly: null,
      maxHourly: null,
      minSourceId: null,
      maxSourceId: null
    };
  }

  let minHourly = rates[0]!.hourly;
  let maxHourly = rates[0]!.hourly;
  let minSourceId = rates[0]!.sourceId;
  let maxSourceId = rates[0]!.sourceId;

  for (const rate of rates) {
    if (rate.hourly < minHourly) {
      minHourly = rate.hourly;
      minSourceId = rate.sourceId;
    }
    if (rate.hourly > maxHourly) {
      maxHourly = rate.hourly;
      maxSourceId = rate.sourceId;
    }
  }

  return {
    gpuModel: item.gpuModel,
    gpuCount: item.gpuCount,
    minHourly,
    maxHourly,
    minSourceId,
    maxSourceId
  };
}

export function estimateTemplateHourlyRange(
  template: UseCaseTemplate,
  catalog: GpuCatalog
): TemplateHourlyEstimate {
  const lines = template.items.map(item => estimateLine(catalog, item));

  let minHourly: number | null = null;
  let maxHourly: number | null = null;
  const sourceIdSet = new Set<string>();

  for (const line of lines) {
    if (line.minHourly === null || line.maxHourly === null) continue;

    minHourly = (minHourly ?? 0) + line.minHourly;
    maxHourly = (maxHourly ?? 0) + line.maxHourly;

    if (line.minSourceId) {
      sourceIdSet.add(line.minSourceId);
    }
    if (line.maxSourceId) {
      sourceIdSet.add(line.maxSourceId);
    }
  }

  if (lines.some(line => line.minHourly === null)) {
    return {
      minHourly: null,
      maxHourly: null,
      sourceIds: [],
      lines
    };
  }

  return {
    minHourly,
    maxHourly,
    sourceIds: Array.from(sourceIdSet),
    lines
  };
}

export function formatHourlyAmount(hourly: number): string {
  return `$${hourly.toFixed(2)}`;
}

export function formatTemplateHourlyRange(
  estimate: Pick<TemplateHourlyEstimate, 'minHourly' | 'maxHourly'>,
  fallback: string
): string {
  const { minHourly, maxHourly } = estimate;
  if (minHourly === null || maxHourly === null) return fallback;
  if (maxHourly > minHourly) {
    return `From ${formatHourlyAmount(minHourly)}–${formatHourlyAmount(maxHourly)}/hr`;
  }
  return `From ${formatHourlyAmount(minHourly)}/hr`;
}

export function formatLineHourlyPrice(
  line: TemplateLineEstimate,
  fallback: string
): string {
  if (line.minHourly === null) return fallback;
  return `From ${formatHourlyAmount(line.minHourly)}/hr`;
}
