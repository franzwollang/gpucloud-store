import type { GpuFamilyId } from '@/types/gpu';

import { FAMILY_BLUEPRINTS } from './gpuSkuMap';

/**
 * Map gridstackhub.ai `gpu_model` strings onto canonical GpuFamilyId.
 * Unmapped models are skipped.
 */
export function mapGridstackGpuModel(
  model: string | null | undefined
): GpuFamilyId | null {
  if (!model?.trim()) return null;

  const normalized = model.trim().toUpperCase().replace(/\s+/g, '');

  if (normalized.includes('B200')) return 'b200';
  if (normalized.includes('H200')) return 'h200';
  if (normalized.includes('H100')) return 'h100-sxm';
  if (normalized.includes('A100-40') || normalized === 'A10040GB') return 'a100-sxm';
  if (normalized.includes('A100')) return 'a100-sxm';
  if (normalized.includes('L40S')) return 'l40s';
  if (normalized.includes('L40') && !normalized.includes('L40S')) return 'l40';
  if (normalized.includes('RTX4090') || normalized === 'RTX4090') return 'rtx-4090';
  if (normalized.includes('RTX3090')) return 'rtx-3090';
  if (normalized.includes('MI300X')) return 'mi300x';
  if (normalized.includes('A10G') || normalized === 'A10') return 'a10';

  return null;
}

/** Display label for a GridStackHub row (VRAM tier when it differs from blueprint). */
export function gridstackModelLabel(
  gpuModel: string,
  familyId: GpuFamilyId,
  memoryGB: number
): string {
  const blueprint = FAMILY_BLUEPRINTS[familyId];
  const normalized = gpuModel.trim().toUpperCase();

  if (normalized.includes('A100-40') || normalized.includes('A100 40')) {
    return 'A100 SXM 40GB';
  }
  if (normalized.includes('A100-80') || normalized.includes('A100 80')) {
    return 'A100 SXM 80GB';
  }
  if (normalized.includes('H100 NVL') || normalized.includes('H100NVL')) {
    return 'H100 NVL';
  }
  if (normalized.includes('H200 NVL') || normalized.includes('H200NVL')) {
    return 'H200 NVL';
  }

  if (memoryGB > 0 && memoryGB !== blueprint.memoryGB) {
    return `${blueprint.model} ${memoryGB}GB`;
  }

  return blueprint.model;
}
