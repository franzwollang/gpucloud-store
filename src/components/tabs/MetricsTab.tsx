import React from 'react';

import type { Provider } from '@/types/gpu';

interface MetricsTabProps {
  selectedProvider: Provider;
  selectedRegion: string;
}

interface ScoreBadgeProps {
  score: number | null;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  if (score == null) {
    return (
      <span className="bg-bg-surface/60 text-fg-muted rounded px-2 py-0.5 text-xs">
        n/a
      </span>
    );
  }

  const getColorClass = (value: number) => {
    // Higher is always better: 4-5 green, 3 yellow, 1-2 red
    return value >= 4
      ? 'bg-green-500/20 text-green-400'
      : value === 3
        ? 'bg-yellow-500/20 text-yellow-400'
        : 'bg-red-500/20 text-red-400';
  };

  return (
    <span className={`rounded px-2 py-0.5 text-xs ${getColorClass(score)}`}>
      {score}/5
    </span>
  );
};

interface MetricTooltipProps {
  content: string;
}

const MetricTooltip: React.FC<MetricTooltipProps> = ({ content }) => (
  <div
    className="border-border/70 pointer-events-none absolute bottom-full left-0 z-10 mb-2 max-w-[min(16rem,100%)] rounded-lg border bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    dangerouslySetInnerHTML={{ __html: content }}
  />
);

interface MetricRowProps {
  label: string;
  score: number | null;
  tooltip: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, score, tooltip }) => (
  <div className="group bg-bg-surface/10 hover:bg-bg-page/50 hover:border-border/50 relative flex min-w-0 cursor-pointer items-center justify-between gap-2 overflow-hidden rounded border border-transparent px-2 py-1.5 transition-all duration-200 hover:shadow-sm">
    <span className="group-hover:text-fg-main min-w-0 flex-1 truncate transition-colors">
      {label}:
    </span>
    <span className="shrink-0">
      <ScoreBadge score={score} />
    </span>
    <MetricTooltip content={tooltip} />
  </div>
);

const METRIC_KEYS = [
  'naturalDisaster',
  'electricityReliability',
  'fireRisk',
  'securityBreach',
  'powerEfficiency',
  'costEfficiency',
  'networkReliability',
  'coolingCapacity'
] as const;

function scoreOrNull(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export const MetricsTab: React.FC<MetricsTabProps> = ({
  selectedProvider,
  selectedRegion
}) => {
  const regionData = selectedProvider.regions.find(
    r => r.name === selectedRegion
  );
  const metrics = regionData?.riskMetrics ?? {};

  const regionRiskMetrics = {
    naturalDisaster: scoreOrNull(metrics.naturalDisaster),
    electricityReliability: scoreOrNull(metrics.electricityReliability),
    fireRisk: scoreOrNull(metrics.fireRisk),
    securityBreach: scoreOrNull(metrics.securityBreach),
    powerEfficiency: scoreOrNull(metrics.powerEfficiency),
    costEfficiency: scoreOrNull(metrics.costEfficiency),
    networkReliability: scoreOrNull(metrics.networkReliability),
    coolingCapacity: scoreOrNull(metrics.coolingCapacity)
  };

  const hasAnyScore = METRIC_KEYS.some(
    key => regionRiskMetrics[key as keyof typeof regionRiskMetrics] != null
  );

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col justify-start overflow-x-hidden">
      <div className="border-border/20 bg-bg-surface/20 min-w-0 overflow-hidden rounded-lg border p-3">
        <div className="text-fg-muted/70 mb-3 text-xs tracking-wide break-words uppercase">
          Risk & Performance Metrics — {selectedProvider.name},{' '}
          {selectedRegion}
        </div>

        {!hasAnyScore ? (
          <p className="text-fg-muted mb-3 text-xs">
            Risk scores are not available for this listing yet. Values show as
            n/a until provider facilities are assessed.
          </p>
        ) : null}

        <div className="grid min-w-0 grid-cols-1 gap-x-2 gap-y-0 text-xs sm:grid-cols-2">
          <div className="min-w-0 space-y-0">
            <MetricRow
              label="Natural Disaster"
              score={regionRiskMetrics.naturalDisaster}
              tooltip="Likelihood of service interruptions from environmental events (earthquakes, flooding, storms, hurricanes, wildfire) over the contract duration."
            />
            <MetricRow
              label="Electricity Reliability"
              score={regionRiskMetrics.electricityReliability}
              tooltip="Stability of electrical supply including grid reliability, on-site generation, UPS redundancy, and historical uptime."
            />
            <MetricRow
              label="Fire Risk"
              score={regionRiskMetrics.fireRisk}
              tooltip="Effectiveness of fire detection, prevention, suppression systems, and structural compartmentalization."
            />
            <MetricRow
              label="Security Breach"
              score={regionRiskMetrics.securityBreach}
              tooltip="Strength of physical and operational security protecting against unauthorized access or service disruption."
            />
          </div>

          <div className="min-w-0 space-y-0">
            <MetricRow
              label="Power Efficiency"
              score={regionRiskMetrics.powerEfficiency}
              tooltip="Overall electrical and cooling efficiency, especially under continuous high-density GPU load."
            />
            <MetricRow
              label="Cost Efficiency"
              score={regionRiskMetrics.costEfficiency}
              tooltip="Structural cost-effectiveness of operating GPUs at this facility, influenced by energy costs, cooling efficiency, and scale economics."
            />
            <MetricRow
              label="Network Reliability"
              score={regionRiskMetrics.networkReliability}
              tooltip="Carrier diversity, fiber path redundancy, routing hardware quality, and historical network performance."
            />
            <MetricRow
              label="Cooling Capacity"
              score={regionRiskMetrics.coolingCapacity}
              tooltip="Ability to sustain high-density GPU loads (20–100+ kW per rack) under continuous operation without throttling or derating."
            />
          </div>
        </div>
        <div className="mt-3 text-xs">
          <a href="#" className="text-blue-300 underline hover:text-blue-200">
            How are these evaluated?
          </a>
        </div>
      </div>
    </div>
  );
};
