import type {
  FrameStats,
  LongTaskStats,
  PerfLabSummary,
  ScenarioId
} from '@/lib/animation/types';
import { getEffectOverrides } from '@/lib/animation/effectOverrides';
import {
  getGpuTimingStats,
  resetGpuTiming
} from '@/lib/animation/webglTimers';

type CollectorState = {
  running: boolean;
  startedAtMs: number;
  frameIntervals: number[];
  longTasks: { duration: number; startTime: number }[];
  rafId: number | null;
  lastFrameMs: number | null;
  longTaskObserver: PerformanceObserver | null;
  activeRafSamples: number;
};

const state: CollectorState = {
  running: false,
  startedAtMs: 0,
  frameIntervals: [],
  longTasks: [],
  rafId: null,
  lastFrameMs: null,
  longTaskObserver: null,
  activeRafSamples: 0
};

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)
  );
  return sorted[idx] ?? 0;
}

function computeFrameStats(intervals: number[]): FrameStats {
  if (intervals.length === 0) {
    return {
      sampleCount: 0,
      p50Ms: 0,
      p95Ms: 0,
      meanMs: 0,
      pctOver25Ms: 0,
      maxMs: 0
    };
  }
  const sorted = [...intervals].sort((a, b) => a - b);
  const sum = intervals.reduce((acc, v) => acc + v, 0);
  const over25 = intervals.filter(v => v > 25).length;
  return {
    sampleCount: intervals.length,
    p50Ms: round2(percentile(sorted, 50)),
    p95Ms: round2(percentile(sorted, 95)),
    meanMs: round2(sum / intervals.length),
    pctOver25Ms: round2((over25 / intervals.length) * 100),
    maxMs: round2(sorted[sorted.length - 1] ?? 0)
  };
}

function computeLongTaskStats(
  tasks: { duration: number }[]
): LongTaskStats {
  if (tasks.length === 0) {
    return { count: 0, totalMs: 0, maxMs: 0 };
  }
  const durations = tasks.map(t => t.duration);
  return {
    count: tasks.length,
    totalMs: round2(durations.reduce((a, b) => a + b, 0)),
    maxMs: round2(Math.max(...durations))
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Heuristic only — never call getContext() here (that can create contexts).
 * Counts canvases that look like WebGL backings used by fog/spotlight/R3F.
 */
function countLikelyWebGlCanvases(): number {
  if (typeof document === 'undefined') return 0;
  let count = 0;
  for (const canvas of document.querySelectorAll('canvas')) {
    const el = canvas as HTMLCanvasElement;
    // R3F / custom WebGL canvases are typically full-bleed or data-engine tagged.
    if (
      el.dataset.engine === 'three.js' ||
      el.dataset.perfLabWebgl === '1' ||
      el.className.includes('webgl') ||
      (el.width > 0 && el.height > 0 && !el.getAttribute('role'))
    ) {
      count += 1;
    }
  }
  return count;
}

function onFrame(now: number): void {
  if (!state.running) return;
  state.activeRafSamples += 1;
  if (state.lastFrameMs != null) {
    const delta = now - state.lastFrameMs;
    // Ignore absurd gaps (tab backgrounded / debugger pauses)
    if (delta > 0 && delta < 2000) {
      state.frameIntervals.push(delta);
    }
  }
  state.lastFrameMs = now;
  state.rafId = requestAnimationFrame(onFrame);
}

export function startTelemetry(): void {
  if (typeof window === 'undefined') return;
  if (state.running) return;

  state.running = true;
  state.startedAtMs = performance.now();
  state.frameIntervals = [];
  state.longTasks = [];
  state.lastFrameMs = null;
  state.activeRafSamples = 0;
  resetGpuTiming();

  if (typeof PerformanceObserver !== 'undefined') {
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          state.longTasks.push({
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
      observer.observe({ type: 'longtask', buffered: true } as PerformanceObserverInit);
      state.longTaskObserver = observer;
    } catch {
      state.longTaskObserver = null;
    }
  }

  state.rafId = requestAnimationFrame(onFrame);
}

export function stopTelemetry(): void {
  state.running = false;
  if (state.rafId != null) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
  if (state.longTaskObserver) {
    state.longTaskObserver.disconnect();
    state.longTaskObserver = null;
  }
}

export function resetTelemetry(): void {
  stopTelemetry();
  state.frameIntervals = [];
  state.longTasks = [];
  state.lastFrameMs = null;
  state.activeRafSamples = 0;
  state.startedAtMs = 0;
  resetGpuTiming();
}

export function isTelemetryRunning(): boolean {
  return state.running;
}

export function buildSummary(
  scenarioId: ScenarioId | 'manual' = 'manual',
  notes: string[] = []
): PerfLabSummary {
  const endedAtMs = performance.now();
  const startedAtMs = state.startedAtMs || endedAtMs;
  const canvasCount =
    typeof document !== 'undefined'
      ? document.querySelectorAll('canvas').length
      : 0;

  const summaryNotes = [...notes];
  if (!state.longTaskObserver) {
    summaryNotes.push(
      'Long-task observer unavailable in this browser; frame stats only.'
    );
  }

  const gpuTiming = getGpuTimingStats();
  if (!gpuTiming.supported) {
    summaryNotes.push(
      'WebGL timer queries unavailable; using frame-time EWMA as GPU-cost fallback.'
    );
  } else if (gpuTiming.sampleCount === 0) {
    summaryNotes.push(
      'WebGL timer extension present but no GPU samples recorded this run.'
    );
  }

  return {
    schemaVersion: 1,
    scenarioId,
    startedAt: new Date(Date.now() - (endedAtMs - startedAtMs)).toISOString(),
    endedAt: new Date().toISOString(),
    durationMs: round2(endedAtMs - startedAtMs),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    devicePixelRatio:
      typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    viewport: {
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0
    },
    visibility:
      typeof document !== 'undefined' ? document.visibilityState : 'visible',
    frame: computeFrameStats(state.frameIntervals),
    longTasks: computeLongTaskStats(state.longTasks),
    gpuTiming,
    canvasCount,
    webglContextHint: countLikelyWebGlCanvases(),
    activeRafSamples: state.activeRafSamples,
    effectOverrides: getEffectOverrides(),
    notes: summaryNotes
  };
}
