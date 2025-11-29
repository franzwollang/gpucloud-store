// ==================================================
// ENUMS
// ==================================================

export enum Vendor {
  NVIDIA = 'nvidia',
  AMD = 'amd',
  INTEL = 'intel',
  OTHER = 'other'
}

export enum ProvisioningType {
  BARE_METAL = 'bare-metal',
  VIRTUAL_MACHINE = 'virtual-machine',
  FRACTIONAL_BARE_METAL = 'fractional-bare-metal'
}

export enum BillingModel {
  ON_DEMAND = 'on-demand',
  RESERVED = 'reserved',
  DEDICATED_MONTHLY = 'dedicated-monthly',
  CUSTOM_CONTRACT = 'custom-contract'
}

// Optional: If you want a fixed region vocabulary
export enum RegionCode {
  US_WEST = 'us-west',
  US_EAST = 'us-east',
  EU_CENTRAL = 'eu-central',
  EU_NORTH = 'eu-north',
  ASIA_EAST = 'asia-east',
  GLOBAL = 'global'
}

// Optional: canonical GPU families
export enum GpuFamilyId {
  H100_SXM = 'h100-sxm',
  H100_PCIE = 'h100-pcie',
  A100_SXM = 'a100-sxm',
  A100_PCIE = 'a100-pcie',
  L40S = 'l40s',
  L40 = 'l40',
  RTX4090 = 'rtx-4090',
  RTX3090 = 'rtx-3090',
  MI300X = 'mi300x',
  MI250 = 'mi250',
  A10 = 'a10'
}

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
  regionCode: RegionCode | string; // use enum or freeform
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
// LEGACY COMPATIBILITY TYPES
// ==================================================

// For backward compatibility during migration
export interface LegacyProvider {
  id: string;
  name: string;
  location: string;
  supportedSizes: number[];
  specs: string;
  regions: LegacyRegion[];
  leadTime: string;
  minTerm: string;
  shortDetails: string;
  details: string;
}

export interface LegacyRegion {
  name: string;
  price: string;
  riskMetrics: Partial<RiskMetrics>; // Allow partial for migration
}

export interface LegacyGpuType {
  type: string;
  description: string;
  shortDetails: string;
  providers: LegacyProvider[];
}

// ==================================================
// UTILITY TYPES FOR COMPONENTS
// ==================================================

export interface ProviderCombination {
  provider: LegacyProvider;
  sizes: number[];
}

export interface GpuOption {
  type: string;
  description: string;
  availableSizes: number[];
  providers: LegacyProvider[];
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

// ==================================================
// MIGRATION HELPERS
// ==================================================

/**
 * Converts legacy GPU types to new GpuCatalog structure
 * This is a temporary utility for migration
 */
export function convertLegacyToCatalog(legacyData: {
  gpuTypes: LegacyGpuType[];
}): GpuCatalog {
  // Implementation would go here for migration
  // For now, return empty catalog
  return {
    gpus: [],
    providers: []
  };
}

/**
 * Converts new GpuCatalog to legacy format for backward compatibility
 * This is a temporary utility during migration
 */
export function convertCatalogToLegacy(catalog: GpuCatalog): {
  gpuTypes: LegacyGpuType[];
} {
  // Implementation would go here for migration
  // For now, return empty array
  return {
    gpuTypes: []
  };
}
