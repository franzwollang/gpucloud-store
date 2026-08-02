import type {
  GpuCatalog,
  GpuFamily,
  GpuOffering,
  NodeSpecs,
  ProviderMeta,
  RegionAvailability
} from '@/types/gpu';

import { mapCompareGpuModel } from './compareGpuMap';
import {
  GPUCLOUDCOMPARE_ATTRIBUTION,
  type GpuCloudComparePlan,
  type GpuCloudCompareSnapshot
} from './feedTypes';
import { FAMILY_BLUEPRINTS } from './gpuSkuMap';
import { DEFAULT_RISK_METRICS, type NormalizeResult, type NormalizeStats } from './normalize';
import {
  PROVIDER_BY_COMPARE_NAME,
  type CuratedProvider
} from './providerMap';

function parsePositiveNumber(value: unknown): number | null {
  if (typeof value === 'number' && value > 0) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function parseRamGb(plan: GpuCloudComparePlan): number {
  if (typeof plan.ram_gb === 'number' && plan.ram_gb > 0) {
    return plan.ram_gb;
  }
  if (plan.ram_label) {
    const match = plan.ram_label.match(/([\d.]+)\s*(GB|TB)/i);
    if (match) {
      const amount = Number.parseFloat(match[1] ?? '');
      if (Number.isFinite(amount) && amount > 0) {
        return match[2]?.toUpperCase() === 'TB' ? amount * 1024 : amount;
      }
    }
  }
  return 0;
}

function parseDiskTb(plan: GpuCloudComparePlan): number {
  if (typeof plan.disk_gb === 'number' && plan.disk_gb > 0) {
    return plan.disk_gb / 1024;
  }
  if (plan.disk_label) {
    const match = plan.disk_label.match(/([\d.]+)\s*(GB|TB)/i);
    if (match) {
      const amount = Number.parseFloat(match[1] ?? '');
      if (Number.isFinite(amount) && amount > 0) {
        return match[2]?.toUpperCase() === 'TB' ? amount : amount / 1024;
      }
    }
  }
  return 0;
}

function nodeSpecsFromPlan(plan: GpuCloudComparePlan): NodeSpecs {
  const vcpus = parsePositiveNumber(plan.vcpu) ?? 0;
  const memoryGB = parseRamGb(plan);
  const localStorageTB = parseDiskTb(plan);

  return {
    vcpus,
    memoryGB,
    localStorageTB,
    storageDescription:
      plan.disk_label ??
      (plan.disk_gb ? `${plan.disk_gb}GB` : 'Specs confirmed on quote')
  };
}

function compareSortKey(
  provider: CuratedProvider,
  hourlyFrom: number,
  gpuCount: number
): number {
  return provider.rank * 1_000_000 + hourlyFrom * 100 + gpuCount;
}

type AcceptedPlan = {
  provider: CuratedProvider;
  plan: GpuCloudComparePlan;
  familyId: keyof typeof FAMILY_BLUEPRINTS;
  gpuCount: number;
  hourlyFrom: number;
  memoryGB: number;
};

function toOffering(row: AcceptedPlan): GpuOffering {
  const { provider, plan, familyId, gpuCount, hourlyFrom, memoryGB } = row;
  const blueprint = FAMILY_BLUEPRINTS[familyId];
  const locations =
    plan.locations?.filter(location => location.trim().length > 0) ?? [];

  const price = {
    currency: 'USD',
    hourlyFrom,
    monthlyFrom:
      typeof plan.price_monthly_usd === 'number' && plan.price_monthly_usd > 0
        ? plan.price_monthly_usd
        : undefined,
    isIndicative: true as const,
    sourceId: GPUCLOUDCOMPARE_ATTRIBUTION.id
  };

  const regions: RegionAvailability[] =
    locations.length > 0
      ? locations.map(location => ({
          regionCode: 'global',
          locationLabel: location,
          price,
          leadTimeDays: { min: 1, max: 7 },
          minTerm: { unit: 'hourly' as const, minimumUnits: 1 }
        }))
      : [
          {
            regionCode: 'global',
            locationLabel: 'Multi-region',
            price,
            leadTimeDays: { min: 1, max: 7 },
            minTerm: { unit: 'hourly', minimumUnits: 1 }
          }
        ];

  return {
    id: `${provider.id}-${familyId}-compare-${gpuCount}gpu`,
    providerId: provider.id,
    displayName: `${provider.name} ${blueprint.model} (${gpuCount}×)`,
    provisioningType: provider.provisioningType,
    gpuCount,
    isClusterCapable: gpuCount > 1 || provider.provisioningType === 'bare-metal',
    regions,
    nodeSpecs: nodeSpecsFromPlan(plan),
    commercial: {
      price,
      minTerm: { unit: 'hourly', minimumUnits: 1 },
      billingModel: 'on-demand',
      notes: `Indicative list price from gpucloudcompare.com (${plan.plan_id})`
    },
    riskMetrics: DEFAULT_RISK_METRICS
  };
}

/**
 * Normalize a gpucloudcompare.com snapshot into GpuCatalog shape.
 * Emits real gpu counts, per-location regions, and node specs when present.
 */
export function normalizeGpuCloudCompareSnapshot(
  snapshot: GpuCloudCompareSnapshot
): NormalizeResult {
  const stats: NormalizeStats = {
    sourceDate: snapshot.captured_at ?? 'unknown',
    offerCount: snapshot.plans?.length ?? 0,
    acceptedOffers: 0,
    skippedUnmappedSku: 0,
    skippedProvider: 0,
    skippedKind: 0,
    skippedInvalidPrice: 0,
    familyCount: 0,
    providerCount: 0
  };

  const accepted: AcceptedPlan[] = [];

  for (const plan of snapshot.plans ?? []) {
    if (plan.type && plan.type !== 'gpu') {
      stats.skippedKind += 1;
      continue;
    }

    const provider = PROVIDER_BY_COMPARE_NAME.get(plan.provider);
    if (!provider) {
      stats.skippedProvider += 1;
      continue;
    }

    const familyId = mapCompareGpuModel(plan.gpu_model);
    if (!familyId) {
      stats.skippedUnmappedSku += 1;
      continue;
    }

    const hourlyFrom = plan.price_hourly_usd;
    if (typeof hourlyFrom !== 'number' || !(hourlyFrom > 0)) {
      stats.skippedInvalidPrice += 1;
      continue;
    }

    const gpuCount =
      typeof plan.gpu_count === 'number' && plan.gpu_count > 0
        ? plan.gpu_count
        : 1;

    const blueprint = FAMILY_BLUEPRINTS[familyId];

    accepted.push({
      provider,
      plan,
      familyId,
      gpuCount,
      hourlyFrom,
      memoryGB: blueprint.memoryGB
    });
  }

  const bestByKey = new Map<string, AcceptedPlan>();
  for (const row of accepted) {
    const key = `${row.provider.id}::${row.familyId}::${row.gpuCount}`;
    const existing = bestByKey.get(key);
    if (
      !existing ||
      compareSortKey(row.provider, row.hourlyFrom, row.gpuCount) <
        compareSortKey(existing.provider, existing.hourlyFrom, existing.gpuCount)
    ) {
      bestByKey.set(key, row);
    }
  }

  stats.acceptedOffers = bestByKey.size;

  const offeringsByFamily = new Map<string, GpuOffering[]>();
  const providersUsed = new Map<string, ProviderMeta>();

  const sortedRows = [...bestByKey.values()].sort(
    (a, b) =>
      compareSortKey(a.provider, a.hourlyFrom, a.gpuCount) -
      compareSortKey(b.provider, b.hourlyFrom, b.gpuCount)
  );

  for (const row of sortedRows) {
    const offering = toOffering(row);
    const list = offeringsByFamily.get(row.familyId) ?? [];
    list.push(offering);
    offeringsByFamily.set(row.familyId, list);

    if (!providersUsed.has(row.provider.id)) {
      providersUsed.set(row.provider.id, {
        id: row.provider.id,
        name: row.provider.name,
        website: row.provider.website,
        description: row.provider.description,
        primaryFocus: row.provider.primaryFocus
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
