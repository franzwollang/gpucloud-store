import { NextResponse } from 'next/server';

/**
 * Optional M3.0 scenario ingest.
 * Stores recent summaries in-process so phone runs can POST without tethered DevTools.
 * Not durable across deploys — pull via GET while the instance is warm, or prefer
 * `window.__gpuPerfLab.download()` for archival.
 */

type StoredSummary = {
  id: string;
  receivedAt: string;
  summary: unknown;
};

const MAX_ENTRIES = 50;
const store: StoredSummary[] = [];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!isObject(body) || body.schemaVersion !== 1) {
    return NextResponse.json(
      { error: 'Expected PerfLabSummary with schemaVersion: 1' },
      { status: 400 }
    );
  }

  const id = `perf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  store.unshift({
    id,
    receivedAt: new Date().toISOString(),
    summary: body
  });
  if (store.length > MAX_ENTRIES) {
    store.length = MAX_ENTRIES;
  }

  return NextResponse.json({ ok: true, id });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const entry = store.find(item => item.id === id);
    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(entry);
  }

  return NextResponse.json({
    count: store.length,
    entries: store.map(({ id: entryId, receivedAt, summary }) => ({
      id: entryId,
      receivedAt,
      scenarioId:
        isObject(summary) && typeof summary.scenarioId === 'string'
          ? summary.scenarioId
          : null
    }))
  });
}
