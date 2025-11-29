import React, { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
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

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  activeIndex: number | null;
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
  options: Array<{
    type: string;
    description: string;
    shortDetails: string;
    availableSizes: number[];
    availableRegions: string[];
  }>;
  onSelect: (index: number) => void;
  dialogIndex: number | null;
  t: (key: string) => string;
  setIsFocused: (focused: boolean) => void;
  isClosingDialogRef: React.MutableRefObject<boolean>;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  isOpen,
  onOpenChange,
  inputRef,
  activeIndex,
  setActiveIndex,
  options,
  onSelect,
  dialogIndex,
  t,
  setIsFocused,
  isClosingDialogRef
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange(newValue);

    if (newValue.trim().length === 0) {
      onOpenChange(false);
      setActiveIndex(null);
    } else {
      onOpenChange(true);
      setActiveIndex(0);
      shouldScrollRef.current = true;
    }
  };

  const handleInputClick = () => {
    if (value.trim().length > 0) {
      onOpenChange(true);
      if (activeIndex === null) {
        setActiveIndex(0);
        shouldScrollRef.current = true;
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const maxIndex = options.length - 1;

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      // If the input is focused, has text, and the dropdown is closed,
      // ArrowDown should open it.
      if (!isOpen && value.trim().length > 0) {
        onOpenChange(true);
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
        onSelect(activeIndex);
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
        onOpenChange(true);
      }
      return;
    }

    // If we're currently closing the dialog, ignore the popover close request
    if (isClosingDialogRef.current) {
      return;
    }

    // Only allow closing the popover if the dialog is not open
    if (dialogIndex === null) {
      onOpenChange(false);
    }
  };

  return (
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
              onClick={() => {
                if (isOpen) {
                  onOpenChange(false);
                } else if (value.trim().length > 0) {
                  onOpenChange(true);
                }
              }}
              className={cn(
                'text-fg-muted/60 hover:text-fg-main flex h-5 w-5 items-center justify-center rounded transition-colors',
                isOpen && 'text-fg-main'
              )}
              aria-label={isOpen ? t('closeDropdown') : t('openDropdown')}
            >
              <Search size={16} />
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
          <CommandList ref={listRef} className="max-h-96">
            <CommandGroup>
              {options.map((option, index) => (
                <CommandItem
                  key={option.type}
                  data-option-index={index}
                  onSelect={() => onSelect(index)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 border-b-border/20 px-5 py-4 text-left transition-colors hover:bg-bg-surface/50',
                    activeIndex === index && 'bg-bg-surface/30',
                    'last:border-b-0'
                  )}
                >
                  <div className="flex-1">
                    <div className="text-fg-main font-medium">
                      {option.type}
                    </div>
                    <div className="text-fg-soft text-sm">
                      {option.description}
                    </div>
                    <div className="text-fg-muted/60 mt-1 text-xs">
                      Available sizes: {option.availableSizes.join(', ')} |
                      Regions: {option.availableRegions.join(', ')}
                    </div>
                    {activeIndex === index && option.shortDetails && (
                      <div className="text-fg-main mt-2 text-sm">
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
  );
};
