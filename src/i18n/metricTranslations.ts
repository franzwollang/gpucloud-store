import type { AppMessages } from '@/i18n';
import type { AppTranslator } from '@/i18n/t';
import type { PathValue } from '@/lib/typing';

type MetricsMessages = PathValue<AppMessages, 'TEST.gpuModal.metrics'>;

type MetricKey =
  | 'naturalDisaster'
  | 'electricityReliability'
  | 'fireRisk'
  | 'securityBreach'
  | 'powerEfficiency'
  | 'costEfficiency'
  | 'networkReliability'
  | 'coolingCapacity';

export function translateMetricLabel(
  t: AppTranslator<MetricsMessages>,
  key: MetricKey
): string {
  switch (key) {
    case 'naturalDisaster':
      return t('labels.naturalDisaster')('Natural Disaster')();
    case 'electricityReliability':
      return t('labels.electricityReliability')('Electricity Reliability')();
    case 'fireRisk':
      return t('labels.fireRisk')('Fire Risk')();
    case 'securityBreach':
      return t('labels.securityBreach')('Security Breach')();
    case 'powerEfficiency':
      return t('labels.powerEfficiency')('Power Efficiency')();
    case 'costEfficiency':
      return t('labels.costEfficiency')('Cost Efficiency')();
    case 'networkReliability':
      return t('labels.networkReliability')('Network Reliability')();
    case 'coolingCapacity':
      return t('labels.coolingCapacity')('Cooling Capacity')();
  }
}

export function translateMetricTooltip(
  t: AppTranslator<MetricsMessages>,
  key: MetricKey
): string {
  switch (key) {
    case 'naturalDisaster':
      return t('tooltips.naturalDisaster')('Likelihood of service interruptions from environmental events (earthquakes, flooding, storms, hurricanes, wildfire) over the contract duration.')();
    case 'electricityReliability':
      return t('tooltips.electricityReliability')('Stability of electrical supply including grid reliability, on-site generation, UPS redundancy, and historical uptime.')();
    case 'fireRisk':
      return t('tooltips.fireRisk')('Effectiveness of fire detection, prevention, suppression systems, and structural compartmentalization.')();
    case 'securityBreach':
      return t('tooltips.securityBreach')('Strength of physical and operational security protecting against unauthorized access or service disruption.')();
    case 'powerEfficiency':
      return t('tooltips.powerEfficiency')('Overall electrical and cooling efficiency, especially under continuous high-density GPU load.')();
    case 'costEfficiency':
      return t('tooltips.costEfficiency')('Structural cost-effectiveness of operating GPUs at this facility, influenced by energy costs, cooling efficiency, and scale economics.')();
    case 'networkReliability':
      return t('tooltips.networkReliability')('Carrier diversity, fiber path redundancy, routing hardware quality, and historical network performance.')();
    case 'coolingCapacity':
      return t('tooltips.coolingCapacity')('Ability to sustain high-density GPU loads (20–100+ kW per rack) under continuous operation without throttling or derating.')();
  }
}
