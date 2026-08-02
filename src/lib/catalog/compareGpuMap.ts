import type { GpuFamilyId } from '@/types/gpu';

/**
 * Map gpucloudcompare `gpu_model` strings onto canonical GpuFamilyId.
 * Unmapped models (H200, B200, L4, RTX Ada, …) are skipped — no new families yet.
 */
export function mapCompareGpuModel(
  model: string | null | undefined
): GpuFamilyId | null {
  if (!model?.trim()) return null;

  const normalized = model.trim().toUpperCase();

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
