import { useTranslations } from 'next-intl';

// import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ClickBurstFrame, ClickBurstTarget } from '@/components/ui/click-burst';
import { PredatorFrame, PredatorTarget } from '@/components/ui/predator-button';

export function CTASection() {
  const t = useTranslations('TEST');

  return (
    <>
      <h2 id="cta-title" className="sr-only">
        {''}
      </h2>
      <section
        id="cta"
        aria-labelledby="cta-title"
        className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20"
      >
        <PredatorFrame
          className="relative z-10 flex w-full flex-col items-center justify-center border border-red-500 py-52"
          config={{
            freezeRadius: 140,
            maxDisplacement: 100,
            springK: 10.0,
            damping: 4.0,
            accelScale: 0.4,
            vibrateAmplitude: 0.8 // More subtle vibration
          }}
        >
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
                  // asChild
                  className="cta-button-glow rounded-full bg-linear-to-br from-(--color-neon-cyan-soft) to-[color-mix(in_srgb,var(--color-neon-cyan-soft),var(--color-bg-surface)_30%)] px-6 py-3 text-sm tracking-widest text-slate-950 uppercase shadow-[0_0_12px_color-mix(in_srgb,var(--color-neon-cyan-soft)_50%,transparent),0_0_24px_rgba(0,0,0,0.6)] transition-all duration-200 hover:from-(--color-neon-cyan-soft) hover:to-(--color-neon-cyan) hover:shadow-[0_0_16px_color-mix(in_srgb,var(--color-neon-cyan-soft)_60%,transparent),0_0_32px_rgba(0,0,0,0.7)]"
                >
                  {/* <Link href="#contact"> */}
                  {t('cta.button')}
                  {/* </Link> */}
                </Button>
              </ClickBurstTarget>
            </ClickBurstFrame>
          </PredatorTarget>
          <p className="text-fg-muted mt-4 text-center text-sm">
            {t('cta.subtitle')}
          </p>
        </PredatorFrame>
      </section>

      <style jsx>{`
        .cta-button-glow {
          position: relative;
          transition: filter 0.3s ease;
        }

        .cta-button-glow::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(
            45deg,
            var(--color-neon-cyan),
            var(--color-neon-magenta),
            var(--color-neon-electric)
          );
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          filter: blur(8px);
          animation: cta-glow-pulse 3s ease-in-out infinite;
          transition: opacity 0.3s ease;
        }

        .cta-button-glow:hover::before {
          opacity: 0.6;
        }

        @keyframes cta-glow-pulse {
          0%,
          100% {
            filter: blur(8px) brightness(1);
            transform: scale(1);
          }
          50% {
            filter: blur(12px) brightness(1.2);
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
}
