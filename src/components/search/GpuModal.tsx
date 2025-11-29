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

  // Derive current modal view
  const currentModalView = !selectedRegion
    ? 'region'
    : !selectedProvider || !selectedSize
      ? 'matrix'
      : 'configuration';

  // Focus appropriate element when modal view changes
  useEffect(() => {
    if (dialogIndex === null || !modalContainerRef.current) return;

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      const container = modalContainerRef.current;
      if (!container) return;

      if (currentModalView === 'region') {
        // Region selection: focus first region button
        container.querySelector<HTMLElement>('[data-region-button]')?.focus();
      } else if (currentModalView === 'matrix') {
        // Provider size matrix: focus first enabled matrix button
        container
          .querySelector<HTMLElement>('[data-matrix-button]:not([disabled])')
          ?.focus();
      } else if (currentModalView === 'configuration') {
        // Configuration modal: focus add to cart button
        document
          .querySelector<HTMLElement>('[data-add-to-plan-button]')
          ?.focus();
      }
    });
  }, [dialogIndex, currentModalView]);

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
            // Only handle arrow key navigation in the matrix
            if (
              !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
                e.key
              )
            ) {
              return;
            }

            const matrixButtons = modalContainerRef.current?.querySelectorAll(
              '[data-matrix-button]'
            );

            if (matrixButtons?.length && currentDialogOption) {
              // Find currently focused button
              const focusedButton = Array.from(matrixButtons).find(
                button => button === document.activeElement
              );

              if (!focusedButton) {
                // No matrix button focused - focus the first available button on arrow key
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
              const numRows = availableCombinations.length;
              const currentRow = Math.floor(currentIndex / numColumns);
              const currentCol = currentIndex % numColumns;

              // Get button at specific position
              const getButton = (
                row: number,
                col: number
              ): HTMLElement | null => {
                if (row < 0 || row >= numRows || col < 0 || col >= numColumns) {
                  return null;
                }
                return matrixButtons[row * numColumns + col] as HTMLElement;
              };

              // Check if button is enabled
              const isEnabled = (btn: HTMLElement | null): boolean => {
                return btn !== null && !btn.hasAttribute('disabled');
              };

              // Find first enabled button in a row
              const findFirstEnabledInRow = (
                row: number
              ): HTMLElement | null => {
                for (let col = 0; col < numColumns; col++) {
                  const btn = getButton(row, col);
                  if (isEnabled(btn)) return btn;
                }
                return null;
              };

              // Find first enabled button in a column
              const findFirstEnabledInCol = (
                col: number
              ): HTMLElement | null => {
                for (let row = 0; row < numRows; row++) {
                  const btn = getButton(row, col);
                  if (isEnabled(btn)) return btn;
                }
                return null;
              };

              // Find closest enabled in same column, searching in direction (with wrap)
              const findClosestEnabledInCol = (
                col: number,
                startRow: number,
                direction: number
              ): HTMLElement | null => {
                let row = startRow + direction;
                for (let i = 0; i < numRows - 1; i++) {
                  if (row < 0) row = numRows - 1;
                  if (row >= numRows) row = 0;
                  if (row === startRow) return null; // Back to start
                  const btn = getButton(row, col);
                  if (isEnabled(btn)) return btn;
                  row += direction;
                }
                return null;
              };

              // Find closest enabled in same row, searching in direction (with wrap)
              const findClosestEnabledInRow = (
                row: number,
                startCol: number,
                direction: number
              ): HTMLElement | null => {
                let col = startCol + direction;
                for (let i = 0; i < numColumns - 1; i++) {
                  if (col < 0) col = numColumns - 1;
                  if (col >= numColumns) col = 0;
                  if (col === startCol) return null; // Back to start
                  const btn = getButton(row, col);
                  if (isEnabled(btn)) return btn;
                  col += direction;
                }
                return null;
              };

              // Find next row with any enabled button (with wrapping)
              const findNextRowWithEnabled = (
                startRow: number,
                direction: number
              ): HTMLElement | null => {
                let row = startRow + direction;
                for (let i = 0; i < numRows; i++) {
                  if (row < 0) row = numRows - 1;
                  if (row >= numRows) row = 0;
                  const btn = findFirstEnabledInRow(row);
                  if (btn) return btn;
                  row += direction;
                }
                return null;
              };

              // Find next column with any enabled button (with wrapping)
              const findNextColWithEnabled = (
                startCol: number,
                direction: number
              ): HTMLElement | null => {
                let col = startCol + direction;
                for (let i = 0; i < numColumns; i++) {
                  if (col < 0) col = numColumns - 1;
                  if (col >= numColumns) col = 0;
                  const btn = findFirstEnabledInCol(col);
                  if (btn) return btn;
                  col += direction;
                }
                return null;
              };

              e.preventDefault();

              let targetButton: HTMLElement | null = null;

              if (e.key === 'ArrowUp') {
                // 1. Try immediate button above
                const directBtn = getButton(currentRow - 1, currentCol);
                if (isEnabled(directBtn)) {
                  targetButton = directBtn;
                } else {
                  // 2. Search same column upward for closest enabled
                  targetButton = findClosestEnabledInCol(
                    currentCol,
                    currentRow,
                    -1
                  );
                  // 3. Find next row with any enabled, select first in that row
                  targetButton ??= findNextRowWithEnabled(currentRow, -1);
                }
              } else if (e.key === 'ArrowDown') {
                // 1. Try immediate button below
                const directBtn = getButton(currentRow + 1, currentCol);
                if (isEnabled(directBtn)) {
                  targetButton = directBtn;
                } else {
                  // 2. Search same column downward for closest enabled
                  targetButton = findClosestEnabledInCol(
                    currentCol,
                    currentRow,
                    1
                  );
                  // 3. Find next row with any enabled, select first in that row
                  targetButton ??= findNextRowWithEnabled(currentRow, 1);
                }
              } else if (e.key === 'ArrowLeft') {
                // 1. Try immediate button to the left
                const directBtn = getButton(currentRow, currentCol - 1);
                if (isEnabled(directBtn)) {
                  targetButton = directBtn;
                } else {
                  // 2. Search same row leftward for closest enabled
                  targetButton = findClosestEnabledInRow(
                    currentRow,
                    currentCol,
                    -1
                  );
                  // 3. Find next column with any enabled, select first in that col
                  targetButton ??= findNextColWithEnabled(currentCol, -1);
                }
              } else if (e.key === 'ArrowRight') {
                // 1. Try immediate button to the right
                const directBtn = getButton(currentRow, currentCol + 1);
                if (isEnabled(directBtn)) {
                  targetButton = directBtn;
                } else {
                  // 2. Search same row rightward for closest enabled
                  targetButton = findClosestEnabledInRow(
                    currentRow,
                    currentCol,
                    1
                  );
                  // 3. Find next column with any enabled, select first in that col
                  targetButton ??= findNextColWithEnabled(currentCol, 1);
                }
              }

              if (targetButton) {
                    targetButton.focus();
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
