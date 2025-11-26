'use client';

import { motion } from 'motion/react';

import { Card, CardContent } from '@/components/ui/card';
import {
  lampFlickerAnimation,
  lampFlickerTransition,
  useLampFlickerControls
} from '@/components/ui/streetlamp';

type FlickeringCardProps = {
  label: string;
  title: string;
  description: string;
  index?: number;
};

export const FlickeringCard = ({
  title,
  description,
  label,
  index = 0
}: FlickeringCardProps) => {
  const sharedOpacity = useLampFlickerControls();

  return (
    <div className="relative z-10 w-[260px]">
      {/* Top yellow rim-light */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 -top-px z-20 h-1 rounded-t-xl"
        style={{
          background: `linear-gradient(to bottom, color-mix(in srgb, var(--color-lamp-glow) 40%, transparent), transparent)`,
          ...(sharedOpacity ? { opacity: sharedOpacity } : undefined)
        }}
        animate={sharedOpacity ? undefined : lampFlickerAnimation}
        transition={sharedOpacity ? undefined : lampFlickerTransition}
      />

      {/* Bottom cool rim-light */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-px z-20 h-1 rounded-b-xl bg-linear-to-t from-blue-400/20 to-transparent" />

      {/* Left side yellow rim-light */}
      {index === 2 && (
        <motion.div
          className="pointer-events-none absolute inset-y-0 -left-px z-20 w-1 rounded-l-xl"
          style={{
            background: `linear-gradient(to right, color-mix(in srgb, var(--color-lamp-glow) 40%, transparent), transparent)`,
            ...(sharedOpacity ? { opacity: sharedOpacity } : undefined)
          }}
          animate={sharedOpacity ? undefined : lampFlickerAnimation}
          transition={sharedOpacity ? undefined : lampFlickerTransition}
        />
      )}

      {/* Right side yellow rim-light */}
      {index === 0 && (
        <motion.div
          className="pointer-events-none absolute inset-y-0 -right-px z-20 w-1 rounded-r-xl"
          style={{
            background: `linear-gradient(to left, color-mix(in srgb, var(--color-lamp-glow) 40%, transparent), transparent)`,
            ...(sharedOpacity ? { opacity: sharedOpacity } : undefined)
          }}
          animate={sharedOpacity ? undefined : lampFlickerAnimation}
          transition={sharedOpacity ? undefined : lampFlickerTransition}
        />
      )}

      {/* Card highlights */}
      {index === 0 && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-15 rounded-sm"
          style={{
            background: `radial-gradient(circle at 100% 0%, color-mix(in srgb, #ff8c00 12%, transparent) 0%, transparent 60%)`,
            ...(sharedOpacity ? { opacity: sharedOpacity } : undefined)
          }}
          animate={sharedOpacity ? undefined : lampFlickerAnimation}
          transition={sharedOpacity ? undefined : lampFlickerTransition}
        />
      )}
      {index === 2 && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-15 rounded-sm"
          style={{
            background: `radial-gradient(circle at 0% 0%, color-mix(in srgb, #ff8c00 15%, transparent) 0%, transparent 60%)`,
            ...(sharedOpacity ? { opacity: sharedOpacity } : undefined)
          }}
          animate={sharedOpacity ? undefined : lampFlickerAnimation}
          transition={sharedOpacity ? undefined : lampFlickerTransition}
        />
      )}

      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          boxShadow:
            '0 -16px 28px color-mix(in srgb, var(--color-lamp-glow) 40%, transparent), 12px 0 28px color-mix(in srgb, var(--color-lamp-glow) 40%, transparent), -12px 0 28px color-mix(in srgb, var(--color-lamp-glow) 40%, transparent)',
          ...(sharedOpacity ? { opacity: sharedOpacity } : undefined)
        }}
        animate={sharedOpacity ? undefined : lampFlickerAnimation}
        transition={sharedOpacity ? undefined : lampFlickerTransition}
      />
      <Card className="bg-card text-card-foreground border-border/60 relative flex h-[180px] w-full flex-col overflow-clip border p-px">
        <div className="bg-card flex h-full flex-col rounded-[calc(var(--radius-sm)-1px)] p-4">
          <CardContent className="flex h-full flex-col justify-between gap-3 p-0">
            <div className="space-y-1.5">
              <p className="text-ui-active-faint text-xs font-medium tracking-[0.22em] uppercase">
                {label}
              </p>
              <div className="text-fg-main text-base font-semibold">
                {title}
              </div>
            </div>
            <p className="text-fg-soft text-sm leading-relaxed">
              {description}
            </p>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};
