'use client';

import { Search } from 'lucide-react';
import type { AnimationPlaybackControls } from 'motion';
import type { MotionValue } from 'motion/react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useEffectOverride } from '@/lib/animation/useEffectOverride';
import { cn } from '@/lib/style';
import { formatNodeSpecsSummary } from '@/lib/catalog/formatSpecs';
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
  onAddToPlan?: (config: {
    type: string;
    provider: Provider;
    size: number;
    region: string;
  }) => void;
  /** When false, stop Motion/CSS halo work (section off-screen). */
  active?: boolean;
};

export const HaloSearch = ({
  value,
  onChange,
  onAddToPlan,
  active = true
}: HaloSearchProps) => {
  const haloEnabled = useEffectOverride('halo');
  const effectsOn = haloEnabled && active;
  const effectsOnRef = useRef(effectsOn);
  effectsOnRef.current = effectsOn;

  const baseAngle = useMotionValue(0);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Use a ref for focus state to avoid stale closures in animation callbacks
  const isFocusedRef = useRef(false);

  const t = useTranslations('TEST.haloSearch');

  // Shared opacity pulse for the large halo around the input (subtle, synced to rotation)
  const haloOpacity = useTransform(baseAngle, v => {
    const theta = (v * Math.PI) / 180;
    const t = (1 - Math.cos(theta)) / 2; // 0 -> 1 -> 0 over a full rotation
    return 0.45 + 0.2 * t; // 0.45–0.65 subtle brightness change
  });

  // Button halo uses a 90deg offset so it matches the original static look
  const iconAngle = useTransform(baseAngle, v => v + 90);

  // Animation control functions
  const stopAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  };

  // Normalize angle to 0-360 range to prevent compounding values
  const normalizeAngle = () => {
    const current = baseAngle.get();
    const normalized = ((current % 360) + 360) % 360;
    baseAngle.set(normalized);
    return normalized;
  };

  // Animate back to 0° (resting position)
  const resetToOrigin = () => {
    const current = normalizeAngle();
    if (current !== 0) {
      // Animate to 0 (or 360 if closer, to avoid backwards spin)
      const target = current > 180 ? 360 : 0;
      animationRef.current = animate(baseAngle, target, {
        duration: 1.8 * (Math.abs(target - current) / 360), // Proportional duration
        ease: 'easeOut',
        onComplete: () => {
          animationRef.current = null;
          baseAngle.set(0); // Ensure we're exactly at 0
        }
      });
    }
  };

  const startIdle = () => {
    stopAnimation();
    const start = normalizeAngle();
    animationRef.current = animate(baseAngle, start + 360, {
      duration: 10,
      ease: 'linear',
      repeat: Infinity
    });
  };

  const spinOnce = () => {
    stopAnimation();
    const start = normalizeAngle();
    animationRef.current = animate(baseAngle, start + 360, {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: 0,
      onComplete: () => {
        animationRef.current = null;
        if (!effectsOnRef.current) {
          baseAngle.set(0);
          return;
        }
        // Check the ref for current focus state, not a stale closure value
        if (isFocusedRef.current) {
          startIdle();
        } else {
          // Not focused - reset back to origin
          resetToOrigin();
        }
      }
    });
  };

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
          specs: formatNodeSpecsSummary(offering.nodeSpecs),
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
  }, [currentDialogOption, selectedRegion]);

  const regionRiskMetrics = useMemo(() => {
    if (!selectedRegion || !selectedProvider) return undefined;

    const region = selectedProvider.regions.find(
      r => r.name === selectedRegion
    );
    return region?.riskMetrics;
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
    if (!effectsOnRef.current) return;
    // Only spin once on hover if not currently focused
    if (!isFocusedRef.current) {
      spinOnce();
    }
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
    if (!effectsOnRef.current) return;
    startIdle();
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    stopAnimation();
    if (!effectsOnRef.current) {
      baseAngle.set(0);
      return;
    }
    const current = baseAngle.get();
    const target = Math.round(current / 360) * 360;
    if (target !== current) {
      // Store the reset animation in animationRef so it can be cancelled
      // if user hovers or focuses again before it completes
      animationRef.current = animate(baseAngle, target, {
        duration: 1.8,
        ease: 'easeOut',
        onComplete: () => {
          animationRef.current = null;
        }
      });
    }
  };

  useEffect(() => {
    if (!effectsOn) {
      stopAnimation();
      baseAngle.set(0);
      return;
    }
    if (isFocusedRef.current) {
      startIdle();
    }
    // Intentionally omit startIdle/stopAnimation/baseAngle from deps — stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectsOn]);

  return (
    <motion.div
      className={cn(
        'halo-search-root relative flex items-center justify-center',
        !effectsOn && 'halo-search-paused'
      )}
      aria-label={t('ariaLabel')}
      onMouseEnter={effectsOn ? handleHoverStart : undefined}
    >
      {effectsOn ? <HaloBackground haloOpacity={haloOpacity} /> : null}

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
        renderInput={props => {
          // Store the ref from BaseSearch to our local inputRef
          if (props.ref.current) {
            inputRef.current = props.ref.current;
          }

          return (
            <div className="relative">
              <div className="ring-border/40 focus-within:ring-ring focus-within:ring-offset-bg-page relative flex h-11 w-[320px] items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--color-bg-page)_98%,transparent)] px-4 pr-3 text-sm ring-1 backdrop-blur-md focus-within:ring-2 focus-within:ring-offset-2">
                <input
                  ref={node => {
                    // Update both refs
                    (
                      props.ref as React.MutableRefObject<HTMLInputElement | null>
                    ).current = node;
                    inputRef.current = node;
                  }}
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
                  onFocus={() => {
                    handleFocus();
                    props.onFocus();
                  }}
                  onBlur={() => {
                    handleBlur();
                    props.onBlur();
                  }}
                />

                {/* Accent blur */}
                <div className="pointer-events-none absolute top-1 left-3 h-5 w-8 bg-[color-mix(in_srgb,var(--color-neon-magenta-soft)_65%,transparent)] opacity-80 blur-xl" />

                {/* Icon */}
                <div className="border-border/60 from-bg-surface to-bg-page text-fg-soft relative flex size-8 flex-none items-center justify-center overflow-hidden rounded-lg border bg-linear-to-b shadow-[0_0_18px_rgba(0,0,0,0.6)] transition">
                  {effectsOn ? (
                    <div className="pointer-events-none absolute inset-0">
                      <motion.div
                        className="opacity-70"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '480px',
                          height: '480px',
                          x: '-50%',
                          y: '-50%',
                          rotate: iconAngle,
                          backgroundImage:
                            'conic-gradient(transparent, color-mix(in srgb, var(--color-neon-electric) 40%, transparent), transparent 45%, transparent 55%, color-mix(in srgb, var(--color-neon-magenta-soft) 45%, transparent), transparent 90%)'
                        }}
                      />
                    </div>
                  ) : null}
                  <Search className="relative z-1 h-3 w-3" />
                </div>
              </div>
            </div>
          );
        }}
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
          onAddToPlan={config => {
            if (!selectedRegion) {
              handleDialogClose();
              return;
            }
            onAddToPlan?.({
              ...config,
              region: selectedRegion
            });
            handleDialogClose();
          }}
          t={t as (key: string) => string}
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

        .halo-search-paused .halo-aurora-core,
        .halo-search-paused .halo-outer-core,
        .halo-search-paused .halo-inner-core,
        .halo-search-paused .halo-main-core,
        .halo-search-paused .halo-btn-core {
          animation: none !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .halo-aurora-core,
          .halo-outer-core,
          .halo-inner-core,
          .halo-main-core,
          .halo-btn-core {
            animation: none !important;
          }
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
