/**
 * Shape of the gpurentalprices.com daily snapshot (`/api/latest.json`).
 * CC BY 4.0 — credit sources on pricing rows/cards only (muted).
 */

export type GpuRentalOfferKind =
  | 'on-demand'
  | 'secure'
  | 'community'
  | 'spot'
  | 'serverless'
  | string;

export interface GpuRentalOffer {
  provider: string;
  gpu: string;
  vram_gb: number;
  usd_hr: number;
  kind: GpuRentalOfferKind;
  source_url?: string;
  fetched_at?: string;
}

export interface GpuRentalProviderStatus {
  ok: boolean;
  last_verified?: string | null;
  stale?: boolean;
}

export interface GpuRentalPricesSnapshot {
  date: string;
  generated_at: string;
  offers: GpuRentalOffer[];
  providers?: Record<string, GpuRentalProviderStatus>;
  meta?: {
    provider_count?: number;
    ok_count?: number;
    stale_count?: number;
    stale_providers?: string[];
    /** Feed currently emits `{ provider, name }[]`; keep open for schema drift. */
    unknown_skus?: unknown;
  };
}

/** A price data origin that must be credited on pricing UI. */
export type CatalogSourceCredit = {
  id: string;
  /** Domain or short name shown after "via" (e.g. gpurentalprices.com). */
  label: string;
  href: string;
};

export const GPURENTALPRICES_FEED_URL =
  'https://gpurentalprices.com/api/latest.json';

export const GPURENTALPRICES_ATTRIBUTION: CatalogSourceCredit = {
  id: 'gpurentalprices',
  label: 'gpurentalprices.com',
  href: 'https://gpurentalprices.com/data'
};

/** gpucloudcompare.com GPU Cloud Price Index (`/data/current.json`). CC-BY-4.0 */
export const GPUCLOUDCOMPARE_FEED_URL =
  'https://gpucloudcompare.com/data/current.json';

export const GPUCLOUDCOMPARE_ATTRIBUTION: CatalogSourceCredit = {
  id: 'gpucloudcompare',
  label: 'gpucloudcompare.com',
  href: 'https://gpucloudcompare.com/data/'
};

export interface GpuCloudComparePlan {
  provider: string;
  plan_id: string;
  price_hourly_usd?: number | null;
  price_monthly_usd?: number | null;
  price_monthly_eur?: number | null;
  locations?: string[];
  captured_at?: string;
  gpu_model?: string | null;
  gpu_count?: number | null;
  vcpu?: number | string | null;
  ram_gb?: number | null;
  ram_label?: string | number | null;
  disk_gb?: number | null;
  disk_label?: string | number | null;
  type?: string;
}

export interface GpuCloudCompareSnapshot {
  dataset?: string;
  captured_at?: string;
  generated_at?: string;
  provider_count?: number;
  providers?: string[];
  plan_count?: number;
  plans: GpuCloudComparePlan[];
}

/** gridstackhub.ai GPU pricing API (`/api/gpu-pricing`). CC BY 4.0 */
export const GRIDSTACKHUB_FEED_URL =
  'https://gridstackhub.ai/api/gpu-pricing';

export const GRIDSTACKHUB_ATTRIBUTION: CatalogSourceCredit = {
  id: 'gridstackhub',
  label: 'gridstackhub.ai',
  href: 'https://gridstackhub.ai/developers'
};

export type GridstackPricingType =
  | 'on-demand'
  | 'on_demand'
  | 'spot'
  | 'reserved'
  | 'reserved-1yr'
  | 'reserved-1mo'
  | string;

export interface GridstackGpuPricingRow {
  id?: number;
  provider: string;
  provider_url?: string;
  gpu_model: string;
  gpu_vram_gb?: number | null;
  instance_type?: string | null;
  gpu_count?: number | null;
  vcpus?: number | null;
  ram_gb?: number | null;
  storage_info?: string | null;
  hourly_rate?: number | null;
  per_gpu_hourly?: number | null;
  pricing_type?: GridstackPricingType;
  region?: string | null;
  interconnect?: string | null;
  source_url?: string | null;
  last_updated?: string | null;
  notes?: string | null;
  active?: boolean;
}

export interface GridstackGpuPricingSnapshot {
  success?: boolean;
  count?: number;
  as_of?: string;
  data: GridstackGpuPricingRow[];
}
