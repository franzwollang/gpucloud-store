'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { GpuModal } from '@/components/search/GpuModal';
import type { GpuOption } from '@/components/search/BaseSearch';
import { formatNodeSpecsSummary } from '@/lib/catalog/formatSpecs';
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
    availableRegions: Array.from(availableRegions).sort()
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

    const providerMap = new Map<string, Provider>();

    gpuFamily.offerings.forEach(offering => {
      const providerId = offering.providerId;
      const providerInfo = gpuCatalog.providers.find(p => p.id === providerId);

      if (!providerMap.has(providerId)) {
        providerMap.set(providerId, {
          id: providerId,
          name: providerInfo?.name ?? providerId,
          location: offering.regions[0]?.locationLabel ?? 'Unknown',
          supportedSizes: [offering.gpuCount],
          specs: formatNodeSpecsSummary(offering.nodeSpecs),
          regions: offering.regions.map(region => ({
            name: region.locationLabel,
            price: `From $${region.price?.hourlyFrom?.toFixed(2)}/hr`,
            riskMetrics: offering.riskMetrics
          })),
          leadTime: offering.regions[0]?.leadTimeDays
            ? `${offering.regions[0].leadTimeDays.min}-${offering.regions[0].leadTimeDays.max} days`
            : '1-3 days',
          minTerm:
            offering.commercial.minTerm.unit === 'monthly'
              ? `${offering.commercial.minTerm.minimumUnits === 1 ? 'Monthly' : `${offering.commercial.minTerm.minimumUnits}-month`}`
              : 'Monthly',
          shortDetails: gpuFamily.shortDetails,
          details: `Provider: ${providerInfo?.description ?? 'High-performance GPU infrastructure'}`
        });
      } else {
        const existingProvider = providerMap.get(providerId)!;
        if (!existingProvider.supportedSizes.includes(offering.gpuCount)) {
          existingProvider.supportedSizes.push(offering.gpuCount);
          existingProvider.supportedSizes.sort((a, b) => a - b);
        }
        offering.regions.forEach(region => {
          if (
            !existingProvider.regions.some(r => r.name === region.locationLabel)
          ) {
            existingProvider.regions.push({
              name: region.locationLabel,
              price: `From $${region.price?.hourlyFrom?.toFixed(2)}/hr`,
              riskMetrics: offering.riskMetrics
            });
          }
        });
      }
    });

    return Array.from(providerMap.values())
      .map((provider: Provider) => ({
        provider: {
          ...provider,
          specs: provider.specs ?? `${provider.name} GPU specs`,
          leadTime: provider.leadTime ?? 'Contact for details',
          minTerm: provider.minTerm ?? 'Contact for details',
          shortDetails: provider.shortDetails ?? provider.details ?? '',
          details: provider.details ?? provider.shortDetails ?? ''
        },
        sizes: provider.supportedSizes.filter(
          size =>
            currentDialogOption.availableSizes.includes(size) &&
            provider.regions.some(r => r.name === selectedRegion)
        )
      }))
      .filter(combination => combination.sizes.length > 0);
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
        addItem({
          title: config.type,
          specs: `${config.size} GPU cluster`,
          price: 'Contact for pricing',
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
