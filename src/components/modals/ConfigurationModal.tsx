'use client';

import React from 'react';
import { useAppTranslations } from '@/i18n';

import type { Provider } from '@/types/gpu';

import * as Tabs from '../ui/tabs';
import { InfrastructureTab } from '../tabs/InfrastructureTab';
import { MetricsTab } from '../tabs/MetricsTab';
import { OverviewTab } from '../tabs/OverviewTab';

interface ConfigurationContentProps {
  currentDialogOption: {
    type: string;
  };
  selectedProvider: Provider;
  selectedSize: number;
  selectedRegion: string;
  onSelectionChange: () => void;
}

export const ConfigurationContent: React.FC<ConfigurationContentProps> = ({
  currentDialogOption,
  selectedProvider,
  selectedSize,
  selectedRegion,
  onSelectionChange
}) => {
  const t = useAppTranslations('TEST.gpuModal');

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-2">
      {/* p-0.5 keeps the focus ring inside the overflow-hidden dialog body */}
      <div className="flex shrink-0 items-center justify-between gap-2 p-0.5">
        <div className="text-fg-muted/70 text-xs tracking-wide uppercase">
          {t('configurationDetails')('Configuration Details')()}
        </div>
        <button
          type="button"
          onClick={onSelectionChange}
          className="text-fg-soft hover:text-fg-main focus-visible:ring-ui-active-soft rounded px-0.5 text-xs underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {t('changeSelection')('Change Selection')()}
        </button>
      </div>

      {/*
        WAI-ARIA Tabs (APG):
        - Tab moves focus: active tab → tabpanel → next page control
        - ArrowLeft/ArrowRight move across tabs (Radix roving tabindex)
        - Do not focus tabs on hover; do not steal arrows outside the tablist
      */}
      <Tabs.Tabs
        defaultValue="overview"
        className="flex min-h-0 min-w-0 flex-1 flex-col"
      >
        <Tabs.TabsList className="grid h-8 w-full shrink-0 grid-cols-3">
          <Tabs.TabsTrigger value="overview" className="py-0.5 text-xs">
            {t('tabs.overview')('Overview')()}
          </Tabs.TabsTrigger>
          <Tabs.TabsTrigger value="risk" className="py-0.5 text-xs">
            {t('tabs.risk')('Risk & Performance')()}
          </Tabs.TabsTrigger>
          <Tabs.TabsTrigger value="infrastructure" className="py-0.5 text-xs">
            {t('tabs.infrastructure')('Infrastructure')()}
          </Tabs.TabsTrigger>
        </Tabs.TabsList>

        <Tabs.TabsContent value="overview" className="mt-3">
          <OverviewTab
            selectedProvider={selectedProvider}
            selectedRegion={selectedRegion}
            selectedSize={selectedSize}
            currentDialogOption={currentDialogOption}
          />
        </Tabs.TabsContent>

        <Tabs.TabsContent value="risk" scrollable className="mt-3">
          <MetricsTab
            selectedProvider={selectedProvider}
            selectedRegion={selectedRegion}
          />
        </Tabs.TabsContent>

        <Tabs.TabsContent value="infrastructure" scrollable className="mt-3">
          <InfrastructureTab selectedProvider={selectedProvider} />
        </Tabs.TabsContent>
      </Tabs.Tabs>
    </div>
  );
};
