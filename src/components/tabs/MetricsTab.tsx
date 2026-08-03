'use client';

import React from 'react';

import { useAppTranslations } from '@/i18n';
import {
  translateMetricLabel,
  translateMetricTooltip
} from '@/i18n/metricTranslations';
import type { Provider } from '@/types/gpu';

interface MetricsTabProps {
  selectedProvider: Provider;
  selectedRegion: string;
}

interface ScoreBadgeProps {
  score: number | null;
  naLabel: string;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, naLabel }) => {
  if (score == null) {
    return (
      <span className="bg-bg-surface/60 text-fg-muted rounded px-2 py-0.5 text-xs">
        {naLabel}
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
  naLabel: string;
}

const MetricRow: React.FC<MetricRowProps> = ({
  label,
  score,
  tooltip,
  naLabel
}) => (
  <div className="group bg-bg-surface/10 hover:bg-bg-page/50 hover:border-border/50 relative flex shrink-0 cursor-pointer items-center justify-between gap-2 overflow-hidden rounded border border-transparent px-2 py-1 transition-all duration-200 hover:shadow-sm">
    <span className="group-hover:text-fg-main min-w-0 flex-1 truncate transition-colors">
      {label}:
    </span>
    <span className="shrink-0">
      <ScoreBadge score={score} naLabel={naLabel} />
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
  const t = useAppTranslations('TEST.gpuModal.metrics');
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

  const leftKeys = METRIC_KEYS.slice(0, 4);
  const rightKeys = METRIC_KEYS.slice(4);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
      {/* Compact metrics block — tab shell stays flex-1; rows do not stretch */}
      <div className="border-border/20 bg-bg-surface/20 flex w-full shrink-0 flex-col overflow-hidden rounded-lg border p-2.5">
        <div className="text-fg-muted/70 mb-1.5 shrink-0 text-[11px] tracking-wide break-words uppercase">
          {t('heading')('Risk & Performance Metrics — {provider}, {region}')({
            provider: selectedProvider.name,
            region: selectedRegion
          })}
        </div>

        {!hasAnyScore ? (
          <p className="text-fg-muted mb-1.5 shrink-0 text-xs">
            {t('unavailable')(
              'Risk scores are not available for this listing yet. Values show as n/a until provider facilities are assessed.'
            )()}
          </p>
        ) : null}

        <div className="grid min-w-0 shrink-0 grid-cols-1 gap-x-2 gap-y-0.5 text-xs sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            {leftKeys.map(key => (
              <MetricRow
                key={key}
                label={translateMetricLabel(t, key)}
                score={regionRiskMetrics[key]}
                tooltip={translateMetricTooltip(t, key)}
                naLabel={t('na')('n/a')()}
              />
            ))}
          </div>

          <div className="flex min-w-0 flex-col gap-0.5">
            {rightKeys.map(key => (
              <MetricRow
                key={key}
                label={translateMetricLabel(t, key)}
                score={regionRiskMetrics[key]}
                tooltip={translateMetricTooltip(t, key)}
                naLabel={t('na')('n/a')()}
              />
            ))}
          </div>
        </div>
        <div className="mt-1.5 shrink-0 text-xs">
          <a href="#" className="text-blue-300 underline hover:text-blue-200">
            {t('howEvaluated')('How are these evaluated?')()}
          </a>
        </div>
      </div>
    </div>
  );
};
