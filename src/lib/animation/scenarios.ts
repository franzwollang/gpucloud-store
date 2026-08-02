import type { ScenarioId } from '@/lib/animation/types';
import {
  buildSummary,
  resetTelemetry,
  startTelemetry,
  stopTelemetry
} from '@/lib/animation/telemetry';
import type { PerfLabSummary } from '@/lib/animation/types';

const SCENARIO_IDS: ScenarioId[] = [
  'idle-hero',
  'lightning-burst',
  'hero-to-availability-scroll',
  'carousel-turnover',
  'crt-visible',
  'spotlight-hover',
  'header-cta-interaction'
];

export function listScenarios(): ScenarioId[] {
  return [...SCENARIO_IDS];
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms);
  });
}

function findByPerfLab(marker: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-perf-lab="${marker}"]`);
}

function findSectionByAnchorSubstring(part: string): HTMLElement | null {
  const lowered = part.toLowerCase();
  const nodes = document.querySelectorAll<HTMLElement>('[id]');
  for (const node of nodes) {
    if (node.id.toLowerCase().includes(lowered)) return node;
  }
  return null;
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

async function scrollElementIntoView(
  el: HTMLElement,
  notes: string[],
  label: string
): Promise<void> {
  const startY = window.scrollY;
  const rect = el.getBoundingClientRect();
  const targetY = Math.max(0, window.scrollY + rect.top - 80);
  const steps = 28;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    window.scrollTo({
      top: Math.round(startY + (targetY - startY) * eased),
      left: 0,
      behavior: 'auto'
    });
    await sleep(36);
  }
  await sleep(400);
  notes.push(`Scrolled to ${label}${el.id ? ` (#${el.id})` : ''}`);
}

async function waitForIdleHero(durationMs: number): Promise<string[]> {
  const notes: string[] = [];
  scrollToTop();
  await sleep(100);
  const hero =
    findByPerfLab('hero') ??
    findSectionByAnchorSubstring('home') ??
    findSectionByAnchorSubstring('hero') ??
    document.querySelector<HTMLElement>('main') ??
    document.body;
  if (!hero) {
    notes.push('Hero section not found; measured at document top.');
  } else {
    hero.scrollIntoView({ block: 'start', behavior: 'auto' });
  }
  await sleep(durationMs);
  return notes;
}

async function waitForLightningBurst(): Promise<string[]> {
  // Lightning clusters are time-driven in the fog shader; hold the hero long
  // enough for at least one storm window while GPU timers sample draws.
  const notes = await waitForIdleHero(8000);
  notes.push('Held hero for ~8s to capture lightning cluster activity.');
  return notes;
}

async function waitForHeroToAvailability(): Promise<string[]> {
  const notes: string[] = [];
  scrollToTop();
  await sleep(80);

  const availability =
    findByPerfLab('crt') ??
    findSectionByAnchorSubstring('featured-availability') ??
    findSectionByAnchorSubstring('availability');

  if (!availability) {
    notes.push(
      'Availability anchor not found; performed synthetic scroll instead.'
    );
    const distance = Math.min(
      document.documentElement.scrollHeight - window.innerHeight,
      Math.round(window.innerHeight * 1.4)
    );
    const steps = 24;
    for (let i = 1; i <= steps; i += 1) {
      window.scrollTo({
        top: Math.round((distance * i) / steps),
        left: 0,
        behavior: 'auto'
      });
      await sleep(50);
    }
    await sleep(400);
    return notes;
  }

  await scrollElementIntoView(availability, notes, 'availability/CRT');
  return notes;
}

async function waitForCarouselTurnover(): Promise<string[]> {
  const notes = await waitForIdleHero(400);
  const carousel = findByPerfLab('carousel');
  if (!carousel) {
    notes.push('Carousel marker missing; waiting for default 10s auto-advance.');
    await sleep(10500);
    return notes;
  }

  window.dispatchEvent(
    new CustomEvent('gpu-perf-lab:carousel-advance', { bubbles: true })
  );
  notes.push('Dispatched gpu-perf-lab:carousel-advance');
  // MorphingText + card transitions settle within ~1.5s.
  await sleep(1800);
  return notes;
}

async function waitForCrtVisible(): Promise<string[]> {
  const notes: string[] = [];
  const crt =
    findByPerfLab('crt') ??
    findSectionByAnchorSubstring('featured-availability');
  if (!crt) {
    notes.push('CRT/availability section not found.');
    await sleep(1000);
    return notes;
  }
  await scrollElementIntoView(crt, notes, 'CRT');
  await sleep(3500);
  notes.push('Measured CRT scanline/filter activity for ~3.5s.');
  return notes;
}

async function waitForSpotlightHover(): Promise<string[]> {
  const notes: string[] = [];
  const spotlight =
    findByPerfLab('spotlight') ??
    findSectionByAnchorSubstring('about');
  if (!spotlight) {
    notes.push('Spotlight section not found.');
    await sleep(1000);
    return notes;
  }

  await scrollElementIntoView(spotlight, notes, 'spotlight');

  const area =
    spotlight.querySelector<HTMLElement>('[data-perf-lab="spotlight-area"]') ??
    spotlight;
  const rect = area.getBoundingClientRect();
  const points = [
    { x: rect.left + rect.width * 0.25, y: rect.top + rect.height * 0.4 },
    { x: rect.left + rect.width * 0.55, y: rect.top + rect.height * 0.55 },
    { x: rect.left + rect.width * 0.75, y: rect.top + rect.height * 0.35 },
    { x: rect.left + rect.width * 0.4, y: rect.top + rect.height * 0.7 }
  ];

  const first = points[0];
  if (!first) return notes;

  area.dispatchEvent(
    new PointerEvent('pointerenter', {
      bubbles: true,
      clientX: first.x,
      clientY: first.y
    })
  );
  area.dispatchEvent(
    new MouseEvent('mouseenter', {
      bubbles: true,
      clientX: first.x,
      clientY: first.y
    })
  );

  for (const point of points) {
    area.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: point.x,
        clientY: point.y
      })
    );
    await sleep(220);
  }

  await sleep(800);
  area.dispatchEvent(
    new MouseEvent('mouseleave', { bubbles: true })
  );
  notes.push('Simulated spotlight pointer path across reveal area.');
  return notes;
}

async function waitForHeaderCtaInteraction(): Promise<string[]> {
  const notes: string[] = [];
  scrollToTop();
  await sleep(100);

  const cta =
    document.querySelector<HTMLButtonElement>('[data-perf-lab="header-cta"]') ??
    Array.from(document.querySelectorAll<HTMLButtonElement>('header button')).find(
      btn =>
        /request quote|quote|cta/i.test(
          `${btn.getAttribute('aria-label') ?? ''} ${btn.textContent ?? ''}`
        )
    ) ??
    null;

  if (!cta) {
    notes.push('Header CTA button not found; measured idle header only.');
    await sleep(1200);
    return notes;
  }

  cta.focus();
  await sleep(200);
  cta.click();
  notes.push('Clicked header Request Quote CTA (scrolls toward contact).');
  await sleep(1600);
  return notes;
}

/**
 * Run a deterministic scenario while collecting frame/long-task telemetry.
 * Invocation (browser console): `await window.__gpuPerfLab.run('idle-hero')`
 */
export async function runScenario(
  scenarioId: ScenarioId
): Promise<PerfLabSummary> {
  resetTelemetry();
  startTelemetry();

  let notes: string[] = [];
  try {
    switch (scenarioId) {
      case 'idle-hero':
        notes = await waitForIdleHero(3000);
        break;
      case 'lightning-burst':
        notes = await waitForLightningBurst();
        break;
      case 'hero-to-availability-scroll':
        notes = await waitForHeroToAvailability();
        break;
      case 'carousel-turnover':
        notes = await waitForCarouselTurnover();
        break;
      case 'crt-visible':
        notes = await waitForCrtVisible();
        break;
      case 'spotlight-hover':
        notes = await waitForSpotlightHover();
        break;
      case 'header-cta-interaction':
        notes = await waitForHeaderCtaInteraction();
        break;
      default: {
        const _exhaustive: never = scenarioId;
        throw new Error(`Unknown scenario: ${String(_exhaustive)}`);
      }
    }
  } finally {
    stopTelemetry();
  }

  return buildSummary(scenarioId, notes);
}

/** Run every registered scenario sequentially (device baseline helper). */
export async function runAllScenarios(): Promise<PerfLabSummary[]> {
  const results: PerfLabSummary[] = [];
  for (const id of SCENARIO_IDS) {
    results.push(await runScenario(id));
    await sleep(250);
  }
  return results;
}
