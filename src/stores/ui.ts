/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import { create } from 'zustand';

import { linksConfig } from '@/components/layout-navigation/links';
import type { NavLinks } from '@/components/layout-navigation/useLinks';

type IndependentVisibilities = 'hero';
type BlockingVisibilities = 'anchors';

type Themes = 'light' | 'dark';

export interface UIStoreState {
  theme: Themes;
  setTheme: (theme: Themes) => void;
  visibilities: {
    [K in IndependentVisibilities]: boolean;
  } & { [K in BlockingVisibilities]: Array<string> };
  setVisibilities: (
    updater: (
      visibilities: UIStoreState['visibilities']
    ) => Partial<UIStoreState['visibilities']>
  ) => void;
}

export const useUIStore = create<UIStoreState>((set, _get) => ({
  theme: 'dark',
  setTheme: theme => {
    set({ theme });
  },
  visibilities: {
    hero: true,
    anchors: []
  },
  setVisibilities: updater => {
    set(state => ({
      visibilities: {
        ...state.visibilities,
        ...updater(state.visibilities)
      }
    }));
  }
}));
