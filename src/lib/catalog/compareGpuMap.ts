import type { GpuFamilyId } from '@/types/gpu';

/**
 * Map gpucloudcompare `gpu_model` strings onto canonical GpuFamilyId.
 * Unmapped models are skipped (popularity list still lists them; discovery
 * simply omits families with no offerings).
 */
export function mapCompareGpuModel(
  model: string | null | undefined
): GpuFamilyId | null {
  if (!model?.trim()) return null;

  const normalized = model.trim().toUpperCase();

  // More specific Hopper / Blackwell SKUs before generic H100 aliases.
  if (normalized.includes('B200')) {
    return 'b200';
  }

  if (normalized.includes('H200')) {
    return 'h200';
  }

  if (
    normalized.includes('H100') ||
    normalized.includes('H100NVL') ||
    normalized.includes('H100 NVL')
  ) {
    return 'h100-sxm';
  }

  if (normalized === 'A100' || normalized.startsWith('A100 ')) {
    return 'a100-sxm';
  }

  if (normalized.includes('L40S')) {
    return 'l40s';
  }

  if (normalized.includes('MI300X')) {
    return 'mi300x';
  }

  return null;
}
