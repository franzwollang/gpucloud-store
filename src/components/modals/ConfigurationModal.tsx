'use client';

import React, {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent
} from 'react';
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
  /** When true, keyboard focus is trapped in the active tabpanel (Enter-to-enter). */
  panelActive: boolean;
  onPanelActiveChange: (active: boolean) => void;
}

const getTabTriggers = (list: HTMLElement | null) => {
  if (!list) return [] as HTMLElement[];
  return Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
};

const getActivePanel = (root: HTMLElement | null) =>
  root?.querySelector<HTMLElement>('[role="tabpanel"][data-state="active"]') ??
  null;

const getPanelFocusables = (panel: HTMLElement) => {
  const candidates = Array.from(
    panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => !el.hasAttribute('disabled'));

  // Panel itself is the activation landing target; include it once at the front.
  return [panel, ...candidates.filter(el => el !== panel)];
};

export const ConfigurationContent: React.FC<ConfigurationContentProps> = ({
  currentDialogOption,
  selectedProvider,
  selectedSize,
  selectedRegion,
  onSelectionChange,
  panelActive,
  onPanelActiveChange
}) => {
  const t = useAppTranslations('TEST.gpuModal');
  const tabsRootRef = useRef<HTMLDivElement | null>(null);
  const tabsListRef = useRef<HTMLDivElement | null>(null);

  const focusActiveTab = () => {
    const tab =
      tabsListRef.current?.querySelector<HTMLElement>(
        '[role="tab"][data-state="active"]'
      ) ?? getTabTriggers(tabsListRef.current)[0];
    tab?.focus({ preventScroll: true });
  };

  // Enter-to-enter: land focus on the active panel when activation flips on.
  useEffect(() => {
    if (!panelActive) return;
    requestAnimationFrame(() => {
      getActivePanel(tabsRootRef.current)?.focus({ preventScroll: true });
    });
  }, [panelActive]);

  // Click outside the panel exits activation (same idea as template cards).
  useEffect(() => {
    if (!panelActive) return;

    const onPointerDown = (event: PointerEvent) => {
      const panel = getActivePanel(tabsRootRef.current);
      const target = event.target as Node | null;
      if (!panel || !target) return;
      if (panel.contains(target)) return;
      onPanelActiveChange(false);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, true);
  }, [panelActive, onPanelActiveChange]);

  const handleTabsListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (panelActive) return;

    const target = event.target as HTMLElement | null;
    if (!target || target.getAttribute('role') !== 'tab') return;

    const tabs = getTabTriggers(event.currentTarget);
    const index = tabs.indexOf(target);
    if (index < 0) return;

    // Enter/Space: enter the active panel (tab is already selected via Radix).
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onPanelActiveChange(true);
      return;
    }

    // Tab walks sibling tabs; edges fall through to Change Selection / footer.
    if (event.key === 'Tab') {
      const next = event.shiftKey ? index - 1 : index + 1;
      if (next >= 0 && next < tabs.length) {
        event.preventDefault();
        event.stopPropagation();
        tabs[next]?.focus({ preventScroll: true });
      }
    }
  };

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!panelActive) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onPanelActiveChange(false);
      focusActiveTab();
      return;
    }

    const panel = event.currentTarget;
    const focusables = getPanelFocusables(panel);
    const activeEl = document.activeElement as HTMLElement | null;
    const actionIndex = activeEl ? focusables.indexOf(activeEl) : -1;

    if (event.key === 'Tab' && focusables.length > 0) {
      event.preventDefault();
      event.stopPropagation();
      if (actionIndex < 0) {
        focusables[0]?.focus({ preventScroll: true });
        return;
      }
      const next = event.shiftKey
        ? (actionIndex - 1 + focusables.length) % focusables.length
        : (actionIndex + 1) % focusables.length;
      focusables[next]?.focus({ preventScroll: true });
      return;
    }

    if (
      (event.key === 'ArrowRight' || event.key === 'ArrowDown') &&
      focusables.length > 1
    ) {
      event.preventDefault();
      const from = actionIndex < 0 ? 0 : actionIndex;
      focusables[(from + 1) % focusables.length]?.focus({ preventScroll: true });
      return;
    }

    if (
      (event.key === 'ArrowLeft' || event.key === 'ArrowUp') &&
      focusables.length > 1
    ) {
      event.preventDefault();
      const from = actionIndex < 0 ? 0 : actionIndex;
      focusables[(from - 1 + focusables.length) % focusables.length]?.focus({
        preventScroll: true
      });
    }
  };

  const panelTabIndex = panelActive ? 0 : -1;

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
        Review-tabs keyboard model (like template cards):
        - Tab / Shift+Tab walk the tab triggers; arrows still switch via Radix
        - Enter / Space enter the active panel (focus trap until Esc / click-out)
        - Esc returns focus to the active tab (dialog close handled by parent)
      */}
      <div
        ref={tabsRootRef}
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        data-config-panel-active={panelActive ? 'true' : undefined}
      >
        <Tabs.Tabs
          defaultValue="overview"
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          onValueChange={() => {
            if (panelActive) onPanelActiveChange(false);
          }}
        >
          <Tabs.TabsList
            ref={tabsListRef}
            className="grid h-8 w-full shrink-0 grid-cols-3"
            onKeyDown={handleTabsListKeyDown}
          >
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

          <Tabs.TabsContent
            value="overview"
            tabIndex={panelTabIndex}
            className="mt-3"
            onKeyDown={handlePanelKeyDown}
          >
            <OverviewTab
              selectedProvider={selectedProvider}
              selectedRegion={selectedRegion}
              selectedSize={selectedSize}
              currentDialogOption={currentDialogOption}
            />
          </Tabs.TabsContent>

          <Tabs.TabsContent
            value="risk"
            scrollable
            tabIndex={panelTabIndex}
            className="mt-3"
            onKeyDown={handlePanelKeyDown}
          >
            <MetricsTab
              selectedProvider={selectedProvider}
              selectedRegion={selectedRegion}
            />
          </Tabs.TabsContent>

          <Tabs.TabsContent
            value="infrastructure"
            scrollable
            tabIndex={panelTabIndex}
            className="mt-3"
            onKeyDown={handlePanelKeyDown}
          >
            <InfrastructureTab selectedProvider={selectedProvider} />
          </Tabs.TabsContent>
        </Tabs.Tabs>
      </div>
    </div>
  );
};
