import React from 'react';

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
  return (
    <div className="space-y-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-fg-muted/70 text-xs tracking-wide uppercase">
          Configuration Details
        </div>
        <button
          type="button"
          onClick={onSelectionChange}
          className="text-fg-soft hover:text-fg-main focus:ring-ring rounded text-xs underline focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          Change Selection
        </button>
      </div>

      <Tabs.Tabs defaultValue="overview" className="w-full">
        <Tabs.TabsList className="grid w-full grid-cols-3">
          <Tabs.TabsTrigger
            value="overview"
            onMouseEnter={e => (e.currentTarget as HTMLElement).focus()}
          >
            Overview
          </Tabs.TabsTrigger>
          <Tabs.TabsTrigger
            value="risk"
            onMouseEnter={e => (e.currentTarget as HTMLElement).focus()}
          >
            Risk & Performance
          </Tabs.TabsTrigger>
          <Tabs.TabsTrigger
            value="infrastructure"
            onMouseEnter={e => (e.currentTarget as HTMLElement).focus()}
          >
            Infrastructure
          </Tabs.TabsTrigger>
        </Tabs.TabsList>

        <Tabs.TabsContent
          value="overview"
          className="mt-3 h-80 overflow-y-auto"
        >
          <OverviewTab
            selectedProvider={selectedProvider}
            selectedRegion={selectedRegion}
            selectedSize={selectedSize}
            currentDialogOption={currentDialogOption}
          />
        </Tabs.TabsContent>

        <Tabs.TabsContent value="risk" className="mt-3 h-80 overflow-visible">
          <MetricsTab
            selectedProvider={selectedProvider}
            selectedRegion={selectedRegion}
          />
        </Tabs.TabsContent>

        <Tabs.TabsContent
          value="infrastructure"
          className="mt-3 h-80 overflow-y-auto"
        >
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

  // If no tab is focused, focus the first one
  if (!focusedTab) {
    e.preventDefault();
    (tabs[0] as HTMLElement).focus();
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
