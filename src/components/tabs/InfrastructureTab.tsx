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
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="text-fg-muted/70 shrink-0 text-xs tracking-wide uppercase">
        {t('title')('Infrastructure Details')()}
      </div>

      <div className="text-fg-soft flex min-h-0 flex-1 flex-col justify-center text-xs leading-relaxed">
        {selectedProvider.details}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="text-fg-muted/70 mb-2 shrink-0 text-xs font-medium">
          {t('regionalAvailability')('Regional Availability')()}
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-evenly gap-1 text-xs">
          {selectedProvider.regions.map(region => (
            <div
              key={region.name}
              className="flex items-center justify-between py-1"
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
