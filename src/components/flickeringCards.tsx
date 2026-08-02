'use client';

import { motion } from 'motion/react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { MorphingText } from '@/components/ui/morphing-text';
import {
  lampFlickerAnimation,
  lampFlickerTransition,
  useLampFlickerControls
} from '@/components/ui/streetlamp';
import type { RawMessageType } from '@/i18n';
import { cn } from '@/lib/style';

// Derive the card type from the JSON structure to ensure they stay in sync
export type FlickeringCarouselCard =
  RawMessageType<'TEST.hero.carousel.cards'> extends (infer T)[] ? T : never;

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

        {/* Top lamp rim-light */}
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

        {/* Left side lamp rim-light */}
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

        {/* Right side lamp rim-light */}
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
                  rgbScale={0.5}
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
  /** When true, stop the 10s auto-advance interval (hero off-section / M3.1). */
  paused?: boolean;
};

export const FlickeringCardsCarousel = ({
  cards,
  paused = false
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
  const isUserInteractingRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const isInternalFocusMoveRef = useRef(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);
  const skipButtonRef = useRef<HTMLButtonElement | null>(null);
  // Refs for indicators (totalGroups) + exit button (last index)
  const indicatorRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  // Track mouse down state to distinguish clicks from keyboard navigation
  useEffect(() => {
    const handleMouseDown = () => {
      isMouseDownRef.current = true;
    };

    const handleMouseUp = () => {
      // Clear after a short delay to ensure focus handler runs first
      setTimeout(() => {
        isMouseDownRef.current = false;
      }, 0);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleCarouselFocus = useCallback(
    (event: React.FocusEvent) => {
      // Only handle focus if it's on a card, not on indicators or other elements
      if (!cardsContainerRef.current?.contains(event.target as Node)) {
        return;
      }

      // Check if this is a keyboard-initiated focus (tab entry) vs mouse click.
      // relatedTarget is the element that previously had focus.
      // - If relatedTarget is inside the carousel, it's an internal focus move (ignore)
      // - If relatedTarget is outside OR null, we need to check if it's keyboard or mouse
      if (carouselRef.current?.contains(event.relatedTarget as Node)) {
        return;
      }

      // Skip entry logic if this is an internal focus move (e.g., from skip button to cards)
      // The skip button gets removed from DOM, so relatedTarget won't be inside carousel
      if (isInternalFocusMoveRef.current) {
        isInternalFocusMoveRef.current = false;
        return;
      }

      // Determine which slot was actually focused
      const focusedElement = event.target as HTMLElement;
      const focusedSlotIndex = cardRefs.current.findIndex(
        ref => ref === focusedElement || ref?.contains(focusedElement)
      );

      if (focusedSlotIndex === -1) return;

      // If user clicked directly on a visible card, just track that slot - don't redirect
      if (isMouseDownRef.current) {
        setFocusedCardIndex(focusedSlotIndex);
        return;
      }

      // Keyboard entry (tab/shift+tab) - redirect to appropriate card and group
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
    },
    [cards.length, isShiftPressed]
  );

  const hasCards = cards.length > 0;

  const visibleCards = useMemo(() => {
    if (!hasCards) return [];

    const result: FlickeringCarouselCard[] = [];

    for (let i = 0; i < 3; i++) {
      const contentIndex = (currentIndex + i) % cards.length;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
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
      const targetCard = cardRefs.current[focusedCardIndex];
      // Only programmatically focus if the target card doesn't already have focus
      // This prevents stealing focus from user clicks
      if (document.activeElement !== targetCard) {
        // Use setTimeout to ensure DOM updates (especially group changes) have completed
        setTimeout(() => {
          cardRefs.current[focusedCardIndex]?.focus();
        }, 0);
      }
    }
  }, [focusedCardIndex, currentIndex]);

  // Auto-advance carousel every 10 seconds unless user is interacting / section paused
  useEffect(() => {
    if (cards.length <= 3) return;

    const advance = () => {
      setCurrentIndex(prevIndex => (prevIndex + 3) % cards.length);
    };

    // Deterministic M3.0 scenario hook (does not require waiting for the interval).
    const onPerfLabAdvance = () => {
      advance();
    };
    window.addEventListener('gpu-perf-lab:carousel-advance', onPerfLabAdvance);

    if (paused) {
      return () => {
        window.removeEventListener(
          'gpu-perf-lab:carousel-advance',
          onPerfLabAdvance
        );
      };
    }

    const intervalId = setInterval(() => {
      // Use ref to get the current interaction state (avoids stale closure)
      if (!isUserInteractingRef.current) {
        advance();
      }
    }, 10000); // 10 seconds

    return () => {
      clearInterval(intervalId);
      window.removeEventListener(
        'gpu-perf-lab:carousel-advance',
        onPerfLabAdvance
      );
    };
  }, [cards.length, paused]);

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
      isUserInteractingRef.current = false;
    }
  }, []);

  return (
    <div
      ref={carouselRef}
      className="relative z-10 flex flex-col items-center gap-3"
      onFocus={handleCarouselFocus}
      onBlur={handleCarouselBlur}
      onMouseEnter={() => {
        isUserInteractingRef.current = true;
      }}
      onMouseLeave={() => {
        // Pause auto-advance for any hover in the section; resume only when
        // pointer leaves and focus is also outside (skip/indicators included).
        const hasFocusInside = carouselRef.current?.contains(
          document.activeElement
        );
        if (!hasFocusInside) {
          isUserInteractingRef.current = false;
        }
      }}
      onFocusCapture={() => {
        isUserInteractingRef.current = true;
      }}
      onBlurCapture={e => {
        if (!carouselRef.current?.contains(e.relatedTarget as Node)) {
          isUserInteractingRef.current = false;
        }
      }}
    >
      <div ref={cardsContainerRef} className="relative flex gap-6">
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
                    // When no card is focused (-1), all slots are focusable so browser
                    // can pick correct one based on tab direction (first for forward, last for shift+tab)
                    // Otherwise, only the currently focused card is focusable
                    focusedCardIndex === -1
                      ? 0
                      : focusedCardIndex === slotIndex
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

        {/* Skip Cards — anchored to the card row (not the full carousel width).
            Beside cards on large viewports; below-centered on narrower ones so it
            stays on-screen when the row already fills the viewport. */}
        {showSkipButton && !indicatorMode && (
          <button
            ref={skipButtonRef}
            type="button"
            tabIndex={0}
            className={cn(
              'border-border/60 bg-bg-surface text-fg-main shadow-lamp-soft absolute z-40 rounded border px-3 py-2 text-sm whitespace-nowrap',
              'transition-opacity duration-200',
              skipButtonDirection === 'forward'
                ? 'top-1/2 left-full ml-3 -translate-y-1/2 max-lg:top-full max-lg:left-1/2 max-lg:ml-0 max-lg:mt-3 max-lg:-translate-x-1/2 max-lg:translate-y-0'
                : 'top-1/2 right-full mr-3 -translate-y-1/2 max-lg:top-full max-lg:right-auto max-lg:left-1/2 max-lg:mr-0 max-lg:mt-3 max-lg:-translate-x-1/2 max-lg:translate-y-0'
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
                  const currentGroupIndex = Math.floor(currentIndex / 3);
                  if (
                    skipButtonDirection === 'forward' &&
                    currentGroupIndex < totalGroups - 1
                  ) {
                    // Mark as internal focus move so handleCarouselFocus doesn't redirect
                    isInternalFocusMoveRef.current = true;
                    // Advance to next group
                    setShowSkipButton(false);
                    setCurrentIndex(currentIndex + 3);
                    setFocusedCardIndex(0);
                  } else {
                    // Last group - just hide skip button, tab will exit carousel
                    setShowSkipButton(false);
                  }
                } else {
                  // Backward tab: continue with normal navigation to previous group
                  e.preventDefault();
                  const currentGroupIndex = Math.floor(currentIndex / 3);
                  if (
                    skipButtonDirection === 'backward' &&
                    currentGroupIndex > 0
                  ) {
                    // Mark as internal focus move so handleCarouselFocus doesn't redirect
                    isInternalFocusMoveRef.current = true;
                    // Go to previous group
                    setShowSkipButton(false);
                    setCurrentIndex(currentIndex - 3);
                    setFocusedCardIndex(2);
                  } else {
                    // First group - just hide skip button, shift+tab will exit carousel
                    setShowSkipButton(false);
                  }
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
      </div>

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
                  // Mark as internal focus move so handleCarouselFocus doesn't redirect
                  isInternalFocusMoveRef.current = true;
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
                  // Mark as internal focus move so handleCarouselFocus doesn't redirect
                  isInternalFocusMoveRef.current = true;
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
            'border-border/60 bg-bg-surface text-fg-main shadow-lamp-soft absolute -top-14 left-1/2 z-40 w-36 -translate-x-1/2 rounded border px-4 py-2 text-sm',
            indicatorMode ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
          aria-label="Exit Card Section"
          onKeyDown={e => {
            if (!indicatorMode) return;

            const totalItems = totalGroups + 1;
            const exitIdx = totalGroups; // Exit button is at index totalGroups

            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              // Mark as internal focus move so handleCarouselFocus doesn't redirect
              isInternalFocusMoveRef.current = true;
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
