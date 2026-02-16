import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// import Link from 'next/link';

import { PageAnchor } from '@/components/layout-navigation/links';
import { Button } from '@/components/ui/button';
import { ClickBurstFrame, ClickBurstTarget } from '@/components/ui/click-burst';
import { PredatorFrame, PredatorTarget } from '@/components/ui/predator-button';
import { cn } from '@/lib/style';

export function CTASection() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('TEST');
  const tAnchors = useTranslations();
  const contactAnchor = tAnchors('UI.navLinks.contact.anchor');
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const proofItems = [
    t('cta.proof.0'),
    t('cta.proof.1'),
    t('cta.proof.2')
  ];

  useEffect(() => {
    // Temporary until standardized observers for every section are implemented (for automatic stateful URL/anchor syncing with scroll).
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        setIsSectionVisible(!!entry?.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleRequestQuote = () => {
    // Navigate to home contact section (locale-aware) without auto-scroll.
    // Delay scroll to allow CTA animation to play.
    router.push(`/${locale}#${contactAnchor}`, { scroll: false });
    setTimeout(() => {
      const contactSection = document.getElementById(contactAnchor);
      if (contactSection) {
        const rect = contactSection.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const target = top + rect.height - window.innerHeight;
        window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
      }
    }, 700);
  };

  return (
    <>
      <h2 id="cta-title" className="sr-only">
        {''}
      </h2>
      <PageAnchor
        anchorKey="TEST.cta.anchor"
        ariaLabel={t('cta.button')}
        className="w-full"
      >
        <section
          aria-labelledby="cta-title"
          className="ctaSection relative z-10 mx-auto w-full max-w-6xl px-6 py-16"
          ref={sectionRef}
        >
          <PredatorFrame
            className="relative z-10 flex w-full flex-col items-center justify-center border border-border/40 py-40"
            config={{
              enabled: isSectionVisible,
              freezeRadius: 140,
              maxDisplacement: 20,
              springK: 10.0,
              damping: 4.0,
              accelScale: 0.4,
              vibrateAmplitude: 0.8
            }}
          >
            <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
              <div className="text-fg-main text-2xl font-semibold">
                {t('cta.headline')}
              </div>
              <p className="text-fg-muted text-sm leading-relaxed">
                {t('cta.description')}
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-[11px]">
                {proofItems.map(item => (
                  <span
                    key={item}
                    className="border-border/60 text-fg-soft rounded-full border px-3 py-1"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <PredatorTarget>
                <ClickBurstFrame
                  config={{
                    pairCount: 8,
                    pairSpacing: 20,
                    distance: 150,
                    distanceVariance: 0.4,
                    particleSize: 8,
                    sizeVariance: 0.6,
                    duration: 600,
                    colors: [
                      'var(--color-neon-cyan)',
                      'var(--color-neon-magenta)',
                      'var(--color-neon-electric)',
                      'var(--color-lamp-core)',
                      'var(--color-neon-cyan-soft)',
                      'var(--color-neon-magenta-soft)'
                    ],
                    showRing: true,
                    ringSize: 120,
                    ringStyle: 'filled'
                  }}
                >
                  <ClickBurstTarget>
                    <Button
                      onClick={handleRequestQuote}
                      className={cn(
                        'cta-button-glow rounded-full bg-linear-to-br from-(--color-neon-cyan-soft) to-[color-mix(in_srgb,var(--color-neon-cyan-soft),var(--color-bg-surface)_30%)] px-6 py-3 text-sm tracking-widest text-slate-950 uppercase shadow-[0_0_12px_color-mix(in_srgb,var(--color-neon-cyan-soft)_50%,transparent),0_0_24px_rgba(0,0,0,0.6)] transition-all duration-200 hover:from-(--color-neon-cyan-soft) hover:to-(--color-neon-cyan) hover:shadow-[0_0_16px_color-mix(in_srgb,var(--color-neon-cyan-soft)_60%,transparent),0_0_32px_rgba(0,0,0,0.7)]',
                        isSectionVisible && 'ctaPulse'
                      )}
                    >
                      {t('cta.button')}
                    </Button>
                  </ClickBurstTarget>
                </ClickBurstFrame>
              </PredatorTarget>
              <p className="text-fg-muted text-xs">
                {t('cta.subtitle')}
              </p>
            </div>
          </PredatorFrame>
        </section>
      </PageAnchor>

      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .ctaSection .ctaPulse {
            animation: none;
          }
        }

        .ctaSection .ctaPulse {
          animation: cta-pulse 1.3s linear infinite;
          will-change: transform, box-shadow, filter;
          transform-origin: 50% 50%;
        }

        .ctaSection .ctaPulse::before {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: inherit;
          pointer-events: none;
          z-index: -1;
          opacity: 0.16;
          background:
            radial-gradient(
              circle at 30% 35%,
              color-mix(in srgb, var(--color-neon-cyan) 40%, transparent),
              transparent 55%
            ),
            radial-gradient(
              circle at 70% 55%,
              color-mix(in srgb, var(--color-neon-magenta) 34%, transparent),
              transparent 60%
            );
          filter: blur(12px);
          mix-blend-mode: screen;
          animation: cta-hue 1.3s linear infinite;
        }

        @keyframes cta-pulse {
          0%,
          100% {
            box-shadow:
              0 0 12px
                color-mix(in srgb, var(--color-neon-cyan-soft) 42%, transparent),
              0 0 24px rgba(0, 0, 0, 0.6);
            transform: translateZ(0) scale(1);
            filter: brightness(1) saturate(1);
          }
          10% {
            box-shadow:
              0 0 22px
                color-mix(in srgb, var(--color-neon-cyan-soft) 72%, transparent),
              0 0 56px rgba(0, 0, 0, 0.82),
              0 0 12px
                color-mix(in srgb, var(--color-neon-magenta) 22%, transparent);
            transform: translateZ(0) scale(1.02);
            filter: brightness(1.06) saturate(1.1);
          }
          18% {
            box-shadow:
              0 0 14px
                color-mix(in srgb, var(--color-neon-cyan-soft) 52%, transparent),
              0 0 28px rgba(0, 0, 0, 0.68);
            transform: translateZ(0) scale(1.006);
            filter: brightness(1.04) saturate(1.1);
          }
          30% {
            box-shadow:
              0 0 18px
                color-mix(in srgb, var(--color-neon-cyan-soft) 62%, transparent),
              0 0 44px rgba(0, 0, 0, 0.78);
            transform: translateZ(0) scale(1.012);
            filter: brightness(1.05) saturate(1.08);
          }
          42% {
            box-shadow:
              0 0 16px
                color-mix(in srgb, var(--color-neon-cyan-soft) 60%, transparent),
              0 0 38px rgba(0, 0, 0, 0.74);
            transform: translateZ(0) scale(1.008);
            filter: brightness(1.06) saturate(1.12);
          }
          60% {
            box-shadow:
              0 0 12px
                color-mix(in srgb, var(--color-neon-cyan-soft) 44%, transparent),
              0 0 24px rgba(0, 0, 0, 0.62);
            transform: translateZ(0) scale(1);
            filter: brightness(1) saturate(1);
          }
        }

        @keyframes cta-hue {
          0%,
          100% {
            filter: hue-rotate(0deg) brightness(1);
            opacity: 0.14;
          }
          50% {
            filter: hue-rotate(10deg) brightness(1.1);
            opacity: 0.22;
          }
        }

        .ctaSection .cta-button-glow {
          position: relative;
          isolation: isolate;
          transition: box-shadow 0.3s ease;
        }

        .ctaSection .cta-button-glow:hover {
          box-shadow:
            0 0 20px var(--color-neon-cyan),
            0 0 40px var(--color-neon-cyan),
            0 0 60px var(--color-neon-magenta),
            0 0 80px var(--color-neon-electric),
            0 0 12px
              color-mix(in srgb, var(--color-neon-cyan-soft) 50%, transparent),
            0 0 24px rgba(0, 0, 0, 0.6);
        }

        @keyframes cta-shadow-pulse {
          0%,
          100% {
            box-shadow:
              0 0 20px var(--color-neon-cyan),
              0 0 40px var(--color-neon-cyan),
              0 0 60px var(--color-neon-magenta),
              0 0 80px var(--color-neon-electric),
              0 0 12px
                color-mix(in srgb, var(--color-neon-cyan-soft) 50%, transparent),
              0 0 24px rgba(0, 0, 0, 0.6);
          }
          50% {
            box-shadow:
              0 0 30px var(--color-neon-cyan),
              0 0 60px var(--color-neon-magenta),
              0 0 90px var(--color-neon-electric),
              0 0 120px var(--color-lamp-core),
              0 0 18px
                color-mix(in srgb, var(--color-neon-cyan-soft) 70%, transparent),
              0 0 36px rgba(0, 0, 0, 0.8);
          }
        }
      `}</style>
    </>
  );
}
