import type {
  GpuCatalog,
  GpuFamily,
  GpuOffering,
  NodeSpecs,
  ProviderMeta,
  RegionAvailability
} from '@/types/gpu';

import {
  GRIDSTACKHUB_ATTRIBUTION,
  type GridstackGpuPricingRow,
  type GridstackGpuPricingSnapshot
} from './feedTypes';
import { gridstackModelLabel, mapGridstackGpuModel } from './gridstackGpuMap';
import { FAMILY_BLUEPRINTS } from './gpuSkuMap';
import { DEFAULT_RISK_METRICS, type NormalizeResult, type NormalizeStats } from './normalize';
import {
  PROVIDER_BY_GRIDSTACK_NAME,
  type CuratedProvider
} from './providerMap';
import { MULTI_REGION_LABEL, sortRegionsByLabel } from './sort';

function parsePositiveNumber(value: unknown): number | null {
  if (typeof value === 'number' && value > 0) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function isOnDemandPricingType(pricingType: string | undefined): boolean {
  if (!pricingType) return false;
  const normalized = pricingType.toLowerCase().replace(/_/g, '-');
  return normalized === 'on-demand';
}

function perGpuHourly(row: GridstackGpuPricingRow): number | null {
  const perGpu = parsePositiveNumber(row.per_gpu_hourly);
  if (perGpu) return perGpu;

  const hourly = parsePositiveNumber(row.hourly_rate);
  if (!hourly) return null;

  const gpuCount =
    typeof row.gpu_count === 'number' && row.gpu_count > 0 ? row.gpu_count : 1;
  return hourly / gpuCount;
}

function regionSlug(region: string): string {
  return region
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'global';
}

function nodeSpecsFromRow(row: GridstackGpuPricingRow): NodeSpecs {
  const vcpus = parsePositiveNumber(row.vcpus) ?? 0;
  const memoryGB = parsePositiveNumber(row.ram_gb) ?? 0;

  return {
    vcpus,
    memoryGB,
    localStorageTB: 0,
    storageDescription:
      typeof row.storage_info === 'string' && row.storage_info.trim()
        ? row.storage_info
        : 'Specs confirmed on quote'
  };
}

function gridstackSortKey(
  provider: CuratedProvider,
  hourlyFrom: number,
  gpuCount: number
): number {
  return provider.rank * 1_000_000 + hourlyFrom * 100 + gpuCount;
}

type AcceptedRow = {
  provider: CuratedProvider;
  row: GridstackGpuPricingRow;
  familyId: keyof typeof FAMILY_BLUEPRINTS;
  gpuCount: number;
  hourlyFrom: number;
  memoryGB: number;
  regionLabel: string;
};

function toOffering(accepted: AcceptedRow): GpuOffering {
  const { provider, row, familyId, gpuCount, hourlyFrom, memoryGB, regionLabel } =
    accepted;
  const modelLabel = gridstackModelLabel(row.gpu_model, familyId, memoryGB);
  const regionCode = regionSlug(regionLabel);

  const price = {
    currency: 'USD',
    hourlyFrom,
    isIndicative: true as const,
    sourceId: GRIDSTACKHUB_ATTRIBUTION.id
  };

  const regions: RegionAvailability[] = sortRegionsByLabel([
    {
      regionCode: 'global' as const,
      locationLabel: regionLabel,
      price,
      leadTimeDays: { min: 1, max: 7 },
      minTerm: { unit: 'hourly' as const, minimumUnits: 1 }
    }
  ]);

  return {
    id: `${provider.id}-${familyId}-gsh-${gpuCount}gpu-${regionCode}`,
    providerId: provider.id,
    displayName: `${provider.name} ${modelLabel} (${gpuCount}×)`,
    provisioningType: provider.provisioningType,
    gpuCount,
    isClusterCapable: gpuCount > 1 || provider.provisioningType === 'bare-metal',
    regions,
    nodeSpecs: nodeSpecsFromRow(row),
    commercial: {
      price,
      minTerm: { unit: 'hourly', minimumUnits: 1 },
      billingModel: 'on-demand',
      notes: `Indicative on-demand list price from gridstackhub.ai (${row.gpu_model}, ${memoryGB}GB)`
    },
    riskMetrics: DEFAULT_RISK_METRICS
  };
}

/**
 * Normalize a gridstackhub.ai snapshot into GpuCatalog shape.
 * Keeps on-demand rows with real gpu counts and per-location regions when present.
 */
export function normalizeGridstackSnapshot(
  snapshot: GridstackGpuPricingSnapshot
): NormalizeResult {
  const stats: NormalizeStats = {
    sourceDate: snapshot.as_of ?? 'unknown',
    offerCount: snapshot.data?.length ?? 0,
    acceptedOffers: 0,
    skippedUnmappedSku: 0,
    skippedGenericSku: 0,
    skippedProvider: 0,
    skippedKind: 0,
    skippedInvalidPrice: 0,
    familyCount: 0,
    providerCount: 0
  };

  const accepted: AcceptedRow[] = [];

  for (const row of snapshot.data ?? []) {
    if (row.active === false) {
      continue;
    }

    if (!isOnDemandPricingType(row.pricing_type)) {
      stats.skippedKind += 1;
      continue;
    }

    const provider = PROVIDER_BY_GRIDSTACK_NAME.get(row.provider);
    if (!provider) {
      stats.skippedProvider += 1;
      continue;
    }

    const familyId = mapGridstackGpuModel(row.gpu_model);
    if (!familyId) {
      stats.skippedUnmappedSku += 1;
      continue;
    }

    const hourlyFrom = perGpuHourly(row);
    if (hourlyFrom === null) {
      stats.skippedInvalidPrice += 1;
      continue;
    }

    const gpuCount =
      typeof row.gpu_count === 'number' && row.gpu_count > 0 ? row.gpu_count : 1;

    const blueprint = FAMILY_BLUEPRINTS[familyId];
    const memoryGB =
      parsePositiveNumber(row.gpu_vram_gb) ?? blueprint.memoryGB;

    const regionLabel =
      typeof row.region === 'string' && row.region.trim()
        ? row.region.trim()
        : MULTI_REGION_LABEL;

    accepted.push({
      provider,
      row,
      familyId,
      gpuCount,
      hourlyFrom,
      memoryGB,
      regionLabel
    });
  }

  const bestByKey = new Map<string, AcceptedRow>();
  for (const entry of accepted) {
    const key = `${entry.provider.id}::${entry.familyId}::${entry.gpuCount}::${entry.regionLabel}`;
    const existing = bestByKey.get(key);
    if (
      !existing ||
      gridstackSortKey(entry.provider, entry.hourlyFrom, entry.gpuCount) <
        gridstackSortKey(existing.provider, existing.hourlyFrom, existing.gpuCount)
    ) {
      bestByKey.set(key, entry);
    }
  }

  stats.acceptedOffers = bestByKey.size;

  const offeringsByFamily = new Map<string, GpuOffering[]>();
  const providersUsed = new Map<string, ProviderMeta>();

  const sortedRows = [...bestByKey.values()].sort(
    (a, b) =>
      gridstackSortKey(a.provider, a.hourlyFrom, a.gpuCount) -
      gridstackSortKey(b.provider, b.hourlyFrom, b.gpuCount)
  );

  for (const entry of sortedRows) {
    const offering = toOffering(entry);
    const list = offeringsByFamily.get(entry.familyId) ?? [];
    list.push(offering);
    offeringsByFamily.set(entry.familyId, list);

    if (!providersUsed.has(entry.provider.id)) {
      providersUsed.set(entry.provider.id, {
        id: entry.provider.id,
        name: entry.provider.name,
        website: entry.provider.website,
        description: entry.provider.description,
        primaryFocus: entry.provider.primaryFocus
      });
    }
  }

  const familyOrder = Object.keys(FAMILY_BLUEPRINTS) as Array<
    keyof typeof FAMILY_BLUEPRINTS
  >;

  const gpus: GpuFamily[] = [];
  for (const familyId of familyOrder) {
    const offerings = offeringsByFamily.get(familyId);
    if (!offerings?.length) continue;
    const blueprint = FAMILY_BLUEPRINTS[familyId];
    gpus.push({
      id: blueprint.id,
      vendor: blueprint.vendor,
      model: blueprint.model,
      memoryGB: blueprint.memoryGB,
      description: blueprint.description,
      shortDetails: blueprint.shortDetails,
      tags: blueprint.tags,
      offerings
    });
  }

  stats.familyCount = gpus.length;
  stats.providerCount = providersUsed.size;

  return {
    catalog: {
      gpus,
      providers: [...providersUsed.values()].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    },
    stats
  };
}
