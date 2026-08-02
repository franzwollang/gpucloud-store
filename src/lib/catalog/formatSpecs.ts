import type { NodeSpecs } from '@/types/gpu';

/** Round to a fixed number of fractional digits. */
function roundDecimals(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Format a number with at most `decimals` fractional digits (rounded, trailing zeros stripped). */
export function formatRoundedNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return 'n/a';
  const rounded = roundDecimals(value, decimals);
  const fixed = rounded.toFixed(decimals);
  return fixed.replace(/\.?0+$/, '');
}

/** Format a GB quantity: GB below 1 TB, TB at/above 1024 GB. */
export function formatMemoryFromGB(memoryGB: number): string {
  if (!Number.isFinite(memoryGB) || memoryGB <= 0) return 'n/a';
  if (memoryGB >= 1024) {
    const tb = roundDecimals(memoryGB / 1024, 2);
    return `${formatRoundedNumber(tb, 2)} TB`;
  }
  return `${formatRoundedNumber(memoryGB, 2)} GB`;
}

/** Human summary for modal/provider cards. Unknown zeros render as n/a. */
export function formatNodeSpecsSummary(specs: Pick<
  NodeSpecs,
  'vcpus' | 'memoryGB' | 'localStorageTB'
>): string {
  const cpu =
    specs.vcpus > 0
      ? `${formatRoundedNumber(specs.vcpus, 2)} vCPU`
      : 'vCPU n/a';
  const ramLabel = formatMemoryFromGB(specs.memoryGB);
  const ram = ramLabel === 'n/a' ? 'RAM n/a' : `${ramLabel} RAM`;
  const storage =
    specs.localStorageTB > 0
      ? `${formatRoundedNumber(specs.localStorageTB, 2)} TB NVMe`
      : 'NVMe n/a';
  return `${cpu} • ${ram} • ${storage}`;
}
