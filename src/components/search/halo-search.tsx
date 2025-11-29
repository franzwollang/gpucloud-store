'use client';

import type { AnimationPlaybackControls } from 'motion';
import type { MotionValue } from 'motion/react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/style';
import type { Provider } from '@/types/gpu';

import { gpuCatalog } from '../../../public/data';
import { BaseSearch, type GpuOption } from './BaseSearch';
import { GpuModal } from './GpuModal';

interface HaloBackgroundProps {
  haloOpacity: MotionValue<number>;
}

const HaloBackground: React.FC<HaloBackgroundProps> = ({ haloOpacity }) => (
  <>
    {/* Aurora glow */}
    <motion.div
      className="pointer-events-none absolute -top-8 h-32 w-[340px] overflow-hidden rounded-[28px] blur-2xl"
      style={{ opacity: haloOpacity }}
    >
      <div
        className="rounded-[32px]"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '600px',
          height: '600px',
          transform: 'translate(-50%, -50%) rotate(60deg)',
          filter: 'brightness(1.4)',
          backgroundImage:
            'conic-gradient(var(--color-bg-page), color-mix(in srgb, var(--color-neon-electric) 70%, transparent) 5%, var(--color-bg-page) 38%, var(--color-bg-page) 50%, color-mix(in srgb, var(--color-neon-magenta-soft) 65%, transparent) 60%, var(--color-bg-page) 87%)'
        }}
      />
    </motion.div>

    {/* Outer rings */}
    <motion.div
      className="pointer-events-none absolute h-[56px] w-[320px] overflow-hidden rounded-2xl"
      style={{ opacity: haloOpacity }}
    >
      <div
        className="rounded-2xl blur-[3px]"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '600px',
          height: '600px',
          transform: 'translate(-50%, -50%) rotate(82deg)',
          backgroundImage:
            'conic-gradient(transparent, color-mix(in srgb, var(--color-neon-electric) 65%, transparent), transparent 12%, transparent 50%, color-mix(in srgb, var(--color-neon-magenta) 55%, transparent) 60%, transparent 70%)'
        }}
      />
      <div
        className="rounded-2xl opacity-70 blur-[3px]"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '600px',
          height: '600px',
          transform: 'translate(-50%, -50%) rotate(82deg)',
          backgroundImage:
            'conic-gradient(transparent, color-mix(in srgb, var(--color-neon-cyan-soft) 50%, transparent), transparent 14%, transparent 50%, color-mix(in srgb, var(--color-neon-magenta-soft) 40%, transparent) 64%, transparent 74%)'
        }}
      />
    </motion.div>

    {/* Main border + inner glow */}
    <motion.div
      className="pointer-events-none absolute h-[52px] w-[304px] overflow-hidden rounded-xl"
      style={{ opacity: haloOpacity }}
    >
      <div
        className="rounded-xl blur-[2px]"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '600px',
          height: '600px',
          transform: 'translate(-50%, -50%) rotate(70deg)',
          backgroundImage:
            'conic-gradient(var(--color-bg-page), color-mix(in srgb, var(--color-neon-electric) 55%, transparent) 5%, var(--color-bg-page) 14%, var(--color-bg-page) 50%, color-mix(in srgb, var(--color-neon-magenta-soft) 60%, transparent) 60%, var(--color-bg-page) 64%)'
        }}
      />
      <div
        className="rounded-[10px] blur-[2px]"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '600px',
          height: '600px',
          transform: 'translate(-50%, -50%) rotate(83deg)',
          backgroundImage:
            'conic-gradient(transparent, color-mix(in srgb, var(--color-neon-cyan) 40%, transparent), transparent 8%, transparent 50%, color-mix(in srgb, var(--color-neon-magenta-soft) 40%, transparent) 58%, transparent 68%)'
        }}
      />
    </motion.div>
  </>
);

type HaloSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onAddToCart?: (config: {
    type: string;
    provider: Provider;
    size: number;
  }) => void;
};

export const HaloSearch = ({
  value,
  onChange,
  onAddToCart
}: HaloSearchProps) => {
  const baseAngle = useMotionValue(0);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);

  const t = useTranslations('TEST.haloSearch');

  const haloOpacity = useTransform(baseAngle, [0, 180, 360], [0.4, 0.6, 0.4]);

  // Modal state management
  const [dialogIndex, setDialogIndex] = useState<number | null>(null);
  const [currentDialogOption, setCurrentDialogOption] =
    useState<GpuOption | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  // Computed values for GpuModal
  const currentGpuType = currentDialogOption?.type ?? '';
  const availableRegions = currentDialogOption?.availableRegions ?? [];

  const availableCombinations = useMemo(() => {
    if (!currentDialogOption || !selectedRegion) return [];

    // Get GPU family from catalog
    const gpuFamily = gpuCatalog.gpus.find(
      gpu => gpu.model === currentDialogOption.type
    );

    if (!gpuFamily) return [];

    // Group offerings by provider and transform to expected format
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
          specs: `${offering.nodeSpecs.vcpus} vCPU • ${Math.round((offering.nodeSpecs.memoryGB / 1024) * 10) / 10} TB RAM • ${offering.nodeSpecs.localStorageTB} TB NVMe`,
          regions: offering.regions.map(r => ({
            name: r.locationLabel,
            price: `From $${r.price?.hourlyFrom?.toFixed(2)}/hr`,
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
        // Add additional GPU count if not present
        const existingProvider = providerMap.get(providerId)!;
        if (!existingProvider.supportedSizes.includes(offering.gpuCount)) {
          existingProvider.supportedSizes.push(offering.gpuCount);
          existingProvider.supportedSizes.sort((a, b) => a - b);
        }
        // Add regions from this offering
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

    const providers = Array.from(providerMap.values());

    return providers
      .map((provider: Provider) => ({
        provider: {
          ...provider,
          // Ensure the provider has the expected structure
          specs: provider.specs ?? `${provider.name} GPU specs`,
          leadTime: provider.leadTime ?? 'Contact for details',
          minTerm: provider.minTerm ?? 'Contact for details',
          shortDetails: provider.shortDetails ?? provider.details ?? '',
          details: provider.details ?? provider.shortDetails ?? ''
        },
        sizes: provider.supportedSizes.filter(
          (size: number) =>
            currentDialogOption.availableSizes.includes(size) &&
            provider.regions.some(r => r.name === selectedRegion)
        )
      }))
      .filter(combination => combination.sizes.length > 0);
  }, [currentDialogOption, selectedRegion, t]);

  const regionRiskMetrics = useMemo(() => {
    if (!selectedRegion || !selectedProvider) return undefined;

    const region = selectedProvider.regions.find(
      r => r.name === selectedRegion
    );
    if (!region?.riskMetrics) return undefined;

    // Provide defaults for missing risk metrics
    return {
      naturalDisaster: region.riskMetrics.naturalDisaster ?? 3,
      electricityReliability: region.riskMetrics.electricityReliability ?? 3,
      fireRisk: region.riskMetrics.fireRisk ?? 3,
      securityBreach: region.riskMetrics.securityBreach ?? 3,
      powerEfficiency: region.riskMetrics.powerEfficiency ?? 3,
      costEfficiency: region.riskMetrics.costEfficiency ?? 3,
      networkReliability: region.riskMetrics.networkReliability ?? 3,
      coolingCapacity: region.riskMetrics.coolingCapacity ?? 3
    };
  }, [selectedRegion, selectedProvider]);

  const handleDialogClose = () => {
    setDialogIndex(null);
    setCurrentDialogOption(null);
    setSelectedRegion(null);
    setSelectedProvider(null);
    setSelectedSize(null);
  };

  const handleRegionSelect = (region: string | null) => {
    setSelectedRegion(region);
    setSelectedProvider(null);
    setSelectedSize(null);
  };

  const handleProviderSizeSelect = (
    provider: Provider | null,
    size: number | null
  ) => {
    setSelectedProvider(provider);
    setSelectedSize(size);
  };

  const handleHoverStart = () => {
    animationRef.current = animate(baseAngle, 360, {
      duration: 10,
      repeat: Infinity,
      ease: 'linear'
    });
  };

  return (
    <motion.div
      className="halo-search-root relative flex items-center justify-center"
      aria-label={t('ariaLabel')}
      onMouseEnter={handleHoverStart}
    >
      <HaloBackground haloOpacity={haloOpacity} />

      <BaseSearch
        value={value}
        onChange={onChange}
        onSelectOption={(index, option) => {
          // Use the option data already computed by BaseSearch
          setCurrentDialogOption(option);
          setDialogIndex(0);
        }}
        modalEnabled={true}
        selectedOption={currentDialogOption}
        onSelectedOptionChange={setCurrentDialogOption}
        renderInput={props => (
          <div className="relative">
            <div className="ring-border/40 focus-within:ring-ring focus-within:ring-offset-bg-page relative flex h-11 w-[320px] items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--color-bg-page)_92%,transparent)]/95 px-4 pr-3 text-sm ring-1 backdrop-blur-sm focus-within:ring-2 focus-within:ring-offset-2">
              <input
                ref={props.ref}
                type="text"
                name="search"
                placeholder={props.placeholder}
                className="placeholder:text-fg-muted/70 text-fg-main h-full w-[260px] max-w-full bg-transparent pr-2 text-sm outline-none"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                value={props.value}
                onChange={props.onChange}
                onKeyDown={props.onKeyDown}
                onClick={props.onClick}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
              />

              {/* Accent blur */}
              <div className="pointer-events-none absolute top-1 left-3 h-5 w-8 bg-[color-mix(in_srgb,var(--color-neon-magenta-soft)_65%,transparent)] opacity-80 blur-xl" />

              {/* Button */}
              <button
                type="button"
                tabIndex={-1}
                onClick={() => {
                  // Halo search behavior
                }}
                className={cn(
                  'text-fg-muted/60 hover:text-fg-main flex h-5 w-5 items-center justify-center rounded transition-colors'
                )}
                aria-label="Search"
              >
                {/* Icon would go here */}
              </button>
            </div>
          </div>
        )}
      />

      {dialogIndex !== null && currentDialogOption && (
        <GpuModal
          dialogIndex={dialogIndex}
          onDialogClose={handleDialogClose}
          currentDialogOption={currentDialogOption}
          currentGpuType={currentGpuType}
          availableRegions={availableRegions}
          selectedRegion={selectedRegion}
          onRegionSelect={handleRegionSelect}
          availableCombinations={availableCombinations}
          selectedProvider={selectedProvider}
          selectedSize={selectedSize}
          onProviderSizeSelect={handleProviderSizeSelect}
          regionRiskMetrics={regionRiskMetrics}
          onAddToCart={config => {
            onAddToCart?.(config);
            handleDialogClose();
          }}
          t={t}
        />
      )}

      <style jsx>{`
        /* Halo search layers (Motion drives rotation/translation) */
        .halo-aurora-core,
        .halo-outer-core,
        .halo-inner-core,
        .halo-main-core,
        .halo-btn-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 480px;
          height: 480px;
          background-repeat: no-repeat;
          background-position: 0 0;
        }

        .halo-aurora-core {
          filter: brightness(1.4);
        }

        .halo-btn-core {
          transform: translate(-50%, -50%) rotate(90deg);
          animation: halo-btn-rotate 4s linear infinite;
        }

        /* Halo search state transitions */
        .halo-search-root:hover .halo-outer-core {
          transform: translate(-50%, -50%) rotate(-98deg);
        }

        .halo-search-root:hover .halo-aurora-core {
          transform: translate(-50%, -50%) rotate(-120deg);
        }

        .halo-search-root:hover .halo-inner-core {
          transform: translate(-50%, -50%) rotate(-97deg);
        }

        .halo-search-root:hover .halo-main-core {
          transform: translate(-50%, -50%) rotate(-110deg);
        }

        .halo-search-root:focus-within .halo-aurora-core {
          animation: halo-idle-aurora 10s linear infinite;
        }

        .halo-search-root:focus-within .halo-outer-core {
          animation: halo-idle-outer 10s linear infinite;
        }

        .halo-search-root:focus-within .halo-inner-core {
          animation: halo-idle-inner 10s linear infinite;
        }

        .halo-search-root:focus-within .halo-main-core {
          animation: halo-idle-main 10s linear infinite;
        }

        @keyframes halo-idle-aurora {
          0% {
            transform: translate(-50%, -50%) rotate(60deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(420deg);
          }
        }

        @keyframes halo-idle-outer {
          0% {
            transform: translate(-50%, -50%) rotate(82deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(442deg);
          }
        }

        @keyframes halo-idle-inner {
          0% {
            transform: translate(-50%, -50%) rotate(83deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(443deg);
          }
        }

        @keyframes halo-idle-main {
          0% {
            transform: translate(-50%, -50%) rotate(70deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(430deg);
          }
        }

        @keyframes halo-btn-rotate {
          100% {
            transform: translate(-50%, -50%) rotate(450deg);
          }
        }
      `}</style>
    </motion.div>
  );
};
