'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { translateWithDefault, useAppTranslations } from '@/i18n';
import {
  BadgeDollarSign,
  Check,
  Cpu,
  Loader2,
  Sparkles,
  Target
} from 'lucide-react';

import { GpuFamilyThumbnailDeck } from '@/components/gpu/GpuFamilyThumbnail';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog';
import {
  estimateTemplateHourlyRange,
  formatLineHourlyPrice,
  formatTemplateHourlyRange
} from '@/lib/catalog/templatePricing';
import { usePlanStore } from '@/stores/plan';
import { cn } from '@/lib/style';

import { gpuCatalog } from '@public/data';

import {
  useCaseTemplateGroups,
  useCases,
  type UseCaseId,
  type UseCaseTemplate
} from '@/lib/useCaseTemplates';

type QuoteFeedback = 'idle' | 'loading' | 'added';

type UseCaseTemplatesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  useCaseId: UseCaseId | null;
  onRequestConfigure: (gpuModel: string, configuringItemId: string) => void;
};

export function UseCaseTemplatesModal({
  open,
  onOpenChange,
  useCaseId,
  onRequestConfigure
}: UseCaseTemplatesModalProps) {
  const t = useAppTranslations('TEST');
  const { addItem } = usePlanStore(({ addItem }) => ({ addItem }));

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
  const [quoteFeedbackById, setQuoteFeedbackById] = useState<
    Record<string, QuoteFeedback>
  >({});
  const quoteFeedbackTimeoutsRef = useRef<
    Record<string, { added?: number; idle?: number }>
  >({});
  /** True while a click/focus/open scroll is in flight — ignore scroll→selection updates. */
  const programmaticScrollRef = useRef(false);
  const programmaticScrollClearRef = useRef<number | null>(null);

  const recommendedTemplateIndex = useMemo(() => {
    const idx = templates.findIndex(
      entry => 'recommended' in entry && entry.recommended
    );
    return idx >= 0 ? idx : 0;
  }, [useCaseId, templates.length]);

  const priceFallback = t('templatesModal.priceTbd')('Contact for pricing')();

  const addTemplateItems = (template: UseCaseTemplate): string[] => {
    if (!selectedUseCase) return [];
    const useCaseName = translateWithDefault(
      t,
      selectedUseCase.nameKey as never,
      selectedUseCase.nameDefault
    );
    const tierName = translateWithDefault(
      t,
      template.tierKey as never,
      template.tierDefault
    );
    const estimate = estimateTemplateHourlyRange(template, gpuCatalog);

    return template.items.map((item, index) => {
      const line = estimate.lines[index];
      return addItem({
        title: `${useCaseName} — ${tierName} — ${item.gpuCount}x ${item.gpuModel}`,
        specs: `${item.gpuCount}x ${item.gpuModel}`,
        price: line
          ? formatLineHourlyPrice(line, priceFallback)
          : priceFallback,
        details: t('templatesModal.planDetails')('Use case: {useCase} - Tier: {tier}')({
          useCase: useCaseName,
          tier: tierName
        }),
        gpuModel: item.gpuModel,
        gpuCount: item.gpuCount
      });
    });
  };

  const clearQuoteFeedbackTimers = (templateId: string) => {
    const timers = quoteFeedbackTimeoutsRef.current[templateId];
    if (!timers) return;
    if (timers.added !== undefined) window.clearTimeout(timers.added);
    if (timers.idle !== undefined) window.clearTimeout(timers.idle);
    delete quoteFeedbackTimeoutsRef.current[templateId];
  };

  const handleAddToQuote = (template: UseCaseTemplate) => {
    const current = quoteFeedbackById[template.id] ?? 'idle';
    if (current !== 'idle') return;

    clearQuoteFeedbackTimers(template.id);
    setQuoteFeedbackById(prev => ({ ...prev, [template.id]: 'loading' }));
    addTemplateItems(template);

    const addedTimeout = window.setTimeout(() => {
      setQuoteFeedbackById(prev => ({ ...prev, [template.id]: 'added' }));
    }, 350);
    const idleTimeout = window.setTimeout(() => {
      setQuoteFeedbackById(prev => ({ ...prev, [template.id]: 'idle' }));
      delete quoteFeedbackTimeoutsRef.current[template.id];
    }, 1600);

    quoteFeedbackTimeoutsRef.current[template.id] = {
      added: addedTimeout,
      idle: idleTimeout
    };
  };

  const addAndConfigureTemplate = (template: UseCaseTemplate) => {
    const ids = addTemplateItems(template);
    const primaryItem = template.items[0];
    const primaryId = ids[0];
    if (!primaryItem || !primaryId) return;
    onRequestConfigure(primaryItem.gpuModel, primaryId);
  };

  useEffect(() => {
    setSelectedTemplateIndex(recommendedTemplateIndex);
  }, [recommendedTemplateIndex]);

  useEffect(() => {
    if (open) return;
    Object.keys(quoteFeedbackTimeoutsRef.current).forEach(clearQuoteFeedbackTimers);
    setQuoteFeedbackById({});
  }, [open]);

  useEffect(() => {
    Object.keys(quoteFeedbackTimeoutsRef.current).forEach(clearQuoteFeedbackTimers);
    setQuoteFeedbackById({});
  }, [useCaseId]);

  useEffect(() => {
    return () => {
      Object.keys(quoteFeedbackTimeoutsRef.current).forEach(clearQuoteFeedbackTimers);
    };
  }, []);

  const templateCards = useMemo(() => {
    return templates.map((template, index, all) => {
      const tierName = translateWithDefault(
        t,
        template.tierKey as never,
        template.tierDefault
      );
      const estimate = estimateTemplateHourlyRange(template, gpuCatalog);
      const priceText = formatTemplateHourlyRange(estimate, priceFallback);
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
  }, [templates, t, priceFallback]);

  const selectedTemplateCard =
    templateCards[selectedTemplateIndex] ?? templateCards[0] ?? null;

  const scrollPaddingPx = 12;

  const getSnapMetrics = (index: number) => {
    const container = templatesScrollRef.current;
    const el = templateCardRefs.current[index];
    if (!container || !el) return null;

    const snapAlignAttr = el.dataset.snapAlign;
    const snapAlign: 'start' | 'center' | 'end' =
      snapAlignAttr === 'start' || snapAlignAttr === 'end'
        ? snapAlignAttr
        : 'center';

    const rootRect = container.getBoundingClientRect();
    const cardRect = el.getBoundingClientRect();

    const cardAnchorY =
      snapAlign === 'start'
        ? cardRect.top
        : snapAlign === 'end'
          ? cardRect.bottom
          : cardRect.top + cardRect.height / 2;

    const targetY =
      snapAlign === 'start'
        ? rootRect.top + scrollPaddingPx
        : snapAlign === 'end'
          ? rootRect.bottom - scrollPaddingPx
          : rootRect.top + rootRect.height / 2;

    return { container, cardAnchorY, targetY, delta: cardAnchorY - targetY };
  };

  const clearProgrammaticScrollLock = () => {
    programmaticScrollRef.current = false;
    if (programmaticScrollClearRef.current !== null) {
      window.clearTimeout(programmaticScrollClearRef.current);
      programmaticScrollClearRef.current = null;
    }
  };

  const beginProgrammaticScroll = () => {
    programmaticScrollRef.current = true;
    if (programmaticScrollClearRef.current !== null) {
      window.clearTimeout(programmaticScrollClearRef.current);
    }
    // Fallback if scrollend never fires (Safari quirks / no movement).
    programmaticScrollClearRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false;
      programmaticScrollClearRef.current = null;
    }, 500);
  };

  const scrollToTemplateIndex = (
    index: number,
    behavior: ScrollBehavior = 'smooth'
  ) => {
    const metrics = getSnapMetrics(index);
    if (!metrics) return;

    const { container, delta } = metrics;
    if (Math.abs(delta) < 1) {
      clearProgrammaticScrollLock();
      return;
    }

    beginProgrammaticScroll();
    container.scrollTo({
      top: container.scrollTop + delta,
      behavior
    });
  };

  /** Selection drives the right pane; optionally snap-scroll the list to match. */
  const selectTemplateIndex = (
    index: number,
    { scroll = true, behavior = 'smooth' as ScrollBehavior } = {}
  ) => {
    if (index < 0 || index >= templateCards.length) return;
    setSelectedTemplateIndex(prev => (prev === index ? prev : index));
    if (scroll) scrollToTemplateIndex(index, behavior);
  };

  // Scroll → selection: pick the card whose snap anchor is closest to the
  // container snap target (more reliable than intersection ratio with tall cards).
  useEffect(() => {
    if (!open) return;
    const cardCount = templateCards.length;
    if (cardCount === 0) return;

    const root = templatesScrollRef.current;
    if (!root) return;

    const pickActiveFromScroll = () => {
      if (programmaticScrollRef.current) return;

      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      for (let idx = 0; idx < cardCount; idx += 1) {
        const metrics = getSnapMetrics(idx);
        if (!metrics) continue;
        const dist = Math.abs(metrics.delta);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      }

      setSelectedTemplateIndex(prev => (prev === bestIdx ? prev : bestIdx));
    };

    let scrollSettleTimer: number | null = null;
    const onScroll = () => {
      if (programmaticScrollRef.current) return;
      if (scrollSettleTimer !== null) window.clearTimeout(scrollSettleTimer);
      // Lightweight settle while dragging; scrollend does the final lock.
      scrollSettleTimer = window.setTimeout(pickActiveFromScroll, 80);
    };

    const onScrollEnd = () => {
      clearProgrammaticScrollLock();
      pickActiveFromScroll();
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    root.addEventListener('scrollend', onScrollEnd);

    return () => {
      root.removeEventListener('scroll', onScroll);
      root.removeEventListener('scrollend', onScrollEnd);
      if (scrollSettleTimer !== null) window.clearTimeout(scrollSettleTimer);
    };
    // templateCards identity changes with pricing/i18n; length + useCase is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snap metrics read latest cards via refs/closure on event
  }, [open, useCaseId, templateCards.length]);

  useEffect(() => {
    return () => {
      if (programmaticScrollClearRef.current !== null) {
        window.clearTimeout(programmaticScrollClearRef.current);
      }
    };
  }, []);

  const selectedTemplateConsiderations = useMemo(() => {
    if (!selectedTemplateCard) return [];
    const { template, priceText } = selectedTemplateCard;
    const configText = template.items
      .map(item => `${item.gpuCount}x ${item.gpuModel}`)
      .join(' + ');

    const items: Array<{
      icon: typeof Cpu;
      label: string;
      value: string;
    }> = [
      {
        icon: Cpu,
        label: t('templatesModal.itemsLabel')('Configuration')(),
        value: configText
      },
      {
        icon: BadgeDollarSign,
        label: t('templatesModal.priceLabel')('Est. price')(),
        value: priceText
      }
    ];

    if (template.bestForKey) {
      items.push({
        icon: Target,
        label: t('templatesModal.bestForLabel')('Best for')(),
        value: template.bestForKey
          ? translateWithDefault(
              t,
              template.bestForKey as never,
              template.bestForDefault ?? ''
            )
          : ''
      });
    }

    return items;
  }, [selectedTemplateCard, t]);

  // Single open pass: scroll recommended into place once refs attach.
  useEffect(() => {
    if (!open) return;
    if (templates.length === 0) return;

    let raf = 0;
    let attempts = 0;

    const tryScroll = () => {
      attempts += 1;
      if (templateCardRefs.current[recommendedTemplateIndex]) {
        selectTemplateIndex(recommendedTemplateIndex, {
          scroll: true,
          behavior: 'auto'
        });
        return;
      }
      if (attempts < 10) {
        raf = window.requestAnimationFrame(tryScroll);
      }
    };

    raf = window.requestAnimationFrame(tryScroll);
    return () => window.cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional open/recommended only
  }, [open, recommendedTemplateIndex, templates.length]);

  if (!selectedUseCase || !selectedGroup) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bg-surface border-border/60 text-fg-main h-[85vh] p-0 overflow-hidden sm:max-w-5xl">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-border/60 bg-linear-to-b from-bg-page/25 via-bg-surface/70 to-bg-surface relative border-b px-6 pt-6 pb-5 pr-14">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-ui-active-soft/15 text-ui-active-soft mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-[color-mix(in_srgb,var(--color-ui-active-soft)_30%,transparent)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-fg-main text-xl font-semibold">
                    {translateWithDefault(
                      t,
                      selectedUseCase.nameKey as never,
                      selectedUseCase.nameDefault
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-fg-muted mt-1 max-w-2xl text-sm">
                    {translateWithDefault(
                      t,
                      selectedUseCase.descriptionKey as never,
                      selectedUseCase.descriptionDefault
                    )}
                  </DialogDescription>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-fg-muted">
                <span>{t('templatesModal.templatesTitle')('Ready-to-deploy templates')()}</span>
                <span className="bg-ui-active-soft/70 h-1.5 w-1.5 rounded-full" />
                <span>{selectedGroup.templates.length}</span>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden px-6 py-6 pr-7">
            <div className="flex h-full min-h-0 flex-col gap-6 lg:flex-row">
              {/* Templates list (left on desktop) */}
              <div className="flex min-h-0 flex-col lg:h-full lg:min-h-0 lg:flex-1">
                <div className="shrink-0">
                  <div className="text-fg-main text-sm font-semibold">
                    {t('templatesModal.templatesTitle')('Ready-to-deploy templates')()}
                  </div>
                  <p className="text-fg-muted mt-1 text-xs">
                    {t('templatesModal.templatesSubtitle')('Pre-configured setups optimized for {useCase}.')({
                      useCase: translateWithDefault(
                        t,
                        selectedUseCase.nameKey as never,
                        selectedUseCase.nameDefault
                      )
                    })}
                  </p>
                </div>

                <div
                  className="border-border/60 bg-bg-page/30 shadow-lamp-inset mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-scroll rounded-2xl border p-3 pr-6 scrollbar-visible"
                  ref={templatesScrollRef}
                  style={{
                    scrollSnapType: 'y mandatory',
                    scrollPaddingTop: scrollPaddingPx,
                    scrollPaddingBottom: scrollPaddingPx
                  }}
                >
                  {templateCards.map(
                    ({ template, tierName, priceText, snapAlign, index }) => {
                      const isSelected = index === selectedTemplateIndex;
                      const quoteFeedback =
                        quoteFeedbackById[template.id] ?? 'idle';
                      return (
                        <div
                          key={template.id}
                          data-template-index={index}
                          data-snap-align={snapAlign}
                          ref={el => {
                            templateCardRefs.current[index] = el;
                          }}
                          className={cn(
                            'border-border/60 bg-bg-surface/80 hover:bg-bg-surface shadow-lamp-card hover:shadow-lamp-soft hover:border-ui-active-soft rounded-2xl border p-4 transition',
                            isSelected &&
                              'ring-ui-active-soft/35 border-ui-active-soft/45 ring-1'
                          )}
                          style={{
                            scrollSnapAlign: snapAlign,
                            scrollSnapStop: 'always'
                          }}
                          onClick={e => {
                            // Don't treat clicks on interactive controls inside the card
                            // (e.g. Add buttons) as card selection — focusCapture handles those.
                            const target = e.target as HTMLElement | null;
                            if (target?.closest('button,a,[role="button"]')) {
                              return;
                            }
                            selectTemplateIndex(index);
                          }}
                          onFocusCapture={() => {
                            // Tabbing into a card (or its buttons) locks selection + snap.
                            selectTemplateIndex(index);
                          }}
                        >
                          <div className="flex flex-row items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-fg-main text-lg font-semibold">
                                  {tierName}
                                </div>
                                {'recommended' in template &&
                                  template.recommended && (
                                    <span className="bg-ui-active-soft/20 text-ui-active-soft rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                                      {t('templatesModal.recommended')('Recommended')()}
                                    </span>
                                  )}
                              </div>
                              <div className="text-fg-muted mt-1 text-xs">
                                {t('templatesModal.priceLabel')('Est. price')()}: {priceText}
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-nowrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="cta"
                                disabled={quoteFeedback === 'loading'}
                                aria-live="polite"
                                aria-label={
                                  quoteFeedback === 'added'
                                    ? t('templatesModal.addToQuoteAdded')(
                                        'Added'
                                      )()
                                    : quoteFeedback === 'loading'
                                      ? t('templatesModal.addToQuoteLoading')(
                                          'Adding…'
                                        )()
                                      : t('templatesModal.addToQuote')(
                                          'Add to Quote'
                                        )()
                                }
                                onClick={() => handleAddToQuote(template)}
                                className={cn(
                                  'relative h-8 min-w-[8.5rem] overflow-hidden',
                                  quoteFeedback !== 'idle' &&
                                    'border-ui-active-soft/50 bg-ui-active-soft/10 text-ui-active-soft'
                                )}
                              >
                                <span
                                  className={cn(
                                    'absolute inset-0 inline-flex items-center justify-center gap-1.5 transition-all duration-200',
                                    quoteFeedback === 'idle'
                                      ? 'translate-y-0 opacity-100'
                                      : 'pointer-events-none translate-y-2 opacity-0'
                                  )}
                                >
                                  {t('templatesModal.addToQuote')(
                                    'Add to Quote'
                                  )()}
                                </span>
                                <span
                                  className={cn(
                                    'absolute inset-0 inline-flex items-center justify-center gap-1.5 transition-all duration-200',
                                    quoteFeedback === 'loading'
                                      ? 'translate-y-0 opacity-100'
                                      : 'pointer-events-none -translate-y-2 opacity-0'
                                  )}
                                  aria-hidden={quoteFeedback !== 'loading'}
                                >
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  {t('templatesModal.addToQuoteLoading')(
                                    'Adding…'
                                  )()}
                                </span>
                                <span
                                  className={cn(
                                    'absolute inset-0 inline-flex items-center justify-center gap-1.5 transition-all duration-200',
                                    quoteFeedback === 'added'
                                      ? 'translate-y-0 opacity-100'
                                      : 'pointer-events-none translate-y-2 opacity-0'
                                  )}
                                  aria-hidden={quoteFeedback !== 'added'}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  {t('templatesModal.addToQuoteAdded')(
                                    'Added'
                                  )()}
                                </span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addAndConfigureTemplate(template)}
                              >
                                {t('templatesModal.addAndConfigure')('Add & Configure')()}
                              </Button>
                            </div>
                          </div>

                          <div className="border-border/60 mt-4 border-t pt-4">
                            <div className="text-fg-muted text-xs uppercase tracking-[0.18em]">
                              {t('templatesModal.itemsLabel')('Configuration')()}
                            </div>
                            <div className="mt-2 flex flex-col gap-2">
                              {template.items.map(item => {
                                const familyId = gpuCatalog.gpus.find(
                                  gpu => gpu.model === item.gpuModel
                                )?.id;
                                return (
                                  <div
                                    key={`${template.id}-${item.gpuModel}-${item.gpuCount}`}
                                    className="flex items-start gap-4"
                                  >
                                    <div className="text-fg-main shrink-0 pt-1.5 text-sm">
                                      {item.gpuCount}x {item.gpuModel}
                                    </div>
                                    <div className="min-w-0 flex-1 overflow-visible">
                                      <GpuFamilyThumbnailDeck
                                        familyId={familyId}
                                        alt={item.gpuModel}
                                        count={item.gpuCount}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {template.tradeoffs && (
                            <div className="mt-4 space-y-2">
                              {(
                                [
                                  [
                                    t('templatesModal.tradeoffs.performance')('Performance')(),
                                    template.tradeoffs.performance
                                  ],
                                  [
                                    t('templatesModal.tradeoffs.cost')('Cost')(),
                                    template.tradeoffs.cost
                                  ],
                                  [
                                    t('templatesModal.tradeoffs.simplicity')('Simplicity')(),
                                    template.tradeoffs.simplicity
                                  ]
                                ] as Array<[string, number]>
                              ).map(([label, value]) => {
                                const score = Math.min(5, Math.max(1, value));
                                return (
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
                                        style={{
                                          width: `${(score / 5) * 100}%`
                                        }}
                                      />
                                    </div>
                                    <span className="text-fg-muted w-9 text-right tabular-nums">
                                      {score}/5
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Details / considerations (right on desktop) */}
              <div className="min-h-0 shrink-0 space-y-6 overflow-hidden pr-4 lg:w-[360px]">
                <div className="border-border/60 bg-bg-page/30 shadow-lamp-inset rounded-xl border p-4">
                  <div className="text-fg-main flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="text-ui-active-soft h-4 w-4" />
                    {t('templatesModal.whyTitle')('Why this matters')()}
                  </div>
                  <p className="text-fg-soft mt-2 text-sm leading-relaxed">
                    {translateWithDefault(
                      t,
                      selectedGroup.whyThisMattersKey as never,
                      selectedGroup.whyDefault
                    )}
                  </p>
                </div>

                <div className="border-border/60 bg-bg-page/30 shadow-lamp-inset rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-fg-main text-sm font-semibold">
                      {t('templatesModal.considerationsTitle')('Key considerations')()}
                    </div>
                    <div className="text-fg-muted text-xs">
                      {selectedTemplateCard
                        ? selectedTemplateCard.tierName
                        : null}
                    </div>
                  </div>

                  <ul className="mt-3 space-y-2">
                    {selectedTemplateConsiderations.map(
                      ({ icon: ItemIcon, label, value }) => (
                        <li
                          key={label}
                          className="flex items-start gap-2 text-sm leading-relaxed"
                        >
                          <span className="bg-ui-active-soft/15 text-ui-active-soft mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md">
                            <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                          </span>
                          <span className="text-fg-soft">
                            <span className="text-fg-muted">{label}:</span>{' '}
                            {value}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-border/60 bg-bg-surface/90 border-t px-6 py-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('templatesModal.close')('Close')()}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
