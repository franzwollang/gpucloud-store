'use client';

import { useEffect, useId, useRef, useState } from 'react';

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
};

/**
 * React adaptation of Inspira UI MorphingText
 * https://inspira-ui.com/docs/components/text-animations/morphing-text
 * https://github.com/unovue/inspira-ui/blob/main/components/content/inspira/ui/morphing-text/MorphingText.vue
 *
 * We keep a single requestAnimationFrame loop and imperatively update
 * blur + opacity on two spans so the outgoing and incoming text
 * morph together.
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
  rgbScale = 0.5
}: MorphingTextProps) => {
  const span1Ref = useRef<HTMLSpanElement | null>(null);
  const span2Ref = useRef<HTMLSpanElement | null>(null);

  const fromTextRef = useRef(text);
  const toTextRef = useRef<string | null>(null);

  const morphRef = useRef(0); // seconds progressed in current morph
  const isMorphingRef = useRef(false);
  const lastTimeRef = useRef<number | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterStrength, setFilterStrength] = useState(0);
  const filterStrengthRef = useRef(0);
  const filterFadeActiveRef = useRef(false);
  const filterFadeElapsedRef = useRef(0);

  // Initialise spans with the first text ONCE, based on fromTextRef,
  // so later text changes are picked up only by the morph effect.
  useEffect(() => {
    const span1 = span1Ref.current;
    const span2 = span2Ref.current;
    if (!span1 || !span2) return;

    const initial = fromTextRef.current;
    span1.textContent = initial;
    span1.style.opacity = '100%';
    span1.style.filter = 'none';

    span2.textContent = '';
    span2.style.opacity = '0%';
    span2.style.filter = 'none';
  }, []);

  // Trigger a new morph when the text prop changes
  useEffect(() => {
    if (text === fromTextRef.current) {
      return;
    }

    const span1 = span1Ref.current;
    const span2 = span2Ref.current;
    if (!span1 || !span2) return;

    // Current visible text becomes the "from"
    fromTextRef.current = span1.textContent || fromTextRef.current;
    toTextRef.current = text;

    span1.textContent = fromTextRef.current;
    span2.textContent = toTextRef.current ?? '';

    morphRef.current = 0;
    isMorphingRef.current = true;
    filterFadeActiveRef.current = false;
    filterFadeElapsedRef.current = 0;
    filterStrengthRef.current = 1;
    setFilterStrength(1);
    setIsFiltering(true);
    lastTimeRef.current = performance.now();
  }, [text]);

  // Animation loop – mirrors the structure of the Vue implementation
  useEffect(() => {
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
      frameIdRef.current = requestAnimationFrame(animate);

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
          setFilterStrength(1);

          return;
        }

        setStyles(fraction);
      }

      if (filterFadeActiveRef.current) {
        const fadeDuration = morphTime * 0.5;
        filterFadeElapsedRef.current += dt;
        const fadeProgress = Math.min(filterFadeElapsedRef.current / fadeDuration, 1);
        const nextStrength = 1 - fadeProgress;
        filterStrengthRef.current = nextStrength;
        setFilterStrength(nextStrength);

        if (fadeProgress >= 1) {
          filterFadeActiveRef.current = false;
          filterStrengthRef.current = 0;
          setFilterStrength(0);
          setIsFiltering(false);
        }
      }
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [morphTime, blurConstant]);

  const filterId = useId();

  return (
    <div
      className={cn('relative block w-full', className)}
      style={
        isFiltering
          ? {
              filter: `url(#${filterId}) blur(${Math.max(
                filterBlur * filterStrength,
                0
              )}px)`
            }
          : undefined
      }
    >
      <span ref={span1Ref} className={cn('block w-full', textClassName)}>
        {fromTextRef.current}
      </span>
      <span
        ref={span2Ref}
        className={cn('absolute inset-0 block w-full', textClassName)}
        aria-hidden="true"
      />

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
    </div>
  );
};
