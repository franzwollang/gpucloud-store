import type { ProvisioningType } from '@/types/gpu';

/**
 * Curated provider map for the gpurentalprices MVP.
 *
 * Public aggregators rarely label bare-metal vs VM. Until Shadeform / Latitude
 * enrichment lands, this allowlist + provisioningType map encodes the funnel's
 * bare-metal / neocloud bias. Community marketplace and serverless SKUs are
 * excluded at normalize time even when a provider appears here.
 */

export type CuratedProvider = {
  /** Stable catalog id (slug). */
  id: string;
  /** Feed `provider` key from gpurentalprices.com. */
  feedKey: string;
  name: string;
  website?: string;
  description?: string;
  primaryFocus?: string;
  provisioningType: ProvisioningType;
  /**
   * Preference rank (lower = preferred). Bare-metal / dedicated neoclouds
   * rank ahead of general VM hosts.
   */
  rank: number;
};

export const CURATED_PROVIDERS: readonly CuratedProvider[] = [
  // Bare-metal / dedicated neocloud leaning
  {
    id: 'coreweave',
    feedKey: 'coreweave',
    name: 'CoreWeave',
    website: 'https://www.coreweave.com',
    description: 'GPU-specialized neocloud with dense cluster offerings.',
    primaryFocus: 'AI training clusters',
    provisioningType: 'bare-metal',
    rank: 10
  },
  {
    id: 'crusoe',
    feedKey: 'crusoe',
    name: 'Crusoe',
    website: 'https://www.crusoe.ai',
    description: 'Energy-aware GPU cloud for training and inference.',
    primaryFocus: 'Sustainable AI compute',
    provisioningType: 'bare-metal',
    rank: 20
  },
  {
    id: 'lambda',
    feedKey: 'lambda',
    name: 'Lambda',
    website: 'https://lambdalabs.com',
    description: 'GPU cloud and on-prem systems for deep learning teams.',
    primaryFocus: 'Deep learning cloud',
    provisioningType: 'bare-metal',
    rank: 30
  },
  {
    id: 'voltagepark',
    feedKey: 'voltagepark',
    name: 'Voltage Park',
    website: 'https://www.voltagepark.com',
    description: 'Large-scale dedicated GPU capacity.',
    primaryFocus: 'Dedicated GPU clusters',
    provisioningType: 'bare-metal',
    rank: 40
  },
  {
    id: 'nebius',
    feedKey: 'nebius',
    name: 'Nebius',
    website: 'https://nebius.com',
    description: 'Full-stack AI cloud with GPU clusters.',
    primaryFocus: 'AI infrastructure',
    provisioningType: 'bare-metal',
    rank: 50
  },
  {
    id: 'datacrunch',
    feedKey: 'datacrunch',
    name: 'DataCrunch',
    website: 'https://datacrunch.io',
    description: 'On-demand and reserved GPU instances.',
    primaryFocus: 'On-demand GPU',
    provisioningType: 'bare-metal',
    rank: 60
  },
  {
    id: 'hyperstack',
    feedKey: 'hyperstack',
    name: 'Hyperstack',
    website: 'https://www.hyperstack.cloud',
    description: 'NexGen Cloud GPU infrastructure.',
    primaryFocus: 'GPU IaaS',
    provisioningType: 'bare-metal',
    rank: 70
  },
  {
    id: 'latitude',
    feedKey: 'latitude',
    name: 'Latitude.sh',
    website: 'https://www.latitude.sh',
    description: 'Bare-metal cloud with GPU plans (API enrichment pending).',
    primaryFocus: 'Bare-metal GPU',
    provisioningType: 'bare-metal',
    rank: 80
  },
  {
    id: 'massedcompute',
    feedKey: 'massedcompute',
    name: 'Massed Compute',
    website: 'https://massedcompute.com',
    description: 'Dedicated GPU servers for AI workloads.',
    primaryFocus: 'Dedicated GPU',
    provisioningType: 'bare-metal',
    rank: 90
  },
  {
    id: 'gmicloud',
    feedKey: 'gmicloud',
    name: 'GMI Cloud',
    website: 'https://www.gmicloud.ai',
    description: 'GPU cloud for training and inference.',
    primaryFocus: 'AI GPU cloud',
    provisioningType: 'bare-metal',
    rank: 100
  },
  {
    id: 'primeintellect',
    feedKey: 'primeintellect',
    name: 'Prime Intellect',
    website: 'https://www.primeintellect.ai',
    description: 'Distributed GPU compute marketplace with dedicated stock.',
    primaryFocus: 'Distributed GPU',
    provisioningType: 'bare-metal',
    rank: 110
  },
  {
    id: 'hotaisle',
    feedKey: 'hotaisle',
    name: 'Hot Aisle',
    website: 'https://hotaisle.xyz',
    description: 'Bare-metal AMD GPU capacity.',
    primaryFocus: 'AMD bare-metal',
    provisioningType: 'bare-metal',
    rank: 120
  },
  {
    id: 'scaleway',
    feedKey: 'scaleway',
    name: 'Scaleway',
    website: 'https://www.scaleway.com',
    description: 'European cloud with GPU instances.',
    primaryFocus: 'EU cloud GPU',
    provisioningType: 'bare-metal',
    rank: 130
  },
  {
    id: 'ovh',
    feedKey: 'ovh',
    name: 'OVHcloud',
    website: 'https://www.ovhcloud.com',
    description: 'European cloud and bare-metal GPU hosts.',
    primaryFocus: 'EU infrastructure',
    provisioningType: 'bare-metal',
    rank: 140
  },
  {
    id: 'digitalocean',
    feedKey: 'digitalocean',
    name: 'DigitalOcean',
    website: 'https://www.digitalocean.com',
    description: 'Developer cloud with GPU droplets.',
    primaryFocus: 'Developer GPU',
    provisioningType: 'virtual-machine',
    rank: 200
  },
  {
    id: 'vultr',
    feedKey: 'vultr',
    name: 'Vultr',
    website: 'https://www.vultr.com',
    description: 'Global cloud with GPU instances.',
    primaryFocus: 'Cloud GPU',
    provisioningType: 'virtual-machine',
    rank: 210
  },
  {
    id: 'atlantic',
    feedKey: 'atlantic',
    name: 'Atlantic.Net',
    website: 'https://www.atlantic.net',
    description: 'US cloud with dedicated GPU instances.',
    primaryFocus: 'US cloud GPU',
    provisioningType: 'virtual-machine',
    rank: 220
  },
  {
    id: 'hetzner',
    feedKey: 'hetzner',
    name: 'Hetzner',
    website: 'https://www.hetzner.com',
    description: 'European cloud with GPU servers.',
    primaryFocus: 'EU cloud GPU',
    provisioningType: 'bare-metal',
    rank: 230
  },
  {
    id: 'linode',
    feedKey: 'linode',
    name: 'Linode / Akamai',
    website: 'https://www.linode.com',
    description: 'Akamai cloud with dedicated GPU instances.',
    primaryFocus: 'Dedicated GPU',
    provisioningType: 'bare-metal',
    rank: 240
  },
  {
    id: 'upcloud',
    feedKey: 'upcloud',
    name: 'UpCloud',
    website: 'https://upcloud.com',
    description: 'High-performance cloud with GPU plans.',
    primaryFocus: 'Cloud GPU',
    provisioningType: 'virtual-machine',
    rank: 250
  },
  // VM / marketplace hosts kept only for consumer SKU coverage (e.g. RTX 4090)
  {
    id: 'runpod',
    feedKey: 'runpod',
    name: 'RunPod',
    website: 'https://www.runpod.io',
    description: 'GPU cloud pods (secure cloud tier only in this catalog).',
    primaryFocus: 'On-demand GPU pods',
    provisioningType: 'virtual-machine',
    rank: 300
  },
  {
    id: 'tensordock',
    feedKey: 'tensordock',
    name: 'TensorDock',
    website: 'https://tensordock.com',
    description: 'Marketplace GPU VMs.',
    primaryFocus: 'GPU VMs',
    provisioningType: 'virtual-machine',
    rank: 310
  },
  {
    id: 'spheron',
    feedKey: 'spheron',
    name: 'Spheron',
    website: 'https://www.spheron.network',
    description: 'Decentralized GPU compute.',
    primaryFocus: 'Distributed GPU',
    provisioningType: 'virtual-machine',
    rank: 320
  }
] as const;

export const PROVIDER_BY_FEED_KEY: ReadonlyMap<string, CuratedProvider> =
  new Map(CURATED_PROVIDERS.map(provider => [provider.feedKey, provider]));

/** gpucloudcompare.com `provider` display names → curated catalog ids. */
export const PROVIDER_BY_COMPARE_NAME: ReadonlyMap<string, CuratedProvider> =
  new Map([
    ['Latitude', PROVIDER_BY_FEED_KEY.get('latitude')!],
    ['DigitalOcean', PROVIDER_BY_FEED_KEY.get('digitalocean')!],
    ['OVHcloud', PROVIDER_BY_FEED_KEY.get('ovh')!],
    ['Scaleway', PROVIDER_BY_FEED_KEY.get('scaleway')!],
    ['Vultr', PROVIDER_BY_FEED_KEY.get('vultr')!],
    ['Atlantic.Net', PROVIDER_BY_FEED_KEY.get('atlantic')!],
    ['Hetzner', PROVIDER_BY_FEED_KEY.get('hetzner')!],
    ['Linode / Akamai', PROVIDER_BY_FEED_KEY.get('linode')!],
    ['UpCloud', PROVIDER_BY_FEED_KEY.get('upcloud')!]
  ]);

/** Offer kinds retained for the MVP funnel (firm-ish list prices). */
export const ALLOWED_OFFER_KINDS = new Set(['on-demand', 'secure']);
