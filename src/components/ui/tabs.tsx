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
      'text-fg-soft hover:text-fg-main focus:ring-ui-active data-[state=active]:bg-ui-active-soft data-[state=active]:border-ui-active-soft focus:ring-offset-bg-surface inline-flex items-center justify-center rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-white',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

type TabsContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>,
  'tabIndex'
> & {
  scrollable: boolean;
};

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, scrollable, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'focus-visible:ring-ui-active-soft mt-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none data-[state=inactive]:hidden',
      className
    )}
    // Tab panels are only focusable when they need to be scrollable.
    tabIndex={scrollable ? 0 : -1}
    {...props}
  >
    {scrollable ? (
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain pr-3">
        {children}
      </div>
    ) : (
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
        {children}
      </div>
    )}
  </TabsPrimitive.Content>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
