'use client';

import React from 'react';
import { useAppTranslations } from '@/i18n';

import { CatalogAttribution } from '@/components/catalog/CatalogAttribution';
import type { Provider } from '@/types/gpu';

interface OverviewTabProps {
  selectedProvider: Provider;
  selectedRegion: string;
  selectedSize: number;
  currentDialogOption: {
    type: string;
  };
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  selectedProvider,
  selectedRegion,
  selectedSize,
  currentDialogOption
}) => {
  const t = useAppTranslations('TEST.gpuModal.overview');
  const selectedRegionData = selectedProvider.regions.find(
    r => r.name === selectedRegion
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 pt-4 pb-1.5 text-center">
        <div className="text-fg-main text-base font-semibold leading-tight">
          {t('clusterTitle')('{count, plural, one {{count} × {model} GPU} other {{count} × {model} GPUs}}')({
            count: selectedSize,
            model: currentDialogOption.type
          })}
        </div>
        <div className="text-fg-soft mt-0.5 text-xs">
          {selectedProvider.name} • {selectedRegion}
        </div>
        <div className="text-ui-active-soft mt-1.5 text-lg font-bold leading-none">
          {selectedRegionData?.price}
        </div>
        {selectedRegionData?.sourceId ? (
          <div className="mt-1 flex justify-center">
            <CatalogAttribution sourceId={selectedRegionData.sourceId} />
          </div>
        ) : null}
      </div>

      <div className="mt-2 grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2">
        <div className="bg-bg-surface/30 flex min-h-0 flex-col justify-center rounded-md px-2.5 py-2">
          <div className="text-fg-muted/70 mb-0.5 text-[10px] font-medium tracking-wide uppercase">
            {t('provider')('Provider')()}
          </div>
          <div className="text-fg-main text-sm font-medium leading-snug">
            {selectedProvider.name}
          </div>
          <div className="text-fg-soft mt-0.5 text-xs leading-snug">
            {selectedRegion}
          </div>
        </div>

        <div className="bg-bg-surface/30 flex min-h-0 flex-col justify-center rounded-md px-2.5 py-2">
          <div className="text-fg-muted/70 mb-0.5 text-[10px] font-medium tracking-wide uppercase">
            {t('configuration')('Configuration')()}
          </div>
          <div className="text-fg-main text-sm font-medium leading-snug">
            {selectedProvider.specs}
          </div>
          <div className="text-fg-soft mt-0.5 text-xs leading-snug">
            {t('leadTime')('Lead time: {leadTime}')({ leadTime: selectedProvider.leadTime })}
          </div>
        </div>

        <div className="bg-bg-surface/30 flex min-h-0 flex-col justify-center rounded-md px-2.5 py-2">
          <div className="text-fg-muted/70 mb-0.5 text-[10px] font-medium tracking-wide uppercase">
            {t('terms')('Terms')()}
          </div>
          <div className="text-fg-main text-sm font-medium leading-snug">
            {t('minTerm')('Min. {term}')({ term: selectedProvider.minTerm })}
          </div>
          <div className="text-fg-soft mt-0.5 text-xs leading-snug">
            {t('flexibleBilling')('Flexible billing')()}
          </div>
        </div>

        <div className="bg-bg-surface/30 flex min-h-0 flex-col justify-center rounded-md px-2.5 py-2">
          <div className="text-fg-muted/70 mb-0.5 text-[10px] font-medium tracking-wide uppercase">
            {t('support')('Support')()}
          </div>
          <div className="text-fg-main text-sm font-medium leading-snug">
            {t('supportValue')('24/7 Technical')()}
          </div>
          <div className="text-fg-soft mt-0.5 text-xs leading-snug">
            {t('supportHint')('Enterprise-grade SLA')()}
          </div>
        </div>
      </div>
    </div>
  );
};
