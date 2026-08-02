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
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="text-fg-muted/70 text-xs tracking-wide uppercase">
          {t('configurationDetails')('Configuration Details')()}
        </div>
        <button
          type="button"
          onClick={onSelectionChange}
          className="text-fg-soft hover:text-fg-main focus:ring-ring rounded text-xs underline focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          {t('changeSelection')('Change Selection')()}
        </button>
      </div>

      <Tabs.Tabs
        defaultValue="overview"
        className="flex min-h-0 min-w-0 flex-1 flex-col"
      >
        <Tabs.TabsList
          className="grid w-full shrink-0 grid-cols-3"
          onFocus={event => {
            if (event.target !== event.currentTarget) return;
            const activeTab = event.currentTarget.querySelector<HTMLElement>(
              '[role="tab"][data-state="active"]'
            );
            activeTab?.focus();
          }}
        >
          <Tabs.TabsTrigger
            value="overview"
            onMouseEnter={e => (e.currentTarget as HTMLElement).focus()}
          >
            {t('tabs.overview')('Overview')()}
          </Tabs.TabsTrigger>
          <Tabs.TabsTrigger
            value="risk"
            onMouseEnter={e => (e.currentTarget as HTMLElement).focus()}
          >
            {t('tabs.risk')('Risk & Performance')()}
          </Tabs.TabsTrigger>
          <Tabs.TabsTrigger
            value="infrastructure"
            onMouseEnter={e => (e.currentTarget as HTMLElement).focus()}
          >
            {t('tabs.infrastructure')('Infrastructure')()}
          </Tabs.TabsTrigger>
        </Tabs.TabsList>

        <Tabs.TabsContent value="overview" scrollable={false}>
          <OverviewTab
            selectedProvider={selectedProvider}
            selectedRegion={selectedRegion}
            selectedSize={selectedSize}
            currentDialogOption={currentDialogOption}
          />
        </Tabs.TabsContent>

        <Tabs.TabsContent value="risk" scrollable={true}>
          <MetricsTab
            selectedProvider={selectedProvider}
            selectedRegion={selectedRegion}
          />
        </Tabs.TabsContent>

        <Tabs.TabsContent value="infrastructure" scrollable={true}>
          <InfrastructureTab selectedProvider={selectedProvider} />
        </Tabs.TabsContent>
      </Tabs.Tabs>
    </div>
  );
};

export const handleConfigKeyDown = (
  e: React.KeyboardEvent,
  containerRef: React.RefObject<HTMLDivElement | null>
): void => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

  const tabs = containerRef.current?.querySelectorAll('[role="tab"]');
  if (!tabs?.length) return;

  const focusedTab = Array.from(tabs).find(
    tab => tab === document.activeElement
  );

  // If no tab is focused, focus the active one to avoid resetting
  if (!focusedTab) {
    const activeTab = Array.from(tabs).find(
      tab => tab.getAttribute('data-state') === 'active'
    );
    e.preventDefault();
    ((activeTab ?? tabs[0]) as HTMLElement).focus();
    return;
  }

  const currentIndex = Array.from(tabs).indexOf(focusedTab);

  let newIndex;
  if (e.key === 'ArrowLeft') {
    newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
  } else {
    newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
  }
  e.preventDefault();
  (tabs[newIndex] as HTMLElement).click();
  (tabs[newIndex] as HTMLElement).focus();
};
