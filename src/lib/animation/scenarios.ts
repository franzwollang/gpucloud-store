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
  'hero-to-availability-scroll'
];

export function listScenarios(): ScenarioId[] {
  return [...SCENARIO_IDS];
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms);
  });
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

async function waitForIdleHero(durationMs: number): Promise<string[]> {
  const notes: string[] = [];
  scrollToTop();
  await sleep(100);
  const hero =
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

async function waitForHeroToAvailability(): Promise<string[]> {
  const notes: string[] = [];
  scrollToTop();
  await sleep(80);

  const availability =
    findSectionByAnchorSubstring('availability') ??
    findSectionByAnchorSubstring('about');

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

  // Smooth-ish programmatic scroll so IntersectionObserver + animations engage.
  const startY = window.scrollY;
  const rect = availability.getBoundingClientRect();
  const targetY = Math.max(0, window.scrollY + rect.top - 80);
  const steps = 30;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    // ease-in-out
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    window.scrollTo({
      top: Math.round(startY + (targetY - startY) * eased),
      left: 0,
      behavior: 'auto'
    });
    await sleep(40);
  }
  await sleep(600);
  notes.push(`Scrolled to #${availability.id}`);
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
      case 'hero-to-availability-scroll':
        notes = await waitForHeroToAvailability();
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
