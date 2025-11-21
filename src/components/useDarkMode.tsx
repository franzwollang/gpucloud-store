'use client';

import { useEffect } from 'react';

import { useUIStore } from '@/stores/ui';

export default function useDarkMode() {
  const [theme, setTheme] = useUIStore(state => [state.theme, state.setTheme]);

  useEffect(() => {
    const noThemeInStorage = !('theme' in window.localStorage);

    if (
      noThemeInStorage &&
      !window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      localStorage.theme = 'light';
      setTheme('light');
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
}
