'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

import { CatalogAttribution } from '@/components/catalog/CatalogAttribution';
import {
  PageAnchor,
  useSectionVisibility
} from '@/components/layout-navigation/links';
import { MorphingText } from '@/components/ui/morphing-text';
import { useEffectOverride } from '@/lib/animation/useEffectOverride';
import {
  FEATURED_AVAILABILITY_COUNT,
  getFeaturedCatalogGpus
} from '@/lib/catalog/sort';
import { getMinChipHourlyFrom } from '@/lib/catalog/pricing';
import { usePlanStore } from '@/stores/plan';

import { gpuCatalog } from '@public/data';

type StockLevel = 'high' | 'medium' | 'low';

const FEATURED_GPU_IMAGE = '/images/gpu-card.svg';

function stockFromOfferings(count: number): StockLevel {
  if (count >= 4) return 'high';
  if (count >= 2) return 'medium';
  return 'low';
}

type FeaturedGpu = {
  model: string;
  description: string;
  shortDetails: string;
  fromPrice: number | null;
  fromPriceSourceId: string | null;
  available: boolean;
  memoryGB: number | null;
  stock: StockLevel;
  image: string;
};

export function AvailabilitySection() {
  const t = useTranslations('TEST');
  const tPlan = useTranslations('TEST.plan');
  const availabilityAnchor = t('availability.anchor');
  const { addItem } = usePlanStore(({ addItem }) => ({ addItem }));
  const crtEnabled = useEffectOverride('crt');
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const addTimeoutRef = useRef<number | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  const { isActive: isSectionVisible } =
    useSectionVisibility(availabilityAnchor);

  // Keep CRT DOM/filter warm; pause filter + CSS animations off-section
  // instead of remounting (remount caused re-entry hitch).
  const crtActive = crtEnabled && isSectionVisible;

  const featuredGpus = useMemo<FeaturedGpu[]>(() => {
    return getFeaturedCatalogGpus(
      gpuCatalog,
      FEATURED_AVAILABILITY_COUNT
    ).map(gpu => {
      const min = getMinChipHourlyFrom(gpu);

      return {
        model: gpu.model,
        description: gpu.description,
        shortDetails: gpu.shortDetails,
        fromPrice: min.hourlyFrom,
        fromPriceSourceId: min.sourceId,
        available: gpu.offerings.length > 0,
        memoryGB: gpu.memoryGB ?? null,
        stock: stockFromOfferings(gpu.offerings.length),
        image: FEATURED_GPU_IMAGE
      };
    });
  }, []);

  const barrelMap = useMemo(() => {
    if (typeof document === 'undefined') {
      return '';
    }

    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const img = ctx.createImageData(size, size);
    const k = 0.18;

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const nx = (x / (size - 1)) * 2 - 1;
        const ny = (y / (size - 1)) * 2 - 1;
        const r2 = nx * nx + ny * ny;
        const dx = Math.max(-0.5, Math.min(0.5, nx * r2 * k));
        const dy = Math.max(-0.5, Math.min(0.5, ny * r2 * k));
        const red = Math.round((dx + 0.5) * 255);
        const green = Math.round((dy + 0.5) * 255);

        const idx = (y * size + x) * 4;
        img.data[idx] = red;
        img.data[idx + 1] = green;
        img.data[idx + 2] = 0;
        img.data[idx + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
    return canvas.toDataURL('image/png');
  }, []);

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    if (typeof ResizeObserver === 'undefined') return;
    // Keep sizes current while CRT is enabled so re-entry does not resize-spike.
    if (!crtEnabled) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setScreenSize({
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height))
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [crtEnabled]);

  useEffect(() => {
    return () => {
      if (addTimeoutRef.current !== null) {
        window.clearTimeout(addTimeoutRef.current);
      }
    };
  }, []);

  const curvatureScale = useMemo(() => {
    if (!screenSize.width || !screenSize.height) return 10;
    const minDim = Math.min(screenSize.width, screenSize.height);
    return Math.max(9, Math.round(minDim * 0.024));
  }, [screenSize.height, screenSize.width]);

  const pixelationRes = useMemo(() => {
    if (!screenSize.width || !screenSize.height) return null;
    const pixelationScale = 16;
    return {
      width: Math.max(1, Math.round(screenSize.width / pixelationScale)),
      height: Math.max(1, Math.round(screenSize.height / pixelationScale))
    };
  }, [screenSize.height, screenSize.width]);

  const posterizeTable = useMemo(() => {
    const steps = 8;
    const values = Array.from({ length: steps }, (_, idx) => {
      const value = idx / (steps - 1);
      return value.toFixed(3);
    });
    return values.join(' ');
  }, []);

  const filterPadding = useMemo(() => {
    const maxDim = Math.max(screenSize.width, screenSize.height);
    return Math.max(16, Math.round(maxDim * 0.6));
  }, [screenSize.height, screenSize.width]);

  const filterWidth = Math.max(1, screenSize.width + filterPadding * 2);
  const filterHeight = Math.max(1, screenSize.height + filterPadding * 2);

  return (
    <PageAnchor
      anchorKey="TEST.availability.anchor"
      ariaLabel={t('availability.title')}
      className="w-full"
    >
      <section className="w-full" data-perf-lab="crt">
        <div className="availabilityFrame border-border/60 bg-bg-surface shadow-lamp-soft mx-auto w-full max-w-6xl overflow-hidden rounded-xl border">
          <div className="availabilityShell">
            <div className="availabilityScreenFrame">
              <div
                ref={screenRef}
                className={
                  crtEnabled
                    ? crtActive
                      ? 'availabilityScreen'
                      : 'availabilityScreen availabilityScreenPaused'
                    : 'availabilityScreenFlat'
                }
              >
                {crtEnabled ? (
                  <>
                    <div aria-hidden="true" className="availabilityScanlines" />
                    <div aria-hidden="true" className="availabilityScanline" />
                    <div
                      aria-hidden="true"
                      className="availabilityScanlineFast"
                    />
                    <div aria-hidden="true" className="availabilityCrystal" />
                  </>
                ) : null}
                <div
                  className={
                    crtEnabled
                      ? 'availabilityContent px-6 py-8 sm:px-8 sm:py-9'
                      : 'px-6 py-8 sm:px-8 sm:py-9'
                  }
                >
                  <div className="availabilityContentInner">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h2 className="text-fg-main text-xl font-semibold">
                          {t('availability.title')}
                        </h2>
                        <p className="text-fg-muted mt-1 text-[11px]">
                          {t('availability.subtitle')}
                        </p>
                      </div>
                      <div className="text-fg-muted flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase">
                        <span>{t('availability.liveLabel')}</span>
                        <span className="bg-ui-success h-2 w-2 rounded-full" />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {featuredGpus.map(gpu => {
                        const hasPrice = gpu.fromPrice !== null;
                        const priceText =
                          gpu.fromPrice === null
                            ? t('availability.priceUnknown')
                            : `$${gpu.fromPrice.toFixed(2)}`;
                        const memoryText = gpu.memoryGB
                          ? `${gpu.memoryGB}GB`
                          : null;
                        const isAdded = recentlyAdded === gpu.model;
                        const ctaText = isAdded
                          ? `${t('availability.added')} ✓`
                          : `${t('availability.cta')} →`;

                        return (
                          <button
                            key={gpu.model}
                            type="button"
                            className="border-border/60 bg-bg-surface hover:border-ui-active-soft hover:bg-bg-surface/90 shadow-lamp-card group flex h-full flex-col gap-2 rounded-lg border p-2 text-left transition hover:shadow-lamp-soft"
                              onClick={() => {
                                addItem({
                                  title: gpu.model,
                                  specs: tPlan('tbdShort'),
                                  price:
                                    gpu.fromPrice !== null
                                      ? `${t('availability.fromLabel')} $${gpu.fromPrice.toFixed(2)}/hr`
                                      : tPlan('tbdPrice'),
                                  priceSourceId:
                                    gpu.fromPriceSourceId ?? undefined,
                                  details: tPlan('tbdDetails'),
                                  gpuModel: gpu.model
                                });
                                setRecentlyAdded(gpu.model);
                                if (addTimeoutRef.current !== null) {
                                  window.clearTimeout(addTimeoutRef.current);
                                }
                                addTimeoutRef.current = window.setTimeout(() => {
                                  setRecentlyAdded(prev =>
                                    prev === gpu.model ? null : prev
                                  );
                                }, 1200);
                              }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2.5">
                                  <div className="border-border/60 bg-bg-page/80 h-10 w-14 overflow-hidden rounded-md border">
                                    <Image
                                      src={gpu.image}
                                      alt={gpu.model}
                                      width={120}
                                      height={72}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="text-fg-main text-sm font-semibold">
                                      {gpu.model}
                                    </div>
                                    {memoryText && (
                                      <div className="text-fg-muted mt-0.5 text-[10px]">
                                        {t('availability.memoryLabel', {
                                          memory: memoryText
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-fg-muted text-[9px]">
                                  {t('availability.fromLabel')}
                                </div>
                                <div className="text-fg-main text-[11px] font-semibold">
                                  {priceText}
                                  {hasPrice && (
                                    <span className="text-fg-muted">
                                      {t('availability.perHour')}
                                    </span>
                                  )}
                                </div>
                                {gpu.fromPriceSourceId ? (
                                  <div className="mt-0.5 flex justify-end">
                                    <CatalogAttribution
                                      sourceId={gpu.fromPriceSourceId}
                                    />
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            <div className="text-fg-muted text-[11px]">
                              {gpu.description}
                            </div>

                            <div className="mt-auto flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <div className="text-fg-muted flex items-center gap-2 text-[10px]">
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${gpu.available ? 'bg-ui-success' : 'bg-border'}`}
                                  />
                                  <span>
                                    {gpu.available
                                      ? t('availability.inStockLabel')
                                      : t('availability.limitedLabel')}
                                  </span>
                                </div>
                                <div
                                  className={`text-ui-active-soft flex items-center justify-end ${
                                    isAdded ? '' : 'transition-transform group-hover:translate-x-0.5'
                                  }`}
                                >
                                  <MorphingText
                                    text={ctaText}
                                    className="w-[120px]"
                                    textClassName="text-ui-active-soft text-[11px] font-semibold text-right"
                                    morphTime={0.6}
                                    blurConstant={4}
                                    filterBlur={0.3}
                                    thresholdB={-80}
                                    rgbScale={0.7}
                                  />
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {crtEnabled ? (
            <svg className="availabilityFilterDefs" aria-hidden="true">
              <defs>
                <filter
                  id="availability-crt-curvature"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                  x={-filterPadding}
                  y={-filterPadding}
                  width={filterWidth}
                  height={filterHeight}
                  filterRes={
                    pixelationRes
                      ? `${pixelationRes.width} ${pixelationRes.height}`
                      : undefined
                  }
                >
                  <feImage
                    href={barrelMap}
                    x={-filterPadding}
                    y={-filterPadding}
                    width={filterWidth}
                    height={filterHeight}
                    preserveAspectRatio="none"
                    result="Map"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="Map"
                    scale={curvatureScale}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="displaced"
                  />
                  <feComponentTransfer in="displaced">
                    <feFuncR type="discrete" tableValues={posterizeTable} />
                    <feFuncG type="discrete" tableValues={posterizeTable} />
                    <feFuncB type="discrete" tableValues={posterizeTable} />
                  </feComponentTransfer>
                </filter>
              </defs>
            </svg>
            ) : null}
          </div>
        </div>
      </section>
      <style jsx>{`
        .availabilityFrame {
          position: relative;
          overflow: hidden;
        }

        .availabilityShell {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .availabilityScreenFrame {
          position: relative;
          z-index: 1;
          overflow: visible;
          box-shadow:
            inset 0 0 0 1px
              color-mix(in srgb, var(--color-lamp-glow) 22%, transparent),
            0 0 28px
              color-mix(in srgb, var(--color-lamp-glow) 16%, transparent);
        }

        .availabilityScreen {
          position: relative;
          z-index: 1;
          border-radius: inherit;
          filter: url(#availability-crt-curvature);
          transform: translateZ(0);
          overflow: hidden;
          isolation: isolate;
          image-rendering: pixelated;
          box-shadow: 0 0 0 1px rgba(10, 12, 18, 0.8);
        }

        /* M3.0 override: keep layout without CRT filter/scanline cost. */
        .availabilityScreenFlat {
          position: relative;
          z-index: 1;
          border-radius: inherit;
          overflow: hidden;
          isolation: isolate;
        }

        /* Off-section: keep CRT DOM/filter defs warm; drop live filter + CSS cost. */
        .availabilityScreenPaused {
          filter: none;
          image-rendering: auto;
        }

        .availabilityScreenPaused .availabilityScanlines,
        .availabilityScreenPaused .availabilityScanline,
        .availabilityScreenPaused .availabilityScanlineFast,
        .availabilityScreenPaused .availabilityCrystal {
          visibility: hidden;
          animation-play-state: paused;
        }

        .availabilityScreenPaused .availabilityScanlines::before,
        .availabilityScreenPaused .availabilityScanlines::after {
          animation-play-state: paused;
        }

        .availabilityScreenPaused .availabilityContent {
          animation: none;
          text-shadow: none;
          -webkit-font-smoothing: antialiased;
        }

        .availabilityContent {
          position: relative;
          z-index: 1;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: auto;
          text-rendering: optimizeSpeed;
          font-variant-ligatures: none;
          font-smooth: never;
          text-shadow: 0 0 3px rgba(0, 0, 0, 0.4);
          animation:
            availability-blur 6s infinite,
            availability-text-shadow 0.15s infinite;
        }

        .availabilityContentInner {
          width: 100%;
        }

        .availabilityContent * {
          text-shadow: inherit;
          -webkit-font-smoothing: inherit;
          -moz-osx-font-smoothing: inherit;
          text-rendering: inherit;
          font-variant-ligatures: inherit;
        }

        .availabilityFilterDefs {
          position: absolute;
          width: 0;
          height: 0;
          overflow: hidden;
        }

        /* Tube display edges (vignette + inner glow). */
        .availabilityScreen::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.7;
          background-image:
            radial-gradient(
              closest-side at 50% 50%,
              rgba(0, 0, 0, 0) 52%,
              rgba(0, 0, 0, 0.85) 100%
            ),
            radial-gradient(
              closest-side at 50% 50%,
              color-mix(in srgb, var(--color-lamp-glow) 22%, transparent) 0%,
              rgba(0, 0, 0, 0) 62%
            ),
            linear-gradient(
              to bottom,
              color-mix(in srgb, var(--color-lamp-core) 16%, transparent),
              rgba(0, 0, 0, 0)
            );
          /* CRT-ish tube edge + faint scanlines */
          mix-blend-mode: normal;
          box-shadow:
            inset 0 0 0 1px
              color-mix(in srgb, var(--color-lamp-glow) 26%, transparent),
            inset 0 0 70px rgba(0, 0, 0, 0.6),
            inset 0 0 120px rgba(0, 0, 0, 0.5);
        }

        /* Dynamic scanlines: very subtle motion, independent of the tube/vignette. */
        .availabilityScanlines {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          z-index: 2;
          opacity: 0.75;
          mix-blend-mode: normal;
        }

        .availabilityScanline,
        .availabilityScanlineFast {
          position: absolute;
          left: 0;
          width: 100%;
          height: 100px;
          z-index: 3;
          pointer-events: none;
          background: linear-gradient(
            0deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(255, 255, 255, 0.2) 10%,
            rgba(0, 0, 0, 0.1) 100%
          );
          opacity: 0.1;
          bottom: 100%;
          animation: availability-scanline 10s linear infinite;
        }

        .availabilityScanlineFast {
          height: 100px;
          opacity: 0.1;
          animation-duration: 4s;
          z-index: 4;
        }

        .availabilityCrystal {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          opacity: 0.25;
          background:
            linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.18) 50%),
            linear-gradient(
              90deg,
              rgba(255, 0, 0, 0.04),
              rgba(0, 255, 0, 0.02),
              rgba(0, 0, 255, 0.04)
            );
          background-size:
            100% 3px,
            2px 100%;
          mix-blend-mode: screen;
        }

        .availabilityScanlines::before,
        .availabilityScanlines::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
        }

        /* Dense scanlines (codepen-intense baseline) */
        .availabilityScanlines::before {
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(0, 0, 0, 0.22) 51%
          );
          background-size: 100% 4px;
          opacity: 0.9;
          animation: scanlines 1.2s steps(55) infinite;
        }

        /* Moving scanline */
        .availabilityScanlines::after {
          width: 100%;
          height: 2px;
          top: 0;
          left: 0;
          background: rgba(0, 0, 0, 0.22);
          opacity: 0.55;
          animation: scanline 6.5s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .availabilityScanlines {
            animation: none;
          }
          .availabilityScanlines::before,
          .availabilityScanlines::after {
            animation: none;
          }
          .availabilityScanline,
          .availabilityScanlineFast,
          .availabilityContent {
            animation: none;
          }
        }

        @keyframes scanline {
          0% {
            transform: translate3d(0, 200000%, 0);
          }
        }

        @keyframes scanlines {
          0% {
            background-position: 0 50%;
          }
        }

        @keyframes availability-scanline {
          0% {
            bottom: 100%;
          }
          80% {
            bottom: 100%;
          }
          100% {
            bottom: 0%;
          }
        }

        @keyframes availability-blur {
          0%,
          96%,
          100% {
            filter: blur(0);
          }
          97% {
            filter: blur(0.6px);
          }
          98% {
            filter: blur(0.2px);
          }
        }

        @keyframes availability-text-shadow {
          0% {
            text-shadow:
              0.5px 0 1px
                color-mix(in srgb, var(--color-neon-cyan) 35%, transparent),
              -0.5px 0 1px
                color-mix(in srgb, var(--color-neon-magenta) 20%, transparent),
              0 0 3px rgba(0, 0, 0, 0.35);
          }
          45% {
            text-shadow:
              1.2px 0 1px
                color-mix(in srgb, var(--color-neon-cyan) 45%, transparent),
              -1.2px 0 1px
                color-mix(in srgb, var(--color-neon-magenta) 30%, transparent),
              0 0 3px rgba(0, 0, 0, 0.4);
          }
          100% {
            text-shadow:
              0.35px 0 1px
                color-mix(in srgb, var(--color-neon-cyan) 30%, transparent),
              -0.35px 0 1px
                color-mix(in srgb, var(--color-neon-magenta) 20%, transparent),
              0 0 3px rgba(0, 0, 0, 0.35);
          }
        }

        .availabilityScreen::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.045;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          mix-blend-mode: overlay;
        }
      `}</style>
    </PageAnchor>
  );
}
