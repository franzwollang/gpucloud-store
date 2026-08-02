import React from 'react';

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
  const selectedRegionData = selectedProvider.regions.find(
    r => r.name === selectedRegion
  );

  return (
    <div className="flex min-h-0 flex-col justify-start">
      <div className="mb-3 text-center">
        <div className="text-fg-main text-base font-semibold leading-tight">
          {selectedSize} × {currentDialogOption.type} GPU
          {selectedSize > 1 ? 's' : ''}
        </div>
        <div className="text-fg-soft mt-0.5 text-xs">
          {selectedProvider.name} • {selectedRegion}
        </div>
        <div className="text-ui-active-soft mt-1.5 text-lg font-bold leading-none">
          {selectedRegionData?.price}
        </div>
        {selectedRegionData?.sourceId ? (
          <div className="mt-0.5 flex justify-center">
            <CatalogAttribution sourceId={selectedRegionData.sourceId} />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-bg-surface/30 rounded-md px-2.5 py-2">
          <div className="text-fg-muted/70 mb-0.5 text-[10px] font-medium tracking-wide uppercase">
            Provider
          </div>
          <div className="text-fg-main text-sm font-medium leading-snug">
            {selectedProvider.name}
          </div>
          <div className="text-fg-soft mt-0.5 text-xs leading-snug">
            {selectedRegion}
          </div>
        </div>

        <div className="bg-bg-surface/30 rounded-md px-2.5 py-2">
          <div className="text-fg-muted/70 mb-0.5 text-[10px] font-medium tracking-wide uppercase">
            Configuration
          </div>
          <div className="text-fg-main text-sm font-medium leading-snug">
            {selectedProvider.specs}
          </div>
          <div className="text-fg-soft mt-0.5 text-xs leading-snug">
            Lead time: {selectedProvider.leadTime}
          </div>
        </div>

        <div className="bg-bg-surface/30 rounded-md px-2.5 py-2">
          <div className="text-fg-muted/70 mb-0.5 text-[10px] font-medium tracking-wide uppercase">
            Terms
          </div>
          <div className="text-fg-main text-sm font-medium leading-snug">
            Min. {selectedProvider.minTerm}
          </div>
          <div className="text-fg-soft mt-0.5 text-xs leading-snug">
            Flexible billing
          </div>
        </div>

        <div className="bg-bg-surface/30 rounded-md px-2.5 py-2">
          <div className="text-fg-muted/70 mb-0.5 text-[10px] font-medium tracking-wide uppercase">
            Support
          </div>
          <div className="text-fg-main text-sm font-medium leading-snug">
            24/7 Technical
          </div>
          <div className="text-fg-soft mt-0.5 text-xs leading-snug">
            Enterprise-grade SLA
          </div>
        </div>
      </div>
    </div>
  );
};
