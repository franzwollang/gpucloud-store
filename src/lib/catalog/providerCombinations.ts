import { formatNodeSpecsSummary } from '@/lib/catalog/formatSpecs';
import { sortRegionsByLabel } from '@/lib/catalog/sort';
import type { GpuFamily, Provider, ProviderMeta } from '@/types/gpu';

/**
 * Build provider × size rows for the selected region only.
 * Provider `location` is always the selected region (never another city from a
 * multi-location plan that happens to share the same SKU/price).
 */
export function buildProviderCombinations(args: {
  gpuFamily: GpuFamily;
  catalogProviders: readonly ProviderMeta[];
  availableSizes: number[];
  selectedRegion: string;
}): Array<{ provider: Provider; sizes: number[] }> {
  const { gpuFamily, catalogProviders, availableSizes, selectedRegion } = args;
  const providerMap = new Map<string, Provider>();

  for (const offering of gpuFamily.offerings) {
    const regionMatch = offering.regions.find(
      region => region.locationLabel === selectedRegion
    );
    if (!regionMatch) continue;

    const providerId = offering.providerId;
    const providerInfo = catalogProviders.find(p => p.id === providerId);
    const regionRow = {
      name: selectedRegion,
      price: `From $${regionMatch.price?.hourlyFrom?.toFixed(2)}/hr`,
      sourceId: regionMatch.price?.sourceId,
      riskMetrics: offering.riskMetrics
    };

    const existing = providerMap.get(providerId);
    if (!existing) {
      providerMap.set(providerId, {
        id: providerId,
        name: providerInfo?.name ?? providerId,
        location: selectedRegion,
        supportedSizes: [offering.gpuCount],
        specs: formatNodeSpecsSummary(offering.nodeSpecs),
        regions: [regionRow],
        leadTime: regionMatch.leadTimeDays
          ? `${regionMatch.leadTimeDays.min}-${regionMatch.leadTimeDays.max} days`
          : '1-3 days',
        minTerm:
          offering.commercial.minTerm.unit === 'monthly'
            ? `${offering.commercial.minTerm.minimumUnits === 1 ? 'Monthly' : `${offering.commercial.minTerm.minimumUnits}-month`}`
            : 'Monthly',
        shortDetails: gpuFamily.shortDetails,
        details: `Provider: ${providerInfo?.description ?? 'High-performance GPU infrastructure'}`
      });
      continue;
    }

    if (!existing.supportedSizes.includes(offering.gpuCount)) {
      existing.supportedSizes.push(offering.gpuCount);
      existing.supportedSizes.sort((a, b) => a - b);
    }
    if (!existing.regions.some(r => r.name === selectedRegion)) {
      existing.regions.push(regionRow);
    }
  }

  return Array.from(providerMap.values())
    .map(provider => ({
      provider: {
        ...provider,
        location: selectedRegion,
        regions: sortRegionsByLabel(provider.regions),
        specs: provider.specs ?? `${provider.name} GPU specs`,
        leadTime: provider.leadTime ?? 'Contact for details',
        minTerm: provider.minTerm ?? 'Contact for details',
        shortDetails: provider.shortDetails ?? provider.details ?? '',
        details: provider.details ?? provider.shortDetails ?? ''
      },
      sizes: provider.supportedSizes.filter(size =>
        availableSizes.includes(size)
      )
    }))
    .filter(combination => combination.sizes.length > 0);
}
