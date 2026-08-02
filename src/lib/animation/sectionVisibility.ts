/**
 * Shared section visibility policy for PageDirector / UI store (M3.1).
 * Hysteresis: prewarm ~300px before entry; dwell 600ms after exit to avoid flap.
 */

/** Expanded IntersectionObserver rootMargin for `isNear` prewarm. */
export const NEAR_ROOT_MARGIN = '300px 0px 300px 0px';

/** Delay before clearing latched near/active after raw exit (500–750ms band). */
export const EXIT_DWELL_MS = 600;

export type ExitDwellLatch = {
  latched: boolean;
  timer: ReturnType<typeof setTimeout> | null;
};

/** Enter immediately; clear only after `dwellMs` past raw exit. */
export function syncExitDwellLatch(
  state: ExitDwellLatch,
  raw: boolean,
  dwellMs: number,
  onChange: () => void
): void {
  if (raw) {
    if (state.timer != null) {
      clearTimeout(state.timer);
      state.timer = null;
    }
    if (!state.latched) {
      state.latched = true;
      onChange();
    }
    return;
  }

  if (!state.latched || state.timer != null) return;

  state.timer = setTimeout(() => {
    state.timer = null;
    state.latched = false;
    onChange();
  }, dwellMs);
}

export function clearExitDwellLatch(state: ExitDwellLatch): void {
  if (state.timer != null) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}
