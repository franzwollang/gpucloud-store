/**
 * M3.0 Performance laboratory — recoverable device-run harness.
 *
 * Enable: add `?perfLab=1` (works in production builds) or run in development.
 * Console:
 *   await window.__gpuPerfLab.run('idle-hero')
 *   await window.__gpuPerfLab.run('lightning-burst')
 *   await window.__gpuPerfLab.run('carousel-turnover')
 *   await window.__gpuPerfLab.run('crt-visible')
 *   await window.__gpuPerfLab.run('spotlight-hover')
 *   await window.__gpuPerfLab.run('header-cta-interaction')
 *   await window.__gpuPerfLab.runAll()
 *   window.__gpuPerfLab.dump()
 *   window.__gpuPerfLab.download()
 *   await window.__gpuPerfLab.post()  // optional POST /api/perf-lab
 *   window.__gpuPerfLab.setEffect('fog', false)
 */

import {
  getEffectOverrides,
  resetEffectOverrides,
  setEffectOverride
} from '@/lib/animation/effectOverrides';
import {
  listScenarios,
  runAllScenarios,
  runScenario
} from '@/lib/animation/scenarios';
import {
  buildSummary,
  resetTelemetry,
  startTelemetry,
  stopTelemetry
} from '@/lib/animation/telemetry';
import type {
  EffectName,
  PerfLabApi,
  PerfLabSummary,
  ScenarioId
} from '@/lib/animation/types';

let lastSummary: PerfLabSummary | null = null;
let installed = false;

function logDump(summary: PerfLabSummary): void {
  const gpuBit =
    summary.gpuTiming.sampleCount > 0
      ? ` gpuP95=${summary.gpuTiming.p95Ms}ms`
      : summary.gpuTiming.supported
        ? ' gpu=ext-no-samples'
        : ' gpu=fallback-frame';
  const banner = `[gpuPerfLab] scenario=${summary.scenarioId} p95=${summary.frame.p95Ms}ms over25=${summary.frame.pctOver25Ms}% longTasks=${summary.longTasks.count}${gpuBit}`;
  // Structured + copyable — phone runs can screenshot/select this JSON.
  console.info(banner);
  console.info(JSON.stringify(summary, null, 2));
}

function dump(scenarioId: ScenarioId | 'manual' = 'manual'): PerfLabSummary {
  const resolvedId =
    scenarioId === 'manual'
      ? (lastSummary?.scenarioId ?? 'manual')
      : scenarioId;
  const summary = buildSummary(resolvedId);
  lastSummary = summary;
  logDump(summary);
  return summary;
}

function download(scenarioId: ScenarioId | 'manual' = 'manual'): PerfLabSummary {
  const summary = dump(scenarioId);
  const blob = new Blob([JSON.stringify(summary, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gpu-perf-lab-${summary.scenarioId}-${Date.now()}.json`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return summary;
}

async function post(
  url = '/api/perf-lab'
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const summary = lastSummary ?? dump('manual');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(summary)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, error: text || `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { id?: string };
    console.info('[gpuPerfLab] posted scenario', data.id ?? '(no id)');
    return { ok: true, id: data.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[gpuPerfLab] post failed', message);
    return { ok: false, error: message };
  }
}

async function run(scenarioId: ScenarioId): Promise<PerfLabSummary> {
  console.info(`[gpuPerfLab] running scenario: ${scenarioId}`);
  const summary = await runScenario(scenarioId);
  lastSummary = summary;
  logDump(summary);
  return summary;
}

async function runAll(): Promise<PerfLabSummary[]> {
  console.info('[gpuPerfLab] running all scenarios…');
  const summaries = await runAllScenarios();
  lastSummary = summaries[summaries.length - 1] ?? null;
  for (const summary of summaries) {
    logDump(summary);
  }
  return summaries;
}

function createApi(): PerfLabApi {
  return {
    enabled: true,
    get effects() {
      return getEffectOverrides();
    },
    setEffect(name: EffectName, enabled: boolean) {
      setEffectOverride(name, enabled);
    },
    resetEffects() {
      resetEffectOverrides();
    },
    start() {
      startTelemetry();
    },
    stop() {
      stopTelemetry();
    },
    reset() {
      resetTelemetry();
      lastSummary = null;
    },
    dump,
    download,
    post,
    run,
    runAll,
    listScenarios,
    getLastSummary() {
      return lastSummary;
    }
  };
}

/** Install `window.__gpuPerfLab` once. Safe to call repeatedly. */
export function installPerfLab(): PerfLabApi {
  if (typeof window === 'undefined') {
    throw new Error('installPerfLab requires a browser environment');
  }
  if (installed && window.__gpuPerfLab) {
    return window.__gpuPerfLab;
  }
  const api = createApi();
  window.__gpuPerfLab = api;
  installed = true;
  console.info(
    '[gpuPerfLab] ready — try: await __gpuPerfLab.run("idle-hero")'
  );
  return api;
}

export function uninstallPerfLab(): void {
  if (typeof window === 'undefined') return;
  resetTelemetry();
  delete window.__gpuPerfLab;
  installed = false;
}

export function shouldEnablePerfLab(): boolean {
  if (typeof window === 'undefined') return false;
  if (process.env.NODE_ENV === 'development') return true;
  try {
    return new URLSearchParams(window.location.search).get('perfLab') === '1';
  } catch {
    return false;
  }
}
