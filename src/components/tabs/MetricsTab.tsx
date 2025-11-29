import React from 'react';

import type { Provider, RiskMetrics } from '@/types/gpu';

interface MetricsTabProps {
  selectedProvider: Provider;
  selectedRegion: string;
}

// Sub-components for reusability

interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  const getColorClass = (score: number) => {
    // Higher is always better: 4-5 green, 3 yellow, 1-2 red
    return score >= 4
      ? 'bg-green-500/20 text-green-400'
      : score === 3
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
    className="absolute bottom-full left-1/2 z-10 mb-2 w-[500px] -translate-x-1/2 transform rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    dangerouslySetInnerHTML={{ __html: content }}
  />
);

interface MetricRowProps {
  label: string;
  score: number;
  tooltip: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, score, tooltip }) => (
  <div className="group hover:bg-bg-surface/50 hover:border-border/30 relative flex cursor-pointer justify-between rounded border border-transparent px-2 py-1.5 transition-all duration-200 hover:shadow-sm">
    <span className="group-hover:text-fg-main transition-colors">{label}:</span>
    <span>
      <ScoreBadge score={score} />
    </span>
    <MetricTooltip content={tooltip} />
  </div>
);

export const MetricsTab: React.FC<MetricsTabProps> = ({
  selectedProvider,
  selectedRegion
}) => {
  const regionRiskMetrics = selectedProvider.regions.find(
    r => r.name === selectedRegion
  )?.riskMetrics;

  if (!regionRiskMetrics) return null;

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="border-border/20 bg-bg-surface/20 rounded-lg border p-3">
        <div className="text-fg-muted/70 mb-3 text-xs tracking-wide uppercase">
          Risk & Performance Metrics - {selectedProvider.name}, {selectedRegion}{' '}
          facilities
        </div>

        <div className="grid grid-cols-2 gap-0 text-xs">
          <div className="space-y-0">
            <MetricRow
              label="Natural Disaster"
              score={regionRiskMetrics.naturalDisaster}
              tooltip="Likelihood of service interruptions from environmental events (earthquakes, flooding, storms, hurricanes, wildfire) over the contract duration. <a href='#' class='text-blue-300 hover:text-blue-200 text-xs underline ml-1'>[Details]</a>"
            />
            <MetricRow
              label="Electricity Reliability"
              score={regionRiskMetrics.electricityReliability}
              tooltip="Stability of electrical supply including grid reliability, on-site generation, UPS redundancy, and historical uptime. <a href='#' class='text-blue-300 hover:text-blue-200 text-xs underline ml-1'>[Details]</a>"
            />
            <MetricRow
              label="Fire Risk"
              score={regionRiskMetrics.fireRisk}
              tooltip="Effectiveness of fire detection, prevention, suppression systems, and structural compartmentalization. <a href='#' class='text-blue-300 hover:text-blue-200 text-xs underline ml-1'>[Details]</a>"
            />
            <MetricRow
              label="Security Breach"
              score={regionRiskMetrics.securityBreach}
              tooltip="Strength of physical and operational security protecting against unauthorized access or service disruption. <a href='#' class='text-blue-300 hover:text-blue-200 text-xs underline ml-1'>[Details]</a>"
            />
          </div>

          <div className="space-y-0">
            <MetricRow
              label="Power Efficiency"
              score={regionRiskMetrics.powerEfficiency}
              tooltip="Overall electrical and cooling efficiency, especially under continuous high-density GPU load. <a href='#' class='text-blue-300 hover:text-blue-200 text-xs underline ml-1'>[Details]</a>"
            />
            <MetricRow
              label="Cost Efficiency"
              score={regionRiskMetrics.costEfficiency}
              tooltip="Structural cost-effectiveness of operating GPUs at this facility, influenced by energy costs, cooling efficiency, and scale economics. <a href='#' class='text-blue-300 hover:text-blue-200 text-xs underline ml-1'>[Details]</a>"
            />
            <MetricRow
              label="Network Reliability"
              score={regionRiskMetrics.networkReliability}
              tooltip="Carrier diversity, fiber path redundancy, routing hardware quality, and historical network performance. <a href='#' class='text-blue-300 hover:text-blue-200 text-xs underline ml-1'>[Details]</a>"
            />
            <MetricRow
              label="Cooling Capacity"
              score={regionRiskMetrics.coolingCapacity}
              tooltip="Ability to sustain high-density GPU loads (20–100+ kW per rack) under continuous operation without throttling or derating. <a href='#' class='text-blue-300 hover:text-blue-200 text-xs underline ml-1'>[Details]</a>"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
