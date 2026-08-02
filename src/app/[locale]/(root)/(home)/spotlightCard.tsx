'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import {
  PageAnchor,
  useOnAnchorRankingsChange
} from '@/components/layout-navigation/links';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { SpotlightArea } from '@/components/ui/spotlight-area';
import { cn } from '@/lib/style';
import { useUIStore } from '@/stores/ui';

export function SpotlightCard() {
  const t = useTranslations('TEST');
  const tAnchors = useTranslations();
  const aboutAnchor = tAnchors('UI.navLinks.about.anchor');
  const steps = [
    {
      number: '01',
      titleKey: 'spotlight.steps.0.title',
      descriptionKey: 'spotlight.steps.0.description',
      detailKey: 'spotlight.steps.0.detail'
    },
    {
      number: '02',
      titleKey: 'spotlight.steps.1.title',
      descriptionKey: 'spotlight.steps.1.description',
      detailKey: 'spotlight.steps.1.detail'
    },
    {
      number: '03',
      titleKey: 'spotlight.steps.2.title',
      descriptionKey: 'spotlight.steps.2.description',
      detailKey: 'spotlight.steps.2.detail'
    }
  ] as const;

  const initialVisible = useMemo(() => {
    const ratio =
      useUIStore
        .getState()
        .visibilities.anchorRankings.find(entry => entry.id === aboutAnchor)
        ?.ratio ?? 0;
    return ratio > 0;
  }, [aboutAnchor]);
  const [isSectionVisible, setIsSectionVisible] = useState(initialVisible);

  useOnAnchorRankingsChange(rankings => {
    const ratio = rankings.find(entry => entry.id === aboutAnchor)?.ratio ?? 0;
    setIsSectionVisible(ratio > 0);
  });

  useEffect(() => {
    setIsSectionVisible(initialVisible);
  }, [initialVisible]);

  return (
    <PageAnchor
      anchorKey="UI.navLinks.about.anchor"
      ariaLabel={t('spotlight.title')}
      className="w-full"
    >
      <section className="w-full" data-perf-lab="spotlight">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="text-center">
            <p className="text-fg-soft text-xs uppercase tracking-[0.18em]">
              {t('spotlight.eyebrow')}
            </p>
            <h2 className="text-fg-main mt-2 text-2xl font-semibold">
              {t('spotlight.title')}
            </h2>
            <p className="text-fg-muted mt-2 text-sm">
              {t('spotlight.subtitle')}
            </p>
          </div>

          <SpotlightArea
            className="border-border/60 bg-bg-surface/90 shadow-lamp-soft mt-10 rounded-2xl border p-6"
            spotlightMode="cursor"
            initialSpotlightPosition={{ xPercent: 0.33, yPercent: 0.5 }}
            radius={320}
            revealOnHover={true}
            active={isSectionVisible}
          >
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map(step => (
                <Card
                  key={step.number}
                  className="border-border/60 bg-bg-surface shadow-lamp-inset"
                >
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="text-fg-soft text-xs font-semibold tracking-[0.24em]">
                      {step.number}
                    </div>
                    <CardTitle
                      className={cn('text-fg-main text-base font-semibold')}
                    >
                      {t(step.titleKey)}
                    </CardTitle>
                    <p className="text-fg-muted text-sm leading-relaxed">
                      {t(step.descriptionKey)}
                    </p>
                    <p className="text-fg-soft mt-auto text-xs">
                      {t(step.detailKey)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SpotlightArea>
        </div>
      </section>
    </PageAnchor>
  );
}
