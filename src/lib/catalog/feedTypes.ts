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
