/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

'use client';

import { animate, motion, useMotionTemplate, useMotionValue } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { CanvasRevealEffect } from '@/components/ui/canvas-reveal-effect';
import { useEffectOverride } from '@/lib/animation/useEffectOverride';
import { cn } from '@/lib/style';

type SpotlightMode = 'cursor' | 'fixed';

type SpotlightPosition = {
  x: string;
  y: string;
};

type SpotlightStart = {
  xPercent: number;
  yPercent: number;
};

// Idle grid stays heavily occluded (near the canvas wash strength) so the
// dotted field reads as atmosphere until the spotlight reveals it.
const IDLE_GRID_OPACITY = 0.22;
const HOVER_GRID_OPACITY = 0.72;
const IDLE_BEAM_OPACITY = 0.62;

export const SpotlightArea = ({
  children,
  radius = 350,
  color = 'rgba(0,0,0,1)',
  className,
  spotlightMode = 'cursor',
  spotlightPosition = { x: '50%', y: '50%' },
  initialSpotlightPosition = { xPercent: 0.5, yPercent: 0.5 },
  revealOnHover = true,
  active = true,
  ...props
}: {
  radius?: number;
  color?: string;
  children: React.ReactNode;
  spotlightMode?: SpotlightMode;
  spotlightPosition?: SpotlightPosition;
  initialSpotlightPosition?: SpotlightStart;
  revealOnHover?: boolean;
  /** Pause R3F canvas work when the section is off-screen. */
  active?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const spotlightEnabled = useEffectOverride('spotlight');
  const canvasActive = spotlightEnabled && active;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const beamRadius = useMotionValue(radius);
  const idleBeamOpacity = revealOnHover ? IDLE_BEAM_OPACITY : 1;
  const beamOpacity = useMotionValue(idleBeamOpacity);
  const gridOpacity = useMotionValue(
    revealOnHover ? IDLE_GRID_OPACITY : 0.55
  );
  const radiusAnimRef = useRef<any>(null);
  const opacityAnimRef = useRef<any>(null);
  const gridAnimRef = useRef<any>(null);
  const isCursorMode = spotlightMode === 'cursor';

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY
  }: ReactMouseEvent<HTMLDivElement>) {
    if (!isCursorMode) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const [isHovering, setIsHovering] = useState(false);
  const handleMouseEnter = () => {
    if (revealOnHover) setIsHovering(true);
  };
  const handleMouseLeave = () => {
    if (revealOnHover) setIsHovering(false);
  };

  const beamMask = useMotionTemplate`
            radial-gradient(
              ${beamRadius}px circle at ${mouseX}px ${mouseY}px,
              transparent 0%,
              transparent 55%,
              white 100%
            )
          `;

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const { width, height } = node.getBoundingClientRect();

    const resolvePos = (raw: string, size: number, fallback: number) => {
      const value = raw.trim();
      if (value.endsWith('%')) {
        const pct = Number.parseFloat(value.slice(0, -1));
        return Number.isFinite(pct) ? (pct / 100) * size : fallback;
      }
      if (value.endsWith('px')) {
        const px = Number.parseFloat(value.slice(0, -2));
        return Number.isFinite(px) ? px : fallback;
      }
      const num = Number.parseFloat(value);
      return Number.isFinite(num) ? num : fallback;
    };

    if (isCursorMode) {
      mouseX.set(width * initialSpotlightPosition.xPercent);
      mouseY.set(height * initialSpotlightPosition.yPercent);
    } else {
      mouseX.set(resolvePos(spotlightPosition.x, width, width / 2));
      mouseY.set(resolvePos(spotlightPosition.y, height, height / 2));
    }
  }, [
    isCursorMode,
    initialSpotlightPosition.xPercent,
    initialSpotlightPosition.yPercent,
    spotlightPosition.x,
    spotlightPosition.y,
    mouseX,
    mouseY
  ]);

  useEffect(() => {
    if (!revealOnHover) return;
    const fullRadius = radius * 2.2;
    const focusedRadius = radius * 0.6;

    // Cancel any in-flight animations so we can smoothly retarget from the
    // current in-between state (prevents hover hysteresis).
    radiusAnimRef.current?.stop?.();
    opacityAnimRef.current?.stop?.();
    gridAnimRef.current?.stop?.();

    if (isHovering) {
      opacityAnimRef.current = animate(beamOpacity, 1, {
        duration: 0.12,
        ease: 'linear'
      });
      radiusAnimRef.current = animate(beamRadius, focusedRadius, {
        duration: 0.35,
        ease: 'easeOut'
      });
      gridAnimRef.current = animate(gridOpacity, HOVER_GRID_OPACITY, {
        duration: 0.35,
        ease: 'easeOut'
      });
    } else {
      radiusAnimRef.current = animate(beamRadius, fullRadius, {
        duration: 1.3,
        ease: 'linear'
      });
      // Retain residual occlusion so the idle grid matches the wash darkness
      // instead of fully exposing the bright dot field.
      opacityAnimRef.current = animate(beamOpacity, idleBeamOpacity, {
        duration: 0.8,
        delay: 0.12,
        ease: 'linear'
      });
      gridAnimRef.current = animate(gridOpacity, IDLE_GRID_OPACITY, {
        duration: 0.7,
        ease: 'linear'
      });
    }
  }, [
    beamOpacity,
    beamRadius,
    gridOpacity,
    idleBeamOpacity,
    isHovering,
    radius,
    revealOnHover
  ]);

  return (
    <div
      ref={containerRef}
      data-perf-lab="spotlight-area"
      className={cn(
        'group/spotlight relative isolate overflow-hidden',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {spotlightEnabled ? (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
            style={{ opacity: gridOpacity }}
          >
            <CanvasRevealEffect
              animationSpeed={5}
              containerClassName="bg-transparent absolute inset-0 pointer-events-none"
              colors={[
                [91, 231, 255],
                [244, 114, 255]
              ]}
              dotSize={3}
              active={canvasActive}
            />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
            style={{
              backgroundColor: color,
              maskImage: beamMask,
              WebkitMaskImage: beamMask,
              opacity: revealOnHover ? beamOpacity : 1
            }}
          />
        </>
      ) : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
