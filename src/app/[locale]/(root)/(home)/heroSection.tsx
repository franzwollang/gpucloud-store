import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { CatalogAttribution } from '@/components/catalog/CatalogAttribution';
import { FlickeringCardsCarousel } from '@/components/flickeringCards';
import {
  PageAnchor,
  useOnAnchorRankingsChange
} from '@/components/layout-navigation/links';
import { HaloSearch } from '@/components/search/halo-search';
import { Fog } from '@/components/ui/fog';
import { LampFlickerProvider, Streetlamp } from '@/components/ui/streetlamp';
import type { RawMessageType } from '@/i18n';
import { useEffectOverride } from '@/lib/animation/useEffectOverride';
import { cn } from '@/lib/style';
import { usePlanStore } from '@/stores/plan';
import { useUIStore } from '@/stores/ui';

const heroAccentGradient =
  'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-neon-electric) 65%, transparent), transparent)';
const heroCyanGradient =
  'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-neon-cyan) 75%, transparent), transparent)';
const heroCyanGlowGradient =
  'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-neon-cyan) 45%, transparent), transparent)';

export function HeroSection() {
  const t = useTranslations('TEST');
  const tAnchors = useTranslations();
  const heroAnchor = tAnchors('UI.navLinks.home.anchor');

  const cardsFromMessages = t.raw(
    'hero.carousel.cards'
  ) as RawMessageType<'TEST.hero.carousel.cards'>;

  const [searchQuery, setSearchQuery] = useState('');
  const initialIsHeroVisible = useMemo(() => {
    const ratio =
      useUIStore
        .getState()
        .visibilities.anchorRankings.find(entry => entry.id === heroAnchor)
        ?.ratio ?? 0;
    return ratio > 0;
  }, [heroAnchor]);
  const [isHeroVisible, setIsHeroVisible] = useState(initialIsHeroVisible);
  const fogEnabled = useEffectOverride('fog');
  const lightningEnabled = useEffectOverride('lightning');
  const lampEnabled = useEffectOverride('lamp');
  const particlesEnabled = useEffectOverride('particles');
  const addItem = usePlanStore(state => state.addItem);
  const setHeaderGradientShifted = useUIStore(
    state => state.setHeaderGradientShifted
  );
  const titleWrapperRef = useRef<HTMLDivElement | null>(null);
  const titleSentinelRef = useRef<HTMLDivElement | null>(null);

  useOnAnchorRankingsChange(rankings => {
    const ratio = rankings.find(entry => entry.id === heroAnchor)?.ratio ?? 0;
    setIsHeroVisible(ratio > 0);
  });

  // Keep state in sync if the locale changes the translated anchor id.
  useEffect(() => {
    setIsHeroVisible(initialIsHeroVisible);
  }, [initialIsHeroVisible]);

  useEffect(() => {
    const titleSentinel = titleSentinelRef.current;
    if (!titleSentinel) return;

    const getHeaderHeight = () => {
      const header = document.querySelector('header');
      return header?.getBoundingClientRect().height ?? 0;
    };

    let headerHeight = getHeaderHeight();
    let observer: IntersectionObserver | null = null;

    const setupObserver = () => {
      if (observer) observer.disconnect();
      observer = new IntersectionObserver(
        entries => {
          const entry = entries[0];
          if (!entry) return;
          setHeaderGradientShifted(!entry.isIntersecting);
        },
        {
          rootMargin: `-${headerHeight}px 0px 0px 0px`,
          threshold: 0
        }
      );
      observer.observe(titleSentinel);
    };

    const handleResize = () => {
      const nextHeight = getHeaderHeight();
      if (Math.abs(nextHeight - headerHeight) < 1) return;
      headerHeight = nextHeight;
      setupObserver();
    };

    setupObserver();
    window.addEventListener('resize', handleResize);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [setHeaderGradientShifted]);

  return (
    <>
      <h2 id="hero-title" className="sr-only">
        {''}
      </h2>
      <PageAnchor
        anchorKey="UI.navLinks.home.anchor"
        ariaLabel={t('hero.title')}
        className="w-full"
      >
        <section
          aria-labelledby="hero-title"
          data-perf-lab="hero"
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
              {fogEnabled ? (
                <Fog
                  paused={!isHeroVisible}
                  enableLightning={lightningEnabled}
                />
              ) : null}
            </div>
          </div>
          <LampFlickerProvider active={isHeroVisible}>
            <div
              ref={titleWrapperRef}
              className="relative z-10 mt-12 flex w-full flex-col items-center"
            >
              <div
                ref={titleSentinelRef}
                aria-hidden="true"
                className="absolute top-0 left-0 h-px w-full"
              />
              <div className="mb-10 flex flex-col items-center gap-3">
                <h1
                  className={cn('text-fg-main text-center text-6xl font-bold')}
                >
                  {t('hero.title')}
                </h1>
                <h2 className="text-fg-muted text-center text-2xl font-bold">
                  Find real GPU capacity. We handle everything else.
                </h2>
              </div>
              <div className="flex w-full flex-col items-center gap-2 py-3">
                <HaloSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onAddToPlan={(config: {
                    type: string;
                    size: number;
                    provider: { id?: string; name: string; location: string };
                    region: string;
                  }) => {
                    addItem({
                      title: config.type,
                      specs: `${config.size} GPU cluster`,
                      price: 'Contact for pricing',
                      details: `Provider: ${config.provider.name} (${config.provider.location})`,
                      gpuModel: config.type,
                      gpuCount: config.size,
                      region: config.region,
                      provider: {
                        id: config.provider.id,
                        name: config.provider.name,
                        location: config.provider.location
                      }
                    });
                  }}
                />
                <CatalogAttribution />
              </div>
              <div className="relative z-0 mt-10 w-full">
                <div className="relative h-44 w-full">
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
                  {lampEnabled ? (
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
                        particleDensity:
                          particlesEnabled && isHeroVisible ? 30 : 0,
                        particleColor: '#F9FAFB'
                      }}
                    />
                  ) : null}
                  {/* Radial Gradient to prevent sharp edges (transparent mask only, no black fill) */}
                  <div className="pointer-events-none absolute inset-0 h-full w-full mask-[radial-gradient(350px_200px_at_top,transparent_20%,white)]" />
                </div>
                <div
                  className="relative -mt-28 flex justify-center"
                  data-perf-lab="carousel"
                >
                  <FlickeringCardsCarousel
                    cards={cardsFromMessages}
                    paused={!isHeroVisible}
                  />
                </div>
              </div>
            </div>
          </LampFlickerProvider>
        </section>
      </PageAnchor>
    </>
  );
}
