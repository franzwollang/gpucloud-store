/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

import {
  isSupportedTheme,
  type SupportedTheme
} from '@/components/useThemeMode';

type IndependentVisibilities =
  | 'hero'
  | 'pageVisible'
  | 'prefersReducedMotion'
  | 'scrollPaused';
type BlockingVisibilities = 'anchorRankings';

export type AnchorVisibility = {
  id: string;
  ratio: number;
  /** Within ~300px of the viewport (prewarm band). Exit-dwell latched. */
  isNear: boolean;
  /** Intersecting the viewport. Exit-dwell latched; AND with pageVisible in hooks. */
  isActive: boolean;
};

export function createAnchorVisibility(
  id: string,
  overrides?: Partial<Omit<AnchorVisibility, 'id'>>
): AnchorVisibility {
  return {
    id,
    ratio: overrides?.ratio ?? 0,
    isNear: overrides?.isNear ?? false,
    isActive: overrides?.isActive ?? false
  };
}

export interface UIStoreState {
  theme: SupportedTheme;
  setTheme: (theme: string) => boolean;
  headerGradientShifted: boolean;
  setHeaderGradientShifted: (shifted: boolean) => void;
  visibilities: {
    [K in IndependentVisibilities]: boolean;
  } & { [K in BlockingVisibilities]: AnchorVisibility[] };
  setVisibilities: (
    updater: (
      visibilities: UIStoreState['visibilities']
    ) => Partial<UIStoreState['visibilities']>
  ) => void;
}

/** Object selectors are safe — store default equality is shallow. */
export const useUIStore = createWithEqualityFn<UIStoreState>()(
  (set, _get) => ({
    theme: 'dark',
    setTheme: theme => {
      if (isSupportedTheme(theme)) {
        set({ theme });
        return true;
      }

      return false;
    },
    headerGradientShifted: false,
    setHeaderGradientShifted: shifted => {
      set({ headerGradientShifted: shifted });
    },
    visibilities: {
      hero: true,
      pageVisible: true,
      prefersReducedMotion: false,
      scrollPaused: false,
      anchorRankings: []
    },
    setVisibilities: updater => {
      set(state => ({
        visibilities: {
          ...state.visibilities,
          ...updater(state.visibilities)
        }
      }));
    }
  }),
  shallow
);
