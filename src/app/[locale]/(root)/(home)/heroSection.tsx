import { useEffect, useRef, useState } from 'react';

import { FlickeringCardsCarousel } from '@/components/flickeringCards';
import {
  PageAnchor,
  useSectionVisibility
} from '@/components/layout-navigation/links';
import { HaloSearch } from '@/components/search/halo-search';
import { Fog } from '@/components/ui/fog';
import { LampFlickerProvider, Streetlamp } from '@/components/ui/streetlamp';
import { useAppTranslations } from '@/i18n';
import { useEffectOverride } from '@/lib/animation/useEffectOverride';
import { cn } from '@/lib/style';
import { planPriceFromProviderRegion } from '@/lib/plan/planPriceFromProviderRegion';
import { usePlanStore } from '@/stores/plan';
import type { Provider } from '@/types/gpu';
import { useUIStore } from '@/stores/ui';

const heroAccentGradient =
  'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-neon-electric) 65%, transparent), transparent)';
const heroCyanGradient =
  'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-neon-cyan) 75%, transparent), transparent)';
const heroCyanGlowGradient =
  'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-neon-cyan) 45%, transparent), transparent)';

export function HeroSection() {
  const t = useAppTranslations('TEST');
  const tAnchors = useAppTranslations();
  const heroAnchor = tAnchors('UI.navLinks.home.anchor')('home')();

  const cardsFromMessages = t.raw('hero.carousel.cards');

  const [searchQuery, setSearchQuery] = useState('');
  const { isActive: isHeroVisible } = useSectionVisibility(heroAnchor);
  const fogEnabled = useEffectOverride('fog');
  const lightningEnabled = useEffectOverride('lightning');
  const lampEnabled = useEffectOverride('lamp');
  const particlesEnabled = useEffectOverride('particles');
  const { addItem } = usePlanStore(({ addItem }) => ({ addItem }));
  const { setHeaderGradientShifted } = useUIStore(
    ({ setHeaderGradientShifted }) => ({ setHeaderGradientShifted })
  );
  const titleWrapperRef = useRef<HTMLDivElement | null>(null);
  const titleSentinelRef = useRef<HTMLDivElement | null>(null);
  const fogRegionRef = useRef<HTMLDivElement | null>(null);
  const [fogRegionVisible, setFogRegionVisible] = useState(true);

  // Fog draws follow the fog band itself — not the tall hero PageAnchor.
  // Adjacent CRT can leave the hero anchor intersecting while fog is off-screen.
  useEffect(() => {
    const el = fogRegionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (!entry) return;
        setFogRegionVisible(
          entry.isIntersecting && entry.intersectionRatio >= 0.08
        );
      },
      { threshold: [0, 0.08, 0.2, 0.4] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fogPaused = !isHeroVisible || !fogRegionVisible;

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
        ariaLabel={t('hero.title')('GPUCloud')()}
        className="w-full"
      >
        <section
          aria-labelledby="hero-title"
          data-perf-lab="hero"
          className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20"
        >
          {/* Fog limited to the upper hero area, with radial mask to focus around the hero */}
          <div
            ref={fogRegionRef}
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[680px]"
            data-perf-lab="fog-region"
          >
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
                <Fog paused={fogPaused} enableLightning={lightningEnabled} />
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
                  {t('hero.title')('GPUCloud')()}
                </h1>
                <h2 className="text-fg-muted text-center text-2xl font-bold">
                  {t('hero.subtitle')(
                    'Find real GPU capacity. We handle everything else.'
                  )()}
                </h2>
              </div>
              <div className="flex w-full flex-col items-center gap-2 py-3">
                <HaloSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  active={isHeroVisible}
                  onAddToPlan={(config: {
                    type: string;
                    size: number;
                    provider: Provider;
                    region: string;
                  }) => {
                    const pricingFallback = t('haloSearch.pricingFallback')(
                      'Contact for pricing'
                    )();
                    const { price, priceSourceId } = planPriceFromProviderRegion(
                      config.provider,
                      config.region,
                      pricingFallback
                    );
                    addItem({
                      title: config.type,
                      specs: t('haloSearch.gpuCluster')('{count} GPU cluster')({
                        count: config.size
                      }),
                      price,
                      priceSourceId,
                      details: t('haloSearch.providerDetails')(
                        'Provider: {name} ({location})'
                      )({
                        name: config.provider.name,
                        location: config.provider.location
                      }),
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
                        // Keep Streetlamp mounted; pause particle work off-hero.
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
