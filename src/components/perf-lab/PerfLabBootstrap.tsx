'use client';

import { useEffect } from 'react';

import {
  installPerfLab,
  shouldEnablePerfLab,
  uninstallPerfLab
} from '@/lib/animation/perfLab';

/**
 * Installs window.__gpuPerfLab when `?perfLab=1` or in development.
 * Mount once near the root client layout.
 */
export function PerfLabBootstrap() {
  useEffect(() => {
    if (!shouldEnablePerfLab()) return;
    installPerfLab();
    return () => {
      uninstallPerfLab();
    };
  }, []);

  return null;
}
