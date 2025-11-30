// Search icon not used in BaseSearch
import { useTranslations } from 'next-intl';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverAnchor,
  PopoverContent
} from '@/components/ui/popover';
import { cn } from '@/lib/style';

import { gpuCatalog } from '../../../public/data';

export type GpuOption = {
  type: string;
  description: string;
  shortDetails: string;
  availableSizes: number[];
  availableRegions: string[];
};

export type BaseSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onSelectOption?:
    | ((index: number) => void)
    | ((index: number, option: GpuOption) => void);
  renderModal?: (
    option: GpuOption | null,
    onClose: () => void
  ) => React.ReactNode;
  modalEnabled?: boolean; // Indicates that selecting an option may open a modal
  selectedOption?: GpuOption | null; // Controlled selected option state
  onSelectedOptionChange?: (option: GpuOption | null) => void; // Callback when selected option changes
  renderInput?: (props: {
    ref: React.RefObject<HTMLInputElement | null>;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    onClick: () => void;
    onFocus: () => void;
    onBlur: () => void;
    placeholder: string;
  }) => React.ReactNode;
  renderDropdownHeader?: () => React.ReactNode;
  renderOption?: (
    option: GpuOption,
    index: number,
    isActive: boolean
  ) => React.ReactNode;
  className?: string;
};

export const BaseSearch: React.FC<BaseSearchProps> = ({
  value,
  onChange,
  onSelectOption,
  renderModal,
  modalEnabled = false,
  selectedOption: controlledSelectedOption,
  onSelectedOptionChange,
  renderInput,
  renderDropdownHeader,
  renderOption,
  className
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [internalSelectedOption, setInternalSelectedOption] =
    useState<GpuOption | null>(null);
  const selectedOption =
    controlledSelectedOption !== undefined
      ? controlledSelectedOption
      : internalSelectedOption;
  const setSelectedOption = onSelectedOptionChange ?? setInternalSelectedOption;
  const listRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);
  const wasModalOpenRef = useRef(false);
  const isOpeningModalRef = useRef(false);
  const isClosingModalRef = useRef(false);
  const prevActiveIndexRef = useRef<number | null>(null);
  const modalOpenedWithIndexRef = useRef<number | null>(null);

  const t = useTranslations('TEST.haloSearch');

  // Default render functions
  const defaultRenderInput = (props: {
    ref: React.RefObject<HTMLInputElement | null>;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    onClick: () => void;
    onFocus: () => void;
    onBlur: () => void;
    placeholder: string;
  }) => (
    <div className="relative">
      <div className="border-border/50 bg-bg-surface/80 focus-within:border-ui-active-soft focus-within:ring-ui-active-soft/20 relative flex h-12 items-center gap-2 rounded-lg border px-3 backdrop-blur-sm transition focus-within:ring-1">
        <input
          ref={props.ref}
          type="text"
          name="search"
          placeholder={props.placeholder}
          className="placeholder:text-fg-muted/70 text-fg-main h-full w-full bg-transparent text-sm outline-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          value={props.value}
          onChange={props.onChange}
          onKeyDown={props.onKeyDown}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
        />
      </div>
    </div>
  );

  const defaultRenderDropdownHeader = () => (
    <div className="border-b-border/40 bg-[color-mix(in_srgb,var(--color-bg-surface)_80%,transparent)] px-5 py-3 text-center text-xs font-medium tracking-[0.18em] text-[color-mix(in_srgb,var(--color-fg-soft)_70%,transparent)] uppercase">
      {t('dropdownHeader')}
    </div>
  );

  const defaultRenderOption = (
    option: GpuOption,
    index: number,
    isActive: boolean
  ) => (
    <div className="flex-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-fg-main font-medium">{option.type}</div>
          <div className="text-fg-soft text-sm">{option.description}</div>
          {option.shortDetails && (
            <div
              data-accordion-content
              className={cn(
                'text-fg-main origin-top overflow-hidden text-sm',
                isActive
                  ? 'mt-2 max-h-24 opacity-100'
                  : 'mt-0 max-h-0 opacity-0'
              )}
              style={{
                transition: isActive
                  ? 'max-height 300ms ease-in, opacity 300ms ease-in 300ms, margin 300ms ease-in'
                  : 'none'
              }}
            >
              {option.shortDetails}
            </div>
          )}
        </div>
        <div className="text-fg-muted/60 w-48 shrink-0 text-left">
          <div className="text-[10px] leading-tight break-words">
            Sizes: {option.availableSizes.join(', ')}
          </div>
          <div className="mt-0.5 text-[10px] leading-tight break-words">
            Regions: {option.availableRegions.join(', ')}
          </div>
        </div>
      </div>
    </div>
  );

  const options: GpuOption[] = useMemo(() => {
    return gpuCatalog.gpus.map(gpu => {
      const availableSizes = new Set<number>();
      const availableRegions = new Set<string>();

      gpu.offerings.forEach(offering => {
        availableSizes.add(offering.gpuCount);

        offering.regions.forEach(region => {
          availableRegions.add(region.locationLabel);
        });
      });

      return {
        type: gpu.model,
        description: gpu.description,
        shortDetails: gpu.shortDetails,
        availableSizes: Array.from(availableSizes).sort((a, b) => a - b),
        availableRegions: Array.from(availableRegions).sort()
      };
    });
  }, [t]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange(newValue);

    if (newValue.trim().length === 0) {
      setIsOpen(false);
      setActiveIndex(null);
    } else {
      setIsOpen(true);
      setActiveIndex(0);
      shouldScrollRef.current = true;
    }
  };

  const handleInputClick = () => {
    if (value.trim().length > 0) {
      setIsOpen(true);
      if (activeIndex === null) {
        setActiveIndex(0);
        shouldScrollRef.current = true;
      }
    }
  };

  const handleFocus = () => {
    // Always open dropdown on focus to show all available options
    setIsOpen(true);
    // Don't reset activeIndex to 0 if we're returning focus after modal close
    if (isClosingModalRef.current && modalOpenedWithIndexRef.current !== null) {
      // Restore the index that was active when modal opened
      setActiveIndex(modalOpenedWithIndexRef.current);
      shouldScrollRef.current = true;
    } else if (!isClosingModalRef.current) {
      setActiveIndex(0);
      shouldScrollRef.current = true;
    }
  };

  const handleBlur = () => {
    console.log(
      'BaseSearch: handleBlur called, selectedOption:',
      !!selectedOption,
      'isOpeningModalRef.current:',
      isOpeningModalRef.current,
      'isClosingModalRef.current:',
      isClosingModalRef.current
    );
    // Don't close dropdown if modal is open, we're opening one, or we're closing one
    if (
      selectedOption ||
      isOpeningModalRef.current ||
      isClosingModalRef.current
    ) {
      console.log('BaseSearch: Not closing dropdown due to modal state');
      return;
    }

    console.log('BaseSearch: Closing dropdown on blur');
    // Close dropdown on blur - user moved focus away from input
    setIsOpen(false);
    setActiveIndex(null);
  };

  const handleSelect = (index: number) => {
    const option = options[index];
    console.log(
      'BaseSearch: handleSelect called, renderModal:',
      !!renderModal,
      'modalEnabled:',
      modalEnabled,
      'index:',
      index
    );
    if (renderModal || (modalEnabled && onSelectOption)) {
      console.log(
        'BaseSearch: Opening modal, setting isOpeningModalRef to true'
      );
      isOpeningModalRef.current = true;
      modalOpenedWithIndexRef.current = index; // Store the index to restore when modal closes
      setSelectedOption(option ?? null);
      // Keep dropdown open and maintain active index when opening modal
      setActiveIndex(index);
      // Blur the input to ensure clean focus state for the modal
      // This prevents focus race conditions between dropdown and modal
      inputRef.current?.blur();
      // Reset the flag after a short delay to allow modal to open
      setTimeout(() => {
        console.log('BaseSearch: Resetting isOpeningModalRef to false');
        isOpeningModalRef.current = false;
      }, 100);
    }

    if (onSelectOption && option) {
      if (onSelectOption.length === 2) {
        (onSelectOption as (index: number, option: GpuOption) => void)(
          index,
          option
        );
      } else {
        (onSelectOption as (index: number) => void)(index);
      }

      // If modalEnabled and onSelectOption was called, assume modal will open
      if (modalEnabled && !renderModal) {
        console.log(
          'BaseSearch: onSelectOption called with modalEnabled, assuming modal will open'
        );
        // The modal opening will be handled by the useEffect when dialogIndex changes in parent
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedOption(null);
    // Return focus to the search input when modal closes
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const maxIndex = options.length - 1;

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(null);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (!isOpen) {
        // Open dropdown if closed (regardless of text content)
        setIsOpen(true);
        setActiveIndex(0);
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

      if (!isOpen) {
        // Open dropdown if closed (regardless of text content)
        setIsOpen(true);
        setActiveIndex(maxIndex);
        shouldScrollRef.current = true;
        return;
      }

      shouldScrollRef.current = true;
      setActiveIndex(prev => {
        const next =
          prev === null ? maxIndex : prev - 1 < 0 ? maxIndex : prev - 1;
        return next;
      });
    } else if (event.key === 'Enter') {
      if (isOpen && activeIndex !== null) {
        event.preventDefault();
        handleSelect(activeIndex);
      }
    }
  };

  // Prevent body scrolling when dropdown is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Track when modal opens/closes and focus input when it closes
  useEffect(() => {
    console.log(
      'BaseSearch: selectedOption changed:',
      selectedOption ? 'has option' : 'null',
      'wasModalOpenRef.current:',
      wasModalOpenRef.current
    );
    if (selectedOption !== null) {
      // Modal is now open
      console.log(
        'BaseSearch: Modal is now open, setting wasModalOpenRef to true'
      );
      wasModalOpenRef.current = true;
    } else if (wasModalOpenRef.current) {
      // Modal was open and is now closed - return focus to input
      console.log('BaseSearch: Modal was closed, focusing input');
      wasModalOpenRef.current = false;
      isClosingModalRef.current = true;
      // Restore the active index before focusing
      if (modalOpenedWithIndexRef.current !== null) {
        setActiveIndex(modalOpenedWithIndexRef.current);
        shouldScrollRef.current = true;
      }
      // Small delay to ensure modal has fully closed and focus can be restored
      setTimeout(() => {
        inputRef.current?.focus();
        // Reset the flags after focus is restored
        setTimeout(() => {
          isClosingModalRef.current = false;
          modalOpenedWithIndexRef.current = null;
        }, 100);
      }, 50);
    }
  }, [selectedOption]);

  useEffect(() => {
    if (!listRef.current) return;

    const prevIndex = prevActiveIndexRef.current;
    const currentIndex = activeIndex;

    // If we have a previous active item that's collapsing, and it's above the new item,
    // we need to compensate for the height change
    if (
      prevIndex !== null &&
      currentIndex !== null &&
      prevIndex !== currentIndex &&
      prevIndex < currentIndex
    ) {
      // Find the collapsing accordion's expanded content
      const prevEl = listRef.current.querySelector<HTMLElement>(
        `[data-option-index="${prevIndex}"] [data-accordion-content]`
      );

      if (prevEl) {
        // Get the height before it collapses
        const collapsingHeight = prevEl.offsetHeight;

        // Immediately adjust scroll position to compensate
        if (collapsingHeight > 0) {
          listRef.current.scrollTop -= collapsingHeight;
        }
      }
    }

    // Update the ref for next time
    prevActiveIndexRef.current = activeIndex;

    // Now handle the scroll-to behavior
    if (activeIndex === null || !shouldScrollRef.current) return;

    const el = listRef.current.querySelector<HTMLElement>(
      `[data-option-index="${activeIndex}"]`
    );
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    shouldScrollRef.current = false;
  }, [activeIndex]);

  const handleOpenChange = (nextOpen: boolean) => {
    console.log(
      'BaseSearch: handleOpenChange called, nextOpen:',
      nextOpen,
      'selectedOption:',
      !!selectedOption,
      'isOpeningModalRef.current:',
      isOpeningModalRef.current
    );
    if (nextOpen) {
      console.log('BaseSearch: Opening dropdown');
      // Always open dropdown when requested (focus, click, etc.) - show all results initially
      setIsOpen(true);
      setActiveIndex(0);
      shouldScrollRef.current = true;
    } else {
      // Don't close dropdown if modal is open, we're opening one, or we're closing one
      if (
        selectedOption ||
        isOpeningModalRef.current ||
        isClosingModalRef.current
      ) {
        console.log('BaseSearch: Not closing dropdown due to modal state');
        return;
      }

      console.log('BaseSearch: Closing dropdown via handleOpenChange');
      // Allow closing regardless of text content - user can close via escape, click outside, etc.
      setIsOpen(false);
      setActiveIndex(null);
    }
  };

  return (
    <>
      <div className={className}>
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverAnchor asChild>
            {(renderInput ?? defaultRenderInput)({
              ref: inputRef,
              value,
              onChange: handleInputChange,
              onKeyDown: handleInputKeyDown,
              onClick: handleInputClick,
              onFocus: handleFocus,
              onBlur: handleBlur,
              placeholder: t('placeholder')
            })}
          </PopoverAnchor>

          <PopoverContent
            side="bottom"
            align="center"
            avoidCollisions={true}
            collisionPadding={20}
            onOpenAutoFocus={event => event.preventDefault()}
            className="from-bg-surface/75 via-bg-page/92 to-bg-surface/80 border-border/60 text-fg-soft w-[900px] max-w-[96vw] overflow-hidden rounded-2xl border bg-linear-to-b p-0 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-lg"
          >
            {(renderDropdownHeader ?? defaultRenderDropdownHeader)()}
            <Command className="border-none bg-transparent text-inherit">
              <CommandList
                ref={listRef}
                className="max-h-72 overflow-y-auto py-1 pb-8"
              >
                <CommandGroup>
                  {options.map((option, index) => (
                    <CommandItem
                      key={index}
                      data-option-index={index}
                      onMouseDown={e => e.preventDefault()}
                      onSelect={() => handleSelect(index)}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => {
                        // Don't clear active index if modal is opening - preserve the selection
                        if (!isOpeningModalRef.current && !selectedOption) {
                          setActiveIndex(null);
                        }
                      }}
                      className={cn(
                        'border-b-border/20 hover:bg-bg-surface/50 flex cursor-pointer items-center gap-3 border-l-2 px-5 py-4 text-left transition-colors',
                        activeIndex === index
                          ? 'text-fg-main border-ui-active-soft bg-[color-mix(in_srgb,var(--color-bg-surface)_96%,transparent)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-border)_60%,transparent)]'
                          : 'border-transparent',
                        'last:border-b-0'
                      )}
                    >
                      {(renderOption ?? defaultRenderOption)(
                        option,
                        index,
                        activeIndex === index
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {renderModal?.(selectedOption, handleCloseModal)}
      </div>
    </>
  );
};
