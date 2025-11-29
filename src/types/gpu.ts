// ==================================================
// ENUMS
// ==================================================

export const VENDORS = ['nvidia', 'amd', 'intel', 'other'] as const;
export type Vendor = (typeof VENDORS)[number];

export const PROVISIONING_TYPES = [
  'bare-metal',
  'virtual-machine',
  'fractional-bare-metal'
] as const;
export type ProvisioningType = (typeof PROVISIONING_TYPES)[number];

export const BILLING_MODELS = [
  'on-demand',
  'reserved',
  'dedicated-monthly',
  'custom-contract'
] as const;
export type BillingModel = (typeof BILLING_MODELS)[number];

// Optional: If you want a fixed region vocabulary
export const REGION_CODES = [
  'us-west',
  'us-east',
  'us-central',
  'eu-west',
  'eu-central',
  'eu-north',
  'asia-east',
  'asia-pacific',
  'global'
] as const;
export type RegionCode = (typeof REGION_CODES)[number];

// Optional: canonical GPU families
export const GPU_FAMILY_IDS = [
  'h100-sxm',
  'h100-pcie',
  'a100-sxm',
  'a100-pcie',
  'l40s',
  'l40',
  'rtx-4090',
  'rtx-3090',
  'mi300x',
  'mi250',
  'a10'
] as const;
export type GpuFamilyId = (typeof GPU_FAMILY_IDS)[number];

// ==================================================
// CORE TYPES
// ==================================================

export interface GpuCatalog {
  gpus: GpuFamily[];
  providers: ProviderMeta[];
}

export interface GpuFamily {
  id: GpuFamilyId; // canonical GPU family enum
  vendor: Vendor;
  model: string; // e.g. "H100 SXM"
  memoryGB: number;
  description: string;
  shortDetails: string;
  tags?: string[];

  // All provider offerings for this GPU model
  offerings: GpuOffering[];
}

// ==================================================
// OFFERING
// ==================================================

export interface GpuOffering {
  id: string; // unique
  providerId: string; // FK into ProviderMeta.id
  displayName: string;

  provisioningType: ProvisioningType;
  gpuCount: number; // 1,2,4,8
  isClusterCapable: boolean;

  regions: RegionAvailability[];

  nodeSpecs: NodeSpecs;
  commercial: CommercialTerms;
  riskMetrics: RiskMetrics;
}

// ==================================================
// REGION
// ==================================================

export interface RegionAvailability {
  regionCode: string; // prefer values from REGION_CODES for consistency, but allow freeform
  locationLabel: string; // "US West", "Finland", etc.
  datacenterName?: string;

  leadTimeDays?: Range;
  minTerm?: ContractTerm;
  price?: PriceEstimate;
  riskMetricsOverride?: Partial<RiskMetrics>;
}

// ==================================================
// NODE SPECS
// ==================================================

export interface NodeSpecs {
  vcpus: number;
  memoryGB: number;
  localStorageTB: number;
  storageDescription?: string;

  networkGbps?: number;
  interconnect?: string; // "NVSwitch", "Infinity Fabric", etc.

  cpuModel?: string;
  formFactor?: string; // "2U", "4U"
  maxRackDensityKw?: number;
}

// ==================================================
// COMMERCIAL
// ==================================================

export interface CommercialTerms {
  price: PriceEstimate;
  minTerm: ContractTerm;
  billingModel: BillingModel;
  notes?: string;
}

export interface PriceEstimate {
  currency: string; // "USD"
  hourlyFrom?: number;
  monthlyFrom?: number;
  isIndicative: boolean;
}

export interface ContractTerm {
  unit: 'hourly' | 'daily' | 'monthly' | 'yearly';
  minimumUnits: number;
}

// ==================================================
// RISK METRICS
// ==================================================

export interface RiskMetrics {
  naturalDisaster: number; // 1–5
  electricityReliability: number; // 1–5
  fireRisk: number; // 1–5
  securityBreach: number; // 1–5
  powerEfficiency: number; // 1–5
  costEfficiency: number; // 1–5
  networkReliability: number; // 1–5
  coolingCapacity: number; // 1–5
  leadTimeReliability: number; // 1–5
  carbonIntensity: number; // 1–5
  rackDensitySupport: number; // 1–5
}

// ==================================================
// PROVIDER META
// ==================================================

export interface ProviderMeta {
  id: string; // "provider-g"
  name: string;
  website?: string;
  description?: string;
  headquartersRegion?: string;
  primaryFocus?: string; // "HPC", "AI", "rendering", etc.
}

// ==================================================
// UTILITY
// ==================================================

export interface Range {
  min: number;
  max: number;
}

// ==================================================
// COMPONENT UTILITY TYPES
// ==================================================

// ==================================================
// UTILITY TYPES FOR COMPONENTS
// ==================================================

export interface Provider {
  id: string;
  name: string;
  location: string;
  supportedSizes: number[];
  specs: string;
  regions: Region[];
  leadTime: string;
  minTerm: string;
  shortDetails: string;
  details: string;
}

export interface Region {
  name: string;
  price: string;
  riskMetrics: Partial<RiskMetrics>;
}

export interface GpuType {
  type: string;
  description: string;
  shortDetails: string;
  providers: Provider[];
}

export interface ProviderCombination {
  provider: Provider;
  sizes: number[];
}

export interface GpuOption {
  type: string;
  description: string;
  availableSizes: number[];
  providers: Provider[];
}

// Risk metrics display types
export interface MetricScore {
  label: string;
  score: number;
  tooltip: string;
}

// Scoring constants
export const RISK_LEVELS = {
  LOW: 1,
  MODERATE: 2,
  MEDIUM: 3,
  HIGH: 4,
  VERY_HIGH: 5
} as const;

export type RiskLevel = (typeof RISK_LEVELS)[keyof typeof RISK_LEVELS];

// Helper function to get risk level label
export function getRiskLevelLabel(score: number): string {
  switch (score) {
    case RISK_LEVELS.LOW:
      return 'Low';
    case RISK_LEVELS.MODERATE:
      return 'Moderate';
    case RISK_LEVELS.MEDIUM:
      return 'Medium';
    case RISK_LEVELS.HIGH:
      return 'High';
    case RISK_LEVELS.VERY_HIGH:
      return 'Very High';
    default:
      return 'Unknown';
  }
}

// Helper function to get risk level color class
export function getRiskLevelColor(score: number): string {
  switch (score) {
    case RISK_LEVELS.LOW:
      return 'text-green-600';
    case RISK_LEVELS.MODERATE:
      return 'text-yellow-600';
    case RISK_LEVELS.MEDIUM:
      return 'text-orange-600';
    case RISK_LEVELS.HIGH:
      return 'text-red-600';
    case RISK_LEVELS.VERY_HIGH:
      return 'text-red-800';
    default:
      return 'text-gray-600';
  }
}
