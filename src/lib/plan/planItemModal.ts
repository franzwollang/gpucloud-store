import type { GpuOption } from '@/components/search/BaseSearch';
import { getMedianChipHourlyFrom } from '@/lib/catalog/pricing';
import { buildProviderCombinations } from '@/lib/catalog/providerCombinations';
import { sortRegionLabels } from '@/lib/catalog/sort';
import type { PlanItem } from '@/stores/plan';
import type { Provider } from '@/types/gpu';

import { gpuCatalog } from '@public/data';

export type PlanItemModalState = {
  option: GpuOption;
  selectedRegion: string | null;
  selectedProvider: Provider | null;
  selectedSize: number | null;
};

export function buildGpuOptionFromModel(model: string): GpuOption | null {
  const gpu = gpuCatalog.gpus.find(entry => entry.model === model);
  if (!gpu) return null;

  const availableSizes = new Set<number>();
  const availableRegions = new Set<string>();

  gpu.offerings.forEach(offering => {
    availableSizes.add(offering.gpuCount);
    offering.regions.forEach(region => {
      availableRegions.add(region.locationLabel);
    });
  });

  return {
    familyId: gpu.id,
    type: gpu.model,
    description: gpu.description,
    shortDetails: gpu.shortDetails,
    availableSizes: Array.from(availableSizes).sort((a, b) => a - b),
    availableRegions: sortRegionLabels(availableRegions),
    medianPrice: getMedianChipHourlyFrom(gpu)
  };
}

/**
 * Resolve GpuModal initial state when configuring or editing an existing plan item.
 * Pre-selects region, provider, and size when the item already has them.
 */
export function resolvePlanItemModalState(
  item: PlanItem
): PlanItemModalState | null {
  if (!item.gpuModel) return null;

  const option = buildGpuOptionFromModel(item.gpuModel);
  if (!option) return null;

  const selectedRegion = item.region ?? null;
  let selectedProvider: Provider | null = null;
  let selectedSize =
    typeof item.gpuCount === 'number' && item.gpuCount > 0
      ? item.gpuCount
      : null;

  if (selectedRegion && item.provider?.id && selectedSize) {
    const gpuFamily = gpuCatalog.gpus.find(gpu => gpu.model === item.gpuModel);
    if (gpuFamily) {
      const combinations = buildProviderCombinations({
        gpuFamily,
        catalogProviders: gpuCatalog.providers,
        availableSizes: option.availableSizes,
        selectedRegion
      });
      const match = combinations.find(
        entry => entry.provider.id === item.provider?.id
      );
      if (match?.sizes.includes(selectedSize)) {
        selectedProvider = match.provider;
      } else {
        selectedProvider = null;
      }
    }
  }

  return {
    option,
    selectedRegion,
    selectedProvider,
    selectedSize
  };
}
