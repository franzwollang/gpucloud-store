import React, { useEffect, useRef } from 'react';

import type { HaloSearchTranslator } from '@/i18n';

import { GpuFamilyThumbnail } from '@/components/gpu/GpuFamilyThumbnail';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { GpuFamilyId, Provider } from '@/types/gpu';

import {
  ConfigurationContent
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
    familyId?: GpuFamilyId;
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
  regionRiskMetrics?: Partial<
    import('@/types/gpu').RiskMetrics
  >;
  onAddToPlan: (item: {
    type: string;
    provider: Provider;
    size: number;
  }) => void;
  /** When updating an existing plan row, show save copy instead of add. */
  planAction?: 'add' | 'update';
  t: HaloSearchTranslator;
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
  regionRiskMetrics: _regionRiskMetrics,
  onAddToPlan,
  planAction = 'add',
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
        const tab =
          containerRef.current.querySelector<HTMLElement>(
            '[role="tab"][data-state="active"]'
          ) ?? containerRef.current.querySelector<HTMLElement>('[role="tab"]');
        if (tab) {
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
    }
    // Configuration tabs: Radix Tabs implements the WAI-ARIA APG pattern
    // (arrows within tablist, Tab moves into the active tabpanel).
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
        className="bg-bg-surface border-border/60 text-fg-main flex h-[min(90dvh,40rem)] w-full flex-col gap-4 overflow-hidden sm:max-w-xl md:max-w-4xl"
        onEscapeKeyDown={e => {
          e.preventDefault();
          onDialogClose();
        }}
        onKeyDown={handleKeyDown}
      >
        <div
          ref={containerRef}
          key={currentGpuType}
          className="flex min-h-0 flex-1 flex-col gap-3"
        >
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-5 sm:gap-6">
              <GpuFamilyThumbnail
                familyId={currentDialogOption.familyId}
                alt={currentDialogOption.type}
                size="lg"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <DialogTitle className="text-2xl leading-tight font-semibold sm:text-3xl">
                  {currentDialogOption.type}
                </DialogTitle>
                <DialogDescription className="text-fg-soft text-base leading-relaxed sm:text-lg">
                  {currentDialogOption.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
              selectedSize && (
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

        <DialogFooter className="mt-0 shrink-0 flex-row-reverse gap-2 sm:flex-row-reverse sm:justify-start">
          {selectedProvider && selectedSize && (
            <Button
              data-add-to-plan-button
              type="button"
              variant="cta"
              size="sm"
              onClick={() => {
                onAddToPlan({
                  type: currentDialogOption.type,
                  provider: selectedProvider,
                  size: selectedSize
                });
                onDialogClose();
              }}
            >
              {planAction === 'update'
                ? t('saveConfiguration')('Save configuration')()
                : t('addToPlan')('Add to Plan')()}
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onDialogClose}>
            {t('close')('Close')()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
