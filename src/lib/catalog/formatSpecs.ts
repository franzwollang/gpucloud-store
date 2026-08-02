import type { NodeSpecs } from '@/types/gpu';

/** Format a GB quantity: GB below 1 TB, TB at/above 1024 GB. */
export function formatMemoryFromGB(memoryGB: number): string {
  if (!Number.isFinite(memoryGB) || memoryGB <= 0) return 'n/a';
  if (memoryGB >= 1024) {
    const tb = Math.round((memoryGB / 1024) * 10) / 10;
    return `${tb} TB`;
  }
  const gb = Number.isInteger(memoryGB)
    ? memoryGB
    : Math.round(memoryGB * 10) / 10;
  return `${gb} GB`;
}

/** Human summary for modal/provider cards. Unknown zeros render as n/a. */
export function formatNodeSpecsSummary(specs: Pick<
  NodeSpecs,
  'vcpus' | 'memoryGB' | 'localStorageTB'
>): string {
  const cpu = specs.vcpus > 0 ? `${specs.vcpus} vCPU` : 'vCPU n/a';
  const ramLabel = formatMemoryFromGB(specs.memoryGB);
  const ram = ramLabel === 'n/a' ? 'RAM n/a' : `${ramLabel} RAM`;
  const storage =
    specs.localStorageTB > 0
      ? `${specs.localStorageTB} TB NVMe`
      : 'NVMe n/a';
  return `${cpu} • ${ram} • ${storage}`;
}
