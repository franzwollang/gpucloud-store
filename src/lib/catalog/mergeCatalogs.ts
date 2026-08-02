import type { GpuCatalog, GpuFamily, GpuOffering } from '@/types/gpu';

function offeringKey(offering: GpuOffering): string {
  return offering.id;
}

function sortOfferings(offerings: GpuOffering[]): GpuOffering[] {
  return [...offerings].sort((a, b) => {
    const priceA = a.commercial.price.hourlyFrom ?? Number.POSITIVE_INFINITY;
    const priceB = b.commercial.price.hourlyFrom ?? Number.POSITIVE_INFINITY;
    if (priceA !== priceB) return priceA - priceB;
    return a.gpuCount - b.gpuCount;
  });
}

/**
 * Union two normalized catalogs. Offerings are keyed by id so the same
 * provider×family×gpuCount from different feeds remain separate rows.
 */
export function mergeCatalogs(
  primary: GpuCatalog,
  secondary: GpuCatalog
): GpuCatalog {
  const providers = new Map(primary.providers.map(provider => [provider.id, provider]));
  for (const provider of secondary.providers) {
    if (!providers.has(provider.id)) {
      providers.set(provider.id, provider);
    }
  }

  const families = new Map<string, GpuFamily>(
    primary.gpus.map(gpu => [gpu.id, { ...gpu, offerings: [...gpu.offerings] }])
  );

  for (const gpu of secondary.gpus) {
    const existing = families.get(gpu.id);
    if (!existing) {
      families.set(gpu.id, { ...gpu, offerings: [...gpu.offerings] });
      continue;
    }

    const seen = new Set(existing.offerings.map(offeringKey));
    for (const offering of gpu.offerings) {
      if (seen.has(offeringKey(offering))) continue;
      existing.offerings.push(offering);
      seen.add(offeringKey(offering));
    }
    existing.offerings = sortOfferings(existing.offerings);
  }

  for (const gpu of families.values()) {
    gpu.offerings = sortOfferings(gpu.offerings);
  }

  const familyOrder = primary.gpus.map(gpu => gpu.id);
  for (const gpu of secondary.gpus) {
    if (!familyOrder.includes(gpu.id)) {
      familyOrder.push(gpu.id);
    }
  }

  return {
    providers: [...providers.values()].sort((a, b) => a.name.localeCompare(b.name)),
    gpus: familyOrder
      .map(id => families.get(id))
      .filter((gpu): gpu is GpuFamily => gpu !== undefined)
  };
}
