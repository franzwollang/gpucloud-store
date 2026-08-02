'use client';

import { translateWithDefault, useAppTranslations } from '@/i18n';

import {
  PageAnchor,
  useSectionVisibility
} from '@/components/layout-navigation/links';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { SpotlightArea } from '@/components/ui/spotlight-area';
import { cn } from '@/lib/style';

const spotlightSteps = [
  {
    number: '01',
    title: 'Share requirements',
    description: 'Workload, region, timeline, and budget targets.',
    detail: '2–3 minutes, no commitment.',
    titleKey: 'spotlight.steps.0.title' as const,
    descriptionKey: 'spotlight.steps.0.description' as const,
    detailKey: 'spotlight.steps.0.detail' as const
  },
  {
    number: '02',
    title: 'We confirm capacity',
    description: 'We check providers for lead time, pricing, and fit.',
    detail: 'Multiple regions and redundancy options.',
    titleKey: 'spotlight.steps.1.title' as const,
    descriptionKey: 'spotlight.steps.1.description' as const,
    detailKey: 'spotlight.steps.1.detail' as const
  },
  {
    number: '03',
    title: 'Receive quote + plan',
    description: 'Clear options for on-demand or reserved capacity.',
    detail: 'We recommend the fastest path.',
    titleKey: 'spotlight.steps.2.title' as const,
    descriptionKey: 'spotlight.steps.2.description' as const,
    detailKey: 'spotlight.steps.2.detail' as const
  }
] as const;

export function SpotlightCard() {
  const t = useAppTranslations('TEST');
  const tAnchors = useAppTranslations();
  const aboutAnchor = tAnchors('UI.navLinks.about.anchor')('about')();
  const { isActive: isSectionVisible } = useSectionVisibility(aboutAnchor);

  return (
    <PageAnchor
      anchorKey="UI.navLinks.about.anchor"
      ariaLabel={t('spotlight.title')('Confirm capacity in three steps')()}
      className="w-full"
    >
      <section className="w-full" data-perf-lab="spotlight">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="text-center">
            <p className="text-fg-soft text-xs uppercase tracking-[0.18em]">
              {t('spotlight.eyebrow')('What happens next')()}
            </p>
            <h2 className="text-fg-main mt-2 text-2xl font-semibold">
              {t('spotlight.title')('Confirm capacity in three steps')()}
            </h2>
            <p className="text-fg-muted mt-2 text-sm">
              {t('spotlight.subtitle')('Quick process, clear answers, and zero guesswork.')()}
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
              {spotlightSteps.map(step => (
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
                      {translateWithDefault(t, step.titleKey, step.title)}
                    </CardTitle>
                    <p className="text-fg-muted text-sm leading-relaxed">
                      {translateWithDefault(t, step.descriptionKey, step.description)}
                    </p>
                    <p className="text-fg-soft mt-auto text-xs">
                      {translateWithDefault(t, step.detailKey, step.detail)}
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
