/**
 * Optional WebGL GPU timing for M3.0.
 * Uses EXT_disjoint_timer_query(_webgl2) when available; otherwise records
 * nothing and lets frame-time EWMA remain the fallback (see telemetry).
 */

export type GpuTimingSample = {
  label: string;
  ms: number;
};

export type GpuTimingStats = {
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

type PendingQuery = {
  label: string;
  query: WebGLQuery | WebGLTimerQueryEXT;
  ext: TimerExt;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  isWebGL2: boolean;
};

type TimerExt = {
  TIME_ELAPSED_EXT: number;
  GPU_DISJOINT_EXT: number;
  QUERY_RESULT_EXT?: number;
  QUERY_RESULT_AVAILABLE_EXT?: number;
  createQueryEXT?: () => WebGLTimerQueryEXT;
  beginQueryEXT?: (target: number, query: WebGLTimerQueryEXT) => void;
  endQueryEXT?: (target: number) => void;
  getQueryObjectEXT?: (
    query: WebGLTimerQueryEXT,
    pname: number
  ) => number | boolean;
  deleteQueryEXT?: (query: WebGLTimerQueryEXT) => void;
};

// Minimal typing for the WebGL1 timer-query extension object shape.
type WebGLTimerQueryEXT = object;

const samples: GpuTimingSample[] = [];
const pending: PendingQuery[] = [];
let pollRaf: number | null = null;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)
  );
  return sorted[idx] ?? 0;
}

function statsFor(values: number[]): {
  sampleCount: number;
  meanMs: number;
  p95Ms: number;
  maxMs: number;
} {
  if (values.length === 0) {
    return { sampleCount: 0, meanMs: 0, p95Ms: 0, maxMs: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    sampleCount: values.length,
    meanMs: round2(sum / values.length),
    p95Ms: round2(percentile(sorted, 95)),
    maxMs: round2(sorted[sorted.length - 1] ?? 0)
  };
}

function resolveExtension(
  gl: WebGLRenderingContext | WebGL2RenderingContext
): { ext: TimerExt; isWebGL2: boolean; name: string } | null {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2') as TimerExt | null;
    if (ext) return { ext, isWebGL2: true, name: 'EXT_disjoint_timer_query_webgl2' };
  }
  const ext = gl.getExtension('EXT_disjoint_timer_query') as TimerExt | null;
  if (ext) return { ext, isWebGL2: false, name: 'EXT_disjoint_timer_query' };
  return null;
}

function ensurePollLoop(): void {
  if (typeof window === 'undefined' || pollRaf != null) return;
  const tick = () => {
    pollPending();
    pollRaf = pending.length > 0 ? requestAnimationFrame(tick) : null;
  };
  pollRaf = requestAnimationFrame(tick);
}

function pollPending(): void {
  if (pending.length === 0) return;
  const stillPending: PendingQuery[] = [];

  for (const item of pending) {
    const { gl, ext, query, isWebGL2, label } = item;
    try {
      const disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);
      if (disjoint) {
        // Drop this sample — GPU timing was interrupted.
        if (isWebGL2) {
          (gl as WebGL2RenderingContext).deleteQuery(query as WebGLQuery);
        } else {
          ext.deleteQueryEXT?.(query as WebGLTimerQueryEXT);
        }
        continue;
      }

      let available = false;
      let nanos = 0;

      if (isWebGL2) {
        const gl2 = gl as WebGL2RenderingContext;
        available = Boolean(
          gl2.getQueryParameter(query as WebGLQuery, gl2.QUERY_RESULT_AVAILABLE)
        );
        if (available) {
          nanos = Number(
            gl2.getQueryParameter(query as WebGLQuery, gl2.QUERY_RESULT)
          );
          gl2.deleteQuery(query as WebGLQuery);
        }
      } else {
        available = Boolean(
          ext.getQueryObjectEXT?.(
            query as WebGLTimerQueryEXT,
            ext.QUERY_RESULT_AVAILABLE_EXT ?? 0
          )
        );
        if (available) {
          nanos = Number(
            ext.getQueryObjectEXT?.(
              query as WebGLTimerQueryEXT,
              ext.QUERY_RESULT_EXT ?? 0
            )
          );
          ext.deleteQueryEXT?.(query as WebGLTimerQueryEXT);
        }
      }

      if (!available) {
        stillPending.push(item);
        continue;
      }

      // Nanoseconds → milliseconds
      samples.push({ label, ms: nanos / 1e6 });
    } catch {
      // Ignore failed polls; keep collecting frame stats.
    }
  }

  pending.length = 0;
  pending.push(...stillPending);
}

/**
 * Wrap a single draw submission with a GPU timer query when supported.
 * Safe no-op when the extension is missing or too many queries are in flight.
 */
export function withGpuTimer(
  gl: WebGLRenderingContext | WebGL2RenderingContext | null | undefined,
  label: string,
  draw: () => void
): void {
  if (!gl) {
    draw();
    return;
  }

  const resolved = resolveExtension(gl);
  if (!resolved || pending.length > 8) {
    draw();
    return;
  }

  const { ext, isWebGL2 } = resolved;
  let query: WebGLQuery | WebGLTimerQueryEXT | null = null;

  try {
    if (isWebGL2) {
      const gl2 = gl as WebGL2RenderingContext;
      query = gl2.createQuery();
      if (!query) {
        draw();
        return;
      }
      gl2.beginQuery(ext.TIME_ELAPSED_EXT, query);
      draw();
      gl2.endQuery(ext.TIME_ELAPSED_EXT);
    } else {
      query = ext.createQueryEXT?.() ?? null;
      if (!query) {
        draw();
        return;
      }
      ext.beginQueryEXT?.(ext.TIME_ELAPSED_EXT, query as WebGLTimerQueryEXT);
      draw();
      ext.endQueryEXT?.(ext.TIME_ELAPSED_EXT);
    }
    pending.push({ label, query, ext, gl, isWebGL2 });
    ensurePollLoop();
  } catch {
    draw();
  }
}

export function markWebGlCanvas(canvas: HTMLCanvasElement | null): void {
  if (!canvas) return;
  canvas.dataset.perfLabWebgl = '1';
}

export function resetGpuTiming(): void {
  samples.length = 0;
  // Drop pending without waiting — queries may still complete harmlessly.
  pending.length = 0;
  if (pollRaf != null && typeof window !== 'undefined') {
    cancelAnimationFrame(pollRaf);
    pollRaf = null;
  }
}

export function getGpuTimingStats(): GpuTimingStats {
  pollPending();

  const supported =
    typeof document !== 'undefined' &&
    (() => {
      try {
        const canvas = document.createElement('canvas');
        const gl2 = canvas.getContext('webgl2');
        if (gl2?.getExtension('EXT_disjoint_timer_query_webgl2')) {
          return true;
        }
        const gl = canvas.getContext('webgl');
        return Boolean(gl?.getExtension('EXT_disjoint_timer_query'));
      } catch {
        return false;
      }
    })();

  let extension: string | null = null;
  if (supported && typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      const gl2 = canvas.getContext('webgl2');
      if (gl2?.getExtension('EXT_disjoint_timer_query_webgl2')) {
        extension = 'EXT_disjoint_timer_query_webgl2';
      } else {
        const gl = canvas.getContext('webgl');
        if (gl?.getExtension('EXT_disjoint_timer_query')) {
          extension = 'EXT_disjoint_timer_query';
        }
      }
    } catch {
      extension = null;
    }
  }

  const overall = statsFor(samples.map(s => s.ms));
  const valuesByLabel = new Map<string, number[]>();
  for (const sample of samples) {
    const list = valuesByLabel.get(sample.label) ?? [];
    list.push(sample.ms);
    valuesByLabel.set(sample.label, list);
  }

  const byLabel: GpuTimingStats['byLabel'] = {};
  for (const [label, values] of valuesByLabel) {
    byLabel[label] = statsFor(values);
  }

  return {
    supported,
    extension,
    sampleCount: overall.sampleCount,
    meanMs: overall.meanMs,
    p95Ms: overall.p95Ms,
    maxMs: overall.maxMs,
    byLabel
  };
}
