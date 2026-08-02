'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { translateWithDefault, useAppTranslations } from '@/i18n';
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
import { cn } from '@/lib/style';

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
  const intersectionRatiosRef = useRef<Map<Element, number>>(new Map());

  const recommendedTemplateIndex = useMemo(() => {
    const idx = templates.findIndex(
      entry => 'recommended' in entry && entry.recommended
    );
    return idx >= 0 ? idx : 0;
  }, [useCaseId, templates.length]);

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
    const priceText = template.priceTextKey
      ? translateWithDefault(
          t,
          template.priceTextKey as never,
          template.priceDefault ?? ''
        )
      : t('templatesModal.priceTbd')('Contact for pricing')();

    return template.items.map(item =>
      addItem({
        title: `${useCaseName} — ${tierName} — ${item.gpuCount}x ${item.gpuModel}`,
        specs: `${item.gpuCount}x ${item.gpuModel}`,
        price: priceText,
        details: t('templatesModal.planDetails')('Use case: {useCase} - Tier: {tier}')({
          useCase: useCaseName,
          tier: tierName
        }),
        gpuModel: item.gpuModel,
        gpuCount: item.gpuCount
      })
    );
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

  const templateCards = useMemo(() => {
    return templates.map((template, index, all) => {
      const tierName = translateWithDefault(
        t,
        template.tierKey as never,
        template.tierDefault
      );
      const priceText = template.priceTextKey
        ? translateWithDefault(
            t,
            template.priceTextKey as never,
            template.priceDefault ?? ''
          )
        : t('templatesModal.priceTbd')('Contact for pricing')();
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

  // IntersectionObserver replaces the old scroll-settle RAF loop that called
  // getBoundingClientRect on every card for up to 90 frames.
  useEffect(() => {
    if (!open) return;
    const cardCount = templateCards.length;
    if (cardCount === 0) return;

    const root = templatesScrollRef.current;
    if (!root) return;

    intersectionRatiosRef.current = new Map();

    const pickActive = () => {
      const cards = templateCardRefs.current;
      if (cards.length === 0) return;

      let bestIdx = 0;
      let bestRatio = -1;

      for (let idx = 0; idx < cardCount; idx++) {
        const el = cards[idx];
        if (!el) continue;
        const ratio = intersectionRatiosRef.current.get(el) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestIdx = idx;
        }
      }

      setSelectedTemplateIndex(prev => (prev === bestIdx ? prev : bestIdx));
    };

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          intersectionRatiosRef.current.set(
            entry.target,
            entry.intersectionRatio
          );
        }
        pickActive();
      },
      {
        root,
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    for (const el of templateCardRefs.current) {
      if (el) observer.observe(el);
    }

    root.addEventListener('scrollend', pickActive);

    return () => {
      observer.disconnect();
      root.removeEventListener('scrollend', pickActive);
    };
  }, [open, useCaseId, templateCards.length]);

  const selectedTemplateConsiderations = useMemo(() => {
    if (!selectedTemplateCard) return [];
    const { template, priceText } = selectedTemplateCard;
    const configText = template.items
      .map(item => `${item.gpuCount}x ${item.gpuModel}`)
      .join(' + ');

    const items = [
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
        scrollToTemplateIndex(recommendedTemplateIndex, 'auto');
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

          <div className="min-h-0 flex-1 overflow-y-scroll px-6 py-6 pr-7 scrollbar-visible lg:overflow-hidden">
            <div className="flex h-full min-h-0 flex-col gap-6 lg:flex-row">
              {/* Templates list (left on desktop) */}
              <div className="min-h-0 flex flex-col lg:h-full lg:flex-1">
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
                      return (
                        <div
                          key={template.id}
                          data-template-index={index}
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
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="cta"
                                onClick={() => addTemplateItems(template)}
                              >
                                {t('templatesModal.addToQuote')('Add to Quote')()}
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
                              ).map(([label, value]) => (
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
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Details / considerations (right on desktop) */}
              <div className="space-y-6 overflow-y-scroll pr-4 scrollbar-visible lg:w-[360px] lg:shrink-0">
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
                          <span className="bg-ui-active-soft/15 text-ui-active-soft mt-0.5 flex h-6 w-6 items-center justify-center rounded-md">
                            <ItemIcon className="h-3.5 w-3.5" />
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
