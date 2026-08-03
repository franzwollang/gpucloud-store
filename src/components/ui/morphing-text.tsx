'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { useEffectOverride } from '@/lib/animation/useEffectOverride';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/lib/style';

export type MorphingTextProps = {
  text: string;
  className?: string;
  textClassName?: string;
  morphTime?: number;
  blurConstant?: number;
  filterBlur?: number;
  thresholdB?: number;
  thresholdA?: number;
  /**
   * RGB multiplier (0-1) to counteract brightness boost from alpha thresholding.
   * Lower values darken the text during morph. Default 0.7 provides a good balance.
   */
  rgbScale?: number;
  /**
   * When false, text snaps with no morph/RAF (section off-screen or override).
   */
  enabled?: boolean;
};

/**
 * React adaptation of Inspira UI MorphingText
 * https://inspira-ui.com/docs/components/text-animations/morphing-text
 * https://github.com/unovue/inspira-ui/blob/main/components/content/inspira/ui/morphing-text/MorphingText.vue
 *
 * RAF runs only while a morph or filter fade is active (M3.1: no idle RAF).
 * Filter strength is written to the DOM during the fade — no per-frame setState.
 *
 * Layout uses a single grid cell with invisible from/to sizers so the box is
 * always max(from, to). That prevents mid-morph wrap jank when the outgoing
 * string is narrower (e.g. "Balanced" → "Cost-Optimized").
 */
export const MorphingText = ({
  text,
  className,
  textClassName,
  morphTime = 0.8,
  blurConstant = 10,
  filterBlur = 0.4,
  thresholdB = -55,
  thresholdA = 255,
  rgbScale = 0.5,
  enabled = true
}: MorphingTextProps) => {
  const morphOverride = useEffectOverride('carouselMorphs');
  const { scrollPaused } = useUIStore(({ visibilities }) => ({
    scrollPaused: visibilities.scrollPaused
  }));
  const morphEnabled = morphOverride && enabled && !scrollPaused;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const span1Ref = useRef<HTMLSpanElement | null>(null);
  const span2Ref = useRef<HTMLSpanElement | null>(null);

  const fromTextRef = useRef(text);
  const toTextRef = useRef<string | null>(null);

  const morphRef = useRef(0); // seconds progressed in current morph
  const isMorphingRef = useRef(false);
  const lastTimeRef = useRef<number | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const kickLoopRef = useRef<() => void>(() => {});
  const [isFiltering, setIsFiltering] = useState(false);
  const [layoutFrom, setLayoutFrom] = useState(text);
  const [layoutTo, setLayoutTo] = useState<string | null>(null);
  const filterStrengthRef = useRef(0);
  const filterFadeActiveRef = useRef(false);
  const filterFadeElapsedRef = useRef(0);
  const filterId = useId();
  const filterBlurRef = useRef(filterBlur);
  filterBlurRef.current = filterBlur;

  const applyRootFilter = (strength: number) => {
    const root = rootRef.current;
    if (!root) return;
    if (strength <= 0) {
      root.style.filter = '';
      return;
    }
    root.style.filter = `url(#${filterId}) blur(${Math.max(
      filterBlurRef.current * strength,
      0
    )}px)`;
  };

  // Keep visible spans in sync with layout targets (DOM-owned during morph).
  useLayoutEffect(() => {
    const span1 = span1Ref.current;
    const span2 = span2Ref.current;
    if (!span1 || !span2) return;

    if (layoutTo != null) {
      span1.textContent = layoutFrom;
      span2.textContent = layoutTo;
      return;
    }

    span1.textContent = layoutFrom;
    span1.style.opacity = '100%';
    span1.style.filter = 'none';
    span2.textContent = '';
    span2.style.opacity = '0%';
    span2.style.filter = 'none';
  }, [layoutFrom, layoutTo]);

  // Trigger a new morph when the text prop changes
  useEffect(() => {
    if (text === fromTextRef.current && toTextRef.current == null) {
      return;
    }
    // Same target already in flight.
    if (text === toTextRef.current) {
      return;
    }

    const span1 = span1Ref.current;
    if (!span1) return;

    // M3.0 override: skip morph work and snap text immediately.
    if (!morphEnabled) {
      fromTextRef.current = text;
      toTextRef.current = null;
      isMorphingRef.current = false;
      filterFadeActiveRef.current = false;
      filterStrengthRef.current = 0;
      setLayoutFrom(text);
      setLayoutTo(null);
      setIsFiltering(false);
      applyRootFilter(0);
      return;
    }

    // If a morph is already running, continue from its target (not the outgoing glyph).
    fromTextRef.current =
      (isMorphingRef.current && toTextRef.current) ||
      span1.textContent ||
      fromTextRef.current;
    toTextRef.current = text;
    setLayoutFrom(fromTextRef.current);
    setLayoutTo(text);

    morphRef.current = 0;
    isMorphingRef.current = true;
    filterFadeActiveRef.current = false;
    filterFadeElapsedRef.current = 0;
    filterStrengthRef.current = 1;
    setIsFiltering(true);
    applyRootFilter(1);
    lastTimeRef.current = performance.now();
    kickLoopRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to text/enablement; layout is derived
  }, [text, morphEnabled, filterId]);

  // Animation loop — scheduled only while morphing or filter-fading.
  useEffect(() => {
    if (!morphEnabled) {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
      kickLoopRef.current = () => {};
      return;
    }

    const span1 = span1Ref.current;
    const span2 = span2Ref.current;

    if (!span1 || !span2) return;

    const setStyles = (fraction: number) => {
      const clamped = Math.min(Math.max(fraction, 0), 1);
      const inverted = 1 - clamped;

      const inBlur =
        clamped === 0
          ? blurConstant * 2
          : Math.min(blurConstant / clamped - blurConstant, blurConstant * 2);
      const inOpacity = Math.pow(clamped, 0.4) * 100;

      const outBlur =
        inverted === 0
          ? blurConstant * 2
          : Math.min(blurConstant / inverted - blurConstant, blurConstant * 2);
      const outOpacity = Math.pow(inverted, 0.4) * 100;

      span2.style.filter = `blur(${inBlur}px)`;
      span2.style.opacity = `${inOpacity}%`;

      span1.style.filter = `blur(${outBlur}px)`;
      span1.style.opacity = `${outOpacity}%`;
    };

    const animate = (now: number) => {
      frameIdRef.current = null;

      if (!isMorphingRef.current && !filterFadeActiveRef.current) {
        return;
      }

      lastTimeRef.current ??= now;

      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isMorphingRef.current) {
        morphRef.current += dt;
        const fraction = morphRef.current / morphTime;

        if (fraction >= 1) {
          // End of morph: show only the new text
          isMorphingRef.current = false;
          morphRef.current = 0;

          if (toTextRef.current != null) {
            fromTextRef.current = toTextRef.current;
          }
          toTextRef.current = null;
          setLayoutFrom(fromTextRef.current);
          setLayoutTo(null);

          span1.textContent = fromTextRef.current;
          span1.style.filter = 'none';
          span1.style.opacity = '100%';

          span2.textContent = '';
          span2.style.filter = 'none';
          span2.style.opacity = '0%';

          // Begin a short falloff for the outer blur filter so we do not
          // abruptly snap from gooey blur to crisp text (avoids flicker).
          filterFadeActiveRef.current = true;
          filterFadeElapsedRef.current = 0;
          filterStrengthRef.current = 1;
          applyRootFilter(1);
        } else {
          setStyles(fraction);
        }
      }

      if (filterFadeActiveRef.current) {
        const fadeDuration = morphTime * 0.5;
        filterFadeElapsedRef.current += dt;
        const fadeProgress = Math.min(
          filterFadeElapsedRef.current / fadeDuration,
          1
        );
        const nextStrength = 1 - fadeProgress;
        filterStrengthRef.current = nextStrength;
        applyRootFilter(nextStrength);

        if (fadeProgress >= 1) {
          filterFadeActiveRef.current = false;
          filterStrengthRef.current = 0;
          applyRootFilter(0);
          setIsFiltering(false);
        }
      }

      if (isMorphingRef.current || filterFadeActiveRef.current) {
        frameIdRef.current = requestAnimationFrame(animate);
      }
    };

    kickLoopRef.current = () => {
      if (frameIdRef.current != null) return;
      if (!isMorphingRef.current && !filterFadeActiveRef.current) return;
      lastTimeRef.current = performance.now();
      frameIdRef.current = requestAnimationFrame(animate);
    };

    // Resume if a morph was already in flight when this effect remounted.
    kickLoopRef.current();

    return () => {
      kickLoopRef.current = () => {};
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [morphTime, blurConstant, morphEnabled, filterId]);

  return (
    <div ref={rootRef} className={cn('relative grid w-full', className)}>
      {/* Invisible sizers: cell grows to max(from, to) so incoming text never
          wraps inside a too-narrow outgoing box mid-morph. */}
      <span
        aria-hidden="true"
        className={cn('invisible col-start-1 row-start-1', textClassName)}
      >
        {layoutFrom}
      </span>
      {layoutTo != null && layoutTo !== layoutFrom ? (
        <span
          aria-hidden="true"
          className={cn('invisible col-start-1 row-start-1', textClassName)}
        >
          {layoutTo}
        </span>
      ) : null}

      <span
        ref={span1Ref}
        className={cn('col-start-1 row-start-1', textClassName)}
      />
      <span
        ref={span2Ref}
        className={cn('col-start-1 row-start-1', textClassName)}
        aria-hidden="true"
      />

      {isFiltering ? (
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <filter id={filterId}>
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values={`${rgbScale} 0 0 0 0
                      0 ${rgbScale} 0 0 0
                      0 0 ${rgbScale} 0 0
                      0 0 0 ${thresholdA} ${thresholdB}`}
              />
            </filter>
          </defs>
        </svg>
      ) : null}
    </div>
  );
};
