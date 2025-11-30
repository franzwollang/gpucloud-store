import React, { useEffect, useRef } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import type { Provider } from '@/types/gpu';

import {
  ConfigurationContent,
  handleConfigKeyDown
} from '../modals/ConfigurationModal';
import {
  handleMatrixKeyDown,
  ProviderSizeMatrixContent
} from '../modals/ProviderSizeMatrixModal';
import {
  handleRegionKeyDown,
  RegionSelectionContent
} from '../modals/RegionSelectionModal';

interface GpuModalProps {
  dialogIndex: number | null;
  onDialogClose: () => void;
  currentDialogOption: {
    type: string;
    description: string;
    availableSizes: number[];
  } | null;
  currentGpuType: string;
  availableRegions: string[];
  selectedRegion: string | null;
  onRegionSelect: (region: string | null) => void;
  availableCombinations: Array<{
    provider: Provider;
    sizes: number[];
  }>;
  selectedProvider: Provider | null;
  selectedSize: number | null;
  onProviderSizeSelect: (
    provider: Provider | null,
    size: number | null
  ) => void;
  regionRiskMetrics:
    | {
        naturalDisaster: number;
        electricityReliability: number;
        fireRisk: number;
        securityBreach: number;
        powerEfficiency: number;
        costEfficiency: number;
        networkReliability: number;
        coolingCapacity: number;
      }
    | undefined;
  onAddToPlan: (item: {
    type: string;
    provider: Provider;
    size: number;
  }) => void;
  t: (key: string) => string;
}

type ModalView = 'region' | 'matrix' | 'configuration';

export const GpuModal: React.FC<GpuModalProps> = ({
  dialogIndex,
  onDialogClose,
  currentDialogOption,
  currentGpuType,
  availableRegions,
  selectedRegion,
  onRegionSelect,
  availableCombinations,
  selectedProvider,
  selectedSize,
  onProviderSizeSelect,
  regionRiskMetrics,
  onAddToPlan,
  t
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevViewRef = useRef<ModalView | null>(null);

  // Determine which view to show
  const currentView: ModalView = !selectedRegion
    ? 'region'
    : !selectedProvider || !selectedSize
      ? 'matrix'
      : 'configuration';

  // Focus first element when view changes (not on initial render - Radix handles that)
  useEffect(() => {
    // Skip if this is the initial render or view hasn't changed
    if (prevViewRef.current === null || prevViewRef.current === currentView) {
      prevViewRef.current = currentView;
      return;
    }

    prevViewRef.current = currentView;

    // Small delay to let the new view render
    const timeoutId = setTimeout(() => {
      if (!containerRef.current) return;

      let firstElement: HTMLElement | null = null;

      if (currentView === 'region') {
        // Focus first region button
        const regionButton = containerRef.current.querySelector(
          '[data-region-button]'
        );
        if (regionButton instanceof HTMLElement) {
          firstElement = regionButton;
        }
      } else if (currentView === 'matrix') {
        // Find first non-disabled matrix button
        const matrixButtons = containerRef.current.querySelectorAll(
          '[data-matrix-button]'
        );
        for (const button of matrixButtons) {
          if (
            button instanceof HTMLElement &&
            !button.hasAttribute('disabled')
          ) {
            firstElement = button;
            break;
          }
        }
      } else if (currentView === 'configuration') {
        const tab = containerRef.current.querySelector('[role="tab"]');
        if (tab instanceof HTMLElement) {
          firstElement = tab;
        }
      }

      firstElement?.focus();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [currentView]);

  if (!currentDialogOption) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (currentView === 'region') {
      handleRegionKeyDown(e, containerRef, availableRegions);
    } else if (currentView === 'matrix') {
      handleMatrixKeyDown(
        e,
        containerRef,
        currentDialogOption,
        availableCombinations
      );
    } else if (currentView === 'configuration') {
      handleConfigKeyDown(e, containerRef);
    }
  };

  return (
    <Dialog
      open={dialogIndex !== null}
      modal={true}
      onOpenChange={open => {
        if (!open) {
          onDialogClose();
        }
      }}
    >
      <DialogContent
        className="bg-bg-surface border-border/70 text-fg-main sm:max-w-xl md:max-w-4xl"
        onEscapeKeyDown={e => {
          e.preventDefault();
          onDialogClose();
        }}
        onKeyDown={handleKeyDown}
      >
        <div ref={containerRef} key={currentGpuType} className="space-y-3">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {currentDialogOption.type}
            </DialogTitle>
            <DialogDescription className="text-fg-soft text-sm">
              {currentDialogOption.description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 min-h-[300px]">
            {currentView === 'region' && (
              <RegionSelectionContent
                availableRegions={availableRegions}
                selectedRegion={selectedRegion}
                onRegionSelect={onRegionSelect}
              />
            )}

            {currentView === 'matrix' && selectedRegion && (
              <ProviderSizeMatrixContent
                currentDialogOption={currentDialogOption}
                availableCombinations={availableCombinations}
                selectedProvider={selectedProvider}
                selectedSize={selectedSize}
                selectedRegion={selectedRegion}
                onProviderSizeSelect={onProviderSizeSelect}
                onRegionSelect={onRegionSelect}
              />
            )}

            {currentView === 'configuration' &&
              selectedRegion &&
              selectedProvider &&
              selectedSize &&
              regionRiskMetrics && (
                <ConfigurationContent
                  currentDialogOption={currentDialogOption}
                  selectedProvider={selectedProvider}
                  selectedSize={selectedSize}
                  selectedRegion={selectedRegion}
                  onSelectionChange={() => onProviderSizeSelect(null, null)}
                />
              )}
          </div>
        </div>

        <DialogFooter className="mt-1 gap-2">
          <button
            type="button"
            onClick={onDialogClose}
            className="border-border/70 text-fg-main hover:border-ui-active-soft hover:text-fg-main/90 bg-bg-surface inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium transition"
          >
            {t('close')}
          </button>
          {selectedProvider && selectedSize && (
            <button
              data-add-to-plan-button
              type="button"
              onClick={() => {
                onAddToPlan({
                  type: currentDialogOption.type,
                  provider: selectedProvider,
                  size: selectedSize
                });
                onDialogClose();
              }}
              className="bg-ui-active-soft hover:bg-ui-active inline-flex items-center justify-center rounded-md border border-transparent px-4 py-1.5 text-xs font-medium text-white transition"
            >
              {t('addToPlan')}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
