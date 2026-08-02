/**
 * M3.0 performance laboratory types.
 * Scenarios + dumps are recoverable without tethered DevTools.
 */

export type EffectName =
  | 'fog'
  | 'lightning'
  | 'particles'
  | 'lamp'
  | 'carouselMorphs'
  | 'crt'
  | 'spotlight'
  | 'halo'
  | 'predator';

export type EffectOverrides = Record<EffectName, boolean>;

export const ALL_EFFECTS: readonly EffectName[] = [
  'fog',
  'lightning',
  'particles',
  'lamp',
  'carouselMorphs',
  'crt',
  'spotlight',
  'halo',
  'predator'
] as const;

export type ScenarioId =
  | 'idle-hero'
  | 'off-hero-idle'
  | 'lightning-burst'
  | 'hero-to-availability-scroll'
  | 'carousel-turnover'
  | 'crt-visible'
  | 'spotlight-hover'
  | 'header-cta-interaction';

export type FrameStats = {
  sampleCount: number;
  p50Ms: number;
  p95Ms: number;
  meanMs: number;
  pctOver25Ms: number;
  maxMs: number;
};

export type LongTaskStats = {
  count: number;
  totalMs: number;
  maxMs: number;
};

export type GpuTimingSummary = {
  supported: boolean;
  extension: string | null;
  sampleCount: number;
  meanMs: number;
  p95Ms: number;
  maxMs: number;
  byLabel: Record<
    string,
    { sampleCount: number; meanMs: number; p95Ms: number; maxMs: number }
  >;
};

export type PerfLabSummary = {
  schemaVersion: 1;
  scenarioId: ScenarioId | 'manual';
  startedAt: string;
  endedAt: string;
  durationMs: number;
  userAgent: string;
  devicePixelRatio: number;
  viewport: { width: number; height: number };
  visibility: DocumentVisibilityState;
  frame: FrameStats;
  longTasks: LongTaskStats;
  gpuTiming: GpuTimingSummary;
  canvasCount: number;
  webglContextHint: number;
  activeRafSamples: number;
  effectOverrides: EffectOverrides;
  notes: string[];
};

export type PerfLabApi = {
  /** Whether the lab bootstrap is active. */
  enabled: boolean;
  effects: EffectOverrides;
  setEffect: (name: EffectName, enabled: boolean) => void;
  resetEffects: () => void;
  start: () => void;
  stop: () => void;
  reset: () => void;
  /** Structured summary + console dump (copyable). */
  dump: (scenarioId?: ScenarioId | 'manual') => PerfLabSummary;
  /** Trigger a JSON file download of the latest/current dump. */
  download: (scenarioId?: ScenarioId | 'manual') => PerfLabSummary;
  /** Optional POST to /api/perf-lab (or custom URL). */
  post: (url?: string) => Promise<{ ok: boolean; id?: string; error?: string }>;
  run: (scenarioId: ScenarioId) => Promise<PerfLabSummary>;
  runAll: () => Promise<PerfLabSummary[]>;
  listScenarios: () => ScenarioId[];
  getLastSummary: () => PerfLabSummary | null;
};

declare global {
  interface Window {
    __gpuPerfLab?: PerfLabApi;
  }
}

export {};
