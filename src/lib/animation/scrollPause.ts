/**
 * Page-level animation pause while a programmatic smooth scroll runs.
 * Sets UI store `scrollPaused` so section effects freeze until scroll settles.
 */

import { useUIStore } from '@/stores/ui';

let pauseDepth = 0;

function setScrollPaused(paused: boolean): void {
  useUIStore.getState().setVisibilities(() => ({ scrollPaused: paused }));
}

/** Wait two frames so React can apply pause before scroll starts. */
function nextPaint(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Resolve when window scroll settles (`scrollend` + idle fallback).
 * Caps at `timeoutMs` so pause never sticks forever.
 */
export function waitForScrollIdle(timeoutMs = 2500): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  return new Promise(resolve => {
    let settled = false;
    let raf = 0;
    let idleFrames = 0;
    let lastY = window.scrollY;

    const done = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener('scrollend', onScrollEnd);
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      resolve();
    };

    const onScrollEnd = () => done();
    window.addEventListener('scrollend', onScrollEnd, { once: true });

    const tick = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 0.5) {
        idleFrames += 1;
        if (idleFrames >= 10) {
          done();
          return;
        }
      } else {
        idleFrames = 0;
        lastY = y;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const timer = window.setTimeout(done, timeoutMs);
  });
}

/** Pause all gated animations, run `action`, wait for scroll idle, then resume. */
export async function withAnimationScrollPause(
  action: () => void | Promise<void>
): Promise<void> {
  pauseDepth += 1;
  if (pauseDepth === 1) {
    setScrollPaused(true);
    await nextPaint();
  }

  try {
    await action();
    await waitForScrollIdle();
  } finally {
    pauseDepth = Math.max(0, pauseDepth - 1);
    if (pauseDepth === 0) {
      setScrollPaused(false);
    }
  }
}

export type SmoothScrollToOptions = {
  /** scrollIntoView block; ignored when `getTargetTop` is set. */
  block?: ScrollLogicalPosition;
  /** Custom window scroll Y (e.g. pin section bottom to viewport). */
  getTargetTop?: (el: HTMLElement) => number;
};

/** Smooth-scroll to an element id while animations are page-paused. */
export async function smoothScrollToId(
  elementId: string,
  options: SmoothScrollToOptions = {}
): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) return;

  const { block = 'center', getTargetTop } = options;

  await withAnimationScrollPause(() => {
    if (typeof history !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.hash !== `#${elementId}`) {
        url.hash = elementId;
        history.pushState(null, '', url);
      }
    }

    if (getTargetTop) {
      window.scrollTo({
        top: Math.max(0, getTargetTop(el)),
        behavior: 'smooth'
      });
      return;
    }

    el.scrollIntoView({
      behavior: 'smooth',
      block,
      inline: 'nearest'
    });
  });
}

/** Contact-form scroll helper used by CTAs and hash links. */
export function smoothScrollToContact(
  contactAnchorId: string,
  options?: SmoothScrollToOptions
): Promise<void> {
  return smoothScrollToId(contactAnchorId, {
    ...options,
    // Dock the contact block into the viewport. Do NOT use block:'center' —
    // near document end the browser overscrolls and reveals the footer.
    getTargetTop:
      options?.getTargetTop ??
      ((el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        // Matches header / contact `mt-[5.5rem]` clearance.
        const headerOffsetPx = 5.5 * 16;
        // Furthest scroll that keeps contact bottom flush with the viewport
        // bottom — anything past this peeks the footer.
        const maxDock = absoluteTop + rect.height - window.innerHeight;

        let target: number;
        if (rect.height + headerOffsetPx <= window.innerHeight) {
          target = maxDock;
        } else {
          target = absoluteTop - headerOffsetPx;
        }

        const docMax = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight
        );
        return Math.max(0, Math.min(target, maxDock, docMax));
      })
  });
}
