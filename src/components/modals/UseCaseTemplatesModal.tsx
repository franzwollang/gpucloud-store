'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { translateWithDefault, useAppTranslations } from '@/i18n';
import { BadgeDollarSign, Cpu, Sparkles, Target } from 'lucide-react';

import { GpuFamilyThumbnailDeck } from '@/components/gpu/GpuFamilyThumbnail';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog';
import { MorphingText } from '@/components/ui/morphing-text';
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

type QuoteFeedback = 'idle' | 'added';

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
  /** Card whose inner actions are in the tab order (Enter to enter, Esc to leave). */
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [quoteFeedbackById, setQuoteFeedbackById] = useState<
    Record<string, QuoteFeedback>
  >({});
  const quoteFeedbackTimeoutsRef = useRef<Record<string, number>>({});
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
    const timer = quoteFeedbackTimeoutsRef.current[templateId];
    if (timer === undefined) return;
    window.clearTimeout(timer);
    delete quoteFeedbackTimeoutsRef.current[templateId];
  };

  const handleAddToQuote = (template: UseCaseTemplate) => {
    const current = quoteFeedbackById[template.id] ?? 'idle';
    if (current !== 'idle') return;

    clearQuoteFeedbackTimers(template.id);
    addTemplateItems(template);
    setQuoteFeedbackById(prev => ({ ...prev, [template.id]: 'added' }));

    quoteFeedbackTimeoutsRef.current[template.id] = window.setTimeout(() => {
      setQuoteFeedbackById(prev => ({ ...prev, [template.id]: 'idle' }));
      delete quoteFeedbackTimeoutsRef.current[template.id];
    }, 1200);
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
    }, 450);
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

  const getCardActions = (card: HTMLElement | null) => {
    if (!card) return [] as HTMLElement[];
    return Array.from(
      card.querySelectorAll<HTMLElement>('[data-template-action]')
    );
  };

  const focusCardWrapper = (index: number) => {
    if (index < 0 || index >= templateCards.length) return;
    setActiveCardIndex(null);
    selectTemplateIndex(index);
    requestAnimationFrame(() => {
      templateCardRefs.current[index]?.focus();
    });
  };

  const activateCard = (index: number, focusActionIndex = 0) => {
    setActiveCardIndex(index);
    selectTemplateIndex(index);
    requestAnimationFrame(() => {
      const actions = getCardActions(templateCardRefs.current[index]);
      actions[focusActionIndex]?.focus();
    });
  };

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    index: number
  ) => {
    const card = event.currentTarget;
    const actions = getCardActions(card);
    const activated = activeCardIndex === index;

    if (!activated) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateCard(index, 0);
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        focusCardWrapper(index + 1);
        return;
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        focusCardWrapper(index - 1);
        return;
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setActiveCardIndex(null);
      card.focus();
      return;
    }

    const activeEl = document.activeElement as HTMLElement | null;
    const actionIndex = activeEl ? actions.indexOf(activeEl) : -1;

    if (event.key === 'Tab' && actions.length > 0) {
      event.preventDefault();
      if (actionIndex < 0) {
        actions[0]?.focus();
        return;
      }
      const next = event.shiftKey
        ? (actionIndex - 1 + actions.length) % actions.length
        : (actionIndex + 1) % actions.length;
      actions[next]?.focus();
      return;
    }

    if (
      (event.key === 'ArrowRight' || event.key === 'ArrowDown') &&
      actions.length > 0
    ) {
      event.preventDefault();
      const from = actionIndex < 0 ? 0 : actionIndex;
      actions[(from + 1) % actions.length]?.focus();
      return;
    }

    if (
      (event.key === 'ArrowLeft' || event.key === 'ArrowUp') &&
      actions.length > 0
    ) {
      event.preventDefault();
      const from = actionIndex < 0 ? 0 : actionIndex;
      actions[(from - 1 + actions.length) % actions.length]?.focus();
    }
  };

  useEffect(() => {
    if (!open) setActiveCardIndex(null);
  }, [open]);

  useEffect(() => {
    setActiveCardIndex(null);
  }, [useCaseId]);

  // Scroll → selection. Uses a single viewport center line (plus top/bottom
  // edge cases) so snap settling maps to the visually focused card.
  useEffect(() => {
    if (!open) return;
    const cardCount = templateCards.length;
    if (cardCount === 0) return;

    let cancelled = false;
    let root: HTMLDivElement | null = null;
    let settleTimer: number | null = null;
    let attachRaf = 0;

    const pickActiveFromScroll = () => {
      if (cancelled || programmaticScrollRef.current) return;
      const container = templatesScrollRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = Math.max(0, scrollHeight - clientHeight);

      // At the extremes, snap-align start/end should win explicitly.
      if (scrollTop <= 2) {
        setSelectedTemplateIndex(prev => (prev === 0 ? prev : 0));
        return;
      }
      if (maxScroll > 0 && scrollTop >= maxScroll - 2) {
        const last = cardCount - 1;
        setSelectedTemplateIndex(prev => (prev === last ? prev : last));
        return;
      }

      const rootRect = container.getBoundingClientRect();
      const targetY = rootRect.top + rootRect.height / 2;
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      for (let idx = 0; idx < cardCount; idx += 1) {
        const el = templateCardRefs.current[idx];
        if (!el) continue;
        const cardRect = el.getBoundingClientRect();
        const anchorY = cardRect.top + cardRect.height / 2;
        const dist = Math.abs(anchorY - targetY);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      }

      setSelectedTemplateIndex(prev => (prev === bestIdx ? prev : bestIdx));
    };

    const schedulePick = () => {
      if (programmaticScrollRef.current) return;
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(pickActiveFromScroll, 60);
    };

    const onScrollEnd = () => {
      clearProgrammaticScrollLock();
      pickActiveFromScroll();
    };

    // Any direct user gesture should release programmatic lock so snap→focus works.
    const onUserGesture = () => {
      clearProgrammaticScrollLock();
    };

    const onScroll = () => {
      schedulePick();
    };

    const attach = () => {
      if (cancelled) return;
      root = templatesScrollRef.current;
      if (!root) {
        attachRaf = window.requestAnimationFrame(attach);
        return;
      }

      root.addEventListener('scroll', onScroll, { passive: true });
      root.addEventListener('scrollend', onScrollEnd);
      root.addEventListener('wheel', onUserGesture, { passive: true });
      root.addEventListener('touchstart', onUserGesture, { passive: true });
      root.addEventListener('pointerdown', onUserGesture, { passive: true });
      pickActiveFromScroll();
    };

    attach();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(attachRaf);
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      if (!root) return;
      root.removeEventListener('scroll', onScroll);
      root.removeEventListener('scrollend', onScrollEnd);
      root.removeEventListener('wheel', onUserGesture);
      root.removeEventListener('touchstart', onUserGesture);
      root.removeEventListener('pointerdown', onUserGesture);
    };
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
      <DialogContent
        className="bg-bg-surface border-border/60 text-fg-main h-[85vh] overflow-hidden p-0 sm:max-w-5xl"
        onEscapeKeyDown={event => {
          // Esc exits an activated card before closing the dialog.
          if (activeCardIndex == null) return;
          event.preventDefault();
          const card = templateCardRefs.current[activeCardIndex];
          setActiveCardIndex(null);
          card?.focus();
        }}
      >
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

          <div className="min-h-0 flex-1 overflow-hidden px-6 py-6">
            <div className="flex h-full min-h-0 flex-col gap-5 lg:flex-row">
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
                  className="border-border/60 bg-bg-page/30 shadow-lamp-inset mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-scroll rounded-2xl border p-3 pt-5 pr-6 scrollbar-visible"
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
                      const isActivated = activeCardIndex === index;
                      const quoteFeedback =
                        quoteFeedbackById[template.id] ?? 'idle';
                      return (
                        <div
                          key={template.id}
                          role="group"
                          tabIndex={0}
                          aria-label={tierName}
                          data-template-index={index}
                          data-snap-align={snapAlign}
                          ref={el => {
                            templateCardRefs.current[index] = el;
                          }}
                          className={cn(
                            'border-border/60 bg-bg-surface/80 hover:bg-bg-surface shadow-lamp-card hover:shadow-lamp-soft hover:border-ui-active-soft focus-visible:ring-ui-active-soft/40 relative rounded-2xl border p-4 transition focus-visible:ring-2 focus-visible:outline-none',
                            isSelected &&
                              'ring-ui-active-soft/35 border-ui-active-soft/45 ring-1',
                            isActivated &&
                              'border-ui-active-soft/55 ring-ui-active-soft/25 ring-1'
                          )}
                          style={{
                            scrollSnapAlign: snapAlign,
                            scrollSnapStop: 'always'
                          }}
                          onClick={e => {
                            // Don't treat clicks on interactive controls inside the card
                            // as wrapper activation — those focus themselves.
                            const target = e.target as HTMLElement | null;
                            if (target?.closest('button,a,[role="button"]')) {
                              return;
                            }
                            setActiveCardIndex(null);
                            selectTemplateIndex(index);
                            e.currentTarget.focus();
                          }}
                          onFocus={e => {
                            selectTemplateIndex(index);
                            if (e.target !== e.currentTarget) {
                              setActiveCardIndex(index);
                            }
                          }}
                          onBlur={e => {
                            if (activeCardIndex !== index) return;
                            const next = e.relatedTarget as Node | null;
                            if (next && e.currentTarget.contains(next)) return;
                            setActiveCardIndex(null);
                          }}
                          onKeyDown={e => handleCardKeyDown(e, index)}
                        >
                          {'recommended' in template && template.recommended ? (
                            <span className="border-ui-active-soft/35 bg-ui-active-soft/15 text-ui-active-soft pointer-events-none absolute top-0 left-4 z-10 -translate-y-1/2 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase shadow-[0_1px_0_color-mix(in_srgb,var(--color-bg-page)_55%,transparent)]">
                              {t('templatesModal.recommended')('Recommended')()}
                            </span>
                          ) : null}
                          <div className="flex flex-row items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="text-fg-main text-lg font-semibold">
                                {tierName}
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
                                data-template-action=""
                                tabIndex={isActivated ? 0 : -1}
                                aria-live="polite"
                                aria-label={
                                  quoteFeedback === 'added'
                                    ? `${t('templatesModal.addToQuoteAdded')('Added')()} ✓`
                                    : t('templatesModal.addToQuote')(
                                        'Add to Quote'
                                      )()
                                }
                                onClick={() => handleAddToQuote(template)}
                                className={cn(
                                  'relative h-8 min-w-34 overflow-hidden',
                                  quoteFeedback === 'added' &&
                                    'border-ui-active-soft/50 bg-ui-active-soft/10 text-ui-active-soft'
                                )}
                              >
                                <MorphingText
                                  text={
                                    quoteFeedback === 'added'
                                      ? `${t('templatesModal.addToQuoteAdded')('Added')()} ✓`
                                      : t('templatesModal.addToQuote')(
                                          'Add to Quote'
                                        )()
                                  }
                                  className="w-full"
                                  textClassName={cn(
                                    'text-center text-sm font-medium',
                                    quoteFeedback === 'added' &&
                                      'text-ui-active-soft'
                                  )}
                                  morphTime={0.6}
                                  blurConstant={4}
                                  filterBlur={0.3}
                                  thresholdB={-80}
                                  rgbScale={0.7}
                                />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                data-template-action=""
                                tabIndex={isActivated ? 0 : -1}
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
              <div className="flex min-h-0 w-full flex-col gap-3 overflow-hidden lg:h-full lg:w-[420px] lg:shrink-0">
                <div className="border-border/60 bg-bg-page/30 shadow-lamp-inset shrink-0 rounded-xl border px-3.5 py-3">
                  <div className="text-fg-main flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="text-ui-active-soft h-4 w-4 shrink-0" />
                    {t('templatesModal.whyTitle')('Why this matters')()}
                  </div>
                  <p className="text-fg-soft mt-1.5 line-clamp-4 text-sm leading-snug">
                    {translateWithDefault(
                      t,
                      selectedGroup.whyThisMattersKey as never,
                      selectedGroup.whyDefault
                    )}
                  </p>
                </div>

                <div className="border-border/60 bg-bg-page/30 shadow-lamp-inset flex min-h-0 flex-1 flex-col rounded-xl border px-3.5 py-3">
                  <div className="flex shrink-0 items-start justify-between gap-3">
                    <div className="text-fg-main text-sm font-semibold">
                      {t('templatesModal.considerationsTitle')('Key considerations')()}
                    </div>
                    {selectedTemplateCard ? (
                      <MorphingText
                        text={selectedTemplateCard.tierName}
                        className="w-auto shrink-0"
                        textClassName="text-fg-muted text-right text-xs whitespace-nowrap"
                        morphTime={0.6}
                        blurConstant={4}
                        filterBlur={0.3}
                        thresholdB={-80}
                        rgbScale={0.7}
                      />
                    ) : null}
                  </div>

                  <ul className="mt-3 flex flex-col justify-start gap-3">
                    {selectedTemplateConsiderations.map(
                      ({ icon: ItemIcon, label, value }) => (
                        <li
                          key={label}
                          className="flex items-start gap-2 text-sm leading-snug"
                        >
                          <span className="bg-ui-active-soft/15 text-ui-active-soft mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md">
                            <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                          </span>
                          <div className="text-fg-soft min-w-0 flex-1">
                            <div className="text-fg-muted text-xs">{label}</div>
                            {/* Fixed 2-line slot so long Best for never stretches/clips the card */}
                            <div className="mt-0.5 h-[2.75rem] overflow-hidden">
                              <MorphingText
                                text={value}
                                textClassName="text-fg-soft text-sm leading-snug line-clamp-2"
                                morphTime={0.6}
                                blurConstant={4}
                                filterBlur={0.3}
                                thresholdB={-80}
                                rgbScale={0.7}
                              />
                            </div>
                          </div>
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
