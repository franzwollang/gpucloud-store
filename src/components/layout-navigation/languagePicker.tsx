'use client';

import { CheckIcon, ChevronDownIcon, LanguagesIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { localesByCode, type SupportedLocale, supportedLocales } from '@/i18n';
import { cn } from '@/lib/style';
import { usePathname, useRouter } from '@/navigation';

export default function LanguagePicker({
  className
}: {
  className?: string;
  placeholderText?: string;
  noResultsText?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocaleCode = useLocale() as SupportedLocale;
  const t = useTranslations('UI.languagePicker');

  const [open, setOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState(
    localesByCode[currentLocaleCode]
  );
  const commandRef = useRef<HTMLDivElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const localeOptions = useMemo(
    () =>
      Object.values(supportedLocales).map(code => ({
        code,
        locale: localesByCode[code]
      })),
    []
  );

  useEffect(() => {
    setCurrentLocale(localesByCode[currentLocaleCode]);
  }, [currentLocaleCode]);

  useEffect(() => {
    if (open) {
      setSelectedIndex(
        localeOptions.findIndex(opt => opt.code === currentLocaleCode)
      );
      // Focus the popover content to capture keyboard events
      requestAnimationFrame(() => {
        if (popoverContentRef.current) {
          popoverContentRef.current.focus();
          console.log(
            'Focused popover content:',
            document.activeElement === popoverContentRef.current
          );
        }
      });
    }
    // localeOptions is memoized and never changes, so it's safe to exclude from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentLocaleCode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = (selectedIndex + 1) % localeOptions.length;
      console.log('ArrowDown: changing from', selectedIndex, 'to', newIndex);
      setSelectedIndex(newIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex =
        (selectedIndex - 1 + localeOptions.length) % localeOptions.length;
      console.log('ArrowUp: changing from', selectedIndex, 'to', newIndex);
      setSelectedIndex(newIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = localeOptions[selectedIndex];
      if (selected) {
        console.log('Enter: selecting', selected.locale.label);
        setCurrentLocale(selected.locale);
        setOpen(false);
        router.push(pathname, {
          locale: selected.code
        });
      }
    } else if (e.key === 'Tab') {
      // Allow Tab to close the popover and move focus
      setOpen(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="group">
        <PopoverTrigger asChild>
          <Button
            aria-label={t('ariaLabel')}
            tabIndex={0}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-[160px] justify-center', className)}
          >
            <span className="flex items-center justify-around overflow-hidden">
              <span className="mr-2 transition-all duration-500">
                <LanguagesIcon className="group-hover:text-ui-active-soft h-4 w-4 transition" />
              </span>
              <span className="group-hover:text-ui-active-soft transition">
                {currentLocale.label}
              </span>
            </span>
            <span className="ml-2 h-4 shrink-0">
              <ChevronDownIcon className="group-hover:text-ui-active-soft h-4 w-4 transition" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          ref={popoverContentRef}
          className="w-[200px] p-0"
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          <Command ref={commandRef} className="relative" loop>
            <CommandList className="max-h-[300px]">
              <CommandGroup>
                {localeOptions.map((option, index) => {
                  const { code: supportedLocale, locale } = option;

                  return (
                    <CommandItem
                      className={cn(
                        'flex cursor-pointer justify-between border-l-2 transition-colors',
                        selectedIndex === index
                          ? 'text-fg-main border-ui-active-soft bg-[color-mix(in_srgb,var(--color-bg-surface)_96%,transparent)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-border)_60%,transparent)]'
                          : 'border-transparent hover:bg-[color-mix(in_srgb,var(--color-bg-surface)_85%,transparent)]'
                      )}
                      key={supportedLocale}
                      value={locale.label}
                      keywords={[locale.label]}
                      onSelect={() => {
                        setCurrentLocale(locale);
                        setOpen(false);
                        router.push(pathname, {
                          locale: supportedLocale
                        });
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <CheckIcon
                        className={cn(
                          'mr-2 h-4 w-4 shrink-0',
                          currentLocale === locale ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className="grow">
                        <span className="flex justify-center">
                          <span>{locale.label}</span>
                          <span className="ml-2">{locale.icon}</span>
                        </span>
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </div>
    </Popover>
  );
}
