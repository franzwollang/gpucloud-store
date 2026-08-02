import type { GpuFamilyId } from '@/types/gpu';

/** Blueprint thumbnails from `scripts/generate-gpu-blueprints.mjs`. */
export function gpuFamilyImagePath(familyId: GpuFamilyId | string): string {
  return `/images/gpus/${familyId}.svg`;
}
