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
export { listScenarios, runScenario, runAllScenarios } from '@/lib/animation/scenarios';
export {
  withGpuTimer,
  markWebGlCanvas,
  getGpuTimingStats,
  resetGpuTiming
} from '@/lib/animation/webglTimers';
export type {
  EffectName,
  EffectOverrides,
  PerfLabApi,
  PerfLabSummary,
  ScenarioId,
  GpuTimingSummary
} from '@/lib/animation/types';
