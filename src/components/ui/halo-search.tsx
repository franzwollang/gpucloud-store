'use client';

import { Search } from 'lucide-react';
import type { AnimationPlaybackControls } from 'motion';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverAnchor,
  PopoverContent
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/style';

type RiskMetrics = {
  naturalDisaster: number;
  electricityReliability: number;
  fireRisk: number;
  securityBreach: number;
  powerEfficiency: number;
  costEfficiency: number;
  networkReliability: number;
  coolingCapacity: number;
};

type Provider = {
  id: string;
  name: string;
  location: string;
  supportedSizes: number[];
  specs: string;
  price: string;
  regions: string;
  leadTime: string;
  minTerm: string;
  shortDetails: string;
  details: string;
  riskMetrics: RiskMetrics;
};

type GpuType = {
  type: string;
  description: string;
  shortDetails: string;
  availableSizes: number[];
  availableRegions: string[];
  providers: Provider[];
};

type HaloSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onAddToCart?: (config: {
    type: string;
    provider: Provider;
    size: number;
  }) => void;
};

export const HaloSearch = ({
  value,
  onChange,
  onAddToCart
}: HaloSearchProps) => {
  const baseAngle = useMotionValue(0);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [dialogIndex, setDialogIndex] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [currentGpuType, setCurrentGpuType] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const isClosingDialogRef = useRef(false);
  const shouldScrollRef = useRef(false);

  const t = useTranslations('TEST.haloSearch');

  const options = useMemo(() => {
    const raw: unknown = t.raw('gpuTypes');
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.flatMap(gpuType => {
      if (typeof gpuType !== 'object' || gpuType === null) {
        return [];
      }

      const candidate = gpuType as Partial<(typeof raw)[0]>;
      if (
        typeof candidate.type !== 'string' ||
        typeof candidate.description !== 'string' ||
        typeof candidate.shortDetails !== 'string' ||
        !Array.isArray(candidate.providers)
      ) {
        return [];
      }

      // Calculate available sizes and regions from provider data
      const availableSizes = new Set<number>();
      const availableRegions = new Set<string>();

      candidate.providers.forEach((provider: Provider) => {
        provider.supportedSizes.forEach((size: number) => {
          availableSizes.add(size);
        });
        provider.regions.split(', ').forEach((region: string) => {
          availableRegions.add(region.trim());
        });
      });

      // Create search options for each GPU type
      return [
        {
          type: candidate.type,
          description: candidate.description,
          shortDetails: candidate.shortDetails,
          availableSizes: Array.from(availableSizes).sort((a, b) => a - b),
          availableRegions: Array.from(availableRegions).sort(),
          providers: candidate.providers
        }
      ];
    });
  }, [t]);

  const currentDialogOption =
    dialogIndex !== null ? (options[dialogIndex] as GpuType) : null;

  // Update current GPU type when dialog opens
  useEffect(() => {
    if (currentDialogOption && currentGpuType !== currentDialogOption.type) {
      setCurrentGpuType(currentDialogOption.type);
    }
  }, [currentDialogOption, currentGpuType]);

  // Reset selection state when GPU type changes
  useEffect(() => {
    if (currentGpuType) {
      setSelectedRegion(null);
      setSelectedProvider(null);
      setSelectedSize(null);
    }
  }, [currentGpuType]);

  // Focus first focusable element when selection state changes
  useEffect(() => {
    // Use multiple requestAnimationFrame calls to ensure DOM has updated
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Find the first appropriate element based on current state
        let selector = '';
        if (!selectedRegion) {
          // Region selection - focus first region button
          selector = '[data-region-button]';
        } else if (selectedRegion && !selectedProvider && !selectedSize) {
          // Matrix selection - focus first matrix button
          selector = '[data-matrix-button]';
        } else if (selectedProvider && selectedSize) {
          // Configuration view - focus add to plan button
          selector = '[data-add-to-plan-button]';
        }

        if (selector) {
          const element = document.querySelector(selector);
          if (element) {
            (element as HTMLElement).focus();
          }
        }
      });
    });
  }, [selectedRegion, selectedProvider, selectedSize]);

  // Get available regions for current GPU type
  const availableRegions = useMemo(() => {
    if (!currentDialogOption) return [];
    const regions = new Set<string>();
    currentDialogOption.providers.forEach(provider => {
      provider.regions
        .split(', ')
        .forEach(region => regions.add(region.trim()));
    });
    return Array.from(regions).sort();
  }, [currentDialogOption]);

  // Get available provider-size combinations for selected region
  const availableCombinations = useMemo(() => {
    if (!currentDialogOption || !selectedRegion) return [];

    return currentDialogOption.providers
      .filter(provider => provider.regions.includes(selectedRegion))
      .map(provider => ({
        provider,
        sizes: provider.supportedSizes
      }));
  }, [currentDialogOption, selectedRegion]);

  // Button halo uses a 90deg offset so it matches the original static look
  const iconAngle = useTransform(baseAngle, v => v + 90);
  // Shared opacity pulse for the large halo around the input (subtle, synced to rotation)
  const haloOpacity = useTransform(baseAngle, v => {
    const theta = (v * Math.PI) / 180;
    const t = (1 - Math.cos(theta)) / 2; // 0 -> 1 -> 0 over a full rotation
    return 0.45 + 0.2 * t; // 0.45–0.65 subtle brightness change
  });

  const stopAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  };

  const startIdle = () => {
    stopAnimation();
    animationRef.current = animate(baseAngle, baseAngle.get() + 360, {
      duration: 10,
      ease: 'linear',
      repeat: Infinity
    });
  };

  const spinOnce = () => {
    stopAnimation();
    animationRef.current = animate(baseAngle, baseAngle.get() + 360, {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: 0,
      onComplete: () => {
        animationRef.current = null;
        if (isFocused) {
          startIdle();
        }
      }
    });
  };

  const handleHoverStart = () => {
    if (!isFocused) {
      spinOnce();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    startIdle();
    if (value.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    stopAnimation();
    const current = baseAngle.get();
    const target = Math.round(current / 360) * 360;
    if (target !== current) {
      animate(baseAngle, target, { duration: 1.8, ease: 'easeOut' });
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onChange(nextValue);
    setIsOpen(nextValue.trim().length > 0);
  };

  const handleInputClick = () => {
    if (!isOpen && value.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const maxIndex = options.length - 1;

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      // If the input is focused, has text, and the dropdown is closed,
      // ArrowDown should open it.
      if (!isOpen && value.trim().length > 0) {
        setIsOpen(true);
        setActiveIndex(prev => prev ?? 0);
        shouldScrollRef.current = true;
        return;
      }

      shouldScrollRef.current = true;
      setActiveIndex(prev => {
        const next = prev === null ? 0 : prev + 1 > maxIndex ? 0 : prev + 1;
        return next;
      });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      shouldScrollRef.current = true;
      setActiveIndex(prev => {
        const next =
          prev === null ? maxIndex : prev - 1 < 0 ? maxIndex : prev - 1;
        return next;
      });
    } else if (event.key === 'Enter') {
      if (isOpen && activeIndex !== null) {
        event.preventDefault();
        // Open a details dialog for the currently selected option.
        setDialogIndex(activeIndex);
      }
    }
  };

  useEffect(() => {
    if (activeIndex === null || !listRef.current || !shouldScrollRef.current)
      return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-option-index="${activeIndex}"]`
    );
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    shouldScrollRef.current = false;
  }, [activeIndex]);

  const handleOpenChange = (nextOpen: boolean) => {
    // Let Radix drive the toggle, but clamp opening to cases where we have text.
    // If the details dialog is open, ignore close requests so we can return to
    // the same dropdown state when the dialog closes.
    if (nextOpen) {
      if (value.trim().length > 0) {
        setIsOpen(true);
      }
      return;
    }

    // If we're currently closing the dialog, ignore the popover close request
    if (isClosingDialogRef.current) {
      return;
    }

    // Only allow closing the popover if the dialog is not open
    if (dialogIndex === null) {
      setIsOpen(false);
    }
  };

  const handleDialogClose = () => {
    // Set flag to prevent popover from closing
    isClosingDialogRef.current = true;

    setDialogIndex(null);
    // Restore the dropdown if there is still text in the input.
    if (value.trim().length > 0) {
      setIsOpen(true);
    }

    // Return focus to the input - use requestAnimationFrame for smoother behavior
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const len = inputRef.current.value.length;
        try {
          inputRef.current.setSelectionRange(len, len);
        } catch {
          // Some input types don't support setSelectionRange; safe to ignore.
        }
      }
      // Reset the flag after a short delay
      setTimeout(() => {
        isClosingDialogRef.current = false;
      }, 100);
    });
  };

  return (
    <motion.div
      className="halo-search-root relative flex items-center justify-center"
      aria-label={t('ariaLabel')}
      onMouseEnter={handleHoverStart}
    >
      {/* Aurora glow */}
      <motion.div
        className="pointer-events-none absolute -top-8 h-32 w-[340px] overflow-hidden rounded-[28px] blur-2xl"
        style={{ opacity: haloOpacity }}
      >
        <div
          className="rounded-[32px]"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '600px',
            height: '600px',
            transform: 'translate(-50%, -50%) rotate(60deg)',
            filter: 'brightness(1.4)',
            backgroundImage:
              'conic-gradient(var(--color-bg-page), color-mix(in srgb, var(--color-neon-electric) 70%, transparent) 5%, var(--color-bg-page) 38%, var(--color-bg-page) 50%, color-mix(in srgb, var(--color-neon-magenta-soft) 65%, transparent) 60%, var(--color-bg-page) 87%)'
          }}
        />
      </motion.div>

      {/* Outer rings */}
      <motion.div
        className="pointer-events-none absolute h-[56px] w-[320px] overflow-hidden rounded-2xl"
        style={{ opacity: haloOpacity }}
      >
        <div
          className="rounded-2xl blur-[3px]"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '600px',
            height: '600px',
            transform: 'translate(-50%, -50%) rotate(82deg)',
            backgroundImage:
              'conic-gradient(transparent, color-mix(in srgb, var(--color-neon-electric) 65%, transparent), transparent 12%, transparent 50%, color-mix(in srgb, var(--color-neon-magenta) 55%, transparent) 60%, transparent 70%)'
          }}
        />
        <div
          className="rounded-2xl opacity-70 blur-[3px]"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '600px',
            height: '600px',
            transform: 'translate(-50%, -50%) rotate(82deg)',
            backgroundImage:
              'conic-gradient(transparent, color-mix(in srgb, var(--color-neon-cyan-soft) 50%, transparent), transparent 14%, transparent 50%, color-mix(in srgb, var(--color-neon-magenta-soft) 40%, transparent) 64%, transparent 74%)'
          }}
        />
      </motion.div>

      {/* Main border + inner glow */}
      <motion.div
        className="pointer-events-none absolute h-[52px] w-[304px] overflow-hidden rounded-xl"
        style={{ opacity: haloOpacity }}
      >
        <div
          className="rounded-xl blur-[2px]"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '600px',
            height: '600px',
            transform: 'translate(-50%, -50%) rotate(70deg)',
            backgroundImage:
              'conic-gradient(var(--color-bg-page), color-mix(in srgb, var(--color-neon-electric) 55%, transparent) 5%, var(--color-bg-page) 14%, var(--color-bg-page) 50%, color-mix(in srgb, var(--color-neon-magenta-soft) 60%, transparent) 60%, var(--color-bg-page) 64%)'
          }}
        />
        <div
          className="rounded-[10px] blur-[2px]"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '600px',
            height: '600px',
            transform: 'translate(-50%, -50%) rotate(83deg)',
            backgroundImage:
              'conic-gradient(transparent, color-mix(in srgb, var(--color-neon-cyan) 40%, transparent), transparent 8%, transparent 50%, color-mix(in srgb, var(--color-neon-magenta-soft) 40%, transparent) 58%, transparent 68%)'
          }}
        />
      </motion.div>

      {/* Search field + dropdown */}
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverAnchor asChild>
          <div className="relative">
            <div className="ring-border/40 relative flex h-11 w-[320px] items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--color-bg-page)_92%,transparent)]/95 px-4 pr-3 text-sm ring-1 backdrop-blur-sm">
              <input
                ref={inputRef}
                type="text"
                name="search"
                placeholder={t('placeholder')}
                className="placeholder:text-fg-muted/70 text-fg-main h-full w-[260px] max-w-full bg-transparent pr-2 text-sm outline-none"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onClick={handleInputClick}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />

              {/* Accent blur */}
              <div className="pointer-events-none absolute top-1 left-3 h-5 w-8 bg-[color-mix(in_srgb,var(--color-neon-magenta-soft)_65%,transparent)] opacity-80 blur-xl" />

              {/* Button */}
              <button
                type="button"
                className="group border-border/60 from-bg-surface to-bg-page text-fg-soft hover:border-ui-active-soft hover:text-fg-main relative flex size-8 flex-none items-center justify-center overflow-hidden rounded-lg border bg-linear-to-b shadow-[0_0_18px_rgba(0,0,0,0.6)] transition"
                aria-label="Search"
              >
                <div className="pointer-events-none absolute inset-0">
                  <motion.div
                    className="opacity-70"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '480px',
                      height: '480px',
                      x: '-50%',
                      y: '-50%',
                      rotate: iconAngle,
                      backgroundImage:
                        'conic-gradient(transparent, color-mix(in srgb, var(--color-neon-electric) 40%, transparent), transparent 45%, transparent 55%, color-mix(in srgb, var(--color-neon-magenta-soft) 45%, transparent), transparent 90%)'
                    }}
                  />
                </div>
                <Search className="relative z-1 h-3 w-3" />
              </button>
            </div>
          </div>
        </PopoverAnchor>

        <PopoverContent
          side="bottom"
          align="center"
          avoidCollisions={false}
          onOpenAutoFocus={event => event.preventDefault()}
          className="from-bg-surface/75 via-bg-page/92 to-bg-surface/80 border-border/60 text-fg-soft w-[900px] max-w-[96vw] overflow-hidden rounded-2xl border bg-linear-to-b p-0 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-lg"
        >
          <div className="border-b-border/40 bg-[color-mix(in_srgb,var(--color-bg-surface)_80%,transparent)] px-5 py-3 text-center text-xs font-medium tracking-[0.18em] text-[color-mix(in_srgb,var(--color-fg-soft)_70%,transparent)] uppercase">
            {t('dropdownHeader')}
          </div>
          <Command className="border-none bg-transparent text-inherit">
            <CommandList
              ref={listRef}
              className="divide-border/25 max-h-[288px] divide-y overflow-y-auto py-1"
            >
              <CommandGroup heading="">
                {options.map((option, index) => (
                  <CommandItem
                    key={option.type}
                    data-option-index={index}
                    className={cn(
                      'flex items-center justify-between border-l-2 px-5 py-3 transition hover:bg-[color-mix(in_srgb,var(--color-bg-surface)_90%,transparent)]/80 data-[selected=true]:bg-transparent data-[selected=true]:text-inherit',
                      activeIndex === index
                        ? 'text-fg-main border-ui-active-soft bg-[color-mix(in_srgb,var(--color-bg-surface)_96%,transparent)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-border)_60%,transparent)]'
                        : 'border-transparent'
                    )}
                    onMouseEnter={() => {
                      shouldScrollRef.current = false;
                      setActiveIndex(index);
                    }}
                    onSelect={() => {
                      setActiveIndex(index);
                      setDialogIndex(index);

                      // Reset selections only when switching to a different GPU type
                      const newGpuType = options[index]?.type;
                      if (newGpuType && currentGpuType !== newGpuType) {
                        setSelectedRegion(null);
                        setSelectedProvider(null);
                        setSelectedSize(null);
                        setCurrentGpuType(newGpuType);
                      }
                    }}
                  >
                    <div className="flex w-full flex-col gap-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-fg-main text-sm font-medium">
                            {option.type}
                          </div>
                          <div className="text-fg-soft text-xs">
                            {option.description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-fg-muted/60 text-xs">
                            {option.providers.length} provider
                            {option.providers.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-fg-muted/50 text-xs">
                            Sizes: {option.availableSizes.join(', ')}
                          </div>
                          <div className="text-fg-muted/50 text-xs">
                            Regions: {option.availableRegions.join(', ')}
                          </div>
                        </div>
                      </div>
                      {activeIndex === index && (
                        <div className="text-fg-soft/90 border-border/25 border-t pt-2 text-xs leading-relaxed">
                          {option.shortDetails}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog
        open={dialogIndex !== null}
        modal={true}
        onOpenChange={open => {
          if (!open) {
            handleDialogClose();
          }
        }}
      >
        <DialogContent
          className="bg-bg-surface border-border/70 text-fg-main sm:max-w-xl md:max-w-4xl"
          onEscapeKeyDown={e => {
            e.preventDefault();
            handleDialogClose();
          }}
          onOpenAutoFocus={e => {
            e.preventDefault();
            // Focus the first focusable element in the modal
            requestAnimationFrame(() => {
              const modalContent = e.target as HTMLElement;
              // Find focusable elements that are descendants of the modal content (using descendant selector)
              const focusableElements = modalContent.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              );
              // Skip the modal content itself if it somehow got included
              const filteredElements = Array.from(focusableElements).filter(
                element => element !== modalContent
              );
              const firstFocusable = filteredElements[0] as HTMLElement;
              if (firstFocusable) {
                firstFocusable.focus();
              }
            });
          }}
        >
          {currentDialogOption && (
            <div
              key={currentGpuType}
              className="space-y-3"
              onKeyDown={(event: React.KeyboardEvent) => {
                // Don't interfere with modal escape key
                if (event.key === 'Escape') return;

                // Handle region navigation when in region selection
                if (!selectedRegion) {
                  const regionButtons = event.currentTarget.querySelectorAll(
                    '[data-region-button]'
                  );
                  if (regionButtons.length > 0) {
                    const currentElement = event.target as HTMLElement;
                    let currentIndex = Array.from(regionButtons).findIndex(
                      btn => btn === currentElement
                    );

                    // If current element is not a region button, start from first button
                    if (currentIndex === -1) {
                      currentIndex = 0;
                    }

                    if (
                      event.key === 'ArrowLeft' ||
                      event.key === 'ArrowRight'
                    ) {
                      event.preventDefault();
                      let newIndex;
                      if (event.key === 'ArrowLeft') {
                        newIndex =
                          currentIndex > 0
                            ? currentIndex - 1
                            : regionButtons.length - 1;
                      } else {
                        newIndex =
                          currentIndex < regionButtons.length - 1
                            ? currentIndex + 1
                            : 0;
                      }
                      (regionButtons[newIndex] as HTMLElement).focus();
                      return;
                    }
                  }
                }

                // Handle provider-size matrix navigation
                if (selectedRegion && !selectedProvider && !selectedSize) {
                  const matrixButtons = event.currentTarget.querySelectorAll(
                    '[data-matrix-button]'
                  );
                  if (matrixButtons.length > 0) {
                    const currentElement = event.target as HTMLElement;
                    let currentIndex = Array.from(matrixButtons).findIndex(
                      btn => btn === currentElement
                    );

                    // If current element is not a matrix button, start from first button
                    if (currentIndex === -1) {
                      currentIndex = 0;
                    }

                    // Calculate grid dimensions
                    const numColumns =
                      currentDialogOption.availableSizes.length;
                    const currentRow = Math.floor(currentIndex / numColumns);
                    const currentCol = currentIndex % numColumns;

                    let newRow = currentRow;
                    let newCol = currentCol;

                    if (event.key === 'ArrowLeft') {
                      newCol = currentCol > 0 ? currentCol - 1 : numColumns - 1;
                    } else if (event.key === 'ArrowRight') {
                      newCol = currentCol < numColumns - 1 ? currentCol + 1 : 0;
                    } else if (event.key === 'ArrowUp') {
                      newRow =
                        currentRow > 0
                          ? currentRow - 1
                          : availableCombinations.length - 1;
                    } else if (event.key === 'ArrowDown') {
                      newRow =
                        currentRow < availableCombinations.length - 1
                          ? currentRow + 1
                          : 0;
                    }

                    if (
                      event.key === 'ArrowLeft' ||
                      event.key === 'ArrowRight' ||
                      event.key === 'ArrowUp' ||
                      event.key === 'ArrowDown'
                    ) {
                      event.preventDefault();
                      const newIndex = newRow * numColumns + newCol;
                      if (newIndex < matrixButtons.length) {
                        (matrixButtons[newIndex] as HTMLElement).focus();
                      }
                      return;
                    }
                  }
                }

                // Handle tab navigation when in configuration details
                const tabs =
                  event.currentTarget.querySelectorAll('[role="tab"]');
                const activeTab = event.currentTarget.querySelector(
                  '[data-state="active"][role="tab"]'
                );
                const currentIndex = activeTab
                  ? Array.from(tabs).indexOf(activeTab)
                  : 0;

                if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  const prevIndex =
                    currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                  (tabs[prevIndex] as HTMLElement).focus();
                  (tabs[prevIndex] as HTMLElement).click();
                } else if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  const nextIndex =
                    currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                  (tabs[nextIndex] as HTMLElement).focus();
                  (tabs[nextIndex] as HTMLElement).click();
                }
              }}
            >
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  {currentDialogOption.type}
                </DialogTitle>
                <DialogDescription className="text-fg-soft text-sm">
                  {currentDialogOption.description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 min-h-[300px]">
                {!selectedRegion ? (
                  /* Region Selection */
                  <div>
                    <div className="text-fg-muted/70 mb-3 text-xs tracking-wide uppercase">
                      Select Region
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {availableRegions.map(region => (
                        <button
                          key={region}
                          data-region-button
                          onClick={() => setSelectedRegion(region)}
                          className="border-border/30 bg-bg-surface/30 hover:bg-bg-surface/50 rounded-lg border p-4 text-center transition"
                        >
                          <div className="text-fg-main text-sm font-medium">
                            {region}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : !selectedProvider || !selectedSize ? (
                  /* Size + Provider Matrix */
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-fg-muted/70 text-xs tracking-wide uppercase">
                        Select Size & Provider
                      </div>
                      <button
                        onClick={() => setSelectedRegion(null)}
                        className="text-fg-soft hover:text-fg-main text-xs underline"
                      >
                        Change Region
                      </button>
                    </div>
                    <div className="mb-4 text-sm">
                      <div className="text-fg-main font-medium">
                        Region: {selectedRegion}
                      </div>
                    </div>

                    {/* Size options header */}
                    <div className="mb-2 grid grid-cols-5 gap-2">
                      <div className="text-fg-muted/60 text-xs font-medium">
                        Provider
                      </div>
                      {currentDialogOption.availableSizes.map(size => (
                        <div
                          key={size}
                          className="text-fg-muted/60 text-center text-xs font-medium"
                        >
                          {size} GPUs
                        </div>
                      ))}
                    </div>

                    {/* Provider rows */}
                    <div className="space-y-2">
                      {availableCombinations.map(({ provider }) => (
                        <div
                          key={provider.id}
                          className="grid grid-cols-5 items-center gap-2"
                        >
                          {/* Provider name */}
                          <div className="text-fg-main text-sm font-medium">
                            {provider.name}
                            <div className="text-fg-soft text-xs">
                              {provider.location}
                            </div>
                          </div>

                          {/* Size buttons */}
                          {currentDialogOption.availableSizes.map(size => {
                            const isAvailable =
                              provider.supportedSizes.includes(size);
                            const isSelected =
                              selectedProvider?.id === provider.id &&
                              selectedSize === size;

                            return (
                              <button
                                key={size}
                                onClick={() => {
                                  if (isAvailable) {
                                    setSelectedProvider(provider);
                                    setSelectedSize(size);
                                  }
                                }}
                                disabled={!isAvailable}
                                className={`rounded border p-2 text-center transition ${
                                  isSelected
                                    ? 'bg-ui-active-soft border-ui-active-soft text-white'
                                    : isAvailable
                                      ? 'border-border/30 bg-bg-surface/30 hover:bg-bg-surface/50 text-fg-main'
                                      : 'border-border/20 bg-bg-surface/10 text-fg-muted/30 cursor-not-allowed'
                                }`}
                                data-matrix-button
                              >
                                <div className="text-xs font-medium">
                                  {isAvailable ? provider.price : '—'}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Configuration Details */
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-fg-muted/70 text-xs tracking-wide uppercase">
                        Configuration Details
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedProvider(null);
                            setSelectedSize(null);
                          }}
                          className="text-fg-soft hover:text-fg-main text-xs underline"
                        >
                          Change Selection
                        </button>
                      </div>
                    </div>
                    <div className="mb-3 text-sm">
                      <div className="text-fg-main font-medium">
                        {selectedProvider.name} - {selectedSize}{' '}
                        {currentDialogOption.type} GPUs
                      </div>
                      <div className="text-fg-soft text-xs">
                        {selectedRegion}
                      </div>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="risk">
                          Risk & Performance
                        </TabsTrigger>
                        <TabsTrigger value="infrastructure">
                          Infrastructure
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="mt-3 space-y-3">
                        {/* Pricing Section */}
                        <div className="border-border/30 bg-bg-surface/50 rounded-lg border p-3">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-fg-muted/80 text-xs tracking-[0.18em] uppercase">
                              {t('hourlyRate')}
                            </span>
                            <span className="text-ui-active-soft text-lg font-semibold">
                              {selectedProvider.price}
                            </span>
                          </div>
                          <div className="text-fg-muted/50 text-xs italic">
                            {t('pricingNote')}
                          </div>
                        </div>

                        {/* Configuration Details Grid */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="border-border/30 bg-bg-surface/30 rounded-lg border p-2.5 text-center">
                            <div className="text-fg-muted/60 mb-1 text-xs tracking-wide uppercase">
                              Regions
                            </div>
                            <div className="text-fg-main text-sm font-medium">
                              {selectedRegion}
                            </div>
                          </div>
                          <div className="border-border/30 bg-bg-surface/30 rounded-lg border p-3 text-center">
                            <div className="text-fg-muted/60 mb-1 text-xs tracking-wide uppercase">
                              Lead Time
                            </div>
                            <div className="text-fg-main text-sm font-medium">
                              {selectedProvider.leadTime}
                            </div>
                          </div>
                          <div className="border-border/30 bg-bg-surface/30 rounded-lg border p-3 text-center">
                            <div className="text-fg-muted/60 mb-1 text-xs tracking-wide uppercase">
                              Min Term
                            </div>
                            <div className="text-fg-main text-sm font-medium">
                              {selectedProvider.minTerm}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="risk" className="mt-3">
                        {/* Risk Metrics */}
                        <div className="border-border/20 bg-bg-surface/20 rounded-lg border p-3">
                          <div className="text-fg-muted/70 mb-3 text-xs tracking-wide uppercase">
                            Risk & Performance Metrics
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1.5">
                              <div className="flex justify-between">
                                <span>Natural Disaster:</span>
                                <span
                                  className={`rounded px-2 py-0.5 text-xs ${
                                    selectedProvider.riskMetrics
                                      .naturalDisaster <= 2
                                      ? 'bg-green-500/20 text-green-400'
                                      : selectedProvider.riskMetrics
                                            .naturalDisaster <= 3
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {selectedProvider.riskMetrics.naturalDisaster}
                                  /5
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Electricity Reliability:</span>
                                <span
                                  className={`rounded px-2 py-0.5 text-xs ${
                                    selectedProvider.riskMetrics
                                      .electricityReliability >= 4
                                      ? 'bg-green-500/20 text-green-400'
                                      : selectedProvider.riskMetrics
                                            .electricityReliability >= 3
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {
                                    selectedProvider.riskMetrics
                                      .electricityReliability
                                  }
                                  /5
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fire Risk:</span>
                                <span
                                  className={`rounded px-2 py-0.5 text-xs ${
                                    selectedProvider.riskMetrics.fireRisk <= 2
                                      ? 'bg-green-500/20 text-green-400'
                                      : selectedProvider.riskMetrics.fireRisk <=
                                          3
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {selectedProvider.riskMetrics.fireRisk}/5
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Security Breach:</span>
                                <span
                                  className={`rounded px-2 py-0.5 text-xs ${
                                    selectedProvider.riskMetrics
                                      .securityBreach <= 2
                                      ? 'bg-green-500/20 text-green-400'
                                      : selectedProvider.riskMetrics
                                            .securityBreach <= 3
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {selectedProvider.riskMetrics.securityBreach}
                                  /5
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between">
                                <span>Power Efficiency:</span>
                                <span
                                  className={`rounded px-2 py-0.5 text-xs ${
                                    selectedProvider.riskMetrics
                                      .powerEfficiency >= 4
                                      ? 'bg-green-500/20 text-green-400'
                                      : selectedProvider.riskMetrics
                                            .powerEfficiency >= 3
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-blue-500/20 text-blue-400'
                                  }`}
                                >
                                  {selectedProvider.riskMetrics.powerEfficiency}
                                  /5
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cost Efficiency:</span>
                                <span
                                  className={`rounded px-2 py-0.5 text-xs ${
                                    selectedProvider.riskMetrics
                                      .costEfficiency >= 4
                                      ? 'bg-green-500/20 text-green-400'
                                      : selectedProvider.riskMetrics
                                            .costEfficiency >= 3
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {selectedProvider.riskMetrics.costEfficiency}
                                  /5
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Network Reliability:</span>
                                <span
                                  className={`rounded px-2 py-0.5 text-xs ${
                                    selectedProvider.riskMetrics
                                      .networkReliability >= 4
                                      ? 'bg-green-500/20 text-green-400'
                                      : selectedProvider.riskMetrics
                                            .networkReliability >= 3
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {
                                    selectedProvider.riskMetrics
                                      .networkReliability
                                  }
                                  /5
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cooling Capacity:</span>
                                <span
                                  className={`rounded px-2 py-0.5 text-xs ${
                                    selectedProvider.riskMetrics
                                      .coolingCapacity >= 4
                                      ? 'bg-green-500/20 text-green-400'
                                      : selectedProvider.riskMetrics
                                            .coolingCapacity >= 3
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {selectedProvider.riskMetrics.coolingCapacity}
                                  /5
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="infrastructure" className="mt-3">
                        {/* Infrastructure Details */}
                        <div className="border-border/20 bg-bg-surface/20 rounded-lg border p-3">
                          <div className="text-fg-muted/70 mb-2 text-xs tracking-wide uppercase">
                            Infrastructure Details
                          </div>
                          <p className="text-fg-main text-sm leading-relaxed">
                            {selectedProvider.details}
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-1 gap-2">
                <button
                  type="button"
                  onClick={handleDialogClose}
                  className="border-border/70 text-fg-main hover:border-ui-active-soft hover:text-fg-main/90 bg-bg-surface inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium transition"
                >
                  {t('close')}
                </button>
                {onAddToCart && selectedProvider && selectedSize && (
                  <button
                    data-add-to-plan-button
                    type="button"
                    onClick={() => {
                      onAddToCart({
                        type: currentDialogOption.type,
                        provider: selectedProvider,
                        size: selectedSize
                      });
                      handleDialogClose();
                    }}
                    className="bg-ui-active-soft hover:bg-ui-active inline-flex items-center justify-center rounded-md border border-transparent px-4 py-1.5 text-xs font-medium text-white transition"
                  >
                    {t('addToPlan')}
                  </button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style jsx>{`
        /* Halo search layers (Motion drives rotation/translation) */
        .halo-aurora-core,
        .halo-outer-core,
        .halo-inner-core,
        .halo-main-core,
        .halo-btn-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 480px;
          height: 480px;
          background-repeat: no-repeat;
          background-position: 0 0;
        }

        .halo-aurora-core {
          filter: brightness(1.4);
        }

        .halo-btn-core {
          transform: translate(-50%, -50%) rotate(90deg);
          animation: halo-btn-rotate 4s linear infinite;
        }

        /* Halo search state transitions */
        .halo-search-root:hover .halo-outer-core {
          transform: translate(-50%, -50%) rotate(-98deg);
        }

        .halo-search-root:hover .halo-aurora-core {
          transform: translate(-50%, -50%) rotate(-120deg);
        }

        .halo-search-root:hover .halo-inner-core {
          transform: translate(-50%, -50%) rotate(-97deg);
        }

        .halo-search-root:hover .halo-main-core {
          transform: translate(-50%, -50%) rotate(-110deg);
        }

        .halo-search-root:focus-within .halo-aurora-core {
          animation: halo-idle-aurora 10s linear infinite;
        }

        .halo-search-root:focus-within .halo-outer-core {
          animation: halo-idle-outer 10s linear infinite;
        }

        .halo-search-root:focus-within .halo-inner-core {
          animation: halo-idle-inner 10s linear infinite;
        }

        .halo-search-root:focus-within .halo-main-core {
          animation: halo-idle-main 10s linear infinite;
        }

        @keyframes halo-idle-aurora {
          0% {
            transform: translate(-50%, -50%) rotate(60deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(420deg);
          }
        }

        @keyframes halo-idle-outer {
          0% {
            transform: translate(-50%, -50%) rotate(82deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(442deg);
          }
        }

        @keyframes halo-idle-inner {
          0% {
            transform: translate(-50%, -50%) rotate(83deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(443deg);
          }
        }

        @keyframes halo-idle-main {
          0% {
            transform: translate(-50%, -50%) rotate(70deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(430deg);
          }
        }

        @keyframes halo-btn-rotate {
          100% {
            transform: translate(-50%, -50%) rotate(450deg);
          }
        }
      `}</style>
    </motion.div>
  );
};
