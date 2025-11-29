import React, { useRef } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import type { Provider } from '@/types/gpu';

import { ConfigurationModal } from '../modals/ConfigurationModal';
import { ProviderSizeMatrixModal } from '../modals/ProviderSizeMatrixModal';
import { useModalKeyboardNavigation } from './useModalKeyboardNavigation';

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
  onAddToCart: (item: {
    type: string;
    provider: Provider;
    size: number;
  }) => void;
  t: (key: string) => string;
}

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
  onAddToCart,
  t
}) => {
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useModalKeyboardNavigation({
    selectedRegion,
    selectedProvider,
    selectedSize,
    availableCombinations,
    currentDialogOption,
    containerRef: modalContainerRef as React.RefObject<HTMLElement>
  });

  if (!currentDialogOption) return null;

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
        onOpenAutoFocus={e => {
          e.preventDefault();
          // Focus the first focusable element in the modal
          requestAnimationFrame(() => {
            const modalContent = e.target as HTMLElement;
            // Find focusable elements that are descendants of the modal content (using descendant selector)
            const focusableElements = modalContent.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            // Skip the modal content itself if it somehow got included
            const filteredElements = Array.from(focusableElements).filter(
              element => element !== modalContent
            );
            const firstFocusable = filteredElements[0] as HTMLElement;
            if (firstFocusable) {
              firstFocusable.focus();
            }
          });
        }}
        onKeyDown={e => {
          // Handle region navigation when in region selection
          if (!selectedRegion) {
            const regionButtons = modalContainerRef.current?.querySelectorAll(
              '[data-region-button]'
            );
            if (regionButtons?.length) {
              // Find currently focused button or use first button as fallback
              const focusedButton = Array.from(regionButtons).find(
                button => button === document.activeElement
              );
              const currentIndex = focusedButton
                ? Array.from(regionButtons).indexOf(focusedButton)
                : 0;

              let newIndex = currentIndex;

              if (e.key === 'ArrowLeft') {
                newIndex =
                  currentIndex > 0
                    ? currentIndex - 1
                    : availableRegions.length - 1;
                e.preventDefault();
                (regionButtons[newIndex] as HTMLElement).focus();
              } else if (e.key === 'ArrowRight') {
                newIndex =
                  currentIndex < availableRegions.length - 1
                    ? currentIndex + 1
                    : 0;
                e.preventDefault();
                (regionButtons[newIndex] as HTMLElement).focus();
              } else if (e.key === 'Enter' && regionButtons[currentIndex]) {
                e.preventDefault();
                (regionButtons[currentIndex] as HTMLElement).click();
              }
            }
          }

          // Handle provider-size matrix navigation
          if (selectedRegion && !selectedProvider && !selectedSize) {
            const matrixButtons = modalContainerRef.current?.querySelectorAll(
              '[data-matrix-button]'
            );

            if (matrixButtons?.length && currentDialogOption) {
              // Find currently focused button
              const focusedButton = Array.from(matrixButtons).find(
                button => button === document.activeElement
              );

              if (!focusedButton) {
                // No matrix button focused - focus the first available button
                e.preventDefault();
                const firstButton = matrixButtons[0] as HTMLElement;
                if (!firstButton.hasAttribute('disabled')) {
                  firstButton.focus();
                } else {
                  // Find first non-disabled button
                  for (const button of matrixButtons) {
                    if (!(button as HTMLElement).hasAttribute('disabled')) {
                      (button as HTMLElement).focus();
                      break;
                    }
                  }
                }
                return; // Don't navigate, just focus
              }

              // A matrix button is focused - navigate from there
              const currentIndex =
                Array.from(matrixButtons).indexOf(focusedButton);
              const numColumns = currentDialogOption.availableSizes.length;
              const currentRow = Math.floor(currentIndex / numColumns);
              const currentCol = currentIndex % numColumns;
              let newRow = currentRow;
              let newCol = currentCol;

              if (e.key === 'ArrowLeft') {
                if (currentCol > 0) {
                  newCol = currentCol - 1;
                } else {
                  // Stay in same row, don't wrap to maintain predictability
                  return; // Don't navigate
                }
              } else if (e.key === 'ArrowRight') {
                if (currentCol < numColumns - 1) {
                  newCol = currentCol + 1;
                } else {
                  // Stay in same row, don't wrap to maintain predictability
                  return; // Don't navigate
                }
              } else if (e.key === 'ArrowUp') {
                newRow =
                  currentRow > 0
                    ? currentRow - 1
                    : availableCombinations.length - 1;
                // Ensure we don't go to a column that doesn't exist in the target row
                newCol = Math.min(newCol, numColumns - 1);
              } else if (e.key === 'ArrowDown') {
                newRow =
                  currentRow < availableCombinations.length - 1
                    ? currentRow + 1
                    : 0;
                // Ensure we don't go to a column that doesn't exist in the target row
                newCol = Math.min(newCol, numColumns - 1);
              }

              if (
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowDown'
              ) {
                e.preventDefault();
                const newIndex = newRow * numColumns + newCol;
                if (newIndex >= 0 && newIndex < matrixButtons.length) {
                  const targetButton = matrixButtons[newIndex] as HTMLElement;
                  if (!targetButton.hasAttribute('disabled')) {
                    targetButton.focus();
                  }
                }
              }
            }
          }

          // Handle tab navigation when in configuration view
          if (selectedProvider && selectedSize) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault();
              const tabs =
                modalContainerRef.current?.querySelectorAll('[role="tab"]');
              if (tabs?.length) {
                const focusedTab = Array.from(tabs).find(
                  tab => tab === document.activeElement
                );
                const currentIndex = focusedTab
                  ? Array.from(tabs).indexOf(focusedTab)
                  : 0;

                let newIndex;
                if (e.key === 'ArrowLeft') {
                  newIndex =
                    currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                } else {
                  newIndex =
                    currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                }
                (tabs[newIndex] as HTMLElement).click();
                (tabs[newIndex] as HTMLElement).focus();
              }
            }
          }
        }}
      >
        <div ref={modalContainerRef} key={currentGpuType} className="space-y-3">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {currentDialogOption.type}
            </DialogTitle>
            <DialogDescription className="text-fg-soft text-sm">
              {currentDialogOption.description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 min-h-[300px]">
            {!selectedRegion ? (
              /* Region Selection */
              <div>
                <div className="text-fg-muted/70 mb-3 text-xs tracking-wide uppercase">
                  Select Region
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {availableRegions.map((region, index) => (
                    <button
                      key={region}
                      data-region-button
                      data-region-index={index}
                      onClick={() => onRegionSelect(region)}
                      className={`rounded-lg border p-4 text-center transition ${
                        region === selectedRegion
                          ? 'bg-ui-active-soft border-ui-active-soft text-white'
                          : 'border-border/30 bg-bg-surface/30 hover:bg-bg-surface/50 text-fg-main'
                      }`}
                    >
                      <div className="text-sm font-medium">{region}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : !selectedProvider || !selectedSize ? (
              <ProviderSizeMatrixModal
                availableCombinations={availableCombinations}
                selectedProvider={selectedProvider}
                selectedSize={selectedSize}
                selectedRegion={selectedRegion}
                currentDialogOption={currentDialogOption}
                onProviderSizeSelect={onProviderSizeSelect}
                onRegionSelect={onRegionSelect}
              />
            ) : !regionRiskMetrics ? (
              /* Loading state or error - should not happen in normal flow */
              <div className="py-8 text-center">
                <div className="text-fg-muted/70">
                  Loading configuration details...
                </div>
              </div>
            ) : (
              <ConfigurationModal
                selectedProvider={selectedProvider}
                selectedSize={selectedSize}
                selectedRegion={selectedRegion}
                onAddToCart={onAddToCart}
                onClose={onDialogClose}
                onSelectionChange={() => {
                  onProviderSizeSelect(null, null);
                }}
                currentDialogOption={currentDialogOption}
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
          {onAddToCart && selectedProvider && selectedSize && (
            <button
              data-add-to-plan-button
              type="button"
              onClick={() => {
                onAddToCart({
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
