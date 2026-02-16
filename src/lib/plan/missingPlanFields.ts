import type { PlanItem } from '@/stores/plan';

const requiredKeys = [
  'gpuModel',
  'gpuCount',
  'region',
  'provider'
] as const satisfies ReadonlyArray<keyof PlanItem>;

export type MissingPlanField = (typeof requiredKeys)[number];

export function getMissingPlanFields(
  item: PlanItem
): MissingPlanField[] {
  const missing: MissingPlanField[] = [];

  requiredKeys.forEach(key => {
    if (key === 'provider') {
      if (!item.provider?.name) {
        missing.push('provider');
      }
      return;
    }

    if (item[key] == null) {
      missing.push(key);
    }
  });

  return missing;
}

export function needsConfiguration(item: PlanItem): boolean {
  return getMissingPlanFields(item).length > 0;
}
