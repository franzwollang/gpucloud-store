'use client';

import { Check, ClipboardList, Loader2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import type { GpuOption } from '@/components/search/BaseSearch';
import { GpuModal } from '@/components/search/GpuModal';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { getMissingPlanFields } from '@/lib/plan/missingPlanFields';
import { smoothScrollToContact } from '@/lib/animation/scrollPause';
import { cn } from '@/lib/style';
import { usePlanStore } from '@/stores/plan';
import type { PlanItem } from '@/stores/plan';
import { useUIStore } from '@/stores/ui';
import type { Provider } from '@/types/gpu';

import { gpuCatalog } from '@public/data';

import DarkModeToggle from './darkModeToggle';
import LanguagePicker from './languagePicker';

const buildGpuOption = (model: string): GpuOption | null => {
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
};

export const Header = () => {
  const t = useTranslations('UI.plan');
  const tModal = useTranslations('TEST.haloSearch');
  const tAnchors = useTranslations();
  const contactAnchor = tAnchors('UI.navLinks.contact.anchor');
  const { headerGradientShifted } = useUIStore(
    ({ headerGradientShifted }) => ({ headerGradientShifted })
  );
  const [isOpen, setIsOpen] = useState(false);
  const { items, addItem, removeItem, updateItem, getTotalItems } =
    usePlanStore(
      ({ items, addItem, removeItem, updateItem, getTotalItems }) => ({
        items,
        addItem,
        removeItem,
        updateItem,
        getTotalItems
      })
    );

  const itemCount = getTotalItems();

  const prevCountRef = useRef(itemCount);
  const [isBumped, setIsBumped] = useState(false);
  const [ctaFeedback, setCtaFeedback] = useState<'idle' | 'loading' | 'added'>(
    'idle'
  );

  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setIsBumped(true);
      setCtaFeedback('loading');
      const bumpTimeout = setTimeout(() => setIsBumped(false), 400);
      const addedTimeout = setTimeout(() => setCtaFeedback('added'), 350);
      const idleTimeout = setTimeout(() => setCtaFeedback('idle'), 1600);
      prevCountRef.current = itemCount;
      return () => {
        clearTimeout(bumpTimeout);
        clearTimeout(addedTimeout);
        clearTimeout(idleTimeout);
      };
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  // Modal state management (dumb/duplicated by design)
  const [dialogIndex, setDialogIndex] = useState<number | null>(null);
  const [currentDialogOption, setCurrentDialogOption] =
    useState<GpuOption | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [configuringItemId, setConfiguringItemId] = useState<string | null>(
    null
  );

  const currentGpuType = currentDialogOption?.type ?? '';
  const availableRegions = currentDialogOption?.availableRegions ?? [];

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

    const providers = Array.from(providerMap.values());

    return providers
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

    const region = selectedProvider.regions.find(
      r => r.name === selectedRegion
    );
    if (!region?.riskMetrics) return undefined;

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
    setConfiguringItemId(null);
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

  const scrollToContact = () => {
    void smoothScrollToContact(contactAnchor, { block: 'center' });
  };

  const handleContactSales = () => {
    setIsOpen(false);
    scrollToContact();
  };

  const handleHeaderCta = () => {
    if (ctaFeedback !== 'idle') return;
    scrollToContact();
  };

  const handleConfigureItem = (item: PlanItem) => {
    if (!item.gpuModel) return;
    const option = buildGpuOption(item.gpuModel);
    if (!option) return;
    setSelectedRegion(null);
    setSelectedProvider(null);
    setSelectedSize(null);
    setCurrentDialogOption(option);
    setDialogIndex(0);
    if (item.gpuCount) {
      setSelectedSize(item.gpuCount);
    }
    setConfiguringItemId(item.id);
  };

  return (
    <>
      <header
        className="fixed top-0 right-0 left-0 z-50 transition-[--header-opaque-stop,--header-fade-stop] duration-500"
        style={
          {
            '--header-opaque-stop': headerGradientShifted ? '50%' : '0%',
            '--header-fade-stop': '100%',
            backgroundImage:
              'linear-gradient(to bottom, var(--color-bg-page) 0%, var(--color-bg-page) var(--header-opaque-stop), transparent var(--header-fade-stop))'
          } as CSSProperties
        }
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 pt-6 pb-14">
          <div
            className={cn(
              'flex items-center gap-2 pl-2 transition-opacity duration-500',
              headerGradientShifted ? 'opacity-100' : 'opacity-0'
            )}
            aria-hidden={!headerGradientShifted}
          >
            <Image
              src="/images/gpucloud-icon.svg"
              alt="GPUcloud"
              width={42}
              height={42}
              className="h-10.5 w-10.5"
            />
            <span className="font-display text-fg-main text-lg font-semibold tracking-tight">
              GPUCloud
            </span>
          </div>
          <div className="flex items-center justify-end gap-3">
            <LanguagePicker
              placeholderText=""
              noResultsText="No language found"
            />
            <DarkModeToggle />
            <div
              className="bg-border/60 mx-0.5 h-6 w-px shrink-0"
              aria-hidden="true"
            />
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                type="button"
                data-perf-lab="header-cta"
                onClick={handleHeaderCta}
                variant="header"
                disabled={ctaFeedback === 'loading'}
                aria-live="polite"
                aria-label={
                  ctaFeedback === 'added'
                    ? t('headerCtaAdded')
                    : ctaFeedback === 'loading'
                      ? t('headerCtaLoading')
                      : t('headerCta')
                }
                className={cn(
                  'relative h-9 min-w-[7.5rem] overflow-hidden px-3 text-xs sm:min-w-[9.5rem] sm:px-4 sm:text-sm',
                  ctaFeedback !== 'idle' &&
                    'border-ui-active-soft/50 bg-ui-active-soft/10 text-ui-active-soft'
                )}
              >
                <span
                  className={cn(
                    'absolute inset-0 inline-flex items-center justify-center gap-1.5 transition-all duration-200',
                    ctaFeedback === 'idle'
                      ? 'translate-y-0 opacity-100'
                      : 'pointer-events-none translate-y-2 opacity-0'
                  )}
                >
                  {t('headerCta')}
                </span>
                <span
                  className={cn(
                    'absolute inset-0 inline-flex items-center justify-center gap-1.5 transition-all duration-200',
                    ctaFeedback === 'loading'
                      ? 'translate-y-0 opacity-100'
                      : 'pointer-events-none -translate-y-2 opacity-0'
                  )}
                  aria-hidden={ctaFeedback !== 'loading'}
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="hidden sm:inline">{t('headerCtaLoading')}</span>
                </span>
                <span
                  className={cn(
                    'absolute inset-0 inline-flex items-center justify-center gap-1.5 transition-all duration-200',
                    ctaFeedback === 'added'
                      ? 'translate-y-0 opacity-100'
                      : 'pointer-events-none translate-y-2 opacity-0'
                  )}
                  aria-hidden={ctaFeedback !== 'added'}
                >
                  <Check className="h-3.5 w-3.5" />
                  {t('headerCtaAdded')}
                </span>
              </Button>
              <Button
                type="button"
                onClick={() => setIsOpen(true)}
                variant="header"
                className={cn(
                  'group relative',
                  isBumped && 'ring-ui-active-soft/30 ring-1'
                )}
                aria-label={t('open')}
              >
                <ClipboardList
                  className={cn(
                    'h-5 w-5 transition',
                    isBumped
                      ? 'text-ui-active-soft'
                      : 'group-hover:text-ui-active-soft'
                  )}
                />
                {itemCount > 0 && (
                  <span
                    className={cn(
                      'bg-ui-active-soft absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold text-white transition',
                      isBumped &&
                        'origin-center scale-110 animate-[badge-sway_0.45s_ease-in-out] shadow-[0_0_10px_color-mix(in_srgb,var(--color-ui-active-soft)_45%,transparent)]'
                    )}
                  >
                    {itemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="bg-bg-surface border-border/60 text-fg-main flex h-dvh w-[400px] max-w-[90vw] flex-col sm:w-[450px]"
        >
          <SheetHeader>
            <SheetTitle className="text-fg-main">{t('title')}</SheetTitle>
            <SheetDescription className="text-fg-soft">
              {itemCount === 0
                ? t('empty')
                : t('summary', { count: itemCount })}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex flex-1 min-h-0 flex-col gap-4">
            {itemCount === 0 ? (
              <div className="text-fg-muted flex h-[200px] flex-col items-center justify-center text-center text-sm">
                <ClipboardList className="mb-3 h-12 w-12 opacity-40" />
                <p>{t('emptyHint')}</p>
              </div>
            ) : (
              <>
                <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-y-auto pr-4 scrollbar-visible">
                  {items.map(item => {
                    const missingFields = getMissingPlanFields(item);
                    const isIncomplete = missingFields.length > 0;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'border-border/60 bg-bg-page/50 flex flex-col gap-2 rounded-lg border p-3',
                          isIncomplete &&
                            'border-ui-warning/50 bg-ui-warning/5'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-fg-main text-sm font-medium">
                              {item.title}
                            </h4>
                            <p className="text-fg-soft mt-0.5 text-xs">
                              {item.specs}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-fg-muted hover:text-fg-main rounded p-1 transition"
                            aria-label={t('removeItem')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {isIncomplete && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-ui-warning font-medium">
                              {t('missingDetails')}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConfigureItem(item)}
                              disabled={!item.gpuModel}
                            >
                              {t('configure')}
                            </Button>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-fg-muted">
                            {t('quantity', { count: item.quantity })}
                          </span>
                          <span className="text-ui-active-soft font-semibold">
                            {item.price}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-border/60 mt-auto border-t pt-4">
                  <Button
                    type="button"
                    variant="cta"
                    onClick={handleContactSales}
                    className="w-full px-4 py-3"
                  >
                    {t('contactButton')}
                  </Button>
                  <p className="text-fg-muted mt-2 text-center text-xs">
                    {t('contactHint')}
                  </p>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

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
            const updates = {
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
            };

            if (configuringItemId) {
              updateItem(configuringItemId, updates);
            } else {
              addItem({
                title: config.type,
                ...updates
              });
            }
            handleDialogClose();
          }}
          t={tModal as (key: string) => string}
        />
      )}
    </>
  );
};
