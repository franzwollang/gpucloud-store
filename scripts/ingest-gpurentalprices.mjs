#!/usr/bin/env node
/**
 * Fetch today's catalog snapshots and write last-good JSON used by `public/data.ts`.
 * Fail soft per feed: leave the existing snapshot on error.
 *
 * Usage: pnpm catalog:ingest
 *
 * Normalization / allowlist live in `src/lib/catalog/` and run when the app
 * loads `public/data.ts`. This script only refreshes committed snapshots.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FEEDS = [
  {
    id: 'gpurentalprices',
    url: 'https://gpurentalprices.com/api/latest.json',
    outPath: 'public/data/gpurentalprices-latest.json',
    validate: payload =>
      Array.isArray(payload?.offers) && payload.offers.length > 0,
    describe: payload =>
      `offers=${payload.offers.length} providers=${
        payload.meta?.provider_count ??
        Object.keys(payload.providers ?? {}).length
      }`
  },
  {
    id: 'gpucloudcompare',
    url: 'https://gpucloudcompare.com/data/current.json',
    outPath: 'public/data/gpucloudcompare-latest.json',
    validate: payload =>
      Array.isArray(payload?.plans) && payload.plans.length > 0,
    describe: payload =>
      `plans=${payload.plans.length} providers=${payload.provider_count ?? payload.providers?.length ?? 'unknown'}`
  }
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function readExisting(outPath) {
  const absolute = path.join(root, outPath);
  try {
    return JSON.parse(await readFile(absolute, 'utf8'));
  } catch {
    return null;
  }
}

async function ingestFeed(feed) {
  const absoluteOut = path.join(root, feed.outPath);
  await mkdir(path.dirname(absoluteOut), { recursive: true });
  const existing = await readExisting(feed.outPath);

  let payload;
  try {
    const response = await fetch(feed.url, {
      headers: { accept: 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    payload = await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[catalog:ingest] ${feed.id} fetch failed: ${message}`);
    if (feed.validate(existing)) {
      console.error(
        `[catalog:ingest] ${feed.id} keeping last-good snapshot (${existing.captured_at ?? existing.date ?? 'unknown'})`
      );
      return { ok: true, kept: true };
    }
    return { ok: false, kept: false };
  }

  if (!feed.validate(payload)) {
    console.error(`[catalog:ingest] ${feed.id} unexpected/empty payload`);
    if (feed.validate(existing)) {
      console.error(`[catalog:ingest] ${feed.id} keeping last-good snapshot`);
      return { ok: true, kept: true };
    }
    return { ok: false, kept: false };
  }

  await writeFile(absoluteOut, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(
    `[catalog:ingest] wrote ${feed.outPath} (${feed.describe(payload)})`
  );
  return { ok: true, kept: false };
}

async function main() {
  const results = [];
  for (const feed of FEEDS) {
    results.push(await ingestFeed(feed));
  }

  const failures = results.filter(result => !result.ok);
  if (failures.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(
    '[catalog:ingest] app normalize/merge: src/lib/catalog (public/data.ts)'
  );
}

main().catch(error => {
  console.error('[catalog:ingest] unexpected error', error);
  process.exitCode = 1;
});
