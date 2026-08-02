'use client';

import { useSyncExternalStore } from 'react';

import {
  getEffectOverrides,
  isEffectEnabled,
  subscribeEffectOverrides
} from '@/lib/animation/effectOverrides';
import type { EffectName } from '@/lib/animation/types';

function subscribe(onStoreChange: () => void): () => void {
  return subscribeEffectOverrides(() => onStoreChange());
}

function getSnapshot(name: EffectName): boolean {
  return isEffectEnabled(name);
}

/**
 * Subscribe to a single M3.0 effect override (defaults to enabled).
 * When the perf lab disables an effect, consumers can skip mounting work.
 */
export function useEffectOverride(name: EffectName): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot(name),
    () => true
  );
}

export function useAllEffectOverrides() {
  return useSyncExternalStore(
    subscribe,
    getEffectOverrides,
    getEffectOverrides
  );
}
