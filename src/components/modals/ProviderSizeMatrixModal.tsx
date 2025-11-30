import React from 'react';

import type { Provider } from '@/types/gpu';

interface ProviderSizeMatrixContentProps {
  currentDialogOption: {
    availableSizes: number[];
  };
  availableCombinations: Array<{
    provider: Provider;
    sizes: number[];
  }>;
  selectedProvider: Provider | null;
  selectedSize: number | null;
  selectedRegion: string;
  onProviderSizeSelect: (provider: Provider, size: number) => void;
  onRegionSelect: (region: string | null) => void;
}

export const ProviderSizeMatrixContent: React.FC<
  ProviderSizeMatrixContentProps
> = ({
  currentDialogOption,
  availableCombinations,
  selectedProvider,
  selectedSize,
  selectedRegion,
  onProviderSizeSelect,
  onRegionSelect
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
          className="text-fg-soft hover:text-fg-main focus:ring-ring rounded text-xs underline focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          Change Region
        </button>
      </div>
      <div className="mb-4 text-sm">
        <div className="text-fg-main font-medium">Region: {selectedRegion}</div>
      </div>

      <div className="space-y-4">
        {/* Header */}
        <div
          className="text-fg-muted/70 grid items-center gap-2 text-xs font-medium tracking-wide uppercase"
          style={{
            gridTemplateColumns: `200px repeat(${currentDialogOption.availableSizes.length}, 1fr)`
          }}
        >
          <div>Provider</div>
          {currentDialogOption.availableSizes.map(size => (
            <div key={size} className="text-center">
              {size} GPU{size > 1 ? 's' : ''}
            </div>
          ))}
        </div>

        {/* Provider rows */}
        {availableCombinations.map(({ provider, sizes }, providerIdx) => (
          <div
            key={`${provider.id}-${providerIdx}`}
            className="grid items-center gap-2"
            style={{
              gridTemplateColumns: `200px repeat(${currentDialogOption.availableSizes.length}, 1fr)`
            }}
          >
            {/* Provider name */}
            <div className="text-fg-main text-sm font-medium">
              {provider.name}
              <div className="text-fg-soft text-xs">{provider.location}</div>
            </div>

            {/* Size buttons */}
            {currentDialogOption.availableSizes.map(size => {
              const isAvailable = sizes.includes(size);
              const isSelected =
                selectedProvider?.id === provider.id && selectedSize === size;

              return (
                <button
                  key={size}
                  onMouseEnter={e => {
                    if (!e.currentTarget.hasAttribute('disabled')) {
                      (e.currentTarget as HTMLElement).focus();
                    }
                  }}
                  onClick={() => {
                    if (isAvailable) {
                      onProviderSizeSelect(provider, size);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`rounded border p-2 text-center transition focus:ring-2 focus:ring-ui-active focus:ring-offset-2 focus:ring-offset-bg-surface focus:outline-none ${
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
                      ? (provider.regions.find(r => r.name === selectedRegion)
                          ?.price ?? '—')
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

export const handleMatrixKeyDown = (
  e: React.KeyboardEvent,
  containerRef: React.RefObject<HTMLDivElement | null>,
  currentDialogOption: { availableSizes: number[] },
  availableCombinations: Array<{ provider: Provider; sizes: number[] }>
): void => {
  // Only handle arrow key navigation in the matrix
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    return;
  }

  const matrixButtons = containerRef.current?.querySelectorAll(
    '[data-matrix-button]'
  );

  if (!matrixButtons?.length) return;

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
    return;
  }

  // A matrix button is focused - navigate from there
  const currentIndex = Array.from(matrixButtons).indexOf(focusedButton);
  const numColumns = currentDialogOption.availableSizes.length;
  const numRows = availableCombinations.length;
  const currentRow = Math.floor(currentIndex / numColumns);
  const currentCol = currentIndex % numColumns;

  // Get button at specific position
  const getButton = (row: number, col: number): HTMLElement | null => {
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
  const findFirstEnabledInRow = (row: number): HTMLElement | null => {
    for (let col = 0; col < numColumns; col++) {
      const btn = getButton(row, col);
      if (isEnabled(btn)) return btn;
    }
    return null;
  };

  // Find first enabled button in a column
  const findFirstEnabledInCol = (col: number): HTMLElement | null => {
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
      if (row === startRow) return null;
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
      if (col === startCol) return null;
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
    const directBtn = getButton(currentRow - 1, currentCol);
    if (isEnabled(directBtn)) {
      targetButton = directBtn;
    } else {
      targetButton = findClosestEnabledInCol(currentCol, currentRow, -1);
      targetButton ??= findNextRowWithEnabled(currentRow, -1);
    }
  } else if (e.key === 'ArrowDown') {
    const directBtn = getButton(currentRow + 1, currentCol);
    if (isEnabled(directBtn)) {
      targetButton = directBtn;
    } else {
      targetButton = findClosestEnabledInCol(currentCol, currentRow, 1);
      targetButton ??= findNextRowWithEnabled(currentRow, 1);
    }
  } else if (e.key === 'ArrowLeft') {
    const directBtn = getButton(currentRow, currentCol - 1);
    if (isEnabled(directBtn)) {
      targetButton = directBtn;
    } else {
      targetButton = findClosestEnabledInRow(currentRow, currentCol, -1);
      targetButton ??= findNextColWithEnabled(currentCol, -1);
    }
  } else if (e.key === 'ArrowRight') {
    const directBtn = getButton(currentRow, currentCol + 1);
    if (isEnabled(directBtn)) {
      targetButton = directBtn;
    } else {
      targetButton = findClosestEnabledInRow(currentRow, currentCol, 1);
      targetButton ??= findNextColWithEnabled(currentCol, 1);
    }
  }

  if (targetButton) {
    targetButton.focus();
  }
};

