import React from 'react';

interface RegionSelectionModalProps {
  availableRegions: string[];
  selectedRegion: string | null;
  onRegionSelect: (region: string) => void;
}

export const RegionSelectionModal: React.FC<RegionSelectionModalProps> = ({
  availableRegions,
  selectedRegion,
  onRegionSelect,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-fg-main mb-2">
          Select Region
        </h3>
        <p className="text-sm text-fg-soft">
          Choose the region where you want to deploy your GPU cluster.
        </p>
      </div>

      <div className="grid gap-2 max-h-64 overflow-y-auto">
        {availableRegions.map((region) => (
          <button
            key={region}
            data-region-button
            onClick={() => onRegionSelect(region)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              selectedRegion === region
                ? 'bg-ui-active-soft border-ui-active-soft text-white'
                : 'border-border/30 bg-bg-surface/30 hover:bg-bg-surface/50 text-fg-main'
            }`}
          >
            <div className="font-medium">{region}</div>
            <div className="text-sm opacity-75">
              {region === 'US East' && 'Northeast US - Low latency to major markets'}
              {region === 'US West' && 'West Coast US - Access to major cloud hubs'}
              {region === 'US Central' && 'Central US - Cost-effective infrastructure'}
              {region === 'EU West' && 'Western Europe - GDPR compliant'}
              {region === 'EU Central' && 'Central Europe - Balanced performance'}
              {region === 'Asia Pacific' && 'Asia Pacific - Growing AI infrastructure'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
