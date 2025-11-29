// Mock database for GPU configuration data
// This will eventually be replaced with a real database or API
import type {
  CommercialTerms,
  GpuCatalog,
  GpuFamily,
  GpuOffering,
  NodeSpecs,
  ProviderMeta,
  RegionAvailability,
  RiskMetrics
} from '@/types/gpu';
import {
  BillingModel,
  GpuFamilyId,
  ProvisioningType,
  Vendor
} from '@/types/gpu';

// Helper functions to convert legacy data to new format
function parsePrice(priceString: string): {
  currency: string;
  hourlyFrom: number;
  isIndicative: boolean;
} {
  // Extract price from strings like "From $8.40/hr"
  const match = priceString.match(/\$([\d.]+)/);
  return {
    currency: 'USD',
    hourlyFrom: match ? parseFloat(match[1]) : 0,
    isIndicative: true
  };
}

function parseLeadTime(leadTime: string): { min: number; max: number } {
  // Parse strings like "1-3 days" or "Same day"
  if (leadTime === 'Same day') return { min: 0, max: 1 };
  const regex = /(\d+)-(\d+)\s*(days?|weeks?|months?)/;
  const match = regex.exec(leadTime);
  if (match) {
    const [, minStr, maxStr, unit] = match;
    const multiplier = unit?.includes('week')
      ? 7
      : unit?.includes('month')
        ? 30
        : 1;
    return {
      min: parseInt(minStr, 10) * multiplier,
      max: parseInt(maxStr, 10) * multiplier
    };
  }
  return { min: 1, max: 7 }; // fallback
}

function parseMinTerm(minTerm: string): {
  unit: 'hourly' | 'daily' | 'monthly' | 'yearly';
  minimumUnits: number;
} {
  switch (minTerm.toLowerCase()) {
    case 'daily':
      return { unit: 'daily', minimumUnits: 1 };
    case 'weekly':
      return { unit: 'daily', minimumUnits: 7 };
    case 'monthly':
      return { unit: 'monthly', minimumUnits: 1 };
    case '3-month':
      return { unit: 'monthly', minimumUnits: 3 };
    case '6-month':
      return { unit: 'monthly', minimumUnits: 6 };
    default:
      return { unit: 'monthly', minimumUnits: 1 };
  }
}

function parseSpecs(specs: string): NodeSpecs {
  // Parse strings like "96 vCPU • 1.6 TB RAM • 3.2 TB NVMe"
  const vcpuRegex = /(\d+)\s*vCPU/;
  const ramRegex = /([\d.]+)\s*TB?\s*RAM/;
  const storageRegex = /([\d.]+)\s*TB?\s*NVMe/;

  const vcpuMatch = vcpuRegex.exec(specs);
  const ramMatch = ramRegex.exec(specs);
  const storageMatch = storageRegex.exec(specs);

  return {
    vcpus: vcpuMatch ? parseInt(vcpuMatch[1], 10) : 0,
    memoryGB: ramMatch ? parseFloat(ramMatch[1]) * 1024 : 0,
    localStorageTB: storageMatch ? parseFloat(storageMatch[1]) : 0
  };
}

function extendRiskMetrics(legacy: Record<string, number>): RiskMetrics {
  // Extend legacy 8-field metrics to new 11-field metrics
  return {
    naturalDisaster: legacy.naturalDisaster ?? 3,
    electricityReliability: legacy.electricityReliability ?? 3,
    fireRisk: legacy.fireRisk ?? 3,
    securityBreach: legacy.securityBreach ?? 3,
    powerEfficiency: legacy.powerEfficiency ?? 3,
    costEfficiency: legacy.costEfficiency ?? 3,
    networkReliability: legacy.networkReliability ?? 3,
    coolingCapacity: legacy.coolingCapacity ?? 3,
    leadTimeReliability: 3, // new field
    carbonIntensity: 3, // new field
    rackDensitySupport: 3 // new field
  };
}

// Main catalog data
export const gpuCatalog: GpuCatalog = {
  gpus: [
    // A100 GPU Family
    {
      id: GpuFamilyId.A100_SXM,
      vendor: Vendor.NVIDIA,
      model: 'A100 SXM',
      memoryGB: 80,
      description: 'NVIDIA A100 GPU with 80GB HBM2e memory',
      shortDetails:
        'Best for multi-node training runs with large models and long training windows.',
      offerings: [
        {
          id: 'provider-a-a100-2gpu',
          providerId: 'provider-a',
          displayName: 'A100 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $8.40/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly'),
              riskMetricsOverride: extendRiskMetrics({
                naturalDisaster: 2,
                electricityReliability: 5,
                fireRisk: 1,
                securityBreach: 1,
                powerEfficiency: 4,
                costEfficiency: 3,
                networkReliability: 5,
                coolingCapacity: 4
              })
            },
            {
              regionCode: 'eu-west',
              locationLabel: 'EU West',
              price: parsePrice('From $9.50/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly'),
              riskMetricsOverride: extendRiskMetrics({
                naturalDisaster: 3,
                electricityReliability: 4,
                fireRisk: 2,
                securityBreach: 1,
                powerEfficiency: 3,
                costEfficiency: 2,
                networkReliability: 4,
                coolingCapacity: 3
              })
            }
          ],
          nodeSpecs: parseSpecs('96 vCPU • 1.6 TB RAM • 3.2 TB NVMe'),
          commercial: {
            price: parsePrice('From $8.40/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Tier III+ datacenters with redundant cooling systems'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-a-a100-4gpu',
          providerId: 'provider-a',
          displayName: 'A100 4-GPU Cluster',
          provisioningType: 'bare-metal',
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $16.80/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            },
            {
              regionCode: 'eu-west',
              locationLabel: 'EU West',
              price: parsePrice('From $19.00/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('192 vCPU • 3.2 TB RAM • 6.4 TB NVMe'),
          commercial: {
            price: parsePrice('From $16.80/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: 'on-demand'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-a-a100-8gpu',
          providerId: 'provider-a',
          displayName: 'A100 8-GPU Cluster',
          provisioningType: 'bare-metal',
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $33.60/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            },
            {
              regionCode: 'eu-west',
              locationLabel: 'EU West',
              price: parsePrice('From $38.00/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('384 vCPU • 6.4 TB RAM • 12.8 TB NVMe'),
          commercial: {
            price: parsePrice('From $33.60/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: 'on-demand'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-b-a100-4gpu',
          providerId: 'provider-b',
          displayName: 'A100 4-GPU Cluster',
          provisioningType: 'bare-metal',
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'eu-west',
              locationLabel: 'EU West',
              price: parsePrice('From $8.90/hr'),
              leadTimeDays: parseLeadTime('2-4 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 2.0 TB RAM • 4.0 TB NVMe'),
          commercial: {
            price: parsePrice('From $8.90/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: 'on-demand',
            notes: 'GDPR-compliant European datacenter'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 1,
            powerEfficiency: 3,
            costEfficiency: 2,
            networkReliability: 4,
            coolingCapacity: 3
          })
        },
        {
          id: 'provider-h-a100-2gpu',
          providerId: 'provider-h',
          displayName: 'A100 2-GPU Cluster',
          provisioningType: 'bare-metal',
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $8.60/hr'),
              leadTimeDays: parseLeadTime('1-2 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('96 vCPU • 1.6 TB RAM • 3.2 TB NVMe'),
          commercial: {
            price: parsePrice('From $8.60/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: 'on-demand'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-i-a100-8gpu',
          providerId: 'provider-i',
          displayName: 'A100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $34.40/hr'),
              leadTimeDays: parseLeadTime('1-2 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('384 vCPU • 6.4 TB RAM • 12.8 TB NVMe'),
          commercial: {
            price: parsePrice('From $34.40/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-e-a100-8gpu',
          providerId: 'provider-e',
          displayName: 'A100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $33.60/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('384 vCPU • 6.4 TB RAM • 12.8 TB NVMe'),
          commercial: {
            price: parsePrice('From $33.60/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-c-a100-8gpu',
          providerId: 'provider-c',
          displayName: 'A100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $32.00/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('384 vCPU • 6.4 TB RAM • 12.8 TB NVMe'),
          commercial: {
            price: parsePrice('From $32.00/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-f-a100-8gpu',
          providerId: 'provider-f',
          displayName: 'A100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $32.80/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('384 vCPU • 6.4 TB RAM • 12.8 TB NVMe'),
          commercial: {
            price: parsePrice('From $32.80/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'High-altitude natural cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 1,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-g-a100-8gpu',
          providerId: 'provider-g',
          displayName: 'A100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $32.40/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('384 vCPU • 6.4 TB RAM • 12.8 TB NVMe'),
          commercial: {
            price: parsePrice('From $32.40/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'AMD-specialized infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-s-a100-8gpu',
          providerId: 'provider-s',
          displayName: 'A100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-central',
              locationLabel: 'US Central',
              price: parsePrice('From $32.00/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly'),
              riskMetricsOverride: extendRiskMetrics({
                naturalDisaster: 3,
                electricityReliability: 4,
                fireRisk: 2,
                securityBreach: 2,
                powerEfficiency: 4,
                costEfficiency: 4,
                networkReliability: 4,
                coolingCapacity: 4
              })
            }
          ],
          nodeSpecs: parseSpecs('384 vCPU • 6.4 TB RAM • 12.8 TB NVMe'),
          commercial: {
            price: parsePrice('From $32.00/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Competitive AMD infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 4,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-b-a100-8gpu',
          providerId: 'provider-b',
          displayName: 'A100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'eu-west',
              locationLabel: 'EU West',
              price: parsePrice('From $34.40/hr'),
              leadTimeDays: parseLeadTime('2-4 days'),
              minTerm: parseMinTerm('Monthly'),
              riskMetricsOverride: extendRiskMetrics({
                naturalDisaster: 2,
                electricityReliability: 5,
                fireRisk: 1,
                securityBreach: 1,
                powerEfficiency: 4,
                costEfficiency: 3,
                networkReliability: 5,
                coolingCapacity: 4
              })
            }
          ],
          nodeSpecs: parseSpecs('384 vCPU • 6.4 TB RAM • 12.8 TB NVMe'),
          commercial: {
            price: parsePrice('From $34.40/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'GDPR-compliant European datacenter'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-k-a100-8gpu',
          providerId: 'provider-k',
          displayName: 'A100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'eu-west',
              locationLabel: 'EU West',
              price: parsePrice('From $35.20/hr'),
              leadTimeDays: parseLeadTime('3-5 days'),
              minTerm: parseMinTerm('Monthly'),
              riskMetricsOverride: extendRiskMetrics({
                naturalDisaster: 2,
                electricityReliability: 5,
                fireRisk: 1,
                securityBreach: 1,
                powerEfficiency: 4,
                costEfficiency: 3,
                networkReliability: 5,
                coolingCapacity: 4
              })
            }
          ],
          nodeSpecs: parseSpecs('384 vCPU • 6.4 TB RAM • 12.8 TB NVMe'),
          commercial: {
            price: parsePrice('From $35.20/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'EU-based infrastructure with local compliance'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-d-a100-8gpu',
          providerId: 'provider-d',
          displayName: 'A100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'eu-central',
              locationLabel: 'EU Central',
              price: parsePrice('From $35.20/hr'),
              leadTimeDays: parseLeadTime('3-6 days'),
              minTerm: parseMinTerm('Monthly'),
              riskMetricsOverride: extendRiskMetrics({
                naturalDisaster: 2,
                electricityReliability: 5,
                fireRisk: 1,
                securityBreach: 1,
                powerEfficiency: 4,
                costEfficiency: 4,
                networkReliability: 5,
                coolingCapacity: 4
              })
            }
          ],
          nodeSpecs: parseSpecs('384 vCPU • 6.4 TB RAM • 12.8 TB NVMe'),
          commercial: {
            price: parsePrice('From $35.20/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Central European datacenter with high reliability'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-n-a100-8gpu',
          providerId: 'provider-n',
          displayName: 'A100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'eu-central',
              locationLabel: 'EU Central',
              price: parsePrice('From $36.00/hr'),
              leadTimeDays: parseLeadTime('4-8 days'),
              minTerm: parseMinTerm('Monthly'),
              riskMetricsOverride: extendRiskMetrics({
                naturalDisaster: 2,
                electricityReliability: 5,
                fireRisk: 1,
                securityBreach: 1,
                powerEfficiency: 5,
                costEfficiency: 3,
                networkReliability: 5,
                coolingCapacity: 5
              })
            }
          ],
          nodeSpecs: parseSpecs('384 vCPU • 6.4 TB RAM • 12.8 TB NVMe'),
          commercial: {
            price: parsePrice('From $36.00/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Northern European infrastructure with renewable energy'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-f-a100-8gpu',
          providerId: 'provider-f',
          displayName: 'A100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'asia-pacific',
              locationLabel: 'Asia Pacific',
              price: parsePrice('From $33.60/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly'),
              riskMetricsOverride: extendRiskMetrics({
                naturalDisaster: 4,
                electricityReliability: 5,
                fireRisk: 1,
                securityBreach: 1,
                powerEfficiency: 5,
                costEfficiency: 1,
                networkReliability: 5,
                coolingCapacity: 5
              })
            }
          ],
          nodeSpecs: parseSpecs('384 vCPU • 6.4 TB RAM • 12.8 TB NVMe'),
          commercial: {
            price: parsePrice('From $33.60/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'High-altitude natural cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 1,
            networkReliability: 5,
            coolingCapacity: 5
          })
        }
      ]
    },

    // H100 GPU Family
    {
      id: 'h100-sxm',
      vendor: 'nvidia',
      model: 'H100 SXM',
      memoryGB: 96,
      description: 'NVIDIA H100 GPU with 96GB HBM3 memory',
      shortDetails:
        'Great for mixed inference + fine-tuning workloads with strong BF16/FP8 performance.',
      offerings: [
        {
          id: 'provider-c-h100-2gpu',
          providerId: 'provider-c',
          displayName: 'H100 2-GPU Cluster',
          provisioningType: 'bare-metal',
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $6.15/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('3-month')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 2 TB NVMe'),
          commercial: {
            price: parsePrice('From $6.15/hr'),
            minTerm: parseMinTerm('3-month'),
            billingModel: 'dedicated-monthly',
            notes: 'Advanced immersion cooling technology'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-q-h100-2gpu',
          providerId: 'provider-q',
          displayName: 'H100 2-GPU Cluster',
          provisioningType: 'bare-metal',
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $6.30/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 2 TB NVMe'),
          commercial: {
            price: parsePrice('From $6.30/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: 'on-demand'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 3,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 4,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-i-h100-2gpu',
          providerId: 'provider-i',
          displayName: 'H100 2-GPU Cluster',
          provisioningType: 'bare-metal',
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $6.40/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 2 TB NVMe'),
          commercial: {
            price: parsePrice('From $6.40/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: 'on-demand'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-j-h100-2gpu',
          providerId: 'provider-j',
          displayName: 'H100 2-GPU Cluster',
          provisioningType: 'bare-metal',
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'eu-west',
              locationLabel: 'EU West',
              price: parsePrice('From $6.80/hr'),
              leadTimeDays: parseLeadTime('2-4 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 2 TB NVMe'),
          commercial: {
            price: parsePrice('From $6.80/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: 'on-demand',
            notes: 'GDPR-compliant European datacenter'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-a-h100-8gpu',
          providerId: 'provider-a',
          displayName: 'H100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $54.40/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('512 vCPU • 4 TB RAM • 16 TB NVMe'),
          commercial: {
            price: parsePrice('From $54.40/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Tier III+ datacenters with redundant cooling systems'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-h-h100-8gpu',
          providerId: 'provider-h',
          displayName: 'H100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $55.20/hr'),
              leadTimeDays: parseLeadTime('1-2 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('512 vCPU • 4 TB RAM • 16 TB NVMe'),
          commercial: {
            price: parsePrice('From $55.20/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-e-h100-8gpu',
          providerId: 'provider-e',
          displayName: 'H100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $55.60/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('512 vCPU • 4 TB RAM • 16 TB NVMe'),
          commercial: {
            price: parsePrice('From $55.60/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-c-h100-8gpu',
          providerId: 'provider-c',
          displayName: 'H100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $54.40/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('512 vCPU • 4 TB RAM • 16 TB NVMe'),
          commercial: {
            price: parsePrice('From $54.40/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-f-h100-8gpu',
          providerId: 'provider-f',
          displayName: 'H100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $55.20/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('512 vCPU • 4 TB RAM • 16 TB NVMe'),
          commercial: {
            price: parsePrice('From $55.20/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'High-altitude natural cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 1,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-g-h100-8gpu',
          providerId: 'provider-g',
          displayName: 'H100 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $54.80/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('512 vCPU • 4 TB RAM • 16 TB NVMe'),
          commercial: {
            price: parsePrice('From $54.80/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'AMD-specialized infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        }
      ]
    },

    // L40S GPU Family
    {
      id: 'l40s',
      vendor: 'nvidia',
      model: 'L40S',
      memoryGB: 48,
      description: 'NVIDIA L40S GPU with 48GB GDDR6 memory',
      shortDetails:
        'Balanced choice for latency-sensitive inference and smaller training workloads.',
      offerings: [
        {
          id: 'provider-c-l40s-2gpu',
          providerId: 'provider-c',
          displayName: 'L40S 2-GPU Cluster',
          provisioningType: 'bare-metal',
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-central',
              locationLabel: 'US Central',
              price: parsePrice('From $4.20/hr'),
              leadTimeDays: parseLeadTime('1-2 days'),
              minTerm: parseMinTerm('Weekly')
            },
            {
              regionCode: 'eu-central',
              locationLabel: 'EU Central',
              price: parsePrice('From $4.80/hr'),
              leadTimeDays: parseLeadTime('1-2 days'),
              minTerm: parseMinTerm('Weekly')
            }
          ],
          nodeSpecs: parseSpecs('48 vCPU • 256 GB RAM • 1.5 TB NVMe'),
          commercial: {
            price: parsePrice('From $4.20/hr'),
            minTerm: parseMinTerm('Weekly'),
            billingModel: 'on-demand',
            notes: 'Geothermal-assisted cooling systems'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 4,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 4,
            networkReliability: 4,
            coolingCapacity: 4
          })
        }
      ]
    },

    // RTX 4090 GPU Family
    {
      id: 'rtx-4090',
      vendor: 'nvidia',
      model: 'RTX 4090',
      memoryGB: 24,
      description: 'NVIDIA RTX 4090 GPU with 24GB GDDR6X memory',
      shortDetails:
        'Ideal for experiments, prototyping, and heavy local development workloads.',
      offerings: [
        {
          id: 'provider-e-rtx4090-1gpu',
          providerId: 'provider-e',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: 'virtual-machine',
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $2.80/hr'),
              leadTimeDays: parseLeadTime('Same day'),
              minTerm: parseMinTerm('Daily')
            },
            {
              regionCode: 'eu-west',
              locationLabel: 'EU West',
              price: parsePrice('From $3.20/hr'),
              leadTimeDays: parseLeadTime('Same day'),
              minTerm: parseMinTerm('Daily')
            }
          ],
          nodeSpecs: parseSpecs('32 vCPU • 128 GB RAM • 1 TB NVMe'),
          commercial: {
            price: parsePrice('From $2.80/hr'),
            minTerm: parseMinTerm('Daily'),
            billingModel: 'on-demand'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 3
          })
        }
      ]
    },

    // MI300X GPU Family
    {
      id: 'mi300x',
      vendor: 'amd',
      model: 'MI300X',
      memoryGB: 192,
      description: 'AMD MI300X GPU with 192GB HBM3 memory',
      shortDetails:
        'AMD-based alternative for massive inference and ROCm-compatible training.',
      offerings: [
        {
          id: 'provider-g-mi300x-2gpu',
          providerId: 'provider-g',
          displayName: 'MI300X 2-GPU Cluster',
          provisioningType: 'bare-metal',
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $11.20/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            },
            {
              regionCode: 'eu-central',
              locationLabel: 'EU Central',
              price: parsePrice('From $12.40/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $11.20/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: 'on-demand',
            notes: 'Seawater cooling systems, nuclear power'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-a-mi300x-8gpu',
          providerId: 'provider-a',
          displayName: 'MI300X 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $89.60/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('1024 vCPU • 8 TB RAM • 32 TB NVMe'),
          commercial: {
            price: parsePrice('From $89.60/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Tier III+ datacenters with redundant cooling systems'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-e-mi300x-8gpu',
          providerId: 'provider-e',
          displayName: 'MI300X 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $90.80/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('1024 vCPU • 8 TB RAM • 32 TB NVMe'),
          commercial: {
            price: parsePrice('From $90.80/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 3
          })
        },
        {
          id: 'provider-c-mi300x-8gpu',
          providerId: 'provider-c',
          displayName: 'MI300X 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $88.00/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('1024 vCPU • 8 TB RAM • 32 TB NVMe'),
          commercial: {
            price: parsePrice('From $88.00/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-g-mi300x-8gpu',
          providerId: 'provider-g',
          displayName: 'MI300X 8-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 8,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $88.80/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('1024 vCPU • 8 TB RAM • 32 TB NVMe'),
          commercial: {
            price: parsePrice('From $88.80/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'AMD-specialized infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        }
      ]
    },

    // RTX 4090 GPU Family
    {
      id: GpuFamilyId.RTX3090,
      vendor: Vendor.NVIDIA,
      model: 'RTX 4090',
      memoryGB: 24,
      description: 'NVIDIA RTX 4090 GPU with 24GB GDDR6X memory',
      shortDetails:
        'Ideal for experiments, prototyping, and heavy local development workloads.',
      offerings: [
        {
          id: 'provider-a-rtx4090-4gpu',
          providerId: 'provider-a',
          displayName: 'RTX 4090 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $11.20/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $11.20/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Tier III+ datacenters with redundant cooling systems'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 3,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-e-rtx4090-4gpu',
          providerId: 'provider-e',
          displayName: 'RTX 4090 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $11.52/hr'),
              leadTimeDays: parseLeadTime('Same day'),
              minTerm: parseMinTerm('Daily')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $11.52/hr'),
            minTerm: parseMinTerm('Daily'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 3
          })
        },
        {
          id: 'provider-h-rtx4090-4gpu',
          providerId: 'provider-h',
          displayName: 'RTX 4090 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $11.36/hr'),
              leadTimeDays: parseLeadTime('1-2 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $11.36/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-p-rtx4090-4gpu',
          providerId: 'provider-p',
          displayName: 'RTX 4090 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $11.68/hr'),
              leadTimeDays: parseLeadTime('3-6 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $11.68/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-a-rtx4090-1gpu',
          providerId: 'provider-a',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $2.80/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.80/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Tier III+ datacenters with redundant cooling systems'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 3,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-e-rtx4090-1gpu',
          providerId: 'provider-e',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $2.88/hr'),
              leadTimeDays: parseLeadTime('Same day'),
              minTerm: parseMinTerm('Daily')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.88/hr'),
            minTerm: parseMinTerm('Daily'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 3
          })
        },
        {
          id: 'provider-h-rtx4090-1gpu',
          providerId: 'provider-h',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $2.84/hr'),
              leadTimeDays: parseLeadTime('1-2 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.84/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-i-rtx4090-1gpu',
          providerId: 'provider-i',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $2.82/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.82/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-p-rtx4090-1gpu',
          providerId: 'provider-p',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $2.92/hr'),
              leadTimeDays: parseLeadTime('3-6 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.92/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-a-rtx4090-2gpu',
          providerId: 'provider-a',
          displayName: 'RTX 4090 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $5.60/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('32 vCPU • 256 GB RAM • 2 TB NVMe'),
          commercial: {
            price: parsePrice('From $5.60/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Tier III+ datacenters with redundant cooling systems'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 3,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-e-rtx4090-2gpu',
          providerId: 'provider-e',
          displayName: 'RTX 4090 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $5.76/hr'),
              leadTimeDays: parseLeadTime('Same day'),
              minTerm: parseMinTerm('Daily')
            }
          ],
          nodeSpecs: parseSpecs('32 vCPU • 256 GB RAM • 2 TB NVMe'),
          commercial: {
            price: parsePrice('From $5.76/hr'),
            minTerm: parseMinTerm('Daily'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 3
          })
        },
        {
          id: 'provider-c-rtx4090-4gpu',
          providerId: 'provider-c',
          displayName: 'RTX 4090 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $10.88/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $10.88/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-f-rtx4090-4gpu',
          providerId: 'provider-f',
          displayName: 'RTX 4090 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $11.04/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $11.04/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'High-altitude natural cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 1,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-g-rtx4090-4gpu',
          providerId: 'provider-g',
          displayName: 'RTX 4090 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $10.96/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $10.96/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'AMD-specialized infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-s-rtx4090-4gpu',
          providerId: 'provider-s',
          displayName: 'RTX 4090 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $11.12/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $11.12/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Competitive AMD infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-c-rtx4090-1gpu',
          providerId: 'provider-c',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $2.72/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.72/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-f-rtx4090-1gpu',
          providerId: 'provider-f',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $2.76/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.76/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'High-altitude natural cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 1,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-g-rtx4090-1gpu',
          providerId: 'provider-g',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $2.74/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.74/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'AMD-specialized infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-l-rtx4090-1gpu',
          providerId: 'provider-l',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $2.78/hr'),
              leadTimeDays: parseLeadTime('2-4 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.78/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'European-style infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-s-rtx4090-1gpu',
          providerId: 'provider-s',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $2.80/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.80/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Competitive AMD infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-c-rtx4090-2gpu',
          providerId: 'provider-c',
          displayName: 'RTX 4090 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $5.44/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('32 vCPU • 256 GB RAM • 2 TB NVMe'),
          commercial: {
            price: parsePrice('From $5.44/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-f-rtx4090-2gpu',
          providerId: 'provider-f',
          displayName: 'RTX 4090 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $5.52/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('32 vCPU • 256 GB RAM • 2 TB NVMe'),
          commercial: {
            price: parsePrice('From $5.52/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'High-altitude natural cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 1,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-g-rtx4090-4gpu',
          providerId: 'provider-g',
          displayName: 'RTX 4090 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $10.96/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $10.96/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'AMD-specialized infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-s-rtx4090-4gpu',
          providerId: 'provider-s',
          displayName: 'RTX 4090 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $11.12/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $11.12/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Competitive AMD infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-c-rtx4090-1gpu',
          providerId: 'provider-c',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $2.72/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.72/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-f-rtx4090-1gpu',
          providerId: 'provider-f',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $2.76/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.76/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'High-altitude natural cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 1,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-g-rtx4090-1gpu',
          providerId: 'provider-g',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $2.74/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.74/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'AMD-specialized infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-l-rtx4090-1gpu',
          providerId: 'provider-l',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $2.78/hr'),
              leadTimeDays: parseLeadTime('2-4 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.78/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'European-style infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-s-rtx4090-1gpu',
          providerId: 'provider-s',
          displayName: 'RTX 4090 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $2.80/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $2.80/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Competitive AMD infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-c-rtx4090-2gpu',
          providerId: 'provider-c',
          displayName: 'RTX 4090 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $5.44/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('32 vCPU • 256 GB RAM • 2 TB NVMe'),
          commercial: {
            price: parsePrice('From $5.44/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-f-rtx4090-2gpu',
          providerId: 'provider-f',
          displayName: 'RTX 4090 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $5.52/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('32 vCPU • 256 GB RAM • 2 TB NVMe'),
          commercial: {
            price: parsePrice('From $5.52/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'High-altitude natural cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 1,
            networkReliability: 5,
            coolingCapacity: 5
          })
        }
      ]
    },

    // L40S GPU Family
    {
      id: GpuFamilyId.L40,
      vendor: Vendor.NVIDIA,
      model: 'L40S',
      memoryGB: 48,
      description: 'NVIDIA L40S GPU with 48GB GDDR6 memory',
      shortDetails:
        'Balanced choice for latency-sensitive inference and smaller training workloads.',
      offerings: [
        {
          id: 'provider-a-l40s-4gpu',
          providerId: 'provider-a',
          displayName: 'L40S 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $16.80/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 8 TB NVMe'),
          commercial: {
            price: parsePrice('From $16.80/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Tier III+ datacenters with redundant cooling systems'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-e-l40s-4gpu',
          providerId: 'provider-e',
          displayName: 'L40S 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $17.28/hr'),
              leadTimeDays: parseLeadTime('Same day'),
              minTerm: parseMinTerm('Daily')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 8 TB NVMe'),
          commercial: {
            price: parsePrice('From $17.28/hr'),
            minTerm: parseMinTerm('Daily'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 3
          })
        },
        {
          id: 'provider-h-l40s-4gpu',
          providerId: 'provider-h',
          displayName: 'L40S 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $17.12/hr'),
              leadTimeDays: parseLeadTime('1-2 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 8 TB NVMe'),
          commercial: {
            price: parsePrice('From $17.12/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-p-l40s-4gpu',
          providerId: 'provider-p',
          displayName: 'L40S 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $17.44/hr'),
              leadTimeDays: parseLeadTime('3-6 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 8 TB NVMe'),
          commercial: {
            price: parsePrice('From $17.44/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-a-l40s-1gpu',
          providerId: 'provider-a',
          displayName: 'L40S Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $4.20/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $4.20/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Tier III+ datacenters with redundant cooling systems'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-e-l40s-1gpu',
          providerId: 'provider-e',
          displayName: 'L40S Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $4.32/hr'),
              leadTimeDays: parseLeadTime('Same day'),
              minTerm: parseMinTerm('Daily')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $4.32/hr'),
            minTerm: parseMinTerm('Daily'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 3
          })
        },
        {
          id: 'provider-h-l40s-1gpu',
          providerId: 'provider-h',
          displayName: 'L40S Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $4.28/hr'),
              leadTimeDays: parseLeadTime('1-2 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $4.28/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-i-l40s-1gpu',
          providerId: 'provider-i',
          displayName: 'L40S Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $4.26/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $4.26/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-p-l40s-1gpu',
          providerId: 'provider-p',
          displayName: 'L40S Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $4.36/hr'),
              leadTimeDays: parseLeadTime('3-6 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $4.36/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-a-l40s-2gpu',
          providerId: 'provider-a',
          displayName: 'L40S 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $8.40/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $8.40/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Tier III+ datacenters with redundant cooling systems'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-e-l40s-2gpu',
          providerId: 'provider-e',
          displayName: 'L40S 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $8.64/hr'),
              leadTimeDays: parseLeadTime('Same day'),
              minTerm: parseMinTerm('Daily')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $8.64/hr'),
            minTerm: parseMinTerm('Daily'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 3
          })
        },
        {
          id: 'provider-c-l40s-4gpu',
          providerId: 'provider-c',
          displayName: 'L40S 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $15.68/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 8 TB NVMe'),
          commercial: {
            price: parsePrice('From $15.68/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-f-l40s-4gpu',
          providerId: 'provider-f',
          displayName: 'L40S 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $16.00/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 8 TB NVMe'),
          commercial: {
            price: parsePrice('From $16.00/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'High-altitude natural cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 1,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-g-l40s-4gpu',
          providerId: 'provider-g',
          displayName: 'L40S 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $15.84/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 8 TB NVMe'),
          commercial: {
            price: parsePrice('From $15.84/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'AMD-specialized infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-s-l40s-4gpu',
          providerId: 'provider-s',
          displayName: 'L40S 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $16.16/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 8 TB NVMe'),
          commercial: {
            price: parsePrice('From $16.16/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Competitive AMD infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-c-l40s-1gpu',
          providerId: 'provider-c',
          displayName: 'L40S Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $3.92/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $3.92/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-f-l40s-1gpu',
          providerId: 'provider-f',
          displayName: 'L40S Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $4.00/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $4.00/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'High-altitude natural cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 1,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-g-l40s-1gpu',
          providerId: 'provider-g',
          displayName: 'L40S Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $3.96/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $3.96/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'AMD-specialized infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-l-l40s-1gpu',
          providerId: 'provider-l',
          displayName: 'L40S Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $4.04/hr'),
              leadTimeDays: parseLeadTime('2-4 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $4.04/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'European-style infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-s-l40s-1gpu',
          providerId: 'provider-s',
          displayName: 'L40S Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $4.08/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('16 vCPU • 128 GB RAM • 500 GB NVMe'),
          commercial: {
            price: parsePrice('From $4.08/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Competitive AMD infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-c-l40s-2gpu',
          providerId: 'provider-c',
          displayName: 'L40S 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $7.84/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $7.84/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 5,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-f-l40s-2gpu',
          providerId: 'provider-f',
          displayName: 'L40S 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $8.00/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $8.00/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'High-altitude natural cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 1,
            networkReliability: 5,
            coolingCapacity: 5
          })
        }
      ]
    },

    // A10 GPU Family
    {
      id: 'a10',
      vendor: Vendor.NVIDIA,
      model: 'A10',
      memoryGB: 24,
      description: 'NVIDIA A10 GPU with 24GB GDDR6 memory',
      shortDetails:
        'Entry-level GPU for development and light inference workloads.',
      offerings: [
        {
          id: 'provider-a-a10-1gpu',
          providerId: 'provider-a',
          displayName: 'A10 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $1.40/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('8 vCPU • 64 GB RAM • 250 GB NVMe'),
          commercial: {
            price: parsePrice('From $1.40/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Tier III+ datacenters with redundant cooling systems'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-e-a10-1gpu',
          providerId: 'provider-e',
          displayName: 'A10 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $1.44/hr'),
              leadTimeDays: parseLeadTime('Same day'),
              minTerm: parseMinTerm('Daily')
            }
          ],
          nodeSpecs: parseSpecs('8 vCPU • 64 GB RAM • 250 GB NVMe'),
          commercial: {
            price: parsePrice('From $1.44/hr'),
            minTerm: parseMinTerm('Daily'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 3
          })
        },
        {
          id: 'provider-h-a10-1gpu',
          providerId: 'provider-h',
          displayName: 'A10 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $1.42/hr'),
              leadTimeDays: parseLeadTime('1-2 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('8 vCPU • 64 GB RAM • 250 GB NVMe'),
          commercial: {
            price: parsePrice('From $1.42/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-p-a10-1gpu',
          providerId: 'provider-p',
          displayName: 'A10 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $1.46/hr'),
              leadTimeDays: parseLeadTime('3-6 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('8 vCPU • 64 GB RAM • 250 GB NVMe'),
          commercial: {
            price: parsePrice('From $1.46/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-c-a10-1gpu',
          providerId: 'provider-c',
          displayName: 'A10 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $1.36/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('8 vCPU • 64 GB RAM • 250 GB NVMe'),
          commercial: {
            price: parsePrice('From $1.36/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 5,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-f-a10-1gpu',
          providerId: 'provider-f',
          displayName: 'A10 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $1.40/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('8 vCPU • 64 GB RAM • 250 GB NVMe'),
          commercial: {
            price: parsePrice('From $1.40/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'High-altitude natural cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 5,
            costEfficiency: 5,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-g-a10-1gpu',
          providerId: 'provider-g',
          displayName: 'A10 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $1.38/hr'),
              leadTimeDays: parseLeadTime('5-10 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('8 vCPU • 64 GB RAM • 250 GB NVMe'),
          commercial: {
            price: parsePrice('From $1.38/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'AMD-specialized infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-s-a10-1gpu',
          providerId: 'provider-s',
          displayName: 'A10 Single GPU',
          provisioningType: ProvisioningType.VIRTUAL_MACHINE,
          gpuCount: 1,
          isClusterCapable: false,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $1.42/hr'),
              leadTimeDays: parseLeadTime('3-7 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('8 vCPU • 64 GB RAM • 250 GB NVMe'),
          commercial: {
            price: parsePrice('From $1.42/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Competitive AMD infrastructure'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 4
          })
        }
      ]
    },

    // A100 PCIe GPU Family
    {
      id: 'a100-pcie',
      vendor: Vendor.NVIDIA,
      model: 'A100 PCIe',
      memoryGB: 40,
      description: 'NVIDIA A100 GPU with 40GB HBM2e memory (PCIe version)',
      shortDetails: 'Cost-effective A100 variant for moderate-scale workloads.',
      offerings: [
        {
          id: 'provider-a-a100pcie-4gpu',
          providerId: 'provider-a',
          displayName: 'A100 PCIe 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $14.40/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 8 TB NVMe'),
          commercial: {
            price: parsePrice('From $14.40/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Tier III+ datacenters with redundant cooling systems'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-e-a100pcie-4gpu',
          providerId: 'provider-e',
          displayName: 'A100 PCIe 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $14.72/hr'),
              leadTimeDays: parseLeadTime('Same day'),
              minTerm: parseMinTerm('Daily')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 8 TB NVMe'),
          commercial: {
            price: parsePrice('From $14.72/hr'),
            minTerm: parseMinTerm('Daily'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 3
          })
        },
        {
          id: 'provider-h-a100pcie-4gpu',
          providerId: 'provider-h',
          displayName: 'A100 PCIe 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $14.56/hr'),
              leadTimeDays: parseLeadTime('1-2 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 8 TB NVMe'),
          commercial: {
            price: parsePrice('From $14.56/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 4,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-a-a100pcie-2gpu',
          providerId: 'provider-a',
          displayName: 'A100 PCIe 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $7.20/hr'),
              leadTimeDays: parseLeadTime('1-3 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $7.20/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Tier III+ datacenters with redundant cooling systems'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 2,
            electricityReliability: 5,
            fireRisk: 1,
            securityBreach: 1,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 4
          })
        },
        {
          id: 'provider-e-a100pcie-2gpu',
          providerId: 'provider-e',
          displayName: 'A100 PCIe 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-east',
              locationLabel: 'US East',
              price: parsePrice('From $7.36/hr'),
              leadTimeDays: parseLeadTime('Same day'),
              minTerm: parseMinTerm('Daily')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $7.36/hr'),
            minTerm: parseMinTerm('Daily'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 3,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 3
          })
        },
        {
          id: 'provider-c-a100pcie-4gpu',
          providerId: 'provider-c',
          displayName: 'A100 PCIe 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $13.92/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 8 TB NVMe'),
          commercial: {
            price: parsePrice('From $13.92/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-e-a100pcie-4gpu',
          providerId: 'provider-e',
          displayName: 'A100 PCIe 4-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 4,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $14.08/hr'),
              leadTimeDays: parseLeadTime('Same day'),
              minTerm: parseMinTerm('Daily')
            }
          ],
          nodeSpecs: parseSpecs('128 vCPU • 1 TB RAM • 8 TB NVMe'),
          commercial: {
            price: parsePrice('From $14.08/hr'),
            minTerm: parseMinTerm('Daily'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 3
          })
        },
        {
          id: 'provider-c-a100pcie-2gpu',
          providerId: 'provider-c',
          displayName: 'A100 PCIe 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $6.96/hr'),
              leadTimeDays: parseLeadTime('2-5 days'),
              minTerm: parseMinTerm('Monthly')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $6.96/hr'),
            minTerm: parseMinTerm('Monthly'),
            billingModel: BillingModel.ON_DEMAND,
            notes: 'Coastal datacenters with advanced cooling'
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 4,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 4,
            costEfficiency: 3,
            networkReliability: 5,
            coolingCapacity: 5
          })
        },
        {
          id: 'provider-e-a100pcie-2gpu',
          providerId: 'provider-e',
          displayName: 'A100 PCIe 2-GPU Cluster',
          provisioningType: ProvisioningType.BARE_METAL,
          gpuCount: 2,
          isClusterCapable: true,
          regions: [
            {
              regionCode: 'us-west',
              locationLabel: 'US West',
              price: parsePrice('From $7.04/hr'),
              leadTimeDays: parseLeadTime('Same day'),
              minTerm: parseMinTerm('Daily')
            }
          ],
          nodeSpecs: parseSpecs('64 vCPU • 512 GB RAM • 4 TB NVMe'),
          commercial: {
            price: parsePrice('From $7.04/hr'),
            minTerm: parseMinTerm('Daily'),
            billingModel: BillingModel.ON_DEMAND
          },
          riskMetrics: extendRiskMetrics({
            naturalDisaster: 4,
            electricityReliability: 3,
            fireRisk: 2,
            securityBreach: 2,
            powerEfficiency: 3,
            costEfficiency: 5,
            networkReliability: 4,
            coolingCapacity: 3
          })
        }
      ]
    }
  ],

  providers: [
    {
      id: 'provider-a',
      name: 'Provider Alpha',
      description:
        'Leading cloud GPU provider specializing in AI infrastructure',
      headquartersRegion: 'US East',
      primaryFocus: 'AI training and inference',
      website: 'https://provider-alpha.com'
    },
    {
      id: 'provider-b',
      name: 'Provider Beta',
      description: 'European cloud provider with strong compliance focus',
      headquartersRegion: 'EU West',
      primaryFocus: 'GDPR-compliant AI workloads',
      website: 'https://provider-beta.eu'
    },
    {
      id: 'provider-c',
      name: 'Provider Gamma',
      description:
        'Specialized GPU cloud provider with advanced cooling technology',
      headquartersRegion: 'US West',
      primaryFocus: 'High-performance computing',
      website: 'https://provider-gamma.com'
    },
    {
      id: 'provider-d',
      name: 'Provider Delta',
      description: 'European mid-tier cloud provider',
      headquartersRegion: 'EU Central',
      primaryFocus: 'Cost-effective cloud solutions',
      website: 'https://provider-delta.eu'
    },
    {
      id: 'provider-e',
      name: 'Provider Epsilon',
      description:
        'Urban datacenter provider with district heating integration',
      headquartersRegion: 'US East',
      primaryFocus: 'Sustainable cloud infrastructure',
      website: 'https://provider-epsilon.com'
    },
    {
      id: 'provider-f',
      name: 'Provider Zeta',
      description:
        'High-altitude datacenter provider leveraging natural cooling',
      headquartersRegion: 'US West',
      primaryFocus: 'Large-scale AI training',
      website: 'https://provider-zeta.com'
    },
    {
      id: 'provider-g',
      name: 'Provider Eta',
      description: 'AMD-specialized cloud provider',
      headquartersRegion: 'US West',
      primaryFocus: 'AMD ROCm ecosystem',
      website: 'https://provider-eta.com'
    },
    {
      id: 'provider-h',
      name: 'Provider Theta',
      description: 'High-performance datacenter with advanced networking',
      headquartersRegion: 'US East',
      primaryFocus: 'Low-latency workloads',
      website: 'https://provider-theta.com'
    },
    {
      id: 'provider-i',
      name: 'Provider Iota',
      description: 'State-of-the-art datacenter with immersion cooling',
      headquartersRegion: 'US East',
      primaryFocus: 'Energy-efficient computing',
      website: 'https://provider-iota.com'
    },
    {
      id: 'provider-j',
      name: 'Provider Kappa',
      description: 'GDPR-compliant European GPU provider',
      headquartersRegion: 'EU West',
      primaryFocus: 'European AI infrastructure',
      website: 'https://provider-kappa.eu'
    },
    {
      id: 'provider-k',
      name: 'Provider Lambda',
      description: 'Cost-effective GPU provider for development workloads',
      headquartersRegion: 'US West',
      primaryFocus: 'Prototyping and development',
      website: 'https://provider-lambda.com'
    },
    {
      id: 'provider-m',
      name: 'Provider Nu',
      description: 'European high-capacity cluster provider',
      headquartersRegion: 'EU Central',
      primaryFocus: 'Large-scale AI training',
      website: 'https://provider-nu.eu'
    },
    {
      id: 'provider-p',
      name: 'Provider Pi',
      description: 'Eastern US high-performance GPU provider',
      headquartersRegion: 'US East',
      primaryFocus: 'AMD infrastructure',
      website: 'https://provider-pi.com'
    },
    {
      id: 'provider-q',
      name: 'Provider Rho',
      description: 'Established GPU provider with proven track record',
      headquartersRegion: 'US West',
      primaryFocus: 'Reliable GPU infrastructure',
      website: 'https://provider-rho.com'
    },
    {
      id: 'provider-r',
      name: 'Provider Sigma',
      description: 'GDPR-compliant European GPU provider',
      headquartersRegion: 'EU West',
      primaryFocus: 'European development workloads',
      website: 'https://provider-sigma.eu'
    },
    {
      id: 'provider-s',
      name: 'Provider Tau',
      description: 'Competitive AMD infrastructure provider',
      headquartersRegion: 'US West',
      primaryFocus: 'AMD MI300X workloads',
      website: 'https://provider-tau.com'
    },
    {
      id: 'provider-t',
      name: 'Provider Upsilon',
      description: 'Central US reliable infrastructure provider',
      headquartersRegion: 'US Central',
      primaryFocus: 'Cost-effective GPU solutions',
      website: 'https://provider-upsilon.com'
    }
  ]
};

// Legacy compatibility export (will be removed in future)
export const gpuTypes = gpuCatalog.gpus.flatMap(gpu =>
  gpu.offerings.map(offering => ({
    type: gpu.model,
    description: gpu.description,
    shortDetails: gpu.shortDetails,
    providers: [
      {
        id: offering.providerId,
        name:
          gpuCatalog.providers.find(p => p.id === offering.providerId)?.name ||
          offering.providerId,
        location: offering.regions[0]?.locationLabel || 'Unknown',
        supportedSizes: [offering.gpuCount],
        specs: `${offering.nodeSpecs.vcpus} vCPU • ${Math.round((offering.nodeSpecs.memoryGB / 1024) * 10) / 10} TB RAM • ${offering.nodeSpecs.localStorageTB} TB NVMe`,
        regions: offering.regions.map(r => ({
          name: r.locationLabel,
          price: `From $${r.price?.hourlyFrom?.toFixed(2)}/hr`,
          riskMetrics: offering.riskMetrics
        })),
        leadTime: offering.regions[0]?.leadTimeDays
          ? `${offering.regions[0].leadTimeDays.min}-${offering.regions[0].leadTimeDays.max} days`
          : '1-3 days',
        minTerm:
          offering.commercial.minTerm.unit === 'monthly'
            ? `${offering.commercial.minTerm.minimumUnits === 1 ? 'Monthly' : `${offering.commercial.minTerm.minimumUnits}-month`}`
            : 'Monthly',
        shortDetails: gpu.shortDetails,
        details: `Provider: ${gpuCatalog.providers.find(p => p.id === offering.providerId)?.description || 'High-performance GPU infrastructure'}`
      }
    ]
  }))
);
