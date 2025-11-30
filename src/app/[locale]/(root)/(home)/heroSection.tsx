import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  FlickeringCardsCarousel,
  type FlickeringCarouselCard
} from '@/components/flickeringCards';
import { HaloSearch } from '@/components/search/halo-search';
import { Fog } from '@/components/ui/fog';
import { LampFlickerProvider, Streetlamp } from '@/components/ui/streetlamp';
import { cn } from '@/lib/style';
import { usePlanStore } from '@/stores/plan';

const heroAccentGradient =
  'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-neon-electric) 65%, transparent), transparent)';
const heroCyanGradient =
  'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-neon-cyan) 75%, transparent), transparent)';
const heroCyanGlowGradient =
  'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-neon-cyan) 45%, transparent), transparent)';

export function HeroSection() {
  const t = useTranslations('TEST');

  const cardsFromMessages = t.raw(
    'hero.carousel.cards'
  ) as unknown as FlickeringCarouselCard[];

  const [searchQuery, setSearchQuery] = useState('');
  const addItem = usePlanStore(state => state.addItem);

  return (
    <>
      <h2 id="hero-title" className="sr-only">
        {''}
      </h2>
      <section
        id="hero"
        aria-labelledby="hero-title"
        className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20"
      >
        {/* Fog limited to the upper hero area, with radial mask to focus around the hero */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[680px]">
          <div
            className="relative h-full w-full"
            style={{
              WebkitMaskImage:
                'radial-gradient(circle at 50% 32%, rgba(1,1,1,1) 0%, rgba(1,1,1,0.7) 45%, rgba(1,1,1,0.05) 70%, transparent 90%)',
              maskImage:
                'radial-gradient(circle at 50% 32%, rgba(1,1,1,1) 0%, rgba(1,1,1,0.7) 45%, rgba(1,1,1,0.05) 70%, transparent 90%)'
            }}
          >
            <Fog />
          </div>
        </div>
        <LampFlickerProvider>
          <div className="relative z-10 flex w-full flex-col items-center pt-12">
            <div className="mb-8 flex flex-col items-center gap-4">
              <h1 className={cn('text-fg-main text-center text-6xl font-bold')}>
                {t('hero.title')}
              </h1>
              <h2 className="text-fg-muted text-center text-2xl font-bold">
                Find real GPU capacity. We handle everything else.
              </h2>
            </div>
            <div className="flex w-full justify-center">
              <HaloSearch
                value={searchQuery}
                onChange={setSearchQuery}
                onAddToPlan={(config: {
                  type: string;
                  size: number;
                  provider: { name: string; location: string };
                }) => {
                  addItem({
                    title: config.type,
                    specs: `${config.size} GPU cluster`,
                    price: 'Contact for pricing',
                    details: `Provider: ${config.provider.name} (${config.provider.location})`
                  });
                }}
              />
            </div>
            <div className="relative z-0 mt-10 h-44 w-full">
              {/* Gradients */}
              <div
                className="absolute top-0 left-1/2 h-[2px] w-3/4 -translate-x-1/2 blur-sm"
                style={{ background: heroAccentGradient }}
              />
              <div
                className="absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2"
                style={{ background: heroAccentGradient }}
              />
              <div
                className="absolute top-0 left-1/2 h-[5px] w-1/4 -translate-x-1/2 blur-sm"
                style={{ background: heroCyanGradient }}
              />
              <div
                className="absolute top-0 left-1/2 h-px w-1/4 -translate-x-1/2"
                style={{ background: heroCyanGlowGradient }}
              />
              <Streetlamp
                height="100%"
                className="h-full w-full"
                tipInsetPercent={0}
                featherEdges={true}
                glowColor="color-mix(in srgb, var(--color-lamp-glow) 48%, transparent)"
                motesProps={{
                  background: 'transparent',
                  minSize: 0.4,
                  maxSize: 1,
                  particleDensity: 30,
                  particleColor: '#F9FAFB'
                }}
              />
              {/* Radial Gradient to prevent sharp edges (transparent mask only, no black fill) */}
              <div className="pointer-events-none absolute inset-0 h-full w-full mask-[radial-gradient(350px_200px_at_top,transparent_20%,white)]" />
            </div>
          </div>
          <FlickeringCardsCarousel cards={cardsFromMessages} />
        </LampFlickerProvider>
      </section>
    </>
  );
}
