'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '@/lib/style';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'bg-bg-surface/50 border-border/20 inline-flex h-9 items-center justify-center rounded-lg border p-1',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'text-fg-soft hover:text-fg-main focus-visible:ring-ui-active data-[state=active]:bg-ui-active-soft data-[state=active]:border-ui-active-soft focus-visible:ring-offset-bg-surface inline-flex items-center justify-center rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-white',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

type TabsContentProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
> & {
  /**
   * When true, the tabpanel itself is the scrollport (WAI-ARIA: one focusable
   * panel; arrow keys stay on the tablist via Radix).
   */
  scrollable?: boolean;
};

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, scrollable = false, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    // Active tabpanels are in the page tab order so Tab moves
    // tablist → panel → next control (APG Tabs pattern).
    tabIndex={0}
    className={cn(
      'focus-visible:ring-ui-active-soft mt-2 flex min-h-0 min-w-0 flex-1 flex-col rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none data-[state=inactive]:hidden',
      scrollable
        ? 'overflow-x-hidden overflow-y-auto overscroll-contain pr-3'
        : 'overflow-hidden',
      className
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.Content>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
