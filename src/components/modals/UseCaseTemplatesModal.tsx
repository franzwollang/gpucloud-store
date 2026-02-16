'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Cpu, BadgeDollarSign, Sparkles, Target } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog';
import { usePlanStore } from '@/stores/plan';
import type { Provider } from '@/types/gpu';
import { cn } from '@/lib/style';

import { gpuCatalog } from '@public/data';

import type { GpuOption } from '@/components/search/BaseSearch';
import { GpuModal } from '@/components/search/GpuModal';
import {
  useCaseTemplateGroups,
  useCases,
  type UseCaseId,
  type UseCaseTemplate
} from '@/lib/useCaseTemplates';

type UseCaseTemplatesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  useCaseId: UseCaseId | null;
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

export function UseCaseTemplatesModal({
  open,
  onOpenChange,
  useCaseId
}: UseCaseTemplatesModalProps) {
  const t = useTranslations('TEST');
  const tModal = useTranslations('TEST.haloSearch');
  const addItem = usePlanStore(state => state.addItem);

  const [dialogIndex, setDialogIndex] = useState<number | null>(null);
  const [currentDialogOption, setCurrentDialogOption] =
    useState<GpuOption | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

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
          if (!existingProvider.regions.some(r => r.name === region.locationLabel)) {
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
      entry => entry.name === selectedRegion
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

  const selectedUseCase = useMemo(
    () => useCases.find(entry => entry.id === useCaseId) ?? null,
    [useCaseId]
  );
  const selectedGroup = useMemo(
    () => (useCaseId ? useCaseTemplateGroups[useCaseId] : null),
    [useCaseId]
  );
  const templates = selectedGroup?.templates ?? [];
  const Icon = selectedUseCase?.icon ?? Sparkles;

  // Template list selection + snap syncing.
  const templatesScrollRef = useRef<HTMLDivElement | null>(null);
  const templateCardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);

  const recommendedTemplateIndex = useMemo(() => {
    const idx = templates.findIndex(
      entry => 'recommended' in entry && entry.recommended
    );
    return idx >= 0 ? idx : 0;
  }, [useCaseId, templates.length]);

  const addTemplateItems = (template: UseCaseTemplate) => {
    if (!selectedUseCase) return;
    const useCaseName = t(selectedUseCase.nameKey);
    const tierName = t(template.tierKey as never);
    const priceText = template.priceTextKey
      ? t(template.priceTextKey as never)
      : t('templatesModal.priceTbd');

    template.items.forEach(item => {
      addItem({
        title: `${useCaseName} — ${tierName} — ${item.gpuCount}x ${item.gpuModel}`,
        specs: `${item.gpuCount}x ${item.gpuModel}`,
        price: priceText,
        details: t('templatesModal.planDetails', {
          useCase: useCaseName,
          tier: tierName
        }),
        gpuModel: item.gpuModel,
        gpuCount: item.gpuCount
      });
    });
  };

  const openGpuModalForTemplate = (template: UseCaseTemplate) => {
    const primaryItem = template.items[0];
    if (!primaryItem) return;
    const option = buildGpuOption(primaryItem.gpuModel);
    if (!option) return;
    setCurrentDialogOption(option);
    setDialogIndex(0);
  };

  useEffect(() => {
    setSelectedTemplateIndex(recommendedTemplateIndex);
  }, [recommendedTemplateIndex]);

  const templateCards = useMemo(() => {
    return templates.map((template, index, all) => {
      const tierName = t(template.tierKey as never);
      const priceText = template.priceTextKey
        ? t(template.priceTextKey as never)
        : t('templatesModal.priceTbd');
      const snapAlign: 'start' | 'center' | 'end' =
        index === 0 ? 'start' : index === all.length - 1 ? 'end' : 'center';

      return {
        template,
        tierName,
        priceText,
        snapAlign,
        index
      };
    });
  }, [templates, t]);

  const selectedTemplateCard =
    templateCards[selectedTemplateIndex] ?? templateCards[0] ?? null;

  const scrollPaddingPx = 12;

  const scrollToTemplateIndex = (
    index: number,
    behavior: ScrollBehavior = 'smooth'
  ) => {
    const container = templatesScrollRef.current;
    const el = templateCardRefs.current[index];
    const card = templateCards[index];
    if (!container || !el || !card) return;

    // Avoid relying on scrollIntoView choosing the correct scroll container.
    // Instead, compute the delta from the card's snap anchor to the
    // container's snap target and adjust scrollTop directly.
    const rootRect = container.getBoundingClientRect();
    const cardRect = el.getBoundingClientRect();

    const cardAnchorY =
      card.snapAlign === 'start'
        ? cardRect.top
        : card.snapAlign === 'end'
          ? cardRect.bottom
          : cardRect.top + cardRect.height / 2;

    const targetY =
      card.snapAlign === 'start'
        ? rootRect.top + scrollPaddingPx
        : card.snapAlign === 'end'
          ? rootRect.bottom - scrollPaddingPx
          : rootRect.top + rootRect.height / 2;

    const delta = cardAnchorY - targetY;
    if (Math.abs(delta) < 1) return;

    container.scrollTo({
      top: container.scrollTop + delta,
      behavior
    });
  };

  const selectionRafRef = useRef<number | null>(null);
  const watchRafRef = useRef<number | null>(null);
  const watchFramesRef = useRef<number>(0);
  const watchStableFramesRef = useRef<number>(0);
  const watchPrevTopRef = useRef<number>(0);

  const computeActiveTemplateIndex = useCallback(() => {
    const container = templatesScrollRef.current;
    if (!container) return;

    const cards = templateCardRefs.current;
    if (cards.length === 0) return;

    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    const rootRect = container.getBoundingClientRect();

    for (let idx = 0; idx < templateCards.length; idx++) {
      const el = cards[idx];
      const card = templateCards[idx];
      if (!el || !card) continue;

      const cardRect = el.getBoundingClientRect();
      const cardAnchorY =
        card.snapAlign === 'start'
          ? cardRect.top
          : card.snapAlign === 'end'
            ? cardRect.bottom
            : cardRect.top + cardRect.height / 2;

      const targetY =
        card.snapAlign === 'start'
          ? rootRect.top + scrollPaddingPx
          : card.snapAlign === 'end'
            ? rootRect.bottom - scrollPaddingPx
            : rootRect.top + rootRect.height / 2;

      const dist = Math.abs(cardAnchorY - targetY);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    }

    setSelectedTemplateIndex(prev => (prev === bestIdx ? prev : bestIdx));
  }, [templateCards]);

  const scheduleComputeActiveTemplateIndex = useCallback(() => {
    if (selectionRafRef.current !== null) return;
    selectionRafRef.current = window.requestAnimationFrame(() => {
      selectionRafRef.current = null;
      computeActiveTemplateIndex();
    });
  }, [computeActiveTemplateIndex]);

  const startSnapSettleWatch = useCallback(() => {
    const container = templatesScrollRef.current;
    if (!container) return;
    if (watchRafRef.current !== null) return;

    watchFramesRef.current = 0;
    watchStableFramesRef.current = 0;
    watchPrevTopRef.current = container.scrollTop;

    const tick = () => {
      const container = templatesScrollRef.current;
      if (!container) {
        watchRafRef.current = null;
        return;
      }

      watchFramesRef.current += 1;
      computeActiveTemplateIndex();

      const curTop = container.scrollTop;
      const prevTop = watchPrevTopRef.current;

      if (Math.abs(curTop - prevTop) < 0.5) {
        watchStableFramesRef.current += 1;
      } else {
        watchStableFramesRef.current = 0;
      }
      watchPrevTopRef.current = curTop;

      // Continue for a few stable frames to catch browser-applied scroll-snap
      // adjustments that occur after scroll events stop.
      if (watchStableFramesRef.current < 4 && watchFramesRef.current < 90) {
        watchRafRef.current = window.requestAnimationFrame(tick);
      } else {
        watchRafRef.current = null;
      }
    };

    watchRafRef.current = window.requestAnimationFrame(tick);
  }, [computeActiveTemplateIndex]);

  const handleTemplatesScroll = useCallback(() => {
    scheduleComputeActiveTemplateIndex();
    startSnapSettleWatch();
  }, [scheduleComputeActiveTemplateIndex, startSnapSettleWatch]);

  const selectedTemplateConsiderations = useMemo(() => {
    if (!selectedTemplateCard) return [];
    const { template, priceText } = selectedTemplateCard;
    const configText = template.items
      .map(item => `${item.gpuCount}x ${item.gpuModel}`)
      .join(' + ');

    const items = [
      {
        icon: Cpu,
        label: t('templatesModal.itemsLabel'),
        value: configText
      },
      {
        icon: BadgeDollarSign,
        label: t('templatesModal.priceLabel'),
        value: priceText
      }
    ];

    if (template.bestForKey) {
      items.push({
        icon: Target,
        label: t('templatesModal.bestForLabel'),
        value: t(template.bestForKey as never)
      });
    }

    return items;
  }, [selectedTemplateCard, t]);

  useEffect(() => {
    if (!open) return;
    if (templateCards.length === 0) return;

    const onResize = () => {
      handleTemplatesScroll();
    };

    const raf = window.requestAnimationFrame(() => {
      handleTemplatesScroll();
    });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.cancelAnimationFrame(raf);
      if (selectionRafRef.current !== null) {
        window.cancelAnimationFrame(selectionRafRef.current);
        selectionRafRef.current = null;
      }
      if (watchRafRef.current !== null) {
        window.cancelAnimationFrame(watchRafRef.current);
        watchRafRef.current = null;
      }
    };
  }, [open, useCaseId, templateCards.length, handleTemplatesScroll]);

  useEffect(() => {
    if (!open) return;
    if (templates.length === 0) return;

    let raf = 0;
    let attempts = 0;

    const tryScroll = () => {
      attempts += 1;
      // Wait until refs are attached.
      if (templateCardRefs.current[recommendedTemplateIndex]) {
        scrollToTemplateIndex(recommendedTemplateIndex, 'auto');
        return;
      }
      if (attempts < 10) {
        raf = window.requestAnimationFrame(tryScroll);
      }
    };

    raf = window.requestAnimationFrame(tryScroll);
    return () => window.cancelAnimationFrame(raf);
  }, [open, recommendedTemplateIndex, templates.length]);

  if (!selectedUseCase || !selectedGroup) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-bg-surface border-border/70 text-fg-main h-[85vh] p-0 overflow-hidden sm:max-w-5xl">
          <div className="flex h-full min-h-0 flex-col">
            <div className="border-border/70 bg-linear-to-b from-bg-page/25 via-bg-surface/70 to-bg-surface relative border-b px-6 pt-6 pb-5 pr-14">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-ui-active-soft/15 text-ui-active-soft mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-[color-mix(in_srgb,var(--color-ui-active-soft)_30%,transparent)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-fg-main text-xl font-semibold">
                      {t(selectedUseCase.nameKey)}
                    </DialogTitle>
                    <DialogDescription className="text-fg-muted mt-1 max-w-2xl text-sm">
                      {t(selectedUseCase.descriptionKey)}
                    </DialogDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-fg-muted">
                  <span>{t('templatesModal.templatesTitle')}</span>
                  <span className="bg-ui-active-soft/70 h-1.5 w-1.5 rounded-full" />
                  <span>
                    {selectedGroup.templates.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 scrollbar-visible lg:overflow-hidden">
	              <div className="flex h-full min-h-0 flex-col gap-6 lg:flex-row">
	                <div className="space-y-6 lg:w-[360px] lg:shrink-0">
	                  <div className="border-border/70 bg-bg-page/30 rounded-xl border p-4 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-ui-active-soft)_8%,transparent)]">
	                    <div className="text-fg-main flex items-center gap-2 text-sm font-semibold">
	                      <Sparkles className="text-ui-active-soft h-4 w-4" />
	                      {t('templatesModal.whyTitle')}
	                    </div>
	                    <p className="text-fg-soft mt-2 text-sm leading-relaxed">
	                      {t(selectedGroup.whyThisMattersKey)}
	                    </p>
	                  </div>

	                  <div className="border-border/60 bg-bg-page/20 rounded-xl border p-4 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-ui-active-soft)_8%,transparent)]">
	                    <div className="flex items-start justify-between gap-3">
	                      <div className="text-fg-main text-sm font-semibold">
	                        {t('templatesModal.considerationsTitle')}
	                      </div>
	                      <div className="text-fg-muted text-xs">
	                        {selectedTemplateCard ? selectedTemplateCard.tierName : null}
	                      </div>
	                    </div>

	                    <ul className="mt-3 space-y-2">
	                      {selectedTemplateConsiderations.map(({ icon: Icon, label, value }) => (
	                        <li
	                          key={label}
	                          className="flex items-start gap-2 text-sm leading-relaxed"
	                        >
	                          <span className="bg-ui-active-soft/15 text-ui-active-soft mt-0.5 flex h-6 w-6 items-center justify-center rounded-md">
	                            <Icon className="h-3.5 w-3.5" />
	                          </span>
	                          <span className="text-fg-soft">
	                            <span className="text-fg-muted">{label}:</span> {value}
	                          </span>
	                        </li>
	                      ))}
	                    </ul>
	                  </div>
	                </div>

	                <div className="min-h-0 flex flex-col lg:h-full lg:flex-1">
	                  <div className="shrink-0">
	                    <div className="text-fg-main text-sm font-semibold">
                      {t('templatesModal.templatesTitle')}
                    </div>
                    <p className="text-fg-muted mt-1 text-xs">
                      {t('templatesModal.templatesSubtitle', {
                        useCase: t(selectedUseCase.nameKey)
                      })}
                    </p>
	                  </div>

	                  <div
	                    className="border-border/60 bg-bg-page/10 mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto rounded-2xl border p-3 pr-6 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-ui-active-soft)_6%,transparent)] scrollbar-visible"
	                    ref={templatesScrollRef}
	                    onScroll={handleTemplatesScroll}
	                    style={{
	                      scrollSnapType: 'y mandatory',
	                      scrollPaddingTop: scrollPaddingPx,
	                      scrollPaddingBottom: scrollPaddingPx
	                    }}
	                  >
                    {templateCards.map(
                      ({ template, tierName, priceText, snapAlign, index }) => {
                        const isSelected = index === selectedTemplateIndex;
                        return (
                        <div
                          key={template.id}
                          data-template-index={index}
                          ref={el => {
                            templateCardRefs.current[index] = el;
                          }}
                          className={cn(
                            'border-border/70 bg-bg-page/25 hover:bg-bg-page/30 rounded-2xl border p-4 shadow-[0_18px_60px_-56px_rgba(0,0,0,0.8)] transition',
                            isSelected &&
                              'ring-ui-active-soft/35 border-ui-active-soft/45 ring-1'
                          )}
                          style={{
                            scrollSnapAlign: snapAlign,
                            scrollSnapStop: 'always'
                          }}
                          onClick={e => {
                            // Don't treat clicks on interactive controls inside the card
                            // (e.g. Add buttons) as card selection.
                            const target = e.target as HTMLElement | null;
                            if (target?.closest('button,a,[role="button"]')) {
                              return;
                            }
                            setSelectedTemplateIndex(index);
                            scrollToTemplateIndex(index);
                          }}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-fg-main text-lg font-semibold">
                                  {tierName}
                                </div>
                                {'recommended' in template && template.recommended && (
                                  <span className="bg-ui-active-soft/20 text-ui-active-soft rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                                    {t('templatesModal.recommended')}
                                  </span>
                                )}
                              </div>
                              <div className="text-fg-muted mt-1 text-xs">
                                {t('templatesModal.priceLabel')}: {priceText}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                onClick={() => addTemplateItems(template)}
                                className="bg-ui-active-soft hover:bg-ui-active text-white"
                              >
                                {t('templatesModal.addToQuote')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-border/70 text-fg-main hover:bg-ui-active-soft/10"
                                onClick={() => {
                                  addTemplateItems(template);
                                  onOpenChange(false);
                                  openGpuModalForTemplate(template);
                                }}
                              >
                                {t('templatesModal.addAndConfigure')}
                              </Button>
                            </div>
                          </div>

                          <div className="border-border/70 mt-4 border-t pt-4">
                            <div className="text-fg-muted text-xs uppercase tracking-[0.18em]">
                              {t('templatesModal.itemsLabel')}
                            </div>
                            <div className="text-fg-main mt-2 text-sm">
                              {template.items
                                .map(
                                  item => `${item.gpuCount}x ${item.gpuModel}`
                                )
                                .join(' + ')}
                            </div>
                          </div>

                          {template.tradeoffs && (
                            <div className="mt-4 space-y-2">
                              {([
                                ['Performance', template.tradeoffs.performance],
                                ['Cost', template.tradeoffs.cost],
                                ['Simplicity', template.tradeoffs.simplicity]
                              ] as Array<[string, number]>).map(
                                ([label, value]) => (
                                  <div
                                    key={label}
                                    className="flex items-center gap-3 text-xs"
                                  >
                                    <span className="text-fg-muted w-24">
                                      {label}
                                    </span>
                                    <div className="bg-border/60 h-2 flex-1 overflow-hidden rounded-full">
                                      <div
                                        className="bg-ui-active-soft h-full rounded-full"
                                        style={{ width: `${value}%` }}
                                      />
                                    </div>
                                    <span className="text-fg-muted w-9 text-right">
                                      {value}%
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-border/70 bg-bg-surface/90 border-t px-6 py-4">
              <Button
                variant="outline"
                className="border-border/70 text-fg-main hover:bg-bg-page/40"
                onClick={() => onOpenChange(false)}
              >
                {t('templatesModal.close')}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

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
            handleDialogClose();
          }}
          t={tModal as (key: string) => string}
        />
      )}
    </>
  );
}
