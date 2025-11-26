'use client';

import {
  animate,
  motion,
  type MotionValue,
  type Transition,
  useMotionValue
} from 'motion/react';
import React, {
  type ComponentProps,
  type PropsWithChildren,
  useContext,
  useEffect,
  useId,
  useMemo
} from 'react';

import { cn } from '@/lib/style';

import { Motes } from './motes';

type StreetlampProps = {
  className?: string;
  /**
   * Total rendered height of the light beam container.
   */
  height?: number | string;
  /**
   * Width of the truncated tip expressed as a percentage of the beam width.
   */
  tipWidthPercent?: number;
  /**
   * Width of the base expressed as a percentage of the beam width.
   */
  baseWidthPercent?: number;
  /**
   * Offset that nudges the tip downward to emulate a physical lamp hood.
   */
  tipInsetPercent?: number;
  /**
   * Overlay color used to tint the beam.
   */
  glowColor?: string;
  /**
   * Whether to soften the beam edges with a radial mask.
   */
  featherEdges?: boolean;
  /**
   * Props that will be forwarded to the underlying motes layer.
   */
  motesProps?: ComponentProps<typeof Motes>;
  /**
   * Scale factor (> 1) to expand the particle clipping region relative to the beam.
   */
  clipScale?: number;
};

const clampPercent = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const clampFraction = (value: number, min = 0, max = 1.5) =>
  Math.min(Math.max(value, min), max);
const clampCoord = (value: number) => Math.min(100, Math.max(0, value));

type LampFlickerValue = MotionValue<number> | null;

const LampFlickerContext = React.createContext<LampFlickerValue>(null);

export const lampFlickerAnimation = {
  opacity: [1, 0.8, 1, 0.8, 0.3, 1]
};

export const lampFlickerTransition: Transition = {
  duration: 15,
  repeat: Infinity,
  ease: 'easeInOut',
  times: [0, 0.3, 0.6, 0.85, 0.88, 1]
};

export const LampFlickerProvider = ({ children }: PropsWithChildren) => {
  const opacity = useMotionValue(1);

  useEffect(() => {
    const controls = animate(
      opacity,
      lampFlickerAnimation.opacity,
      lampFlickerTransition
    );

    return () => {
      controls.stop();
    };
  }, [opacity]);

  return (
    <LampFlickerContext.Provider value={opacity}>
      {children}
    </LampFlickerContext.Provider>
  );
};

export const useLampFlickerControls = () => {
  return useContext(LampFlickerContext);
};

export const Streetlamp = ({
  className,
  height = 360,
  tipWidthPercent = 14,
  baseWidthPercent = 96,
  tipInsetPercent = 3,
  glowColor = 'color-mix(in srgb, var(--color-lamp-glow) 80%, transparent)',
  featherEdges = true,
  motesProps,
  clipScale = 1.08
}: StreetlampProps) => {
  const sharedOpacity = useLampFlickerControls();

  const ids = useId();
  const gradientId = `${ids}-gradient`;
  const maskId = `${ids}-mask`;
  const blurId = `${ids}-blur`;

  const { polygonPointsSvg, clipPolygonPointsCss } = useMemo(() => {
    const safeTipWidth = clampPercent(tipWidthPercent, 4, 40);
    const safeBaseWidth = clampPercent(baseWidthPercent, safeTipWidth + 5, 100);
    const tipHalf = safeTipWidth / 2;
    const baseHalf = safeBaseWidth / 2;
    const tipInset = clampPercent(tipInsetPercent, 0, 20);

    const topLeftX = 50 - tipHalf;
    const topRightX = 50 + tipHalf;
    const bottomRightX = 50 + baseHalf;
    const bottomLeftX = 50 - baseHalf;

    const formatPointCss = (x: number, y: number) => `${x}% ${y}%`;
    const polygonPointsSvg = `${topLeftX},${tipInset} ${topRightX},${tipInset} ${bottomRightX},100 ${bottomLeftX},100`;

    const scale = clampFraction(clipScale, 1.01, 1.5);
    const centerY = (tipInset + 100) / 2;
    const scaleX = (x: number) => clampCoord(50 + (x - 50) * scale);
    const scaleY = (y: number) => clampCoord(centerY + (y - centerY) * scale);

    const clipTopLeftX = scaleX(topLeftX);
    const clipTopRightX = scaleX(topRightX);
    const clipBottomRightX = scaleX(bottomRightX);
    const clipBottomLeftX = scaleX(bottomLeftX);
    const clipTopInset = scaleY(tipInset);
    const clipBottom = scaleY(100);

    const clipPolygonPointsCss = [
      formatPointCss(clipTopLeftX, clipTopInset),
      formatPointCss(clipTopRightX, clipTopInset),
      formatPointCss(clipBottomRightX, clipBottom),
      formatPointCss(clipBottomLeftX, clipBottom)
    ].join(', ');

    return {
      polygonPointsSvg,
      clipPolygonPointsCss
    };
  }, [tipWidthPercent, baseWidthPercent, tipInsetPercent, clipScale]);

  const computedHeight = typeof height === 'number' ? `${height}px` : height;

  const mergedMotesProps: ComponentProps<typeof Motes> = {
    background: 'transparent',
    attractor: {
      x: 50,
      y: 2,
      distance: 250,
      rotateX: 1500,
      rotateY: 1500
    },
    fadeBottom: true,
    ...motesProps,
    className: cn('absolute inset-0', motesProps?.className)
  };

  return (
    <div
      className={cn('relative flex w-full justify-center', className)}
      style={{ height: computedHeight }}
    >
      <div className="relative h-full w-full max-w-[80%]">
        <div className="relative h-full w-full overflow-hidden">
          <div
            className="absolute overflow-hidden"
            style={{
              inset: 0,
              clipPath: `polygon(${clipPolygonPointsCss})`,
              WebkitClipPath: `polygon(${clipPolygonPointsCss})`
            }}
          >
            <Motes {...mergedMotesProps} />
          </div>
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={gradientId} x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor={glowColor} stopOpacity={0.95} />
                <stop offset="65%" stopColor={glowColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={glowColor} stopOpacity={0} />
              </linearGradient>
              <filter id={blurId} x="-15%" y="-5%" width="130%" height="120%">
                <feGaussianBlur stdDeviation={featherEdges ? 2.8 : 0} />
              </filter>
              {/* <filter
                id={`${blurId}-grain`}
                x="0%"
                y="0%"
                width="100%"
                height="100%"
              >
                <feTurbulence
                  baseFrequency="0.8"
                  numOctaves="3"
                  stitchTiles="stitch"
                />
                <feColorMatrix type="saturate" values="0" />
                <feComponentTransfer>
                  <feFuncA
                    type="discrete"
                    tableValues="0 0.03 0.06 0.03 0 0.03"
                  />
                </feComponentTransfer>
                <feComposite operator="over" in2="SourceGraphic" />
              </filter> */}
              <mask id={maskId}>
                <polygon
                  points={polygonPointsSvg}
                  fill="white"
                  filter={featherEdges ? `url(#${blurId})` : undefined}
                />
              </mask>
            </defs>
            <motion.rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill={`url(#${gradientId})`}
              mask={`url(#${maskId})`}
              style={sharedOpacity ? { opacity: sharedOpacity } : undefined}
              animate={sharedOpacity ? undefined : lampFlickerAnimation}
              transition={sharedOpacity ? undefined : lampFlickerTransition}
            />
          </svg>
        </div>

        <motion.div
          className="pointer-events-none absolute top-0 left-1/2 h-2 w-12 -translate-x-1/2 rounded-full blur-sm"
          style={{
            background:
              'color-mix(in srgb, var(--color-lamp-core) 75%, transparent)',
            ...(sharedOpacity ? { opacity: sharedOpacity } : undefined)
          }}
          animate={sharedOpacity ? undefined : lampFlickerAnimation}
          transition={sharedOpacity ? undefined : lampFlickerTransition}
        />
        <motion.div
          className="pointer-events-none absolute top-[6px] left-1/2 h-1 w-8 -translate-x-1/2 rounded-full blur-sm"
          style={{
            background:
              'color-mix(in srgb, var(--color-lamp-core) 55%, transparent)',
            ...(sharedOpacity ? { opacity: sharedOpacity } : undefined)
          }}
          animate={sharedOpacity ? undefined : lampFlickerAnimation}
          transition={sharedOpacity ? undefined : lampFlickerTransition}
        />
      </div>
    </div>
  );
};
