'use client';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { FlickeringCard } from '@/components/flickering-card';
import { ContactWithCartForm } from '@/components/forms/contact-with-cart-form';
import { Header } from '@/components/layout-navigation/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from '@/components/ui/card';
import { Fog } from '@/components/ui/fog';
import { HaloSearch } from '@/components/ui/halo-search';
import { SpotlightArea } from '@/components/ui/spotlight-area';
import { LampFlickerProvider, Streetlamp } from '@/components/ui/streetlamp';
import { cn } from '@/lib/style';
import { useCartStore } from '@/stores/cart';

type CarouselCard = {
  id: string;
  title: string;
  description: string;
};

const heroAccentGradient =
  'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-neon-electric) 65%, transparent), transparent)';
const heroCyanGradient =
  'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-neon-cyan) 75%, transparent), transparent)';
const heroCyanGlowGradient =
  'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-neon-cyan) 45%, transparent), transparent)';

export default function TestPage() {
  const locale = useLocale();
  const t = useTranslations('TEST');
  const cardsFromMessages = useMemo<CarouselCard[]>(() => {
    const raw: unknown = t.raw('hero.carousel.cards');
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.flatMap(card => {
      if (typeof card !== 'object' || card === null) {
        return [];
      }

      const candidate = card as Partial<CarouselCard>;
      if (
        typeof candidate.id !== 'string' ||
        typeof candidate.title !== 'string' ||
        typeof candidate.description !== 'string'
      ) {
        return [];
      }

      return [
        {
          id: candidate.id,
          title: candidate.title,
          description: candidate.description
        }
      ];
    });
  }, [t]);
  const [cards, setCards] = useState<CarouselCard[]>(cardsFromMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const addItem = useCartStore(state => state.addItem);

  const handleNext = () => {
    setCards(prev => {
      if (prev.length <= 1) return prev;
      const first = prev[0]!;
      const rest: CarouselCard[] = prev.slice(1);
      return [...rest, first];
    });
  };

  const handlePrev = () => {
    setCards(prev => {
      if (prev.length <= 1) return prev;
      const lastIndex = prev.length - 1;
      const last = prev[lastIndex]!;
      const rest: CarouselCard[] = prev.slice(0, lastIndex);
      return [last, ...rest];
    });
  };

  return (
    <>
      <Header />
      <div className="bg-bg-page text-fg-main relative flex min-h-[85vh] flex-col items-center justify-start gap-8 overflow-hidden pt-16 pb-12">
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
          <div className="relative z-10 flex w-full flex-col items-center pt-24">
            <h1
              className={cn('text-fg-main mb-8 text-center text-6xl font-bold')}
            >
              {t('hero.title')}
            </h1>
            <div className="flex w-full justify-center">
              <HaloSearch
                value={searchQuery}
                onChange={setSearchQuery}
                onAddToCart={addItem}
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
                  particleDensity: 50,
                  particleColor: '#F9FAFB'
                }}
              />
              {/* Radial Gradient to prevent sharp edges (transparent mask only, no black fill) */}
              <div className="pointer-events-none absolute inset-0 h-full w-full mask-[radial-gradient(350px_200px_at_top,transparent_20%,white)]" />
            </div>
          </div>
          <div className="relative -top-32 z-10 flex flex-col items-center gap-3">
            <div className="flex gap-4">
              {cards.map((card, index) => (
                <div
                  key={`card-container-${card.id}-${index}`}
                  className="relative"
                >
                  <FlickeringCard
                    index={index}
                    label={t('hero.featureLabel')}
                    title={card.title}
                    description={card.description}
                  />
                  {/* Card shadow */}
                  <div
                    className={cn(
                      'absolute top-full -left-[54px] mt-2 h-12 w-[368px]',
                      index === 0
                        ? '-left-[74px]'
                        : index === 2
                          ? '-left-[34px]'
                          : '-left-[54px]'
                    )}
                    style={{
                      background: `linear-gradient(to bottom,
                        rgba(0, 0, 0, 0.9) 0%,
                        rgba(0, 0, 0, 0.5) 30%,
                        rgba(0, 0, 0, 0.2) 60%,
                        transparent 100%
                      )`,
                      clipPath:
                        index === 0
                          ? `polygon(20% 0%, 90% 0%, 70% 100%, 10% 100%)` // Right card: skewed left
                          : index === 2
                            ? `polygon(10% 0%, 80% 0%, 90% 100%, 30% 100%)` // Left card: skewed right
                            : `polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)`, // Middle card: symmetric
                      filter: 'blur(12px)'
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="z-30 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                className="group hover:text-fg-main flex h-10 w-10 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-fg-main)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-surface)_65%,transparent)] text-[color-mix(in_srgb,var(--color-fg-main)_70%,transparent)] transition hover:border-[color-mix(in_srgb,var(--color-fg-main)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-bg-surface)_85%,transparent)]"
                aria-label={t('hero.controls.previous')}
              >
                <span className="text-fg-main text-lg leading-none transition-transform group-hover:-translate-x-px">
                  ‹
                </span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="group hover:text-fg-main flex h-10 w-10 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-fg-main)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-surface)_65%,transparent)] text-[color-mix(in_srgb,var(--color-fg-main)_70%,transparent)] transition hover:border-[color-mix(in_srgb,var(--color-fg-main)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-bg-surface)_85%,transparent)]"
                aria-label={t('hero.controls.next')}
              >
                <span className="text-fg-main text-lg leading-none transition-transform group-hover:translate-x-px">
                  ›
                </span>
              </button>
            </div>
          </div>
        </LampFlickerProvider>
        <Card
          className="bg-card text-card-foreground w-[320px] overflow-clip border-[color-mix(in_srgb,var(--color-card-border)_100%,transparent)]"
          style={{
            boxShadow:
              '0 25px 80px color-mix(in srgb, var(--color-lamp-glow) 60%, transparent)'
          }}
        >
          <SpotlightArea
            spotlightMode="fixed"
            spotlightPosition={{ x: '80%', y: '40%' }}
            radius={250}
            revealOnHover={false}
          >
            <CardContent className="flex flex-col gap-4 p-6">
              <CardTitle
                className={cn(
                  'text-fg-main pb-1 text-xl font-semibold tracking-tight'
                )}
              >
                {t('spotlight.title')}
              </CardTitle>
              <div className="h-px w-full bg-[color-mix(in_srgb,var(--color-card-border)_65%,transparent)]" />
              <CardDescription
                className={cn('text-fg-soft text-sm leading-relaxed')}
              >
                {t('spotlight.description')}
              </CardDescription>
            </CardContent>
          </SpotlightArea>
        </Card>

        {/* CTA Section */}
        <div className="relative z-10 mt-16 flex justify-center">
          <Button
            asChild
            className="rounded-full bg-linear-to-br from-cyan-400 to-blue-600 px-6 py-3 text-sm tracking-widest text-slate-950 uppercase shadow-[0_0_22px_rgba(0,255,255,0.9),0_0_46px_rgba(0,0,0,0.9)] transition-all duration-200 hover:from-cyan-400 hover:to-pink-500 hover:shadow-[0_0_30px_rgba(0,255,255,1),0_0_52px_rgba(0,0,0,1)]"
          >
            <Link href="#contact">{t('cta.button')}</Link>
          </Button>
        </div>
      </div>

      {/* Contact Form Section */}
      <section
        id="contact"
        className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20"
      >
        <div className="mb-8">
          <div className="text-fg-soft mb-2 text-xs tracking-[0.2em] uppercase">
            {t('contact.eyebrow')}
          </div>
          <h2 className="text-fg-main mb-2 text-2xl font-semibold">
            {t('contact.title')}
          </h2>
          <p className="text-fg-soft max-w-2xl text-base">
            {t('contact.subtitle')}
          </p>
        </div>

        <ContactWithCartForm key={`contact-form-${locale}`} />
      </section>
    </>
  );
}
