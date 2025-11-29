import React from 'react';

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
    <div className="flex h-full flex-col justify-center">
      {/* Header with selection summary */}
      <div className="mb-6 text-center">
        <div className="text-fg-main text-lg font-semibold">
          {selectedSize} × {currentDialogOption.type} GPU
          {selectedSize > 1 ? 's' : ''}
        </div>
        <div className="text-fg-soft mt-1 text-sm">
          {selectedProvider.name} • {selectedRegion}
        </div>
        <div className="text-ui-active-soft mt-2 text-xl font-bold">
          {selectedRegionData?.price}
        </div>
      </div>

      {/* Key information cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-bg-surface/30 rounded-lg p-4">
          <div className="text-fg-muted/70 mb-2 text-xs font-medium tracking-wide uppercase">
            Provider
          </div>
          <div className="text-fg-main font-medium">
            {selectedProvider.name}
          </div>
          <div className="text-fg-soft mt-1 text-sm">
            {selectedProvider.location}
          </div>
        </div>

        <div className="bg-bg-surface/30 rounded-lg p-4">
          <div className="text-fg-muted/70 mb-2 text-xs font-medium tracking-wide uppercase">
            Configuration
          </div>
          <div className="text-fg-main font-medium">
            {selectedProvider.specs}
          </div>
          <div className="text-fg-soft mt-1 text-sm">
            Lead time: {selectedProvider.leadTime}
          </div>
        </div>

        <div className="bg-bg-surface/30 rounded-lg p-4">
          <div className="text-fg-muted/70 mb-2 text-xs font-medium tracking-wide uppercase">
            Terms
          </div>
          <div className="text-fg-main font-medium">
            Min. {selectedProvider.minTerm}
          </div>
          <div className="text-fg-soft mt-1 text-sm">
            Flexible billing options
          </div>
        </div>

        <div className="bg-bg-surface/30 rounded-lg p-4">
          <div className="text-fg-muted/70 mb-2 text-xs font-medium tracking-wide uppercase">
            Support
          </div>
          <div className="text-fg-main font-medium">24/7 Technical</div>
          <div className="text-fg-soft mt-1 text-sm">Enterprise-grade SLA</div>
        </div>
      </div>
    </div>
  );
};
