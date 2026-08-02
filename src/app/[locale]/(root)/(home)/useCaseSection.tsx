'use client';

import { useEffect, useState } from 'react';
import { translateWithDefault, useAppTranslations } from '@/i18n';

import { PageAnchor } from '@/components/layout-navigation/links';
import { UseCaseGpuConfigureLayer } from '@/components/modals/UseCaseGpuConfigureLayer';
import { UseCaseTemplatesModal } from '@/components/modals/UseCaseTemplatesModal';
import { Button } from '@/components/ui/button';
import { smoothScrollToContact } from '@/lib/animation/scrollPause';
import { useCases, useCaseTemplateGroups } from '@/lib/useCaseTemplates';

import type { UseCaseId } from '@/lib/useCaseTemplates';

/** Match DialogContent `duration-200` exit so we unmount after Radix closes. */
const TEMPLATES_DIALOG_EXIT_MS = 220;

export function UseCaseSection() {
  const t = useAppTranslations('TEST');
  const tAnchors = useAppTranslations();
  const contactAnchor = tAnchors('UI.navLinks.contact.anchor')('contact')();
  const [selectedUseCaseId, setSelectedUseCaseId] =
    useState<UseCaseId | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [configureGpuModel, setConfigureGpuModel] = useState<string | null>(
    null
  );
  const [configuringItemId, setConfiguringItemId] = useState<string | null>(
    null
  );

  // Controlled Dialog does not call onOpenChange when `open` flips false from
  // Add and Configure. Keep the tree mounted through the exit animation, then
  // drop selectedUseCaseId so hooks/listeners fully unmount.
  useEffect(() => {
    if (isModalOpen || !selectedUseCaseId) return;
    const timer = window.setTimeout(() => {
      setSelectedUseCaseId(null);
    }, TEMPLATES_DIALOG_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [isModalOpen, selectedUseCaseId]);

  const handleContact = () => {
    void smoothScrollToContact(contactAnchor, { block: 'center' });
  };

  return (
    <PageAnchor
      anchorKey="TEST.useCases.anchor"
      ariaLabel={t('useCases.title')('What are you building?')()}
      className="w-full"
    >
      <section className="w-full min-h-screen">
        <div className="useCaseShell mx-auto flex w-full max-w-6xl flex-col px-6 py-10">
          <div className="text-center">
            <h2 className="text-fg-main text-3xl font-semibold">
              {t('useCases.title')('What are you building?')()}
            </h2>
            <p className="text-fg-muted mt-2 text-sm">
              {t('useCases.subtitle')('Select your use case to see recommended configurations tailored to your workload.')()}
            </p>
          </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map(useCase => {
            const Icon = useCase.icon;
            const isSelected = useCase.id === selectedUseCaseId && isModalOpen;

            return (
              <button
                key={useCase.id}
                type="button"
                className={`useCaseCard border-border/60 bg-bg-surface hover:border-ui-active-soft hover:bg-bg-surface/90 shadow-lamp-card group flex h-full flex-col gap-3 rounded-xl border p-4 text-left transition hover:shadow-lamp-soft ${
                  isSelected ? 'border-ui-active-soft shadow-lamp-soft' : ''
                }`}
                onClick={() => {
                  setSelectedUseCaseId(useCase.id);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex flex-col items-center gap-2.5 text-center">
                  <div className="bg-ui-active-soft/20 text-ui-active-soft flex h-10 w-10 items-center justify-center rounded-xl">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-fg-main text-base font-semibold">
                    {translateWithDefault(
                      t,
                      useCase.nameKey,
                      useCase.nameDefault
                    )}
                  </div>
                  <p className="text-fg-muted text-xs">
                    {translateWithDefault(
                      t,
                      useCase.descriptionKey,
                      useCase.descriptionDefault
                    )}
                  </p>
                  <p className="text-fg-soft text-[11px]">
                    {t('useCases.templateCount')('{count, plural, one {# template option} other {# template options}}')({
                      count:
                        useCaseTemplateGroups[useCase.id]?.templates.length ?? 0
                    })}
                  </p>
                </div>

                <div className="bg-border/60 h-px w-full" />

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {useCase.exampleKeys.slice(0, 4).map((exampleKey, index) => {
                    const exampleDefault = useCase.exampleDefaults[index]!;
                    return (
                    <div key={exampleKey} className="flex items-start gap-2">
                      <span className="bg-ui-active-soft/70 mt-1.5 h-1.5 w-1.5 rounded-full" />
                      <span className="text-fg-soft text-[11px]">
                        {translateWithDefault(t, exampleKey, exampleDefault)}
                      </span>
                    </div>
                    );
                  })}
                </div>

                <div className="text-ui-active-soft mt-auto inline-flex items-center gap-1 text-[11px] font-semibold opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100">
                  {t('useCases.configureAnchor')('Configure template')()}
                  <span aria-hidden>→</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-fg-muted text-sm">{t('useCases.helper')('Not sure what you need? Have multiple use cases? Want a custom configuration?')()}</p>
          <Button
            type="button"
            variant="outline"
            onClick={handleContact}
            className="mt-3 h-8 px-3 text-xs"
          >
            {t('useCases.helperCta')('Contact us')()}
          </Button>
        </div>
        </div>

        {selectedUseCaseId && (
          <UseCaseTemplatesModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            useCaseId={selectedUseCaseId}
            onRequestConfigure={(gpuModel, itemId) => {
              // Mount configure layer first, then close Dialog so Radix can
              // run its exit animation / release scroll-lock before unmount.
              setConfigureGpuModel(gpuModel);
              setConfiguringItemId(itemId);
              setIsModalOpen(false);
            }}
          />
        )}

        {configureGpuModel && configuringItemId && (
          <UseCaseGpuConfigureLayer
            gpuModel={configureGpuModel}
            configuringItemId={configuringItemId}
            onClose={() => {
              setConfigureGpuModel(null);
              setConfiguringItemId(null);
            }}
          />
        )}
      </section>
      <style jsx>{`
        .useCaseShell {
          position: relative;
        }

        .useCaseCard {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .useCaseCard > * {
          position: relative;
          z-index: 1;
        }

        /* Blueprint grid texture INSIDE cards (not across the whole section). */
        .useCaseCard::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.22;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.06) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            );
          background-size: 28px 28px;
          mix-blend-mode: screen;
          mask-image: radial-gradient(
            circle at 50% 35%,
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.55) 70%,
            rgba(0, 0, 0, 0) 92%
          );
          -webkit-mask-image: radial-gradient(
            circle at 50% 35%,
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.55) 70%,
            rgba(0, 0, 0, 0) 92%
          );
        }

        .useCaseCard::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.06;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
          background-size: 220px 220px;
          mix-blend-mode: overlay;
        }
      `}</style>
    </PageAnchor>
  );
}
