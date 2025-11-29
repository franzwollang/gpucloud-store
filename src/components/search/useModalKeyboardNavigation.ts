import type { Provider, ProviderCombination } from '@/types/gpu';

interface UseModalKeyboardNavigationProps {
  selectedRegion: string | null;
  selectedProvider: Provider | null;
  selectedSize: number | null;
  availableCombinations: ProviderCombination[];
  currentDialogOption: {
    availableSizes: number[];
  } | null;
  containerRef: React.RefObject<HTMLElement>;
}

export const useModalKeyboardNavigation = (
  _props: UseModalKeyboardNavigationProps
) => {
  // Keyboard navigation is now handled directly in the GpuModal onKeyDown handler
};
