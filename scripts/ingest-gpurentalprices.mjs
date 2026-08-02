#!/usr/bin/env node
/**
 * Fetch today's gpurentalprices.com snapshot and write the last-good JSON
 * used by `public/data.ts`. Fail soft: leave the existing snapshot on error.
 *
 * Usage: pnpm catalog:ingest
 *
 * Normalization / allowlist live in `src/lib/catalog/` and run when the app
 * loads `public/data.ts`. This script only refreshes the committed snapshot.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FEED_URL = 'https://gpurentalprices.com/api/latest.json';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outPath = path.join(root, 'public/data/gpurentalprices-latest.json');

async function readExisting() {
  try {
    return JSON.parse(await readFile(outPath, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  await mkdir(path.dirname(outPath), { recursive: true });
  const existing = await readExisting();

  let payload;
  try {
    const response = await fetch(FEED_URL, {
      headers: { accept: 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    payload = await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[catalog:ingest] fetch failed: ${message}`);
    if (existing?.offers?.length) {
      console.error(
        `[catalog:ingest] keeping last-good snapshot (${existing.date ?? 'unknown'}, ${existing.offers.length} offers)`
      );
      process.exitCode = 0;
      return;
    }
    process.exitCode = 1;
    return;
  }

  if (!payload?.offers || !Array.isArray(payload.offers) || payload.offers.length === 0) {
    console.error('[catalog:ingest] unexpected/empty payload; keeping last-good');
    process.exitCode = existing?.offers?.length ? 0 : 1;
    return;
  }

  await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(
    `[catalog:ingest] wrote ${path.relative(root, outPath)} (source ${payload.date ?? 'unknown'})`
  );
  console.log(
    `[catalog:ingest] offers=${payload.offers.length} providers=${payload.meta?.provider_count ?? Object.keys(payload.providers ?? {}).length}`
  );
  console.log(
    '[catalog:ingest] app normalize/allowlist: src/lib/catalog (public/data.ts)'
  );
}

main().catch(error => {
  console.error('[catalog:ingest] unexpected error', error);
  process.exitCode = 1;
});
