import React from 'react';

import type { Provider } from '@/types/gpu';

import * as Tabs from '../ui/tabs';
import { InfrastructureTab } from '../tabs/InfrastructureTab';
import { MetricsTab } from '../tabs/MetricsTab';
import { OverviewTab } from '../tabs/OverviewTab';

interface ConfigurationModalProps {
  selectedProvider: Provider;
  selectedSize: number;
  selectedRegion: string;
  onAddToCart: (item: {
    type: string;
    provider: Provider;
    size: number;
  }) => void;
  onClose: () => void;
  onSelectionChange: () => void;
  currentDialogOption: {
    type: string;
  };
}

export const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  selectedProvider,
  selectedSize,
  selectedRegion,
  onAddToCart,
  onClose,
  onSelectionChange,
  currentDialogOption
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-fg-muted/70 text-xs tracking-wide uppercase">
          Configuration Details
        </div>
        <button
          onClick={onSelectionChange}
          className="text-fg-soft hover:text-fg-main text-xs underline"
        >
          Change Selection
        </button>
      </div>

      <Tabs.Tabs defaultValue="overview" className="w-full">
        <Tabs.TabsList className="grid w-full grid-cols-3">
          <Tabs.TabsTrigger value="overview">Overview</Tabs.TabsTrigger>
          <Tabs.TabsTrigger value="risk">Risk & Performance</Tabs.TabsTrigger>
          <Tabs.TabsTrigger value="infrastructure">
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
