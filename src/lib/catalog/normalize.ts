import type {
  GpuCatalog,
  GpuFamily,
  GpuOffering,
  NodeSpecs,
  ProviderMeta,
  RiskMetrics
} from '@/types/gpu';

import {
  GPURENTALPRICES_ATTRIBUTION,
  type GpuRentalOffer,
  type GpuRentalPricesSnapshot
} from './feedTypes';
import { FAMILY_BLUEPRINTS, FEED_SKU_TO_FAMILY } from './gpuSkuMap';
import {
  ALLOWED_OFFER_KINDS,
  PROVIDER_BY_FEED_KEY,
  type CuratedProvider
} from './providerMap';

/** Neutral empty metrics until deal-book risk overlays exist (UI shows n/a). */
export const DEFAULT_RISK_METRICS: Partial<RiskMetrics> = {};

export type NormalizeStats = {
  sourceDate: string;
  offerCount: number;
  acceptedOffers: number;
  skippedUnmappedSku: number;
  skippedProvider: number;
  skippedKind: number;
  skippedInvalidPrice: number;
  familyCount: number;
  providerCount: number;
};

export type NormalizeResult = {
  catalog: GpuCatalog;
  stats: NormalizeStats;
};

function defaultNodeSpecs(_gpuMemoryGB: number): NodeSpecs {
  // gpurentalprices feed has no node inventory — do not invent CPU/RAM/disk.
  return {
    vcpus: 0,
    memoryGB: 0,
    localStorageTB: 0,
    storageDescription: 'Specs confirmed on quote'
  };
}

function offerSortKey(provider: CuratedProvider, offer: GpuRentalOffer): number {
  return provider.rank * 1_000_000 + offer.usd_hr * 100;
}

function toOffering(
  offer: GpuRentalOffer,
  provider: CuratedProvider,
  familyId: string,
  memoryGB: number
): GpuOffering {
  const price = {
    currency: 'USD',
    hourlyFrom: offer.usd_hr,
    isIndicative: true as const,
    sourceId: GPURENTALPRICES_ATTRIBUTION.id
  };

  return {
    id: `${provider.id}-${familyId}-${offer.kind}-1gpu`,
    providerId: provider.id,
    displayName: `${provider.name} ${FAMILY_BLUEPRINTS[familyId as keyof typeof FAMILY_BLUEPRINTS]?.model ?? familyId} (1×)`,
    provisioningType: provider.provisioningType,
    gpuCount: 1,
    isClusterCapable: provider.provisioningType === 'bare-metal',
    regions: [
      {
        regionCode: 'global',
        locationLabel: 'Multi-region',
        price,
        leadTimeDays: { min: 1, max: 7 },
        minTerm: { unit: 'hourly', minimumUnits: 1 }
      }
    ],
    nodeSpecs: defaultNodeSpecs(memoryGB),
    commercial: {
      price,
      minTerm: { unit: 'hourly', minimumUnits: 1 },
      billingModel: 'on-demand',
      notes: `Indicative ${offer.kind} list price from gpurentalprices.com`
    },
    riskMetrics: DEFAULT_RISK_METRICS
  };
}

/**
 * Normalize a gpurentalprices snapshot into the app's GpuCatalog shape.
 * Pure / isomorphic — safe for client module init from a committed snapshot.
 */
export function normalizeGpuRentalSnapshot(
  snapshot: GpuRentalPricesSnapshot
): NormalizeResult {
  const stats: NormalizeStats = {
    sourceDate: snapshot.date ?? 'unknown',
    offerCount: snapshot.offers?.length ?? 0,
    acceptedOffers: 0,
    skippedUnmappedSku: 0,
    skippedProvider: 0,
    skippedKind: 0,
    skippedInvalidPrice: 0,
    familyCount: 0,
    providerCount: 0
  };

  type Acc = {
    provider: CuratedProvider;
    offer: GpuRentalOffer;
    familyId: keyof typeof FAMILY_BLUEPRINTS;
    memoryGB: number;
  };

  const accepted: Acc[] = [];

  for (const offer of snapshot.offers ?? []) {
    if (!ALLOWED_OFFER_KINDS.has(offer.kind)) {
      stats.skippedKind += 1;
      continue;
    }

    const provider = PROVIDER_BY_FEED_KEY.get(offer.provider);
    if (!provider) {
      stats.skippedProvider += 1;
      continue;
    }

    const familyId = FEED_SKU_TO_FAMILY[offer.gpu];
    if (!familyId) {
      stats.skippedUnmappedSku += 1;
      continue;
    }

    if (typeof offer.usd_hr !== 'number' || !(offer.usd_hr > 0)) {
      stats.skippedInvalidPrice += 1;
      continue;
    }

    const blueprint = FAMILY_BLUEPRINTS[familyId];
    const memoryGB =
      typeof offer.vram_gb === 'number' && offer.vram_gb > 0
        ? offer.vram_gb
        : blueprint.memoryGB;

    accepted.push({ provider, offer, familyId, memoryGB });
  }

  // One offering per provider×family: keep the cheapest accepted kind.
  const bestByKey = new Map<string, Acc>();
  for (const row of accepted) {
    const key = `${row.provider.id}::${row.familyId}`;
    const existing = bestByKey.get(key);
    if (!existing || offerSortKey(row.provider, row.offer) < offerSortKey(existing.provider, existing.offer)) {
      bestByKey.set(key, row);
    }
  }

  stats.acceptedOffers = bestByKey.size;

  const offeringsByFamily = new Map<string, GpuOffering[]>();
  const providersUsed = new Map<string, ProviderMeta>();
  const memoryByFamily = new Map<string, number>();

  const sortedRows = [...bestByKey.values()].sort(
    (a, b) => offerSortKey(a.provider, a.offer) - offerSortKey(b.provider, b.offer)
  );

  for (const row of sortedRows) {
    const offering = toOffering(
      row.offer,
      row.provider,
      row.familyId,
      row.memoryGB
    );
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

    const prevMem = memoryByFamily.get(row.familyId);
    if (prevMem === undefined || row.memoryGB > prevMem) {
      memoryByFamily.set(row.familyId, row.memoryGB);
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
      memoryGB: memoryByFamily.get(familyId) ?? blueprint.memoryGB,
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
