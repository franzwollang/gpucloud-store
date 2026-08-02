import type { Provider } from '@/types/gpu';

/** Resolve display price + feed attribution from a provider's selected region row. */
export function planPriceFromProviderRegion(
  provider: Provider,
  region: string,
  fallback: string
): { price: string; priceSourceId?: string } {
  const regionData = provider.regions.find(r => r.name === region);
  return {
    price: regionData?.price ?? fallback,
    priceSourceId: regionData?.sourceId
  };
}
