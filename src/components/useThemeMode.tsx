'use client';

import { useEffect } from 'react';

import { useUIStore } from '@/stores/ui';
import type { UIStoreState } from '@/stores/ui';

export const supportedThemes = ['light', 'dark'] as const;
export type SupportedTheme = (typeof supportedThemes)[number];

export const isSupportedTheme = (theme: string): theme is SupportedTheme => {
  return supportedThemes.includes(theme as SupportedTheme);
};

export default function useThemeMode() {
  const { theme, setTheme } = useUIStore(({ theme, setTheme }) => ({
    theme,
    setTheme
  }));

  useEffect(() => {
    const stored = window.localStorage.getItem('theme');

    if (!stored || !isSupportedTheme(stored)) {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      const initial = prefersDark ? 'dark' : 'light';
      setTheme(initial);
      window.localStorage.setItem('theme', initial);
      document.documentElement.dataset.theme = initial;
      return;
    }

    if (stored !== theme && isSupportedTheme(stored)) {
      setTheme(stored);
    }

    document.documentElement.dataset.theme = stored;
  }, [setTheme, theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark')
  };
}
