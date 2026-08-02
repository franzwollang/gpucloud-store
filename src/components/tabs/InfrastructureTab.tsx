'use client';

import React from 'react';
import { useAppTranslations } from '@/i18n';

import type { Provider } from '@/types/gpu';

interface InfrastructureTabProps {
  selectedProvider: Provider;
}

export const InfrastructureTab: React.FC<InfrastructureTabProps> = ({
  selectedProvider
}) => {
  const t = useAppTranslations('TEST.gpuModal.infrastructure');

  return (
    <div className="flex min-h-0 flex-1 flex-col pt-3">
      <div className="text-fg-muted/70 shrink-0 text-xs tracking-wide uppercase">
        {t('title')('Infrastructure Details')()}
      </div>

      <div className="text-fg-soft mt-2 shrink-0 text-xs leading-relaxed">
        {selectedProvider.details}
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        <div className="text-fg-muted/70 mb-2 shrink-0 text-xs font-medium">
          {t('regionalAvailability')('Regional Availability')()}
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          {selectedProvider.regions.map(region => (
            <div
              key={region.name}
              className="flex items-center justify-between py-0.5"
            >
              <span className="text-fg-main">{region.name}</span>
              <span className="text-fg-soft">{region.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
