import React from 'react';
import type { Provider } from '@/types/gpu';

interface ProviderSizeMatrixModalProps {
  availableCombinations: Array<{
    provider: Provider;
    sizes: number[];
  }>;
  selectedProvider: Provider | null;
  selectedSize: number | null;
  selectedRegion: string | null;
  currentDialogOption: {
    availableSizes: number[];
  };
  onProviderSizeSelect: (provider: Provider, size: number) => void;
  onRegionSelect: (region: string | null) => void;
}

export const ProviderSizeMatrixModal: React.FC<ProviderSizeMatrixModalProps> = ({
  availableCombinations,
  selectedProvider,
  selectedSize,
  selectedRegion,
  currentDialogOption,
  onProviderSizeSelect,
  onRegionSelect,
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-fg-muted/70 text-xs tracking-wide uppercase">
          Select Size & Provider
        </div>
        <button
          type="button"
          onClick={() => onRegionSelect(null)}
          className="text-fg-soft hover:text-fg-main text-xs underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
        >
          Change Region
        </button>
      </div>
      <div className="mb-4 text-sm">
        <div className="text-fg-main font-medium">
          Region: {selectedRegion}
        </div>
      </div>

      <div className="space-y-4">
        {/* Header */}
        <div className={`grid items-center gap-2 text-xs font-medium text-fg-muted/70 uppercase tracking-wide`} style={{ gridTemplateColumns: `200px repeat(${currentDialogOption.availableSizes.length}, 1fr)` }}>
          <div>Provider</div>
          {currentDialogOption.availableSizes.map(size => (
            <div key={size} className="text-center">
              {size} GPU{size > 1 ? 's' : ''}
            </div>
          ))}
        </div>

        {/* Provider rows */}
        {availableCombinations.map(({ provider, sizes }, index) => (
          <div
            key={`${provider.id}-${index}`}
            className="grid items-center gap-2"
            style={{ gridTemplateColumns: `200px repeat(${currentDialogOption.availableSizes.length}, 1fr)` }}
          >
            {/* Provider name */}
            <div className="text-fg-main text-sm font-medium">
              {provider.name}
              <div className="text-fg-soft text-xs">
                {provider.location}
              </div>
            </div>

            {/* Size buttons */}
            {currentDialogOption.availableSizes.map(size => {
              const isAvailable = sizes.includes(size);
              const isSelected =
                selectedProvider?.id === provider.id && selectedSize === size;

              return (
                <button
                  key={size}
                  onClick={() => {
                    if (isAvailable) {
                      onProviderSizeSelect(provider, size);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`rounded border p-2 text-center transition ${
                    isSelected
                      ? 'bg-ui-active-soft border-ui-active-soft text-white'
                      : isAvailable
                        ? 'border-border/30 bg-bg-surface/30 hover:bg-bg-surface/50 text-fg-main'
                        : 'border-border/20 bg-bg-surface/10 text-fg-muted/30 cursor-not-allowed'
                  }`}
                  data-matrix-button
                >
                  <div className="text-xs font-medium">
                    {isAvailable
                      ? (provider.regions.find(
                          (r) => r.name === selectedRegion
                        )?.price ?? '—')
                      : '—'}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
