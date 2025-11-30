import React from 'react';

interface RegionSelectionContentProps {
  availableRegions: string[];
  selectedRegion: string | null;
  onRegionSelect: (region: string) => void;
}

export const RegionSelectionContent: React.FC<RegionSelectionContentProps> = ({
  availableRegions,
  selectedRegion,
  onRegionSelect
}) => {
  return (
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
            onMouseEnter={e => (e.currentTarget as HTMLElement).focus()}
            onClick={() => onRegionSelect(region)}
            className={`focus:ring-ui-active focus:ring-offset-bg-surface rounded-lg border p-4 text-center transition focus:ring-2 focus:ring-offset-2 focus:outline-none ${
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
  );
};

export const handleRegionKeyDown = (
  e: React.KeyboardEvent,
  containerRef: React.RefObject<HTMLDivElement | null>,
  availableRegions: string[]
): void => {
  if (!['ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) return;

  const regionButtons = containerRef.current?.querySelectorAll(
    '[data-region-button]'
  );
  if (!regionButtons?.length) return;

  const focusedButton = Array.from(regionButtons).find(
    button => button === document.activeElement
  );

  // If no button is focused, focus the first one on any arrow key
  if (!focusedButton) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      (regionButtons[0] as HTMLElement).focus();
    }
    return;
  }

  const currentIndex = Array.from(regionButtons).indexOf(focusedButton);
  let newIndex = currentIndex;

  if (e.key === 'ArrowLeft') {
    newIndex =
      currentIndex > 0 ? currentIndex - 1 : availableRegions.length - 1;
    e.preventDefault();
    (regionButtons[newIndex] as HTMLElement).focus();
  } else if (e.key === 'ArrowRight') {
    newIndex =
      currentIndex < availableRegions.length - 1 ? currentIndex + 1 : 0;
    e.preventDefault();
    (regionButtons[newIndex] as HTMLElement).focus();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    (regionButtons[currentIndex] as HTMLElement).click();
  }
};
