'use client';

import { Check, ClipboardList, Loader2 } from 'lucide-react';
import { useAppTranslations } from '@/i18n';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import type { GpuOption } from '@/components/search/BaseSearch';
import { GpuModal } from '@/components/search/GpuModal';
import { PlanItemCard } from '@/components/plan/PlanItemCard';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { buildProviderCombinations } from '@/lib/catalog/providerCombinations';
import { planPriceFromProviderRegion } from '@/lib/plan/planPriceFromProviderRegion';
import { smoothScrollToContact } from '@/lib/animation/scrollPause';
import { resolvePlanItemModalState } from '@/lib/plan/planItemModal';
import { cn } from '@/lib/style';
import { usePlanStore } from '@/stores/plan';
import type { PlanItem } from '@/stores/plan';
import { useUIStore } from '@/stores/ui';
import type { Provider } from '@/types/gpu';

import { gpuCatalog } from '@public/data';

import DarkModeToggle from './darkModeToggle';
import LanguagePicker from './languagePicker';

export const Header = () => {
  const t = useAppTranslations('UI.plan');
  const tModal = useAppTranslations('TEST.haloSearch');
  const tLang = useAppTranslations('UI.languagePicker');
  const tAnchors = useAppTranslations();
  const contactAnchor = tAnchors('UI.navLinks.contact.anchor')('contact')();
  const { headerGradientShifted } = useUIStore(
    ({ headerGradientShifted }) => ({ headerGradientShifted })
  );
  const [isOpen, setIsOpen] = useState(false);
  const { items, addItem, removeItem, incrementItem, decrementItem, updateItem, getTotalItems } =
    usePlanStore(
      ({
        items,
        addItem,
        removeItem,
        incrementItem,
        decrementItem,
        updateItem,
        getTotalItems
      }) => ({
        items,
        addItem,
        removeItem,
        incrementItem,
        decrementItem,
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

    return buildProviderCombinations({
      gpuFamily,
      catalogProviders: gpuCatalog.providers,
      availableSizes: currentDialogOption.availableSizes,
      selectedRegion
    });
  }, [currentDialogOption, selectedRegion]);

  const regionRiskMetrics = useMemo(() => {
    if (!selectedRegion || !selectedProvider) return undefined;
    return selectedProvider.regions.find(r => r.name === selectedRegion)
      ?.riskMetrics;
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
    const state = resolvePlanItemModalState(item);
    if (!state) return;
    setCurrentDialogOption(state.option);
    setSelectedRegion(state.selectedRegion);
    setSelectedProvider(state.selectedProvider);
    setSelectedSize(state.selectedSize);
    setDialogIndex(0);
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
              noResultsText={tLang('noResults')('No results found')()}
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
                    ? t('headerCtaAdded')('Added')()
                    : ctaFeedback === 'loading'
                      ? t('headerCtaLoading')('Adding…')()
                      : t('headerCta')('Request Quote')()
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
                  {t('headerCta')('Request Quote')()}
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
                  <span className="hidden sm:inline">{t('headerCtaLoading')('Adding…')()}</span>
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
                  {t('headerCtaAdded')('Added')()}
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
                aria-label={t('open')('Capacity plan')()}
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
            <SheetTitle className="text-fg-main">{t('title')('Capacity Plan')()}</SheetTitle>
            <SheetDescription className="text-fg-soft">
              {itemCount === 0
                ? t('empty')('Your plan is empty')()
                : t('summary')('{count, plural, one {{count} item in your plan} other {{count} items in your plan}}')({ count: itemCount })}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex flex-1 min-h-0 flex-col gap-4">
            {itemCount === 0 ? (
              <div className="text-fg-muted flex h-[200px] flex-col items-center justify-center text-center text-sm">
                <ClipboardList className="mb-3 h-12 w-12 opacity-40" />
                <p>{t('emptyHint')('Add GPU configurations to get started')()}</p>
              </div>
            ) : (
              <>
                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-scroll pr-4 scrollbar-visible">
                  {items.map(item => (
                    <PlanItemCard
                      key={item.id}
                      item={item}
                      onRemove={() => removeItem(item.id)}
                      onIncrement={() => incrementItem(item.id)}
                      onDecrement={() => decrementItem(item.id)}
                      onEdit={() => handleConfigureItem(item)}
                    />
                  ))}
                </div>

                <div className="border-border/60 mt-auto border-t pt-4">
                  <Button
                    type="button"
                    variant="cta"
                    onClick={handleContactSales}
                    className="w-full px-4 py-3"
                  >
                    {t('contactButton')('Contact Sales Representative')()}
                  </Button>
                  <p className="text-fg-muted mt-2 text-center text-xs">
                    {t('contactHint')('Share your configuration for a custom quote')()}
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
          planAction={configuringItemId ? 'update' : 'add'}
          onAddToPlan={config => {
            const { price, priceSourceId } = planPriceFromProviderRegion(
              config.provider,
              selectedRegion ?? '',
              tModal('pricingFallback')('Contact for pricing')()
            );
            const updates = {
              title: config.type,
              specs: tModal('gpuCluster')('{count} GPU cluster')({ count: config.size }),
              price,
              priceSourceId,
              details: tModal('providerDetails')('Provider: {name} ({location})')({
                name: config.provider.name,
                location: config.provider.location
              }),
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
              addItem(updates);
            }
            handleDialogClose();
          }}
          t={tModal}
        />
      )}
    </>
  );
};
