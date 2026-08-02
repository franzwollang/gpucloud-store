import type { GpuFamilyId, Vendor } from '@/types/gpu';

/**
 * Maps gpurentalprices.com GPU SKU strings onto our canonical GpuFamilyId.
 * Unmapped SKUs are skipped (not invented as new families in the MVP).
 */

export type FamilyBlueprint = {
  id: GpuFamilyId;
  vendor: Vendor;
  model: string;
  /** Fallback VRAM when an offer omits/zeros vram_gb. */
  memoryGB: number;
  description: string;
  shortDetails: string;
  tags?: string[];
};

export const FAMILY_BLUEPRINTS: Record<GpuFamilyId, FamilyBlueprint> = {
  'h100-sxm': {
    id: 'h100-sxm',
    vendor: 'nvidia',
    model: 'H100 SXM',
    memoryGB: 80,
    description: 'NVIDIA H100 SXM GPU with high-bandwidth NVLink fabric.',
    shortDetails:
      'Best for large-scale training and multi-node clusters that need NVLink.',
    tags: ['training', 'nvlink']
  },
  'h100-pcie': {
    id: 'h100-pcie',
    vendor: 'nvidia',
    model: 'H100 PCIe',
    memoryGB: 80,
    description: 'NVIDIA H100 PCIe for flexible single- and multi-GPU nodes.',
    shortDetails: 'Strong training and inference option without SXM chassis.',
    tags: ['training', 'inference']
  },
  h200: {
    id: 'h200',
    vendor: 'nvidia',
    model: 'H200',
    memoryGB: 141,
    description: 'NVIDIA H200 with 141GB HBM3e for large-context training and inference.',
    shortDetails:
      'Next-gen Hopper memory capacity for frontier models and long-context workloads.',
    tags: ['training', 'inference', 'hbm3e']
  },
  b200: {
    id: 'b200',
    vendor: 'nvidia',
    model: 'B200',
    memoryGB: 180,
    description: 'NVIDIA Blackwell B200 for high-throughput training and inference.',
    shortDetails:
      'Current-generation Blackwell accelerator for dense AI clusters.',
    tags: ['training', 'inference', 'blackwell']
  },
  'a100-sxm': {
    id: 'a100-sxm',
    vendor: 'nvidia',
    model: 'A100 SXM',
    memoryGB: 80,
    description: 'NVIDIA A100 GPU with 80GB HBM2e memory.',
    shortDetails:
      'Best for multi-node training runs with large models and long training windows.',
    tags: ['training', 'nvlink']
  },
  'a100-pcie': {
    id: 'a100-pcie',
    vendor: 'nvidia',
    model: 'A100 PCIe',
    memoryGB: 80,
    description: 'NVIDIA A100 PCIe for cost-efficient training and inference.',
    shortDetails: 'Widely available A100 form factor for mixed workloads.',
    tags: ['training', 'inference']
  },
  l40s: {
    id: 'l40s',
    vendor: 'nvidia',
    model: 'L40S',
    memoryGB: 48,
    description: 'NVIDIA L40S for inference, fine-tuning, and graphics-heavy AI.',
    shortDetails: 'Strong inference and mixed AI/graphics price/performance.',
    tags: ['inference', 'fine-tuning']
  },
  l40: {
    id: 'l40',
    vendor: 'nvidia',
    model: 'L40',
    memoryGB: 48,
    description: 'NVIDIA L40 for visualization and inference workloads.',
    shortDetails: 'Graphics-oriented Ada GPU useful for inference and viz.',
    tags: ['inference', 'graphics']
  },
  'rtx-4090': {
    id: 'rtx-4090',
    vendor: 'nvidia',
    model: 'RTX 4090',
    memoryGB: 24,
    description: 'NVIDIA GeForce RTX 4090 for development and smaller jobs.',
    shortDetails: 'Cost-effective consumer GPU for prototyping and light training.',
    tags: ['dev', 'prototyping']
  },
  'rtx-3090': {
    id: 'rtx-3090',
    vendor: 'nvidia',
    model: 'RTX 3090',
    memoryGB: 24,
    description: 'NVIDIA GeForce RTX 3090 for budget training and inference.',
    shortDetails: 'Widely available 24GB option for lighter workloads.',
    tags: ['dev', 'budget']
  },
  mi300x: {
    id: 'mi300x',
    vendor: 'amd',
    model: 'MI300X',
    memoryGB: 192,
    description: 'AMD Instinct MI300X with 192GB HBM3 memory.',
    shortDetails: 'High-memory AMD accelerator for large-model training.',
    tags: ['training', 'amd']
  },
  mi250: {
    id: 'mi250',
    vendor: 'amd',
    model: 'MI250',
    memoryGB: 128,
    description: 'AMD Instinct MI250 for HPC and AI workloads.',
    shortDetails: 'Prior-gen Instinct GPU still used in HPC clusters.',
    tags: ['hpc', 'amd']
  },
  a10: {
    id: 'a10',
    vendor: 'nvidia',
    model: 'A10',
    memoryGB: 24,
    description: 'NVIDIA A10 for inference and lighter graphics/AI work.',
    shortDetails: 'Efficient inference GPU for production serving.',
    tags: ['inference']
  }
};

/**
 * Feed SKU → family id.
 * Generic aliases (`h100`, `a100`) remain only as fallbacks when a provider has
 * no specific SXM/PCIe/NVL SKU — see `shouldSkipGenericRentalSku`.
 */
export const FEED_SKU_TO_FAMILY: Readonly<Record<string, GpuFamilyId>> = {
  'h100-sxm': 'h100-sxm',
  h100: 'h100-sxm',
  'h100-nvl': 'h100-sxm',
  'h100-pcie': 'h100-pcie',
  h200: 'h200',
  'h200-nvl': 'h200',
  b200: 'b200',
  'a100-sxm-80': 'a100-sxm',
  'a100-sxm-40': 'a100-sxm',
  a100: 'a100-sxm',
  'a100-pcie-80': 'a100-pcie',
  'a100-pcie-40': 'a100-pcie',
  l40s: 'l40s',
  l40: 'l40',
  'rtx-4090': 'rtx-4090',
  'rtx-3090': 'rtx-3090',
  'rtx-3090-ti': 'rtx-3090',
  mi300x: 'mi300x',
  a10: 'a10'
};

/** Ambiguous feed SKUs that should yield to more specific siblings per provider. */
const GENERIC_FEED_SKU_ALTERNATIVES: Readonly<Record<string, readonly string[]>> = {
  h100: ['h100-sxm', 'h100-pcie', 'h100-nvl'],
  a100: ['a100-sxm-80', 'a100-sxm-40', 'a100-pcie-80', 'a100-pcie-40']
};

export function isGenericRentalSku(gpu: string): boolean {
  return Object.prototype.hasOwnProperty.call(GENERIC_FEED_SKU_ALTERNATIVES, gpu);
}

/**
 * Drop generic `h100` / `a100` when the same provider already published a
 * specific SXM/PCIe/NVL SKU in this snapshot.
 */
export function shouldSkipGenericRentalSku(
  gpu: string,
  providerFeedSkus: ReadonlySet<string>
): boolean {
  const alternatives = GENERIC_FEED_SKU_ALTERNATIVES[gpu];
  if (!alternatives) return false;
  return alternatives.some(sku => providerFeedSkus.has(sku));
}

/** Display model label for a rental feed SKU (keeps NVL / VRAM tiers visible). */
export function rentalSkuModelLabel(
  gpu: string,
  familyId: GpuFamilyId,
  memoryGB: number
): string {
  switch (gpu) {
    case 'h100-nvl':
      return 'H100 NVL';
    case 'h200-nvl':
      return 'H200 NVL';
    case 'a100-sxm-40':
      return 'A100 SXM 40GB';
    case 'a100-sxm-80':
      return 'A100 SXM 80GB';
    case 'a100-pcie-40':
      return 'A100 PCIe 40GB';
    case 'a100-pcie-80':
      return 'A100 PCIe 80GB';
    default: {
      const blueprint = FAMILY_BLUEPRINTS[familyId];
      if (memoryGB > 0 && memoryGB !== blueprint.memoryGB) {
        return `${blueprint.model} ${memoryGB}GB`;
      }
      return blueprint.model;
    }
  }
}
