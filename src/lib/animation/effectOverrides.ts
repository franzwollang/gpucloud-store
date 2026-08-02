import {
  ALL_EFFECTS,
  type EffectName,
  type EffectOverrides
} from '@/lib/animation/types';

type Listener = (effects: EffectOverrides) => void;

function createDefaultOverrides(): EffectOverrides {
  return ALL_EFFECTS.reduce((acc, name) => {
    acc[name] = true;
    return acc;
  }, {} as EffectOverrides);
}

let overrides: EffectOverrides = createDefaultOverrides();
const listeners = new Set<Listener>();

export function getEffectOverrides(): EffectOverrides {
  return { ...overrides };
}

export function isEffectEnabled(name: EffectName): boolean {
  return overrides[name] !== false;
}

export function setEffectOverride(name: EffectName, enabled: boolean): void {
  if (overrides[name] === enabled) return;
  overrides = { ...overrides, [name]: enabled };
  for (const listener of listeners) listener(getEffectOverrides());
}

export function resetEffectOverrides(): void {
  overrides = createDefaultOverrides();
  for (const listener of listeners) listener(getEffectOverrides());
}

export function subscribeEffectOverrides(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
