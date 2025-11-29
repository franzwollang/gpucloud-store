'use client';

import { motion } from 'motion/react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';

import { Card, CardContent } from '@/components/ui/card';
import {
  lampFlickerAnimation,
  lampFlickerTransition,
  useLampFlickerControls
} from '@/components/ui/streetlamp';
import { cn } from '@/lib/style';

export type FlickeringCarouselCard = {
  id: string;
  feeling: string;
  title: string;
  text: string;
};

type MorphingTextProps = {
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
const MorphingText = ({
  text,
  className,
  textClassName,
  // Slightly faster default than the original demo to keep the
  // card interactions feeling snappy. Increase if you want a
  // slower, more meditative morph.
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

      // Symmetric blur/opacity curves adapted from Inspira UI:
      // https://github.com/unovue/inspira-ui/blob/main/components/content/inspira/ui/morphing-text/MorphingText.vue
      //
      // In the original demo:
      // - Font size is large (≈ 40pt–6rem, ~50–100px)
      // - blurConstant was effectively 8, so blur radii reached into the
      //   30–100px range (often ≥ glyph height)
      // - The threshold matrix row was 0 0 0 255 -140. The key here is
      //   that A = 255 is *fixed* and only B is tuned to control how
      //   "liquidy" the overlap appears.
      //
      // Here our titles are much smaller (≈ text-sm ~14px), so we still
      // keep A = 255 in the filter and instead:
      // - set blurConstant relative to glyph height
      // - tune only the B term (0 0 0 255 B) in the SVG filter below.
      // Incoming text (span2)
      const inBlur =
        clamped === 0
          ? blurConstant * 2
          : Math.min(blurConstant / clamped - blurConstant, blurConstant * 2);
      const inOpacity = Math.pow(clamped, 0.4) * 100;

      // Outgoing text (span1)
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
        const fadeProgress = Math.min(
          filterFadeElapsedRef.current / Math.max(fadeDuration, 0.0001),
          1
        );
        const nextStrength = 1 - fadeProgress;

        if (Math.abs(filterStrengthRef.current - nextStrength) > 0.01) {
          filterStrengthRef.current = nextStrength;
          setFilterStrength(nextStrength);
        }

        if (fadeProgress >= 1) {
          filterFadeActiveRef.current = false;
          filterFadeElapsedRef.current = 0;
          filterStrengthRef.current = 0;
          setFilterStrength(0);
          setIsFiltering(false);
        }
      }
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current != null) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [morphTime, blurConstant]);

  const filterId = useId();

  return (
    <div
      className={cn(
        // Outer blur + threshold filter to get the liquid “gooey” look.
        //
        // NOTE: The feColorMatrix row (see SVG below) is tightly coupled
        // to the blurConstant and font size used above. If you change the
        // title font size or the blurConstant, you will likely need to
        // re‑tune both:
        // - the blurConstant (per‑span blur)
        // - the alpha row (0 0 0 A B) in the filter.
        //
        // Use block + w-full so the container always occupies the full
        // card width, preventing layout shifts when the outgoing text is
        // shorter than the incoming text mid-morph.
        'relative block w-full',
        className
      )}
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

      {/* Threshold filter copied from Inspira UI MorphingText */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              // Alpha row follows the same structure as the original demo:
              //   0 0 0 255 B
              // The "secret sauce" is:
              // - keep A fixed at 255
              // - start B near 0 (e.g. -10) for a very large liquid region
              // - move B further negative (-20, -40, -60, …) to progressively
              //   *tame* the liquid extent until it feels right for your
              //   font size and blurConstant. Smaller text generally needs
              //   a more negative B than the large demo text.
              //
              // The RGB rows use rgbScale (default 0.7) to counteract the
              // brightness boost that occurs when semi-transparent blur
              // fringes get their alpha boosted to fully opaque.
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

type FlickeringCardProps = {
  feeling: string;
  title: string;
  text: string;
  index?: number;
  globalIndex?: number;
  totalCards?: number;
  tabIndex?: number;
  onKeyDown?: (event: React.KeyboardEvent) => void;
};

export const FlickeringCard = forwardRef<HTMLDivElement, FlickeringCardProps>(
  (
    {
      feeling,
      title,
      text,
      index = 0,
      globalIndex = 0,
      totalCards = 0,
      tabIndex,
      onKeyDown
    },
    ref
  ) => {
    const sharedOpacity = useLampFlickerControls();

    return (
      <div
        ref={ref}
        className="focus:ring-ring focus-visible:ring-ring relative z-10 w-[290px] rounded-t-sm rounded-b-none focus:ring-6 focus:ring-offset-0 focus:outline-none focus-visible:ring-6 focus-visible:ring-offset-0 focus-visible:outline-none"
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        role="group"
        aria-label={`Card ${globalIndex + 1} of ${totalCards}`}
      >
        {/* SVG filters for shadow blur */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <filter
              id={`shadow-blur-${index}`}
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="12" />
              <feGaussianBlur stdDeviation="6" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.6" />
              </feComponentTransfer>
            </filter>
          </defs>
        </svg>

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
        <div className="pointer-events-none absolute inset-x-0 -bottom-px z-20 h-1 bg-linear-to-t from-blue-400/20 to-transparent" />

        {/* Left side yellow rim-light */}
        {(index === 1 || index === 2) && (
          <motion.div
            className="pointer-events-none absolute inset-y-0 -left-px z-20 w-1 rounded-tl-xl rounded-bl-none"
            style={{
              background: `linear-gradient(to right, color-mix(in srgb, var(--color-lamp-glow) 40%, transparent), transparent)`,
              ...(sharedOpacity ? { opacity: sharedOpacity } : undefined)
            }}
            animate={sharedOpacity ? undefined : lampFlickerAnimation}
            transition={sharedOpacity ? undefined : lampFlickerTransition}
          />
        )}

        {/* Right side yellow rim-light */}
        {(index === 0 || index === 1) && (
          <motion.div
            className="pointer-events-none absolute inset-y-0 -right-px z-20 w-1 rounded-tr-xl rounded-br-none"
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
            className="pointer-events-none absolute inset-0 z-15 rounded-t-sm rounded-b-none"
            style={{
              background: `radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--color-lamp-glow) 15%, transparent) 0%, transparent 60%)`,
              ...(sharedOpacity ? { opacity: sharedOpacity } : undefined)
            }}
            animate={sharedOpacity ? undefined : lampFlickerAnimation}
            transition={sharedOpacity ? undefined : lampFlickerTransition}
          />
        )}
        {index === 2 && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-15 rounded-t-sm rounded-b-none"
            style={{
              background: `radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--color-lamp-glow) 15%, transparent) 0%, transparent 60%)`,
              ...(sharedOpacity ? { opacity: sharedOpacity } : undefined)
            }}
            animate={sharedOpacity ? undefined : lampFlickerAnimation}
            transition={sharedOpacity ? undefined : lampFlickerTransition}
          />
        )}

        <motion.div
          className="pointer-events-none absolute inset-0 rounded-t-xl rounded-b-none"
          style={{
            boxShadow:
              '0 -16px 28px color-mix(in srgb, var(--color-lamp-glow) 40%, transparent), 12px 0 28px color-mix(in srgb, var(--color-lamp-glow) 40%, transparent), -12px 0 28px color-mix(in srgb, var(--color-lamp-glow) 40%, transparent)',
            ...(sharedOpacity ? { opacity: sharedOpacity } : undefined)
          }}
          animate={sharedOpacity ? undefined : lampFlickerAnimation}
          transition={sharedOpacity ? undefined : lampFlickerTransition}
        />
        <Card className="bg-card text-card-foreground border-border/60 relative flex h-[180px] w-full flex-col overflow-clip border p-px">
          <div className="bg-card flex h-full flex-col rounded-t-[calc(var(--radius-sm)-1px)] rounded-b-none px-4 py-3">
            <CardContent className="flex h-full flex-col p-0">
              <div className="max-h-5/12 min-h-5/12 flex-none">
                <div className="flex max-h-1/2 min-h-1/2 overflow-hidden">
                  <MorphingText
                    text={feeling}
                    textClassName="text-xs font-medium tracking-[0.15em] text-blue-200/70 uppercase"
                    blurConstant={4}
                    filterBlur={0.4}
                    thresholdB={-35}
                    rgbScale={0.4}
                  />
                </div>
                <div className="grid max-h-1/2 min-h-1/2 grid-cols-1 overflow-hidden">
                  <div className="flex-none overflow-hidden">
                    <MorphingText
                      text={title}
                      textClassName="text-fg-main text-sm leading-tight font-bold"
                      blurConstant={4}
                      filterBlur={0.4}
                      thresholdB={-90}
                      rgbScale={0.8}
                    />
                  </div>
                </div>
              </div>
              <div className="flex max-h-1/12 min-h-1/12 flex-none items-center">
                <div className="via-border/30 h-px w-full bg-linear-to-r from-transparent to-transparent" />
              </div>
              <div className="max-h-6/12 min-h-6/12 flex-none">
                <MorphingText
                  text={text}
                  textClassName="text-fg-soft text-xs leading-relaxed line-clamp-3"
                  blurConstant={6}
                  filterBlur={0.4}
                  thresholdB={-45}
                  rgbScale={0.4}
                />
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Card shadow */}
        <motion.div
          className={cn(
            'pointer-events-none absolute top-full -left-[62px] mt-2 h-12 w-[410px]',
            index === 0
              ? '-left-[86px]'
              : index === 2
                ? '-left-[38px]'
                : '-left-[62px]'
          )}
          style={{
            background: `linear-gradient(to bottom,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0.5) 30%,
            rgba(0, 0, 0, 0.2) 60%,
            transparent 100%
          )`,
            clipPath:
              index === 0
                ? `polygon(20% 0%, 90% 0%, 70% 100%, 0% 100%)`
                : index === 2
                  ? `polygon(10% 0%, 80% 0%, 95% 100%, 30% 100%)`
                  : `polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)`, // Middle card: symmetric
            filter: `url(#shadow-blur-${index})`,
            ...(sharedOpacity ? { opacity: sharedOpacity } : undefined)
          }}
          animate={sharedOpacity ? undefined : lampFlickerAnimation}
          transition={sharedOpacity ? undefined : lampFlickerTransition}
        />
      </div>
    );
  }
);

FlickeringCard.displayName = 'FlickeringCard';

type FlickeringCardsCarouselProps = {
  cards: FlickeringCarouselCard[];
};

export const FlickeringCardsCarousel = ({
  cards
}: FlickeringCardsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusedCardIndex, setFocusedCardIndex] = useState(-1);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [indicatorMode, setIndicatorMode] = useState(false);
  const [focusedIndicatorIndex, setFocusedIndicatorIndex] = useState(-1);
  const [skipButtonDirection, setSkipButtonDirection] = useState<
    'forward' | 'backward'
  >('forward');
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);
  const skipButtonRef = useRef<HTMLButtonElement | null>(null);
  // Refs for indicators (totalGroups) + exit button (last index)
  const indicatorRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  // Track Shift key state globally
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleCarouselFocus = useCallback(
    (event: React.FocusEvent) => {
      // Only handle focus if it's on a card, not on indicators or other elements
      if (!cardsContainerRef.current?.contains(event.target as Node)) {
        return;
      }

      // Detect entry direction using global shift key state
      if (focusedCardIndex === -1) {
        if (isShiftPressed) {
          // Shift+tab entry: go to last card and scroll to last group
          const lastGroupIndex = Math.floor((cards.length - 1) / 3) * 3;
          const lastCardInGroup = (cards.length - 1) % 3;
          setCurrentIndex(lastGroupIndex);
          setFocusedCardIndex(lastCardInGroup);
          // Focus happens via useEffect
        } else {
          // Tab entry: go to first card and ensure first group is visible
          setCurrentIndex(0);
          setFocusedCardIndex(0);
          // Focus happens via useEffect
        }
      }
    },
    [focusedCardIndex, cards.length, isShiftPressed]
  );

  const hasCards = cards.length > 0;

  const visibleCards = useMemo(() => {
    if (!hasCards) return [];

    const result: FlickeringCarouselCard[] = [];

    for (let i = 0; i < 3; i++) {
      const contentIndex = (currentIndex + i) % cards.length;
      result.push(cards[contentIndex]!);
    }

    return result;
  }, [cards, currentIndex, hasCards]);

  if (!hasCards) {
    return null;
  }

  const totalGroups = Math.ceil(cards.length / 3);

  // Focus the currently focused card when focusedCardIndex or currentIndex changes
  // This is the single source of truth for focus management
  useEffect(() => {
    if (focusedCardIndex >= 0 && cardRefs.current[focusedCardIndex]) {
      // Use setTimeout to ensure DOM updates (especially group changes) have completed
      setTimeout(() => {
        cardRefs.current[focusedCardIndex]?.focus();
      }, 0);
    }
  }, [focusedCardIndex, currentIndex]);

  // Auto-advance carousel every 10 seconds unless user is interacting
  useEffect(() => {
    const startAutoAdvance = () => {
      autoAdvanceRef.current = setInterval(() => {
        if (!isUserInteracting && cards.length > 3) {
          setCurrentIndex(prevIndex => (prevIndex + 3) % cards.length);
        }
      }, 10000); // 10 seconds
    };

    const stopAutoAdvance = () => {
      if (autoAdvanceRef.current) {
        clearInterval(autoAdvanceRef.current);
        autoAdvanceRef.current = null;
      }
    };

    if (!isUserInteracting && cards.length > 3) {
      startAutoAdvance();
    } else {
      stopAutoAdvance();
    }

    return stopAutoAdvance;
  }, [isUserInteracting, cards.length]);

  // Hide skip button when entering indicator mode or changing groups
  useEffect(() => {
    if (indicatorMode) {
      setShowSkipButton(false);
    }
  }, [indicatorMode]);

  // Hide skip button when group changes (programmatic focus)
  useEffect(() => {
    setShowSkipButton(false);
  }, [currentIndex]);

  // Focus management for indicator mode
  useEffect(() => {
    if (indicatorMode && focusedIndicatorIndex >= 0) {
      // Focus the specific indicator using refs
      setTimeout(() => {
        indicatorRefs.current[focusedIndicatorIndex]?.focus();
      }, 0);
    }
  }, [indicatorMode, focusedIndicatorIndex]);

  const handleCardKeyDown = useCallback(
    (slotIndex: number) => (event: React.KeyboardEvent) => {
      const globalIndex = currentIndex + slotIndex;

      if (event.key === 'Tab' && !event.shiftKey) {
        if (globalIndex < cards.length - 1) {
          event.preventDefault();
          if (slotIndex < 2) {
            // Next card in current group
            setFocusedCardIndex(slotIndex + 1);
          } else {
            // On last card of group - check if we should show skip button before advancing
            const currentGroupIndex = Math.floor(currentIndex / 3);
            if (currentGroupIndex < totalGroups - 1) {
              // Not the last group - show forward skip button and move focus to it
              setShowSkipButton(true);
              setSkipButtonDirection('forward');
              // Move focus to skip button
              setTimeout(() => skipButtonRef.current?.focus(), 0);
            } else {
              // Last group - advance to next group normally
              setCurrentIndex(currentIndex + 3);
              setFocusedCardIndex(0);
            }
          }
        }
        // If on last card, don't prevent default - let tab exit carousel
      } else if (event.key === 'Tab' && event.shiftKey) {
        if (globalIndex > 0) {
          event.preventDefault();
          if (slotIndex > 0) {
            // Previous card in current group
            setFocusedCardIndex(slotIndex - 1);
          } else {
            // On first card of group - check if we should show skip button before going back
            const currentGroupIndex = Math.floor(currentIndex / 3);
            if (currentGroupIndex > 0) {
              // Not the first group - show backward skip button and move focus to it
              setShowSkipButton(true);
              setSkipButtonDirection('backward');
              // Move focus to skip button
              setTimeout(() => skipButtonRef.current?.focus(), 0);
            } else {
              // First group - go to previous group normally
              setCurrentIndex(currentIndex - 3);
              setFocusedCardIndex(2);
            }
          }
        }
        // If on first card, don't prevent default - let shift+tab exit carousel
      }
    },
    [currentIndex, cards.length, totalGroups]
  );

  const handleCarouselBlur = useCallback((event: React.FocusEvent) => {
    // Reset to initial state when focus leaves the carousel entirely
    // This ensures re-entry works correctly
    if (!carouselRef.current?.contains(event.relatedTarget as Node)) {
      setFocusedCardIndex(-1);
      setIndicatorMode(false);
      setFocusedIndicatorIndex(-1);
      setShowSkipButton(false);
      setIsUserInteracting(false);
    }
  }, []);

  return (
    <div
      ref={carouselRef}
      className="relative -top-32 z-10 flex flex-col items-center gap-3"
      onFocus={handleCarouselFocus}
      onBlur={handleCarouselBlur}
    >
      <div
        ref={cardsContainerRef}
        className="relative flex gap-6"
        onMouseEnter={() => setIsUserInteracting(true)}
        onMouseLeave={() => setIsUserInteracting(false)}
        onFocus={() => setIsUserInteracting(true)}
        onBlur={() => setIsUserInteracting(false)}
      >
        {[0, 1, 2].map(slotIndex => {
          const card = visibleCards[slotIndex];

          return (
            <div
              key={`flicker-card-slot-${slotIndex}`}
              className="relative"
              style={{
                transform:
                  slotIndex === 0
                    ? 'perspective(1000px) rotateY(5deg)'
                    : slotIndex === 1
                      ? 'perspective(1000px) scale(0.98)'
                      : 'perspective(1000px) rotateY(-5deg)'
              }}
            >
              {card && (
                <FlickeringCard
                  index={slotIndex}
                  globalIndex={currentIndex + slotIndex}
                  totalCards={cards.length}
                  feeling={card.feeling}
                  title={card.title}
                  text={card.text}
                  tabIndex={
                    // When no card is focused (-1), first card is focusable for entry
                    // Otherwise, only the currently focused card is focusable
                    (focusedCardIndex === -1 ? 0 : focusedCardIndex) ===
                    slotIndex
                      ? 0
                      : -1
                  }
                  onKeyDown={handleCardKeyDown(slotIndex)}
                  ref={el => {
                    cardRefs.current[slotIndex] = el;
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Skip Cards Button - appears after navigating through all cards */}
      {showSkipButton && !indicatorMode && (
        <button
          ref={skipButtonRef}
          type="button"
          tabIndex={0}
          className={cn(
            'border-ring bg-bg-surface text-fg-main absolute z-40 rounded border px-3 py-2 text-sm',
            'transition-opacity duration-200',
            skipButtonDirection === 'forward'
              ? 'top-1/2 left-[calc(100%+1rem)] -translate-y-1/2' // Right of cards
              : 'top-1/2 right-[calc(100%+1rem)] -translate-y-1/2' // Left of cards
          )}
          aria-label="Skip Cards"
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              const currentGroupIndex = Math.floor(currentIndex / 3);
              setIndicatorMode(true);
              setFocusedIndicatorIndex(currentGroupIndex);
              setShowSkipButton(false);
            } else if (e.key === 'Tab') {
              if (!e.shiftKey) {
                // Forward tab: continue with normal navigation to next group
                e.preventDefault();
                setShowSkipButton(false);
                const currentGroupIndex = Math.floor(currentIndex / 3);
                if (
                  skipButtonDirection === 'forward' &&
                  currentGroupIndex < totalGroups - 1
                ) {
                  // Advance to next group
                  setCurrentIndex(currentIndex + 3);
                  setFocusedCardIndex(0);
                }
                // If last group, just hide skip button - tab will exit carousel
              } else {
                // Backward tab: continue with normal navigation to previous group
                e.preventDefault();
                setShowSkipButton(false);
                const currentGroupIndex = Math.floor(currentIndex / 3);
                if (
                  skipButtonDirection === 'backward' &&
                  currentGroupIndex > 0
                ) {
                  // Go to previous group
                  setCurrentIndex(currentIndex - 3);
                  setFocusedCardIndex(2);
                }
                // If first group, just hide skip button - shift+tab will exit carousel
              }
            } else if (e.key === 'Escape') {
              // Hide skip button and continue normal navigation
              setShowSkipButton(false);
              // Focus moves to next element naturally
            }
          }}
        >
          Skip Cards
        </button>
      )}

      {/* Indicators + Exit Button - always rendered, focusable only in indicator mode */}
      <div className="relative z-30 flex items-center justify-center gap-4 py-6">
        {/* Indicator buttons */}
        {Array.from({ length: totalGroups }).map((_, idx) => {
          const groupIndex = Math.floor(currentIndex / 3);
          const isCurrentGroup = idx === groupIndex;
          // totalItems = totalGroups indicators + 1 exit button
          const totalItems = totalGroups + 1;

          return (
            <button
              key={`flicker-group-indicator-${idx}`}
              ref={el => {
                indicatorRefs.current[idx] = el;
              }}
              type="button"
              tabIndex={indicatorMode ? 0 : -1}
              aria-label={
                indicatorMode ? `Navigate to group ${idx + 1}` : undefined
              }
              aria-hidden={!indicatorMode}
              onClick={() => {
                const newCurrentIndex = idx * 3;
                setCurrentIndex(newCurrentIndex);

                if (indicatorMode) {
                  // In indicator mode: select group and exit
                  setFocusedCardIndex(0);
                  setIndicatorMode(false);
                  setFocusedIndicatorIndex(-1);
                  setTimeout(() => cardRefs.current[0]?.focus(), 0);
                }
                // Outside indicator mode: just change group visually (mouse users)
              }}
              onKeyDown={e => {
                if (!indicatorMode) return;

                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const newCurrentIndex = idx * 3;
                  setCurrentIndex(newCurrentIndex);
                  setFocusedCardIndex(0);
                  setIndicatorMode(false);
                  setFocusedIndicatorIndex(-1);
                  setTimeout(() => cardRefs.current[0]?.focus(), 0);
                } else if (
                  e.key === 'ArrowRight' ||
                  (e.key === 'Tab' && !e.shiftKey)
                ) {
                  e.preventDefault();
                  const nextIdx = (idx + 1) % totalItems;
                  indicatorRefs.current[nextIdx]?.focus();
                } else if (
                  e.key === 'ArrowLeft' ||
                  (e.key === 'Tab' && e.shiftKey)
                ) {
                  e.preventDefault();
                  const prevIdx = (idx - 1 + totalItems) % totalItems;
                  indicatorRefs.current[prevIdx]?.focus();
                } else if (e.key === 'Escape') {
                  setIndicatorMode(false);
                  setFocusedIndicatorIndex(-1);
                  setShowSkipButton(true);
                  setTimeout(() => skipButtonRef.current?.focus(), 0);
                }
              }}
              className={cn(
                'h-3 cursor-pointer rounded-full transition-all duration-300 ease-out',
                'hover:bg-[color-mix(in_srgb,var(--color-fg-main)_70%,transparent)] hover:ring-1 hover:ring-[color-mix(in_srgb,var(--color-ring)_50%,transparent)]',
                indicatorMode &&
                  'focus:ring-ring focus:ring-offset-bg-page focus:ring-2 focus:ring-offset-2 focus:outline-none',
                isCurrentGroup
                  ? 'w-12 bg-[color-mix(in_srgb,var(--color-fg-main)_80%,transparent)]'
                  : 'w-3 bg-[color-mix(in_srgb,var(--color-fg-soft)_25%,transparent)]'
              )}
            />
          );
        })}

        {/* Exit Card Section Button - always rendered, visible only in indicator mode */}
        <button
          ref={el => {
            indicatorRefs.current[totalGroups] = el;
          }}
          type="button"
          tabIndex={indicatorMode ? 0 : -1}
          aria-hidden={!indicatorMode}
          className={cn(
            'border-ring bg-bg-surface text-fg-main absolute -top-14 left-1/2 z-40 w-36 -translate-x-1/2 rounded border px-4 py-2 text-sm',
            indicatorMode ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
          aria-label="Exit Card Section"
          onKeyDown={e => {
            if (!indicatorMode) return;

            const totalItems = totalGroups + 1;
            const exitIdx = totalGroups; // Exit button is at index totalGroups

            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIndicatorMode(false);
              setFocusedIndicatorIndex(-1);
              setShowSkipButton(false);

              // Focus appropriate card based on entry direction
              if (skipButtonDirection === 'forward') {
                // Entered from forward navigation - exit to Card 12 (last group, slot 3)
                const lastGroupIndex = Math.floor((cards.length - 1) / 3) * 3;
                const lastCardSlot = (cards.length - 1) % 3;
                setCurrentIndex(lastGroupIndex);
                setFocusedCardIndex(lastCardSlot);
                setTimeout(() => cardRefs.current[lastCardSlot]?.focus(), 0);
              } else {
                // Entered from backward navigation - exit to Card 1 (first group, slot 1)
                setCurrentIndex(0);
                setFocusedCardIndex(0);
                setTimeout(() => cardRefs.current[0]?.focus(), 0);
              }
            } else if (
              e.key === 'ArrowRight' ||
              (e.key === 'Tab' && !e.shiftKey)
            ) {
              e.preventDefault();
              const nextIdx = (exitIdx + 1) % totalItems;
              indicatorRefs.current[nextIdx]?.focus();
            } else if (
              e.key === 'ArrowLeft' ||
              (e.key === 'Tab' && e.shiftKey)
            ) {
              e.preventDefault();
              const prevIdx = (exitIdx - 1 + totalItems) % totalItems;
              indicatorRefs.current[prevIdx]?.focus();
            } else if (e.key === 'Escape') {
              setIndicatorMode(false);
              setFocusedIndicatorIndex(-1);
              setShowSkipButton(true);
              setTimeout(() => skipButtonRef.current?.focus(), 0);
            }
          }}
        >
          Exit Card Section
        </button>
      </div>
    </div>
  );
};
