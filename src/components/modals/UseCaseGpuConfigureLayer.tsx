'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { GpuModal } from '@/components/search/GpuModal';
import type { GpuOption } from '@/components/search/BaseSearch';
import { buildProviderCombinations } from '@/lib/catalog/providerCombinations';
import { sortRegionLabels } from '@/lib/catalog/sort';
import { usePlanStore } from '@/stores/plan';
import type { Provider } from '@/types/gpu';

import { gpuCatalog } from '@public/data';

type UseCaseGpuConfigureLayerProps = {
  gpuModel: string;
  onClose: () => void;
};

function buildGpuOption(model: string): GpuOption | null {
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
    type: gpu.model,
    description: gpu.description,
    shortDetails: gpu.shortDetails,
    availableSizes: Array.from(availableSizes).sort((a, b) => a - b),
    availableRegions: sortRegionLabels(availableRegions)
  };
}

/**
 * Lazy configure path for use-case templates: mounts GpuModal + catalog
 * combinators only after the user requests configuration.
 */
export function UseCaseGpuConfigureLayer({
  gpuModel,
  onClose
}: UseCaseGpuConfigureLayerProps) {
  const tModal = useTranslations('TEST.haloSearch');
  const { addItem } = usePlanStore(({ addItem }) => ({ addItem }));

  const currentDialogOption = useMemo(
    () => buildGpuOption(gpuModel),
    [gpuModel]
  );

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  const availableCombinations = useMemo(() => {
    if (!currentDialogOption || !selectedRegion) return [];

    const gpuFamily = gpuCatalog.gpus.find(
      gpu => gpu.model === currentDialogOption.type
    );
    if (!gpuFamily) return [];

    return buildProviderCombinations({
      gpuFamily,
      catalogProviders: gpuCatalog.providers,
      availableSizes: currentDialogOption.availableSizes,
      selectedRegion
    });
  }, [currentDialogOption, selectedRegion]);

  const regionRiskMetrics = useMemo(() => {
    if (!selectedRegion || !selectedProvider) return undefined;
    return selectedProvider.regions.find(entry => entry.name === selectedRegion)
      ?.riskMetrics;
  }, [selectedRegion, selectedProvider]);

  if (!currentDialogOption) {
    return null;
  }

  return (
    <GpuModal
      dialogIndex={0}
      onDialogClose={onClose}
      currentDialogOption={currentDialogOption}
      currentGpuType={currentDialogOption.type}
      availableRegions={currentDialogOption.availableRegions}
      selectedRegion={selectedRegion}
      onRegionSelect={region => {
        setSelectedRegion(region);
        setSelectedProvider(null);
        setSelectedSize(null);
      }}
      availableCombinations={availableCombinations}
      selectedProvider={selectedProvider}
      selectedSize={selectedSize}
      onProviderSizeSelect={(provider, size) => {
        setSelectedProvider(provider);
        setSelectedSize(size);
      }}
      regionRiskMetrics={regionRiskMetrics}
      onAddToPlan={config => {
        const regionData = config.provider.regions.find(
          r => r.name === selectedRegion
        );
        addItem({
          title: config.type,
          specs: `${config.size} GPU cluster`,
          price: regionData?.price ?? 'Contact for pricing',
          priceSourceId: regionData?.sourceId,
          details: `Provider: ${config.provider.name} (${config.provider.location})`,
          gpuModel: config.type,
          gpuCount: config.size,
          region: selectedRegion ?? undefined,
          provider: {
            id: config.provider.id,
            name: config.provider.name,
            location: config.provider.location
          }
        });
        onClose();
      }}
      t={tModal as (key: string) => string}
    />
  );
}
