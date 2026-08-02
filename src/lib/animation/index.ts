export {
  installPerfLab,
  uninstallPerfLab,
  shouldEnablePerfLab
} from '@/lib/animation/perfLab';
export { useEffectOverride, useAllEffectOverrides } from '@/lib/animation/useEffectOverride';
export {
  getEffectOverrides,
  isEffectEnabled,
  setEffectOverride,
  resetEffectOverrides
} from '@/lib/animation/effectOverrides';
export type {
  EffectName,
  EffectOverrides,
  PerfLabApi,
  PerfLabSummary,
  ScenarioId
} from '@/lib/animation/types';
